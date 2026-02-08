# Cross-Platform Development Guide

This guide provides information for developing and using the Proxmox MCP Server across different platforms (Windows, Linux, macOS) and with various IDE integrations.

## Platform-Specific Considerations

### Windows

#### Prerequisites
- Node.js 18+ (Download from [nodejs.org](https://nodejs.org/))
- Git for Windows (for proper line ending handling)
- Windows Terminal (recommended for better console experience)

#### Installation
```powershell
# Using npm
npm install -g @swartdraak/proxmox-mcp-server

# Or using npx
npx @swartdraak/proxmox-mcp-server
```

#### Configuration Path
Store your Claude Desktop configuration at:
```
%APPDATA%\Claude\claude_desktop_config.json
```

#### Known Issues
- The `chmod` command in the build process is skipped on Windows (not needed)
- Use PowerShell or Windows Terminal for best experience
- Environment variables can be set in System Properties or via `setx` command

### Linux

#### Prerequisites
- Node.js 18+ (via package manager or nvm)
- Standard development tools (gcc, make)

#### Installation
```bash
# Using npm
sudo npm install -g @swartdraak/proxmox-mcp-server

# Or using npx (no sudo required)
npx @swartdraak/proxmox-mcp-server
```

#### Configuration Path
Store your Claude Desktop configuration at:
```
~/.config/Claude/claude_desktop_config.json
```

### macOS

#### Prerequisites
- Node.js 18+ (via Homebrew or nvm)
- Xcode Command Line Tools

#### Installation
```bash
# Install via Homebrew (if available)
brew install node

# Then install the package
npm install -g @swartdraak/proxmox-mcp-server

# Or using npx
npx @swartdraak/proxmox-mcp-server
```

#### Configuration Path
Store your Claude Desktop configuration at:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

## IDE Integration

### Visual Studio Code

#### Recommended Extensions
This project includes recommended extensions in `.vscode/extensions.json`:
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Enhanced TypeScript support
- **Jest** - Test support
- **Path Intellisense** - File path autocomplete
- **IntelliCode** - AI-assisted code completion

#### Setup
1. Open the project in VS Code
2. Install recommended extensions when prompted
3. The workspace settings will automatically configure formatting and linting

#### GitHub Copilot Integration
This project is optimized for GitHub Copilot:
- Comprehensive JSDoc comments provide context
- Clear type definitions help Copilot understand code structure
- Well-structured tests serve as examples
- Consistent naming conventions improve suggestions

### JetBrains IDEs (WebStorm, IntelliJ IDEA)

#### Setup
1. Open the project in your JetBrains IDE
2. Enable Node.js support: Settings → Languages & Frameworks → Node.js
3. Enable ESLint: Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
4. Enable Prettier: Settings → Languages & Frameworks → JavaScript → Prettier

#### AI Assistant Integration
JetBrains AI Assistant works well with this project:
- Type annotations are comprehensive
- Code is well-documented
- Clear module boundaries
- Consistent code style

### Other IDEs

#### Sublime Text / Atom / Vim / Emacs
- Use LSP (Language Server Protocol) plugins for TypeScript support
- Configure ESLint and Prettier plugins
- Ensure Node.js is in your PATH

## Agentic LLM Integration

### GitHub Copilot

This codebase is designed to work well with GitHub Copilot:

#### Features that Help Copilot
1. **Type Safety**: Comprehensive TypeScript types
2. **Documentation**: JSDoc comments on all public APIs
3. **Consistent Patterns**: Predictable code structure
4. **Clear Naming**: Descriptive variable and function names
5. **Test Examples**: Comprehensive test suite shows usage patterns

#### Tips for Using Copilot
- Use descriptive comments to guide suggestions
- Follow existing patterns in the codebase
- Review generated code for security implications
- Run tests after accepting suggestions

### Claude Code / ChatGPT

The project structure is optimized for AI assistants:

#### Context Files
- `README.md` - High-level overview
- `CONTRIBUTING.md` - Development guidelines
- `docs/` - Detailed documentation
- Type definitions in `src/types/`

#### Getting Help from AI
When asking AI assistants about this code:
1. Reference the relevant module (e.g., "in src/client/proxmox-client.ts")
2. Include error messages or logs
3. Mention the platform you're using
4. Specify the Node.js version

## Building and Testing

### Cross-Platform Build
```bash
# Install dependencies
npm ci

# Build (works on all platforms)
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

### Platform-Specific Notes

#### Windows
```powershell
# Use PowerShell or Command Prompt
npm run build

# The postbuild script skips chmod on Windows
```

#### Linux/macOS
```bash
# Standard npm scripts work as expected
npm run build

# The postbuild script sets executable permission on dist/index.js
```

## Environment Variables

### Setting Environment Variables

#### Windows (PowerShell)
```powershell
$env:PROXMOX_HOST = "proxmox.example.com"
$env:PROXMOX_USERNAME = "root"
$env:PROXMOX_TOKEN_ID = "your-token-id"
$env:PROXMOX_TOKEN_SECRET = "your-token-secret"
```

#### Windows (Command Prompt)
```cmd
set PROXMOX_HOST=proxmox.example.com
set PROXMOX_USERNAME=root
set PROXMOX_TOKEN_ID=your-token-id
set PROXMOX_TOKEN_SECRET=your-token-secret
```

#### Linux/macOS (Bash/Zsh)
```bash
export PROXMOX_HOST="proxmox.example.com"
export PROXMOX_USERNAME="root"
export PROXMOX_TOKEN_ID="your-token-id"
export PROXMOX_TOKEN_SECRET="your-token-secret"
```

### Using .env Files
Create a `.env` file in the project root (see `.env.example`):
```bash
# Copy example file
cp .env.example .env

# Edit with your favorite editor
nano .env  # Linux/macOS
notepad .env  # Windows
```

## Continuous Integration

### Multi-Platform Testing
The CI pipeline tests on:
- **Ubuntu Latest** - Linux testing
- **Windows Latest** - Windows testing
- **macOS Latest** - macOS testing

Across Node.js versions:
- Node.js 18 LTS
- Node.js 20 LTS  
- Node.js 22 Current

### Line Endings
The project uses `.gitattributes` to enforce LF line endings in the repository, while allowing developers to use CRLF locally on Windows if preferred.

## Troubleshooting

### Common Issues

#### Issue: "Cannot find module" errors
**Solution**: Run `npm ci` to ensure all dependencies are installed

#### Issue: "Permission denied" on Linux/macOS
**Solution**: 
```bash
# Make the binary executable
chmod +x dist/index.js

# Or run with node explicitly
node dist/index.js
```

#### Issue: Line ending problems on Windows
**Solution**: 
```powershell
# Configure git to handle line endings
git config --global core.autocrlf true
```

#### Issue: Build fails on Windows
**Solution**: 
```powershell
# Ensure you have Node.js 18+ and npm
node --version
npm --version

# Clear cache and reinstall
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm ci
```

## Security Considerations

### Cross-Platform Security
- Credentials should never be committed to version control
- Use environment variables or secure vaults for secrets
- On Windows, use Windows Credential Manager for sensitive data
- On macOS, use Keychain for sensitive data
- On Linux, consider using pass or similar tools

### File Permissions
- The build script sets executable permissions on Unix-like systems
- On Windows, permissions are managed differently (this is handled automatically)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for general contribution guidelines.

### Platform-Specific Testing
When contributing, please test on multiple platforms if possible:
1. Local testing on your development platform
2. Review CI results for other platforms
3. Note any platform-specific behavior in your PR

## Additional Resources

- [Node.js Platform Support](https://nodejs.org/en/about/releases/)
- [GitHub Actions Runner Images](https://github.com/actions/runner-images)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Proxmox VE API Documentation](https://pve.proxmox.com/pve-docs/api-viewer/)
