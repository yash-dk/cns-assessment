from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager

from app.api.auth import router as auth_router
from app.api.code import router as code_router
from app.api.notebook import router as notebook_router
from app.api.block import router as block_router

from app.db.init_db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="CNS Assessment Backend",
    description="Backend for code execution and notebook system",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(code_router, prefix="/api/code", tags=["Code Execution"])
app.include_router(notebook_router, prefix="/api/notebook", tags=["Notebook Management"])
app.include_router(block_router, prefix="/api/block", tags=["Block Management"])

os.makedirs("app/static", exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Welcome to CNS Assessment Backend API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)