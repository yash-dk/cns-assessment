from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.services.code_execution import code_execution_service

router = APIRouter()


class CodeExecutionRequest(BaseModel):
    code: str
    language: str


class CodeExecutionResponse(BaseModel):
    text_output: Optional[str]
    error: Optional[str]
    plot_urls: Optional[List[str]]


@router.post("/execute", response_model=CodeExecutionResponse)
async def execute_code(
    request: CodeExecutionRequest,
):
    """Execute code in the specified language and return the result."""
    result = await code_execution_service.execute_code(
        code=request.code, language=request.language
    )

    return result
