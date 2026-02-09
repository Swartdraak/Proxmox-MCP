# Proxmox VE MCP Server

[![npm version](https://badge.fury.io/js/@swartdraak%2Fproxmox-mcp-server.svg)](https://www.npmjs.com/package/@swartdraak/proxmox-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for managing Proxmox VE infrastructure through AI assistants like Claude Desktop, GitHub Copilot, Cursor, Continue, and other MCP-compatible IDEs.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Available Tools](#available-tools)
- [Authentication](#authentication)
- [Security](#security)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Proxmox MCP Server enables AI assistants to interact with your Proxmox VE infrastructure through the Model Context Protocol. This allows you to manage virtual machines, containers, nodes, and storage using natural language commands in your favorite AI-powered IDE.

## Features

- 🖥️ **VM Management**: Create, start, stop, restart, clone, and delete virtual machines
- 📦 **Container Management**: Manage LXC containers with full lifecycle control
- 🔧 **Node Monitoring**: View cluster nodes and their resource usage
- 💾 **Storage Management**: List and monitor storage resources
- 🔐 **Secure Authentication**: Support for API tokens and password authentication
- 🌐 **Cross-Platform**: Works on Linux, Windows, and macOS
- 🔌 **Multi-IDE Support**: Compatible with Claude Desktop, VS Code, Cursor, Continue, Zed, and more
- 🛡️ **Security-First**: Input validation, SSL/TLS support, and no credential logging

## Quick Start

### Installation

```bash
# Install globally
npm install -g @swartdraak/proxmox-mcp-server

# Or use directly with npx (no installation required)
npx @swartdraak/proxmox-mcp-server
```

For detailed installation instructions (including repository cloning), see [INSTALLATION.md](INSTALLATION.md).

### Basic Configuration

Set the required environment variables for your Proxmox connection:

**Linux/macOS**:
```bash
export PROXMOX_HOST="proxmox.example.com"
export PROXMOX_USERNAME="root"
export PROXMOX_TOKEN_ID="your-token-id"
export PROXMOX_TOKEN_SECRET="your-token-secret"
```

**Windows (PowerShell)**:
```powershell
$env:PROXMOX_HOST = "proxmox.example.com"
$env:PROXMOX_USERNAME = "root"
$env:PROXMOX_TOKEN_ID = "your-token-id"
$env:PROXMOX_TOKEN_SECRET = "your-token-secret"
```

For complete configuration options and OS-specific instructions, see [INSTALLATION.md](INSTALLATION.md).

### IDE Integration

Configure the MCP server in your preferred IDE or AI assistant:

#### Quick Example: Claude Desktop

Add to your Claude configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "npx",
      "args": ["-y", "@swartdraak/proxmox-mcp-server"],
      "env": {
        "PROXMOX_HOST": "proxmox.example.com",
        "PROXMOX_USERNAME": "root",
        "PROXMOX_TOKEN_ID": "your-token-id",
        "PROXMOX_TOKEN_SECRET": "your-token-secret"
      }
    }
  }
}
```

**For complete IDE configuration instructions including VS Code, Cursor, Continue, Cline, Zed, and others, see [IDE_CONFIGURATION.md](IDE_CONFIGURATION.md).**

## Documentation

- **[Installation Guide](INSTALLATION.md)** - Detailed installation instructions for Linux, Windows, and macOS
- **[IDE Configuration Guide](IDE_CONFIGURATION.md)** - Setup instructions for all supported IDEs and AI assistants
- **[Contributing Guide](CONTRIBUTING.md)** - Guidelines for contributing to the project
- **[Changelog](CHANGELOG.md)** - Version history and updates

## Available Tools

### VMs

- `list_vms` - List all virtual machines
- `get_vm_status` - Get VM status
- `start_vm` - Start a VM
- `stop_vm` - Stop a VM (graceful or forced)
- `restart_vm` - Restart a VM
- `create_vm` - Create a new VM
- `delete_vm` - Delete a VM
- `clone_vm` - Clone a VM
- `get_vm_config` - Get VM configuration

### Containers

- `list_containers` - List all containers
- `get_container_status` - Get container status
- `start_container` - Start a container
- `stop_container` - Stop a container
- `create_container` - Create a new container
- `delete_container` - Delete a container

### Nodes

- `list_nodes` - List all cluster nodes
- `get_node_status` - Get node status and resource usage

### Storage

- `list_storage` - List all storage
- `get_storage_status` - Get storage content

## Authentication

The Proxmox MCP Server supports two authentication methods. Choose the one that best fits your security requirements:

### API Token (Recommended)

API tokens are more secure and provide better access control. They can be created with specific permissions and don't require storing your main password.

**Creating an API Token in Proxmox**:
1. Log in to your Proxmox VE web interface
2. Navigate to **Datacenter → Permissions → API Tokens**
3. Click **Add** to create a new token
4. Select a user (e.g., `root@pam`)
5. Enter a Token ID (e.g., `mcp-server`)
6. Optionally uncheck "Privilege Separation" for full user permissions
7. Click **Add** and copy the displayed secret (it's only shown once!)

**Configuration**:
```bash
# Linux/macOS
export PROXMOX_HOST="proxmox.example.com"
export PROXMOX_USERNAME="root"
export PROXMOX_TOKEN_ID="mcp-server"
export PROXMOX_TOKEN_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export PROXMOX_REALM="pam"

# Windows PowerShell
$env:PROXMOX_HOST = "proxmox.example.com"
$env:PROXMOX_USERNAME = "root"
$env:PROXMOX_TOKEN_ID = "mcp-server"
$env:PROXMOX_TOKEN_SECRET = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
$env:PROXMOX_REALM = "pam"
```

### Password Authentication

Password authentication is simpler to set up but less secure. Use this only in development environments or when API tokens are not available.

**Configuration**:
```bash
# Linux/macOS
export PROXMOX_HOST="proxmox.example.com"
export PROXMOX_USERNAME="root"
export PROXMOX_PASSWORD="your-password"
export PROXMOX_REALM="pam"

# Windows PowerShell
$env:PROXMOX_HOST = "proxmox.example.com"
$env:PROXMOX_USERNAME = "root"
$env:PROXMOX_PASSWORD = "your-password"
$env:PROXMOX_REALM = "pam"
```

### Optional Configuration

Additional environment variables for fine-tuning:

```bash
# Proxmox API port (default: 8006)
export PROXMOX_PORT="8006"

# Realm (default: pam)
export PROXMOX_REALM="pam"

# SSL/TLS verification (default: true)
# Set to false only for self-signed certificates in development
export PROXMOX_VERIFY_SSL="true"

# Request timeout in milliseconds (default: 30000)
export PROXMOX_TIMEOUT="30000"
```

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/Swartdraak/Proxmox-MCP.git
cd Proxmox-MCP

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Run the server
npm start
```

### Development Workflow

```bash
# Watch mode (automatically rebuilds on changes)
npm run watch

# Type checking without building
npm run lint

# Clean build artifacts
npm run clean

# Clean and rebuild
npm run clean && npm run build
```

### Project Structure

```
src/
└── index.ts              # Main server entry point
```

### Testing

```bash
# This project does not yet include automated tests.
# Running the default test script will simply report that no tests are defined:
npm test
```

### Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of conduct
- Development setup
- Coding standards
- Pull request process
- Security guidelines

## Support

### Getting Help

- **Documentation**: Check the [Installation](INSTALLATION.md) and [IDE Configuration](IDE_CONFIGURATION.md) guides
- **Issues**: Search [existing issues](https://github.com/Swartdraak/Proxmox-MCP/issues) or open a new one
- **Discussions**: Join [GitHub Discussions](https://github.com/Swartdraak/Proxmox-MCP/discussions)
- **Examples**: See the [examples](examples/) directory for configuration samples

### Reporting Issues

When reporting issues, please include:
- Operating system and version
- Node.js version (`node --version`)
- Installation method (npm, npx, or repository clone)
- IDE and version
- Complete error messages and logs
- Steps to reproduce the issue

## Security

The Proxmox MCP Server is built with security as a top priority:

- **Input Validation**: All inputs are validated and sanitized using standard TypeScript checks
- **TLS/SSL Support**: Full support for SSL/TLS certificate verification
- **Secure Credentials**: Credentials are never logged or exposed
- **Minimal API Surface**: Only essential Proxmox API endpoints are exposed
- **API Token Support**: Recommended authentication method with granular permissions
- **No Credential Storage**: Credentials are passed via environment variables only

### Security Best Practices

1. **Use API Tokens**: Prefer API tokens over password authentication
2. **Limit Permissions**: Create tokens with only the necessary permissions
3. **Enable SSL/TLS**: Always use `PROXMOX_VERIFY_SSL=true` in production
4. **Secure Environment Variables**: Use secure methods to store environment variables
5. **Regular Updates**: Keep the MCP server updated to get security patches
6. **Network Security**: Ensure Proxmox API is not exposed to untrusted networks
7. **Audit Access**: Regularly review Proxmox audit logs for unauthorized access
8. **Rate Limiting**: Deploy behind a reverse proxy or API gateway (e.g., nginx, Caddy) that enforces rate limits appropriate for your environment

## Troubleshooting

### Common Issues

**Problem**: Cannot connect to Proxmox server

**Solutions**:
- Verify `PROXMOX_HOST` is correct and accessible
- Check that port 8006 (or your custom port) is open
- Ensure firewall allows connections from your machine
- Try setting `PROXMOX_VERIFY_SSL=false` for self-signed certificates (development only)

**Problem**: Authentication failures

**Solutions**:
- Verify your API token or password is correct
- Check that the token hasn't expired
- Ensure the user has sufficient permissions
- Verify `PROXMOX_REALM` is set correctly (usually "pam" or "pve")

**Problem**: Tools not appearing in IDE

**Solutions**:
- Restart your IDE after configuration changes
- Check the IDE's MCP server logs for errors
- Verify the configuration file syntax is valid JSON
- Ensure all required environment variables are set

**Problem**: Permission denied errors

**Solutions**:
- Check that your API token or user has the required permissions
- Review Proxmox role assignments for your user
- Ensure the token was created without "Privilege Separation" if full access is needed

For more detailed troubleshooting, see:
- [Installation Guide - Troubleshooting](INSTALLATION.md#troubleshooting)
- [IDE Configuration Guide - Troubleshooting](IDE_CONFIGURATION.md#troubleshooting)
- [GitHub Issues](https://github.com/Swartdraak/Proxmox-MCP/issues)

## Contributing

Contributions are welcome! Whether you're fixing bugs, adding features, or improving documentation, we appreciate your help.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Powered by [Proxmox VE](https://www.proxmox.com/proxmox-ve)
- Inspired by the growing ecosystem of MCP-compatible tools

## Related Projects

- [MCP Servers Directory](https://github.com/modelcontextprotocol/servers)
- [Awesome MCP Servers](https://github.com/wong2/awesome-mcp-servers)
- [MCP Documentation](https://modelcontextprotocol.io/)

---

**Made with ❤️ for the Proxmox and AI communities**
