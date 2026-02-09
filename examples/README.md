# Configuration Examples

This directory contains example configuration files for various IDEs and AI assistants that support the Model Context Protocol (MCP).

## Available Examples

- **[claude-config.json](claude-config.json)** - Configuration for Claude Desktop
- **[vscode-settings.json](vscode-settings.json)** - Configuration for VS Code MCP extension
- **[cursor-config.json](cursor-config.json)** - Configuration for Cursor IDE
- **[continue-config.json](continue-config.json)** - Configuration for Continue extension
- **[cline-config.json](cline-config.json)** - Configuration for Cline/Roo-Cline extension
- **[zed-settings.json](zed-settings.json)** - Configuration for Zed editor

## How to Use

1. Choose the configuration file for your IDE
2. Copy the content to the appropriate location (see below)
3. Replace the placeholder values with your actual Proxmox credentials:
   - `proxmox.example.com` → Your Proxmox server hostname/IP
   - `your-token-id` → Your Proxmox API token ID
   - `your-token-secret` → Your Proxmox API token secret

## Configuration File Locations

### Claude Desktop

**macOS**: 
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows**: 
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux**: 
```
~/.config/Claude/claude_desktop_config.json
```

### VS Code

Add to your VS Code `settings.json`:
- Open Settings (Ctrl+, or Cmd+,)
- Click the "Open Settings (JSON)" icon in the top right
- Add the MCP server configuration to the settings object

### Cursor

**macOS/Linux**: 
```
~/.config/Cursor/User/globalStorage/settings.json
```

**Windows**: 
```
%APPDATA%\Cursor\User\globalStorage\settings.json
```

### Continue

```
~/.continue/config.json
```

### Cline (Roo-Cline)

Configure through the Cline extension settings in VS Code:
- Open Cline panel
- Click settings gear icon
- Navigate to "MCP Servers" section
- Add the configuration

### Zed

**macOS/Linux**: 
```
~/.config/zed/settings.json
```

**Windows**: 
```
%APPDATA%\Zed\settings.json
```

## Installation Methods

All examples use `npx` for maximum compatibility and ease of use. If you prefer a different installation method, modify the `command` and `args` fields:

### Global NPM Installation

```json
{
  "command": "proxmox-mcp-server"
}
```

### Repository Clone (with npm link)

```json
{
  "command": "proxmox-mcp-server"
}
```

### Repository Clone (without npm link)

**Linux/macOS**:
```json
{
  "command": "node",
  "args": ["/absolute/path/to/Proxmox-MCP/dist/index.js"]
}
```

**Windows**:
```json
{
  "command": "node",
  "args": ["C:\\absolute\\path\\to\\Proxmox-MCP\\dist\\index.js"]
}
```

## Environment Variables

All examples include the following environment variables:

- `PROXMOX_HOST` - Your Proxmox server hostname or IP address (required)
- `PROXMOX_PORT` - Proxmox API port (default: 8006, optional)
- `PROXMOX_USERNAME` - Proxmox username (default: root, required)
- `PROXMOX_TOKEN_ID` - API token ID (required for token authentication)
- `PROXMOX_TOKEN_SECRET` - API token secret (required for token authentication)
- `PROXMOX_REALM` - Authentication realm (default: pam, optional)
- `PROXMOX_VERIFY_SSL` - Enable SSL/TLS verification (default: true, optional)
- `PROXMOX_TIMEOUT` - API request timeout in milliseconds (default: 30000, optional)

## Alternative: Password Authentication

If you prefer password authentication (less secure), replace the token variables with:

```json
"env": {
  "PROXMOX_HOST": "proxmox.example.com",
  "PROXMOX_USERNAME": "root",
  "PROXMOX_PASSWORD": "your-password",
  "PROXMOX_REALM": "pam"
}
```

**Note**: API token authentication is recommended for better security.

## Troubleshooting

### Windows-Specific Issues

On Windows, you may need to use `npx.cmd` instead of `npx`:

```json
{
  "command": "npx.cmd",
  "args": ["-y", "@swartdraak/proxmox-mcp-server"]
}
```

### Self-Signed Certificates

If your Proxmox server uses a self-signed certificate, set:

```json
"PROXMOX_VERIFY_SSL": "false"
```

**Warning**: Only use this in development environments. In production, use valid SSL certificates.

### Connection Issues

If you're having connection issues:

1. Verify your Proxmox server is accessible: `ping proxmox.example.com`
2. Check the port is open: `telnet proxmox.example.com 8006`
3. Verify your API token is valid in the Proxmox web interface
4. Check firewall rules allow connections from your machine

## Additional Resources

- [Installation Guide](../INSTALLATION.md) - Detailed installation instructions
- [IDE Configuration Guide](../IDE_CONFIGURATION.md) - Complete IDE setup guide
- [README](../README.md) - Main documentation
- [Contributing](../CONTRIBUTING.md) - How to contribute to the project

## Need Help?

- Check the [Troubleshooting sections](../IDE_CONFIGURATION.md#troubleshooting)
- Review [GitHub Issues](https://github.com/Swartdraak/Proxmox-MCP/issues)
- Open a new issue if you need assistance
