# CNS Assessment

This project is angular based cns assessment frontend.

## Project Structure

The application follows a feature-based architecture.

```
src/
├── app/
│   ├── core/               # Core functionality and services
│   │   ├── auth/           # Authentication components
│   │   │   ├── guards/     # Route guards for protected routes  
│   │   │   ├── interceptors/ # HTTP interceptors including JWT handling
│   │   │   ├── models/     # Authentication data models
│   │   │   └── services/   # Authentication services
│   │   └── http/          
│   │       └── interceptors/ # Error handling interceptors
│   ├── features/           # Feature modules
│   │   ├── auth/           # Authentication feature
│   │   │   ├── login/      # Login functionality
│   │   │   └── register/   # User registration
│   │   ├── chat/           # Notebook cells implementation
│   │   │   ├── components/ # Cell components (code, markdown, preview)
│   │   │   ├── models/     # Cell and notebook data models
│   │   │   └── services/   # Notebook service for managing notebook data
│   │   └── dashboard/      # Main application interface
│   │       ├── components/ # Dashboard components
│   │       └── sidebar/    # Notebook navigator sidebar
│   └── shared/             # Shared components and services
│       └── providers/      # Shared providers like monaco-editor
```

## Key Components and Their Functionality

### Core Module

- **Auth Service**: Handles user authentication, registration, and token management.
- **JWT Interceptor**: Automatically adds authorization tokens to outgoing HTTP requests.
- **Auth Guard**: Protects routes by ensuring users are logged in.
- **Error Interceptor**: Global error handling for HTTP requests.

### Auth Feature

- **Login Component**: User login interface.
- **Register Component**: New user registration interface.

### Chat Feature (Notebooks)

- **Code Cell Component**: Interactive code editor with execution capabilities supporting Python and R.
- **Markdown Cell Component**: Markdown editor and renderer for documentation.
- **Preview Cell Component**: Display component for cell outputs.
- **Notebook Service**: Manages notebook data, cell operations, and code execution.

### Dashboard Feature

- **Dashboard Component**: Main interface.
- **Sidebar Component**: Navigation for notebooks and notebook management.
- **Create Notebook Dialog**: Interface for creating new notebooks.

### Models

- **Cell Model**: Represents a notebook cell with code/markdown content and execution outputs.
- **Notebook Model**: Contains metadata and a collection of cells.

## Key Technologies Used

- **Angular**: Frontend framework
- **Angular Material**: UI component library
- **Monaco Editor**: Code editor component
- **JWT Authentication**: Secure user authentication
- **RxJS**: Reactive programming library for managing async operations
- **Marked**: Markdown parsing and rendering

## Development Server

To start a local development server, run:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload on source changes.

## Building for Production

```bash
ng build
```

This will compile your project to the `dist/` directory optimized for performance.

## Running Tests

```bash
ng test
```

## Features

- **Authentication**: Secure login and registration system
- **Notebook Management**: Create, edit, and delete computational notebooks
- **Interactive Code Cells**: Write and execute code in Python or R
- **Markdown Support**: Add formatted documentation to notebooks
- **Real-time Updates**: See code execution results in real-time
- **Visualization Support**: Display plots and charts from code execution

## Author

[yash-dk](https://github.com/yash-dk)