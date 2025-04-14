from pydantic_settings import BaseSettings
import os
from pathlib import Path


class Settings(BaseSettings):
    # JWT Settings
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "your_secret_key_here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 3  # 3 days

    # Database Settings
    DATABASE_URL: str = "sqlite:///./app.db"

    CODE_EXECUTION_IMAGE: str = os.environ.get(
        "CODE_EXECUTION_IMAGE", "yashk7/py-r-env:latest"
    )

    # Path to the static files directory
    STATIC_DIR: str = str(
        Path(os.path.abspath(os.path.dirname(__file__))).parent / "static"
    )

    # Restrict registration to a specific key
    REGISTRATION_KEY: str = os.environ.get("REGISTRATION_KEY", "abcd-1234")
    
    DOCKER_HOST: str = "unix:///your/sock/docker.sock"

    class Config:
        env_file = ".env"


settings = Settings()
