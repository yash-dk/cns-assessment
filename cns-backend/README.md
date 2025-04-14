# CNS Assessment Backend

A FastAPI-based backend for the assessment. I have tried to tackle this problem in notbook style.

## Features

1. **Authentication System**
   - JWT-based authentication
   - User registration and login
   - Secure password handling with bcrypt

2. **Code Execution**
   - Execute Python and R code in isolated Docker containers
   - Capture output, errors, and plots
   - Support for various visualization libraries:
     - Python: Matplotlib, Plotly
     - R: base R, ggplot2, Plotly and rgl
   - Supports both 2D and 3D plots.
   - Also supports interactive charts.
   - Return URLs for generated plots which can then be embedded.

3. **Notebook Management**
   - Create, retrieve, and delete notebooks
   - Notebooks are with authenticated users
   - Blocks are linked to the notebook.

4. **Block Management**
   - Create code blocks with execution results
   - Store code, output, errors, and plot URLs
   - Organize blocks within notebooks

## Tech Stack

- **FastAPI**: Web framework for API
- **SQLAlchemy**: ORM for database
- **Docker**: Containerization for isolated code execution
- **JWT**: JSON Web Tokens for authentication
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server for FastAPI 

## Setup and Installation

### Prerequisites

- Docker
- Python 3.8+

## Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yash-dk/cns-assessment.git
   cd cns-assessment/cns-backend
   ```
2. Create a virtual environment:
   ```
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Make sure to update the config either in .env or `app/config/settings.py`

4. Start the FastAPI application:
   ```
   uvicorn app.main:app --reload
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get JWT token

### Code Execution

- `POST /api/code/execute`: Execute code and return results (text output, errors, plot URLs)

### Notebook Management

- `POST /api/notebook/`: Create a new notebook
- `GET /api/notebook/`: Get all notebooks for the authenticated user
- `GET /api/notebook/{notebook_id}`: Get a specific notebook with its blocks
- `DELETE /api/notebook/{notebook_id}`: Delete a notebook

### Block Management

- `POST /api/block/`: Create a new block with code execution
- `GET /api/block/{block_id}`: Get a specific block
- `DELETE /api/block/{block_id}`: Delete a block
- `PUT /api/block/{block_id}`: Update a specific block

## Project Structure

```
app/
├── api/            # API endpoints
│   ├── auth.py     # Authentication routes
│   ├── block.py    # Block management routes
│   ├── code.py     # Code execution routes
│   └── notebook.py # Notebook management routes
├── config/
│   └── settings.py # Application settings
├── db/
│   ├── database.py # Database connection handling
│   └── init_db.py  # Database initialization
├── models/         # SQLAlchemy models
│   ├── block.py    # Block model
│   ├── notebook.py # Notebook model
│   └── user.py     # User model
├── services/
│   ├── code_execution.py # Code execution service
│   └── patch_snippets.py # Code snippets for plot capturing
├── static/         # Directory for storing generated plots
├── utils/
│   └── auth.py     # Authentication
└── main.py         # Application entry point
```

## Notes
- The base image in which the execution is carried out is `yashk7/py-r-env:latest` based on Docker file located in `base-image` folder.
- This app could have been enhanced a lot but due to time constraints i have mainly focused on important goals.

## Author

[yash-dk](https://github.com/yash-dk)