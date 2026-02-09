# Installation Guide

This guide provides detailed installation instructions for the Proxmox MCP Server on Linux, Windows, and macOS using both npm package installation and repository cloning methods.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Method 1: NPM Package Installation](#method-1-npm-package-installation)
  - [Linux](#linux-npm-installation)
  - [Windows](#windows-npm-installation)
  - [macOS](#macos-npm-installation)
- [Method 2: Clone from Repository](#method-2-clone-from-repository)
  - [Linux](#linux-repository-installation)
  - [Windows](#windows-repository-installation)
  - [macOS](#macos-repository-installation)
- [Verification](#verification)
- [Environment Configuration](#environment-configuration)
- [Next Steps](#next-steps)

## Prerequisites

Before installing the Proxmox MCP Server, ensure you have the following:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Usually comes with Node.js
- **Git**: Required only for repository cloning method
- **Proxmox VE**: Access to a Proxmox VE server with API credentials

### Installing Node.js

If you don't have Node.js installed:

**Linux (Ubuntu/Debian)**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Linux (Fedora/RHEL)**:
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

**Windows**:
Download and install from [nodejs.org](https://nodejs.org/)

**macOS**:
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

Verify installation:
```bash
node --version
npm --version
```

## Method 1: NPM Package Installation

This is the recommended method for most users. It's quick, simple, and automatically handles dependencies.

### Linux NPM Installation

#### Global Installation

```bash
# Install globally (requires sudo on most systems)
sudo npm install -g @swartdraak/proxmox-mcp-server

# Verify installation
proxmox-mcp-server --version
```

#### User-level Installation (without sudo)

```bash
# Create a directory for global packages
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to PATH (add to ~/.bashrc or ~/.zshrc for persistence)
export PATH=~/.npm-global/bin:$PATH

# Install the package
npm install -g @swartdraak/proxmox-mcp-server

# Verify installation
proxmox-mcp-server --version
```

#### Using npx (No Installation Required)

```bash
# Run directly without installation
npx @swartdraak/proxmox-mcp-server
```

### Windows NPM Installation

#### Global Installation

Open **PowerShell** or **Command Prompt** as Administrator:

```powershell
# Install globally
npm install -g @swartdraak/proxmox-mcp-server

# Verify installation
proxmox-mcp-server --version
```

#### User-level Installation (without Administrator)

Open **PowerShell** or **Command Prompt**:

```powershell
# Install to user directory
npm install -g @swartdraak/proxmox-mcp-server --prefix %APPDATA%\npm

# Add to PATH if not already added
# The npm global bin directory is usually already in PATH on Windows

# Verify installation
proxmox-mcp-server --version
```

#### Using npx (No Installation Required)

```powershell
# Run directly without installation
npx @swartdraak/proxmox-mcp-server
```

### macOS NPM Installation

#### Global Installation

```bash
# Install globally
sudo npm install -g @swartdraak/proxmox-mcp-server

# Verify installation
proxmox-mcp-server --version
```

#### User-level Installation (without sudo)

```bash
# Create a directory for global packages
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to PATH (add to ~/.zshrc or ~/.bash_profile for persistence)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# Install the package
npm install -g @swartdraak/proxmox-mcp-server

# Verify installation
proxmox-mcp-server --version
```

#### Using npx (No Installation Required)

```bash
# Run directly without installation
npx @swartdraak/proxmox-mcp-server
```

## Method 2: Clone from Repository

This method is recommended for developers or users who want to modify the code or contribute to the project.

### Linux Repository Installation

```bash
# Install Git (if not already installed)
# Ubuntu/Debian:
sudo apt-get update && sudo apt-get install -y git

# Fedora/RHEL:
sudo dnf install -y git

# Clone the repository
git clone https://github.com/Swartdraak/Proxmox-MCP.git

# Navigate to the directory
cd Proxmox-MCP

# Install dependencies
npm install

# Build the project
npm run build

# Verify the build
node dist/index.js --help
```

#### Optional: Create a global command

```bash
# Create a symbolic link (from within the Proxmox-MCP directory)
sudo npm link

# Now you can run from anywhere
proxmox-mcp-server --version
```

### Windows Repository Installation

Open **PowerShell** or **Command Prompt**:

```powershell
# Install Git (if not already installed)
# Download from https://git-scm.com/download/win

# Clone the repository
git clone https://github.com/Swartdraak/Proxmox-MCP.git

# Navigate to the directory
cd Proxmox-MCP

# Install dependencies
npm install

# Build the project
npm run build

# Verify the build
node dist/index.js --help
```

#### Optional: Create a global command

Run PowerShell as Administrator:

```powershell
# From within the Proxmox-MCP directory
npm link

# Now you can run from anywhere
proxmox-mcp-server --version
```

### macOS Repository Installation

```bash
# Install Git (if not already installed)
# Git comes with macOS, but you can update it with Homebrew:
brew install git

# Clone the repository
git clone https://github.com/Swartdraak/Proxmox-MCP.git

# Navigate to the directory
cd Proxmox-MCP

# Install dependencies
npm install

# Build the project
npm run build

# Verify the build
node dist/index.js --help
```

#### Optional: Create a global command

```bash
# Create a symbolic link (from within the Proxmox-MCP directory)
sudo npm link

# Now you can run from anywhere
proxmox-mcp-server --version
```

## Verification

After installation, verify that the Proxmox MCP Server is correctly installed:

### Check Version

```bash
# If installed globally or linked
proxmox-mcp-server --version

# If using npx
npx @swartdraak/proxmox-mcp-server --version

# If built from source
node dist/index.js --version
```

### Test Connection (Optional)

You can test the connection to your Proxmox server by setting environment variables and running the server:

```bash
# Set required environment variables
export PROXMOX_HOST="your-proxmox-host.com"
export PROXMOX_USERNAME="root"
export PROXMOX_TOKEN_ID="your-token-id"
export PROXMOX_TOKEN_SECRET="your-token-secret"

# Run the server
proxmox-mcp-server
# or
npx @swartdraak/proxmox-mcp-server
# or (from source)
npm start
```

## Environment Configuration

After installation, you need to configure environment variables for your Proxmox connection.

### Create a .env file (for repository installation)

If you cloned the repository, you can create a `.env` file:

```bash
# Copy the example file
cp .env.example .env

# Edit with your favorite editor
nano .env  # or vim, code, etc.
```

### Required Environment Variables

Set the following environment variables:

```bash
# Required
PROXMOX_HOST=your-proxmox-host.com
PROXMOX_USERNAME=root

# Authentication Method 1: API Token (Recommended)
PROXMOX_TOKEN_ID=your-token-id
PROXMOX_TOKEN_SECRET=your-token-secret

# Authentication Method 2: Password
# PROXMOX_PASSWORD=your-password

# Optional
PROXMOX_PORT=8006
PROXMOX_REALM=pam
PROXMOX_VERIFY_SSL=true
PROXMOX_TIMEOUT=30000
```

### Setting Environment Variables

**Linux/macOS**:
```bash
# Temporary (current session only)
export PROXMOX_HOST="your-proxmox-host.com"

# Permanent (add to ~/.bashrc, ~/.zshrc, or ~/.bash_profile)
echo 'export PROXMOX_HOST="your-proxmox-host.com"' >> ~/.bashrc
source ~/.bashrc
```

**Windows PowerShell**:
```powershell
# Temporary (current session only)
$env:PROXMOX_HOST = "your-proxmox-host.com"

# Permanent (for user)
[System.Environment]::SetEnvironmentVariable('PROXMOX_HOST', 'your-proxmox-host.com', 'User')
```

**Windows Command Prompt**:
```cmd
# Temporary (current session only)
set PROXMOX_HOST=your-proxmox-host.com

# Permanent (for user)
setx PROXMOX_HOST "your-proxmox-host.com"
```

## Next Steps

After installation:

1. **Configure IDE Integration**: See [IDE_CONFIGURATION.md](IDE_CONFIGURATION.md) for detailed setup instructions for:
   - VS Code
   - Claude Desktop
   - Cursor
   - Continue
   - Cline/Roo-Cline
   - Zed
   - Other MCP-compatible IDEs

2. **Set up Proxmox API Token**: For secure authentication, create an API token in Proxmox VE:
   - Navigate to Datacenter → Permissions → API Tokens
   - Create a new token for your user
   - Copy the Token ID and Secret

3. **Test the Server**: Try listing your VMs or nodes to ensure everything is working correctly.

4. **Read the Documentation**: Check out the [README.md](README.md) for available tools and features.

## Troubleshooting

### Common Issues

**Issue**: `command not found: proxmox-mcp-server`

**Solution**: 
- Ensure the npm global bin directory is in your PATH
- Try using `npx @swartdraak/proxmox-mcp-server` instead
- If installed from source, use `npm link` or run directly with `node dist/index.js`

**Issue**: `Permission denied` during installation

**Solution**:
- Use `sudo` for global installation on Linux/macOS
- Or use user-level installation method
- On Windows, run as Administrator

**Issue**: `Cannot find module` errors

**Solution**:
- Run `npm install` again to ensure all dependencies are installed
- If using the repository method, make sure you ran `npm run build`

**Issue**: SSL/TLS certificate errors

**Solution**:
- For development/self-signed certificates, set `PROXMOX_VERIFY_SSL=false`
- For production, ensure your Proxmox server has a valid SSL certificate

**Issue**: Connection timeout

**Solution**:
- Check that `PROXMOX_HOST` is correct and accessible
- Verify firewall rules allow connection to Proxmox port (default 8006)
- Increase `PROXMOX_TIMEOUT` value if needed

For more help, please:
- Check the [GitHub Issues](https://github.com/Swartdraak/Proxmox-MCP/issues)
- Review the [Contributing Guide](CONTRIBUTING.md)
- Open a new issue if your problem isn't covered
