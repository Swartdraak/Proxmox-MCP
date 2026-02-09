# Proxmox VE MCP Server

[![npm version](https://badge.fury.io/js/@swartdraak%2Fproxmox-mcp-server.svg)](https://www.npmjs.com/package/@swartdraak/proxmox-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for managing Proxmox VE infrastructure through AI assistants like Claude and GitHub Copilot.

## Installation

```bash
npm install -g @swartdraak/proxmox-mcp-server
```

Or use directly with npx:

```bash
npx @swartdraak/proxmox-mcp-server
```

## Configuration

Set environment variables for your Proxmox connection:

```bash
export PROXMOX_HOST="proxmox.example.com"
export PROXMOX_USERNAME="root"
export PROXMOX_TOKEN_ID="your-token-id"
export PROXMOX_TOKEN_SECRET="your-token-secret"
# Optional
export PROXMOX_PORT="8006"
export PROXMOX_REALM="pam"
export PROXMOX_VERIFY_SSL="true"
export PROXMOX_TIMEOUT="30000"
```

## Claude Desktop Integration

Add to your Claude configuration:

**macOS**: ~/Library/Application Support/Claude/claude_desktop_config.json

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

**Windows**: %APPDATA%\Claude\claude_desktop_config.json

## Available Tools

### VMs

- list_vms - List all virtual machines
- get_vm_status - Get VM status
- start_vm - Start a VM
- stop_vm - Stop a VM (graceful or forced)
- estart_vm - Restart a VM
- create_vm - Create a new VM
- delete_vm - Delete a VM
- clone_vm - Clone a VM
- get_vm_config - Get VM configuration

### Containers

- list_containers - List all containers
- get_container_status - Get container status
- start_container - Start a container
- stop_container - Stop a container
- create_container - Create a new container
- delete_container - Delete a container

### Nodes

- list_nodes - List all cluster nodes
- get_node_status - Get node status and resource usage

### Storage

- list_storage - List all storage
- get_storage_status - Get storage content

## Authentication

Two authentication methods are supported:

**API Token (Recommended)**:
```bash
export PROXMOX_TOKEN_ID="my-token"
export PROXMOX_TOKEN_SECRET="secret-key"
```

**Password Authentication**:
```bash
export PROXMOX_PASSWORD="your-password"
```

## Development

```bash
# Clone and setup
git clone https://github.com/Swartdraak/Proxmox-MCP.git
cd Proxmox-MCP
npm install

# Build
npm run build

# Start
npm start
```

## Security

- Input validation and sanitization
- TLS/SSL certificate verification
- No credential logging
- Minimal API surface (only what's needed)

## License

MIT

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
