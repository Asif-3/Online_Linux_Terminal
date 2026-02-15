# Online Linux Terminal

## Credentials

- **Username**: `ASIF`
- **Password**: `3333`

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (usually comes with Node.js)

### Setup

1.  **Clone the repository** (or download the source code):
    ```bash
    git clone <repository-url>
    cd Online-Linux-Terminal
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the application**:
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### Login

1.  Open the application in your browser.
2.  Enter the credentials:
    - Username: `ASIF`
    - Password: `3333`
3.  Click **Login**.

### Terminal Usage

Once logged in, you can use standard Linux commands:

```bash
# List files
ls -la

# Create a directory
mkdir projects

# Navigate to directory
cd projects

# Create a file
touch README.md

# Edit file
cat > README.md

# Git operations
git init
git add .
git commit -m "Initial commit"

# View help
help

# View cheat sheet
cheatsheet

# System commands
reboot
shutdown
```

## Project Structure

```
src/
├── components/
│   ├── Login.jsx          # Login page component
│   ├── Terminal.jsx       # Terminal interface component
│   ├── CheatSheet.jsx     # Cheat sheet component
│   └── ...
├── utils/
│   ├── auth.js            # Authentication utilities
│   ├── commands.js        # Command definitions and execution logic
│   ├── filesystem.js      # Virtual file system
│   └── ...
├── App.jsx                # Main application component
├── index.css              # Global styles
└── ...
```

## Technologies Used

- **React**: UI library for building the interface
- **Vite**: Fast build tool and development server
- **Node.js**: Backend for file system operations
- **CSS3**: Custom properties, animations, and glassmorphism effects

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
