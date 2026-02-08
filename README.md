# Proxmox VE MCP Server

[![CI/CD](https://github.com/Swartdraak/Proxmox-MCP/actions/workflows/ci.yml/badge.svg)](https://github.com/Swartdraak/Proxmox-MCP/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@swartdraak%2Fproxmox-mcp-server.svg)](https://www.npmjs.com/package/@swartdraak/proxmox-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/Swartdraak/Proxmox-MCP/branch/main/graph/badge.svg)](https://codecov.io/gh/Swartdraak/Proxmox-MCP)

An industry-standard, security-first [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for Proxmox VE. This server enables AI assistants like Claude to interact with your Proxmox infrastructure through a secure, well-documented interface.

## 🌟 Features

- **🔒 Security First**: Built with security best practices
  - Input validation and sanitization
  - Rate limiting to prevent abuse
  - Security audit logging
  - SSL/TLS certificate validation
  - No credential exposure

- **📦 Comprehensive Coverage**: Full Proxmox VE API integration
  - Virtual Machine (QEMU) management
  - Container (LXC) management
  - Node monitoring and management
  - Storage operations
  - Resource monitoring

- **🛡️ Safety Controls**: Multiple layers of protection
  - Operation validation
  - Dry-run mode support
  - Destructive action confirmations
  - Role-based access control ready

- **🧪 Well Tested**: Comprehensive test coverage
  - Unit tests with Vitest
  - Integration tests
  - Fuzzing tests for security
  - >80% code coverage

- **📚 Excellent Documentation**: Complete documentation suite
  - API documentation
  - Usage examples
  - Security guidelines
  - Troubleshooting guides

- **🚀 CI/CD Ready**: Production-ready automation
  - Automated testing
  - Security scanning
  - Dependency updates
  - Automated releases

## 📋 Prerequisites

- Node.js 18 or later
- Proxmox VE 7.0 or later
- Valid Proxmox credentials (password or API token)

## 🚀 Quick Start

### Installation

```bash
npm install -g @swartdraak/proxmox-mcp-server
```

Or use directly with npx:

```bash
npx @swartdraak/proxmox-mcp-server
```

### Configuration

Set up your Proxmox credentials as environment variables:

```bash
# Using password authentication
export PROXMOX_HOST="proxmox.example.com"
export PROXMOX_USERNAME="root"
export PROXMOX_PASSWORD="your-password"
export PROXMOX_REALM="pam"  # Optional, defaults to 'pam'

# OR using API token authentication (recommended)
export PROXMOX_HOST="proxmox.example.com"
export PROXMOX_USERNAME="root"
export PROXMOX_TOKEN_ID="your-token-id"
export PROXMOX_TOKEN_SECRET="your-token-secret"
export PROXMOX_REALM="pam"

# Optional settings
export PROXMOX_PORT="8006"  # Default: 8006
export PROXMOX_VERIFY_SSL="true"  # Default: true
export PROXMOX_TIMEOUT="30000"  # Default: 30000ms
```

### Claude Desktop Configuration

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

## 🔧 Usage

Once configured, you can interact with your Proxmox infrastructure through Claude:

### Example Queries

- "List all VMs in my Proxmox cluster"
- "Show me the status of VM 100 on node pve"
- "Create a new VM with 4 cores and 8GB RAM"
- "Start all stopped VMs"
- "Give me an overview of my cluster resources"

### Available Tools

#### Virtual Machine Management
- `list_vms` - List all virtual machines
- `get_vm_status` - Get VM status
- `start_vm` - Start a VM
- `stop_vm` - Stop a VM (graceful shutdown)
- `restart_vm` - Restart a VM
- `create_vm` - Create a new VM
- `delete_vm` - Delete a VM
- `clone_vm` - Clone a VM
- `get_vm_config` - Get VM configuration

#### Container Management
- `list_containers` - List all containers
- `get_container_status` - Get container status
- `start_container` - Start a container
- `stop_container` - Stop a container
- `create_container` - Create a new container
- `delete_container` - Delete a container

#### Node Management
- `list_nodes` - List all cluster nodes
- `get_node_status` - Get node status and resources

#### Storage Management
- `list_storage` - List all storage
- `get_storage_status` - Get storage status
- `list_storage_content` - List storage content

### Available Prompts

- `create-vm-wizard` - Interactive VM creation wizard
- `vm-health-check` - Check health of all VMs
- `cluster-overview` - Get comprehensive cluster overview

### Available Resources

- `proxmox://cluster/overview` - Cluster overview (nodes, VMs, containers)
- `proxmox://audit/logs` - Security audit logs

## 🔐 Security

### Best Practices

1. **Use API Tokens**: Prefer API tokens over passwords for authentication
2. **Enable SSL Verification**: Always verify SSL certificates in production
3. **Limit Permissions**: Create dedicated API tokens with minimal required permissions
4. **Monitor Audit Logs**: Regularly review security audit logs
5. **Rate Limiting**: Built-in rate limiting prevents abuse (100 requests/minute default)

### Creating a Proxmox API Token

1. Log in to Proxmox web interface
2. Go to Datacenter → Permissions → API Tokens
3. Click "Add" to create a new token
4. Save the token ID and secret securely
5. Assign appropriate permissions to the token

### Security Features

- ✅ Input validation and sanitization
- ✅ Rate limiting (token bucket algorithm)
- ✅ Security audit logging
- ✅ SSL/TLS certificate validation
- ✅ No credential exposure in logs
- ✅ Zod schema validation
- ✅ TypeScript strict mode

## 🧪 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/Swartdraak/Proxmox-MCP.git
cd Proxmox-MCP

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run fuzzing tests
npm run test:fuzz

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
proxmox-mcp/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── client/               # Proxmox API client
│   ├── tools/                # MCP tools
│   ├── security/             # Security components
│   ├── types/                # TypeScript types
│   └── config/               # Configuration
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   ├── fuzzing/              # Fuzzing tests
│   └── e2e/                  # End-to-end tests
├── docs/                     # Documentation
└── .github/workflows/        # CI/CD pipelines
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run fuzzing tests
npm run test:fuzz
```

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Architecture Overview](docs/architecture.md)
- [Security Guidelines](docs/security.md)
- [Troubleshooting Guide](docs/troubleshooting.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting PRs.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
- [Proxmox VE](https://www.proxmox.com/proxmox-ve) by Proxmox Server Solutions GmbH
- The open-source community

## 📞 Support

- 🐛 [Report a Bug](https://github.com/Swartdraak/Proxmox-MCP/issues)
- 💡 [Request a Feature](https://github.com/Swartdraak/Proxmox-MCP/issues)
- 💬 [Discussions](https://github.com/Swartdraak/Proxmox-MCP/discussions)

## 🗺️ Roadmap

- [ ] Add backup and restore operations
- [ ] Implement cluster-wide operations
- [ ] Add support for Proxmox Backup Server
- [ ] Implement webhooks for events
- [ ] Add support for custom templates
- [ ] Implement resource scheduling
- [ ] Add Prometheus metrics export

## 📊 Project Status

This project is actively maintained and under continuous development. We welcome contributions and feedback from the community.

---

Made with ❤️ for the Proxmox and AI communities