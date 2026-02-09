# IDE Configuration Guide

This guide provides detailed configuration instructions for integrating the Proxmox MCP Server with various IDEs and AI-powered development tools.

## Table of Contents

- [Overview](#overview)
- [Configuration Methods](#configuration-methods)
- [Claude Desktop](#claude-desktop)
- [VS Code](#vs-code)
- [Cursor](#cursor)
- [Continue](#continue)
- [Cline (Roo-Cline)](#cline-roo-cline)
- [Zed](#zed)
- [Other MCP-Compatible IDEs](#other-mcp-compatible-ides)
- [Troubleshooting](#troubleshooting)

## Overview

The Proxmox MCP Server can be integrated with various AI-powered IDEs and development tools that support the Model Context Protocol (MCP). Each IDE has its own configuration method, but they all follow similar patterns.

## Configuration Methods

Depending on how you installed the Proxmox MCP Server, you'll use different commands in your IDE configuration:

### NPM Global Installation

```json
{
  "command": "proxmox-mcp-server"
}
```

### NPX (No Installation)

```json
{
  "command": "npx",
  "args": ["-y", "@swartdraak/proxmox-mcp-server"]
}
```

### Repository Clone (with npm link)

```json
{
  "command": "proxmox-mcp-server"
}
```

### Repository Clone (without npm link)

```json
{
  "command": "node",
  "args": ["/absolute/path/to/Proxmox-MCP/dist/index.js"]
}
```

**Note**: Replace `/absolute/path/to/Proxmox-MCP` with the actual path where you cloned the repository.

## Claude Desktop

Claude Desktop is an AI assistant application that supports MCP servers for extended functionality.

### Configuration File Location

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

### Configuration Examples

#### Using NPX (Recommended for Claude Desktop)

**macOS/Linux**:

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "npx",
      "args": ["-y", "@swartdraak/proxmox-mcp-server"],
      "env": {
        "PROXMOX_HOST": "proxmox.example.com",
        "PROXMOX_USERNAME": "root",
        "PROXMOX_PORT": "8006",
        "PROXMOX_TOKEN_ID": "your-token-id",
        "PROXMOX_TOKEN_SECRET": "your-token-secret",
        "PROXMOX_REALM": "pam",
        "PROXMOX_VERIFY_SSL": "true",
        "PROXMOX_TIMEOUT": "30000"
      }
    }
  }
}
```

**Windows**:

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "npx",
      "args": ["-y", "@swartdraak/proxmox-mcp-server"],
      "env": {
        "PROXMOX_HOST": "proxmox.example.com",
        "PROXMOX_USERNAME": "root",
        "PROXMOX_PORT": "8006",
        "PROXMOX_TOKEN_ID": "your-token-id",
        "PROXMOX_TOKEN_SECRET": "your-token-secret",
        "PROXMOX_REALM": "pam",
        "PROXMOX_VERIFY_SSL": "true",
        "PROXMOX_TIMEOUT": "30000"
      }
    }
  }
}
```

#### Using Global Installation

**macOS/Linux**:

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "proxmox-mcp-server",
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

**Windows**:

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "proxmox-mcp-server",
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

#### Using Repository Clone

**macOS/Linux**:

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "node",
      "args": ["/home/username/Proxmox-MCP/dist/index.js"],
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

**Windows**:

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "node",
      "args": ["C:\\Users\\YourUsername\\Proxmox-MCP\\dist\\index.js"],
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

### Restarting Claude Desktop

After editing the configuration file, restart Claude Desktop for changes to take effect.

## VS Code

Visual Studio Code supports MCP through extensions like the official MCP extension or through Continue.

### Method 1: Using MCP Extension

1. Install the [MCP Extension](https://marketplace.visualstudio.com/items?itemName=modelcontextprotocol.mcp) from the VS Code marketplace

2. Open VS Code settings (Ctrl+, or Cmd+,)

3. Search for "MCP" in settings

4. Configure the MCP servers in your `settings.json`:

**Using NPX (Linux/macOS)**:

```json
{
  "mcp.servers": {
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

**Using NPX (Windows)**:

```json
{
  "mcp.servers": {
    "proxmox": {
      "command": "npx.cmd",
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

**Using Global Installation (All Platforms)**:

```json
{
  "mcp.servers": {
    "proxmox": {
      "command": "proxmox-mcp-server",
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

**Using Repository Clone (Linux/macOS)**:

```json
{
  "mcp.servers": {
    "proxmox": {
      "command": "node",
      "args": ["/home/username/Proxmox-MCP/dist/index.js"],
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

**Using Repository Clone (Windows)**:

```json
{
  "mcp.servers": {
    "proxmox": {
      "command": "node",
      "args": ["C:\\Users\\YourUsername\\Proxmox-MCP\\dist\\index.js"],
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

### Method 2: Using Continue Extension

See the [Continue](#continue) section below.

## Cursor

Cursor is an AI-powered code editor with built-in MCP support.

### Configuration File Location

**macOS**:
```
~/Library/Application Support/Cursor/User/globalStorage/settings.json
```
or create a `.cursor/config.json` in your project directory.

**Windows**:
```
%APPDATA%\Cursor\User\globalStorage\settings.json
```

**Linux**:
```
~/.config/Cursor/User/globalStorage/settings.json
```

### Configuration Examples

**Using NPX (Linux/macOS)**:

```json
{
  "mcp": {
    "servers": {
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
}
```

**Using NPX (Windows)**:

```json
{
  "mcp": {
    "servers": {
      "proxmox": {
        "command": "npx.cmd",
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
}
```

**Using Global Installation**:

```json
{
  "mcp": {
    "servers": {
      "proxmox": {
        "command": "proxmox-mcp-server",
        "env": {
          "PROXMOX_HOST": "proxmox.example.com",
          "PROXMOX_USERNAME": "root",
          "PROXMOX_TOKEN_ID": "your-token-id",
          "PROXMOX_TOKEN_SECRET": "your-token-secret"
        }
      }
    }
  }
}
```

**Using Repository Clone (Linux/macOS)**:

```json
{
  "mcp": {
    "servers": {
      "proxmox": {
        "command": "node",
        "args": ["/home/username/Proxmox-MCP/dist/index.js"],
        "env": {
          "PROXMOX_HOST": "proxmox.example.com",
          "PROXMOX_USERNAME": "root",
          "PROXMOX_TOKEN_ID": "your-token-id",
          "PROXMOX_TOKEN_SECRET": "your-token-secret"
        }
      }
    }
  }
}
```

**Using Repository Clone (Windows)**:

```json
{
  "mcp": {
    "servers": {
      "proxmox": {
        "command": "node",
        "args": ["C:\\Users\\YourUsername\\Proxmox-MCP\\dist\\index.js"],
        "env": {
          "PROXMOX_HOST": "proxmox.example.com",
          "PROXMOX_USERNAME": "root",
          "PROXMOX_TOKEN_ID": "your-token-id",
          "PROXMOX_TOKEN_SECRET": "your-token-secret"
        }
      }
    }
  }
}
```

## Continue

Continue is a popular AI coding assistant extension for VS Code and JetBrains IDEs.

### Configuration File Location

**VS Code**:
```
~/.continue/config.json
```

**JetBrains IDEs**:
```
~/.continue/config.json
```

### Configuration Examples

**Using NPX (Linux/macOS)**:

```json
{
  "mcpServers": [
    {
      "name": "proxmox",
      "transport": {
        "type": "stdio",
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
  ]
}
```

**Using NPX (Windows)**:

```json
{
  "mcpServers": [
    {
      "name": "proxmox",
      "transport": {
        "type": "stdio",
        "command": "npx.cmd",
        "args": ["-y", "@swartdraak/proxmox-mcp-server"],
        "env": {
          "PROXMOX_HOST": "proxmox.example.com",
          "PROXMOX_USERNAME": "root",
          "PROXMOX_TOKEN_ID": "your-token-id",
          "PROXMOX_TOKEN_SECRET": "your-token-secret"
        }
      }
    }
  ]
}
```

**Using Global Installation**:

```json
{
  "mcpServers": [
    {
      "name": "proxmox",
      "transport": {
        "type": "stdio",
        "command": "proxmox-mcp-server",
        "env": {
          "PROXMOX_HOST": "proxmox.example.com",
          "PROXMOX_USERNAME": "root",
          "PROXMOX_TOKEN_ID": "your-token-id",
          "PROXMOX_TOKEN_SECRET": "your-token-secret"
        }
      }
    }
  ]
}
```

**Using Repository Clone (Linux/macOS)**:

```json
{
  "mcpServers": [
    {
      "name": "proxmox",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["/home/username/Proxmox-MCP/dist/index.js"],
        "env": {
          "PROXMOX_HOST": "proxmox.example.com",
          "PROXMOX_USERNAME": "root",
          "PROXMOX_TOKEN_ID": "your-token-id",
          "PROXMOX_TOKEN_SECRET": "your-token-secret"
        }
      }
    }
  ]
}
```

**Using Repository Clone (Windows)**:

```json
{
  "mcpServers": [
    {
      "name": "proxmox",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["C:\\Users\\YourUsername\\Proxmox-MCP\\dist\\index.js"],
        "env": {
          "PROXMOX_HOST": "proxmox.example.com",
          "PROXMOX_USERNAME": "root",
          "PROXMOX_TOKEN_ID": "your-token-id",
          "PROXMOX_TOKEN_SECRET": "your-token-secret"
        }
      }
    }
  ]
}
```

### Accessing in Continue

After configuration, restart VS Code and:
1. Open Continue (Ctrl+Shift+P → "Continue: Open")
2. Type `@` in the chat to see available MCP tools
3. Select Proxmox tools to interact with your Proxmox server

## Cline (Roo-Cline)

Cline (formerly Roo-Cline) is a VS Code extension that provides AI-assisted coding with MCP support.

### Configuration

1. Install the [Cline extension](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev) from VS Code marketplace

2. Open Cline settings (click the gear icon in Cline panel)

3. Navigate to "MCP Servers" section

4. Add the Proxmox MCP Server configuration:

**Using NPX (Linux/macOS)**:

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

**Using NPX (Windows)**:

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "npx.cmd",
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

**Using Global Installation**:

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "proxmox-mcp-server",
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

**Using Repository Clone (Linux/macOS)**:

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "node",
      "args": ["/home/username/Proxmox-MCP/dist/index.js"],
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

**Using Repository Clone (Windows)**:

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "node",
      "args": ["C:\\Users\\YourUsername\\Proxmox-MCP\\dist\\index.js"],
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

5. Click "Save" and restart Cline

## Zed

Zed is a high-performance code editor with built-in MCP support.

### Configuration File Location

**macOS**:
```
~/.config/zed/settings.json
```

**Linux**:
```
~/.config/zed/settings.json
```

**Windows**:
```
%APPDATA%\Zed\settings.json
```

### Configuration Examples

**Using NPX (Linux/macOS)**:

```json
{
  "context_servers": {
    "proxmox": {
      "command": {
        "path": "npx",
        "args": ["-y", "@swartdraak/proxmox-mcp-server"]
      },
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

**Using NPX (Windows)**:

```json
{
  "context_servers": {
    "proxmox": {
      "command": {
        "path": "npx.cmd",
        "args": ["-y", "@swartdraak/proxmox-mcp-server"]
      },
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

**Using Global Installation**:

```json
{
  "context_servers": {
    "proxmox": {
      "command": {
        "path": "proxmox-mcp-server"
      },
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

**Using Repository Clone (Linux/macOS)**:

```json
{
  "context_servers": {
    "proxmox": {
      "command": {
        "path": "node",
        "args": ["/home/username/Proxmox-MCP/dist/index.js"]
      },
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

**Using Repository Clone (Windows)**:

```json
{
  "context_servers": {
    "proxmox": {
      "command": {
        "path": "node",
        "args": ["C:\\Users\\YourUsername\\Proxmox-MCP\\dist\\index.js"]
      },
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

### Using in Zed

After configuration:
1. Use slash commands in the assistant panel
2. Type `/` to see available prompts and tools
3. The Proxmox tools will be available for use

## Other MCP-Compatible IDEs

The following IDEs and tools also support MCP. Configuration is similar to the examples above:

### Sourcegraph Cody

Cody supports MCP through OpenCTX integration. Configuration varies, so refer to the [Cody documentation](https://sourcegraph.com/docs/cody).

### TheiaIDE

TheiaIDE supports MCP for agent integrations. Configuration is typically done through workspace settings.

### OpenSumi

OpenSumi supports MCP tool integration. Configure through the IDE settings JSON file.

### AIQL TUUI

AIQL TUUI is a cross-platform AI chat application with MCP support. Configuration follows similar patterns to Claude Desktop.

### General Configuration Pattern

For any MCP-compatible IDE not listed here, the general configuration pattern is:

```json
{
  "command": "npx",
  "args": ["-y", "@swartdraak/proxmox-mcp-server"],
  "env": {
    "PROXMOX_HOST": "your-host",
    "PROXMOX_USERNAME": "your-username",
    "PROXMOX_TOKEN_ID": "your-token-id",
    "PROXMOX_TOKEN_SECRET": "your-token-secret"
  }
}
```

**Notes:**
- Use `"command": "proxmox-mcp-server"` for global installations
- Use `"command": "node"` with `"args": ["/path/to/dist/index.js"]` for repository clones
- If using npx, include the args array as shown above

## Troubleshooting

### Server Not Found

**Problem**: IDE cannot find the MCP server

**Solutions**:
- Ensure the command path is correct
- Try using absolute paths instead of relative paths
- For Windows, ensure you're using the correct command (e.g., `npx.cmd` instead of `npx`)
- Verify the server is installed correctly by running it manually in a terminal

### Connection Errors

**Problem**: Cannot connect to Proxmox server

**Solutions**:
- Verify environment variables are set correctly
- Check that `PROXMOX_HOST` is accessible from your machine
- Ensure firewall allows connections to Proxmox port (default 8006)
- For self-signed certificates, set `PROXMOX_VERIFY_SSL: "false"`

### Authentication Failures

**Problem**: Authentication to Proxmox fails

**Solutions**:
- Verify your API token is valid and not expired
- Ensure `PROXMOX_TOKEN_ID` and `PROXMOX_TOKEN_SECRET` are correct
- Check that the token has sufficient permissions
- Verify `PROXMOX_REALM` is set correctly (usually "pam" or "pve")

### Tools Not Appearing

**Problem**: Proxmox tools don't show up in IDE

**Solutions**:
- Restart the IDE after configuration changes
- Check IDE logs for error messages
- Verify the MCP server is running (check process list)
- Ensure the configuration file syntax is valid JSON

### Path Issues on Windows

**Problem**: Windows paths with backslashes cause errors

**Solutions**:
- Use double backslashes: `C:\\Users\\...`
- Or use forward slashes: `C:/Users/...`
- Or use raw strings if your IDE supports them

### Permission Denied

**Problem**: Permission errors when starting the server

**Solutions**:
- Ensure the executable has proper permissions (Linux/macOS)
- Run IDE with appropriate permissions
- Check that Node.js is in your PATH

### Getting More Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/Swartdraak/Proxmox-MCP/issues)
2. Review IDE-specific MCP documentation
3. Enable debug logging in your IDE
4. Open a new issue with:
   - Your operating system and version
   - IDE and version
   - Installation method (npm/npx/repo)
   - Full configuration (with credentials redacted)
   - Error messages and logs

## Additional Resources

- [MCP Official Documentation](https://modelcontextprotocol.io/)
- [Proxmox MCP Server GitHub](https://github.com/Swartdraak/Proxmox-MCP)
- [Installation Guide](INSTALLATION.md)
- [Contributing Guide](CONTRIBUTING.md)
