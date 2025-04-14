from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.db.database import get_db
from app.utils.auth import get_current_user
from app.models.user import User
from app.models.notebook import Notebook
from app.models.block import Block
from app.services.code_execution import code_execution_service

router = APIRouter()


class BlockCreate(BaseModel):
    notebook_id: int
    language: str
    code: str
    order: int


class BlockUpdate(BaseModel):
    notebook_id: int
    language: str
    code: str
    text_output: Optional[str]
    error: Optional[str]
    plot_urls: Optional[List[str]]
    order: int


class BlockResponse(BaseModel):
    id: int
    notebook_id: int
    language: str
    code: str
    text_output: Optional[str]
    error: Optional[str]
    plot_urls: Optional[List[str]]
    order: int

    class Config:
        orm_mode = True


@router.post("/", response_model=BlockResponse, status_code=status.HTTP_201_CREATED)
async def create_block(
    block: BlockCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new block in a notebook"""

    notebook = (
        db.query(Notebook)
        .filter(Notebook.id == block.notebook_id, Notebook.user_id == current_user.id)
        .first()
    )

    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found"
        )

    result = await code_execution_service.execute_code(
        code=block.code, language=block.language
    )

    # Create the block
    db_block = Block(
        notebook_id=block.notebook_id,
        language=block.language,
        code=block.code,
        text_output=result.get("text_output"),
        error=result.get("error"),
        plot_urls=result.get("plot_urls"),
        order=block.order,
    )

    db.add(db_block)
    db.commit()
    db.refresh(db_block)

    return db_block


@router.get("/{block_id}", response_model=BlockResponse)
async def get_block(
    block_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    block = db.query(Block).filter(Block.id == block_id).first()

    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Block not found"
        )

    notebook = (
        db.query(Notebook)
        .filter(Notebook.id == block.notebook_id, Notebook.user_id == current_user.id)
        .first()
    )

    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Block not found"
        )

    return block


@router.delete("/{block_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_block(
    block_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a block from a notebook"""
    block = db.query(Block).filter(Block.id == block_id).first()

    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Block not found"
        )

    # Verify the block belongs to the user via the notebook
    notebook = (
        db.query(Notebook)
        .filter(Notebook.id == block.notebook_id, Notebook.user_id == current_user.id)
        .first()
    )

    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Block not found"
        )

    db.delete(block)
    db.commit()

    return None


@router.put("/{block_id}", response_model=BlockResponse)
async def update_block(
    block_id: int,
    block: BlockUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a block in a notebook"""
    db_block = db.query(Block).filter(Block.id == block_id).first()

    if not db_block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Block not found"
        )

    # Verify the block belongs to the user via the notebook
    notebook = (
        db.query(Notebook)
        .filter(
            Notebook.id == db_block.notebook_id, Notebook.user_id == current_user.id
        )
        .first()
    )

    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Block not found"
        )

    db_block.language = block.language
    db_block.code = block.code
    db_block.order = block.order
    db_block.text_output = block.text_output
    db_block.error = block.error
    db_block.plot_urls = block.plot_urls

    db.commit()
    db.refresh(db_block)

    return db_block
