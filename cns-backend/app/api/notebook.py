from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.db.database import get_db
from app.models.block import Block
from app.utils.auth import get_current_user
from app.models.user import User
from app.models.notebook import Notebook
from datetime import datetime
from app.api.block import BlockResponse

router = APIRouter()


class NotebookCreate(BaseModel):
    title: str
    description: str


class NotebookResponse(BaseModel):
    id: int
    title: str
    description: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class NotebookResponseWithBlocks(BaseModel):
    id: int
    title: str
    description: str
    created_at: datetime
    cells: List[BlockResponse] = []
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


@router.post("/", response_model=NotebookResponse, status_code=status.HTTP_201_CREATED)
async def create_notebook(
    notebook: NotebookCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new notebook for the current user."""
    db_notebook = Notebook(
        title=notebook.title, description=notebook.description, user_id=current_user.id
    )

    db.add(db_notebook)
    db.commit()
    db.refresh(db_notebook)

    return db_notebook


@router.get("/", response_model=List[NotebookResponse])
async def get_notebooks(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get all notebooks for the current user."""
    notebooks = db.query(Notebook).filter(Notebook.user_id == current_user.id).all()
    return notebooks


@router.get("/{notebook_id}", response_model=NotebookResponseWithBlocks)
async def get_notebook(
    notebook_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific notebook by ID for the current user."""
    notebook = (
        db.query(Notebook)
        .filter(Notebook.id == notebook_id, Notebook.user_id == current_user.id)
        .first()
    )
    cells = db.query(Block).filter(Block.notebook_id == notebook_id).all()

    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found"
        )

    return {
        "id": notebook.id,
        "title": notebook.title,
        "description": notebook.description,
        "created_at": notebook.created_at,
        "updated_at": notebook.updated_at,
        "cells": cells,
    }


@router.delete("/{notebook_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notebook(
    notebook_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a notebook for the current user."""
    notebook = (
        db.query(Notebook)
        .filter(Notebook.id == notebook_id, Notebook.user_id == current_user.id)
        .first()
    )

    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found"
        )

    db.delete(notebook)
    db.commit()

    return None
