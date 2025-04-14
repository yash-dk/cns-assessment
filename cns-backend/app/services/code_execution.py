import docker
import os
import tempfile
import uuid
import base64
import json
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from app.services.patch_snippets import PYTHON_PLOT_HOOK, R_PLOT_HOOK

from app.config.settings import settings


class CodeExecutionService:
    """
    Service to execute code in a Docker container
    This class is well commented as it is the main service for executing code.
    """

    def __init__(self):
        self.docker_client = docker.DockerClient(base_url=settings.DOCKER_HOST)
        self.static_dir = settings.STATIC_DIR
        Path(self.static_dir).mkdir(exist_ok=True)

    async def execute_code(self, code: str, language: str) -> Dict:
        """Execute code in a Docker container and return the output"""
        # Generate a unique ID for this execution
        execution_id = str(uuid.uuid4())

        # Create temporary directory for code execution
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create output directory for plots inside temp_dir
            output_dir = os.path.join(temp_dir, "output")
            os.makedirs(output_dir, exist_ok=True)

            # Determine injection and hook file content based on language
            language_lower = language.lower()
            if language_lower == "python":
                # Injection code for Python
                injection = (
                    "# Add the plot hook to intercept plot generation\n"
                    "import plot_hook\n"
                    "plot_hook.patch_all()\n\n"
                )
                hook_file_path = os.path.join(temp_dir, "plot_hook.py")
                hook_content = PYTHON_PLOT_HOOK
            elif language_lower == "r":
                # Injection code for R
                injection = (
                    "# Add the plot hook to intercept plot generation\n"
                    'source("plot_hook.R")\n'
                    "\n\n"
                )
                hook_file_path = os.path.join(temp_dir, "plot_hook.R")
                hook_content = R_PLOT_HOOK
            else:
                # Defaults to Python
                injection = (
                    "# Add the plot hook to intercept plot generation\n"
                    "import plot_hook\n"
                    "plot_hook.patch_all()\n\n"
                )
                hook_file_path = os.path.join(temp_dir, "plot_hook.py")
                hook_content = PYTHON_PLOT_HOOK

            # Write the hook file (plot_hook.py or plot_hook.R) into the temp directory
            with open(hook_file_path, "w", encoding="utf-8") as f:
                f.write(hook_content)

            code_file_path = os.path.join(temp_dir, self._get_code_filename(language))
            code = code.replace("\r\n", "\n")
            full_code = injection + code
            with open(code_file_path, "w") as f:
                f.write(full_code)

            # Mount volumes for code and output files
            volumes = {
                temp_dir: {"bind": "/app", "mode": "rw"},
                output_dir: {"bind": "/output", "mode": "rw"},
            }

            # Prepare container command based on language
            cmd = self._get_container_command(language)

            container_name = f"code_execution_{execution_id}"

            # Run the container
            try:
                container = self.docker_client.containers.run(
                    image=settings.CODE_EXECUTION_IMAGE,
                    command=cmd,
                    volumes=volumes,
                    working_dir="/app",
                    name=container_name,
                    detach=True,
                )

                # Wait for container to finish
                result = container.wait()

                # Get stdout and stderr
                logs = container.logs().decode("utf-8")

                # Process any generated plots
                plot_urls = await self._process_plots(output_dir, execution_id)

                error = None
                if result["StatusCode"] != 0:
                    error = logs
                    text_output = None
                else:
                    text_output = logs

                # Cleanup container
                container.remove()

                return {
                    "text_output": text_output,
                    "error": error,
                    "plot_urls": plot_urls,
                }

            except Exception as e:
                import logging

                logging.exception(f"Error executing code in container: {e}")
                print(f"Error executing code: {e}")
                return {"text_output": None, "error": str(e), "plot_urls": []}

    async def _process_plots(self, output_dir: str, execution_id: str) -> List[str]:
        """Process plots from the output directory and save them to static dir"""
        plot_urls = []

        # Get all files and directories from output directory
        for item in os.listdir(output_dir):
            item_path = os.path.join(output_dir, item)

            # Process both files and directories that match our prefixes
            if item.startswith(
                ("matplotlib_", "plotly_", "baseR_", "ggplot2_", "rgl_", "rglwidget_")
            ):
                static_path = os.path.join(self.static_dir, item)

                if os.path.isfile(item_path):
                    with open(item_path, "rb") as src, open(static_path, "wb") as dst:
                        dst.write(src.read())
                    plot_urls.append(f"/static/{item}")

                elif os.path.isdir(item_path):
                    import shutil

                    if os.path.exists(static_path):
                        shutil.rmtree(static_path)
                    shutil.copytree(item_path, static_path)

        return plot_urls

    def _get_code_filename(self, language: str) -> str:
        language = language.lower()
        if language == "python":
            return "script.py"
        elif language == "r":
            return "script.R"
        else:
            return "script.py"

    def _get_container_command(self, language: str) -> str:
        """Get the appropriate container command for the given language"""
        language = language.lower()
        if language == "python":
            return "python script.py"
        elif language == "r":
            return "Rscript script.R"
        else:
            return "python script.py"


# singleton instance
code_execution_service = CodeExecutionService()
