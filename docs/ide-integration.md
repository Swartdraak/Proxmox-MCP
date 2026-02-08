# IDE Integration Guide

This document provides detailed information about integrating the Proxmox MCP Server with various IDEs and development tools.

## Visual Studio Code

### Quick Setup

1. **Install Recommended Extensions**
   When you open this project in VS Code, you'll be prompted to install recommended extensions. Click "Install All" or install them individually from the Extensions view.

2. **Verify Setup**
   - Open any TypeScript file
   - Check that syntax highlighting works
   - Save a file and verify Prettier formats it
   - Look for ESLint warnings/errors in the Problems panel

### Configuration Files

#### `.vscode/settings.json`
This file configures VS Code for the project:
- Enables format on save with Prettier
- Configures ESLint auto-fix
- Sets TypeScript SDK path
- Excludes build artifacts from search

#### `.vscode/extensions.json`
Recommends essential extensions:
- **ESLint** - Linting and code quality
- **Prettier** - Code formatting
- **TypeScript** - Language support
- **Path Intellisense** - Autocomplete file paths

#### `.vscode/launch.json` (if present)
Debugging configurations for running and testing the server.

#### `.vscode/tasks.json` (if present)
Build and test tasks integrated with VS Code.

### GitHub Copilot in VS Code

#### Optimizations
This codebase is optimized for GitHub Copilot:
- **JSDoc Comments**: Comprehensive documentation helps Copilot understand context
- **Type Definitions**: Strong typing improves suggestion accuracy
- **Consistent Patterns**: Predictable code structure leads to better suggestions
- **Test Examples**: Tests demonstrate usage patterns

#### Best Practices
1. **Write descriptive comments** before complex code blocks
2. **Use meaningful variable names** to guide suggestions
3. **Review all suggestions** before accepting (especially security-related code)
4. **Run tests** after accepting Copilot suggestions
5. **Leverage inline suggestions** by starting to type function names

#### Example Workflow
```typescript
// GitHub Copilot will suggest implementation based on comment and types
/**
 * Gets all VMs from a specific node
 * @param nodeName - The Proxmox node name
 * @returns Promise resolving to array of VMs
 */
async function getNodeVMs(nodeName: string): Promise<ProxmoxVM[]> {
  // Copilot suggests: return await client.get(`/nodes/${nodeName}/qemu`);
}
```

### Keyboard Shortcuts

Essential VS Code shortcuts for this project:
- **Ctrl/Cmd + P**: Quick file open
- **Ctrl/Cmd + Shift + F**: Search across all files
- **F12**: Go to definition
- **Alt + Shift + F**: Format document
- **Ctrl/Cmd + .**: Quick fix (ESLint)
- **Ctrl/Cmd + Space**: Trigger IntelliSense

## JetBrains IDEs (WebStorm, IntelliJ IDEA)

### Setup

1. **Open Project**
   ```bash
   # Open the project directory in WebStorm/IntelliJ
   ```

2. **Configure Node.js**
   - Go to: Settings → Languages & Frameworks → Node.js
   - Ensure Node.js is detected (should auto-detect)
   - Enable "Coding assistance for Node.js"

3. **Configure ESLint**
   - Go to: Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
   - Select "Automatic ESLint configuration"
   - Enable "Run eslint --fix on save"

4. **Configure Prettier**
   - Go to: Settings → Languages & Frameworks → JavaScript → Prettier
   - Prettier package: `{project}/node_modules/prettier`
   - Enable "On save" for automatic formatting

5. **Configure TypeScript**
   - Go to: Settings → Languages & Frameworks → TypeScript
   - TypeScript version: Use project TypeScript
   - Enable TypeScript Language Service

### AI Assistant Integration

JetBrains AI Assistant works well with this codebase:

#### Features
- **Code Completion**: Context-aware suggestions
- **Documentation Generation**: Auto-generate JSDoc comments
- **Code Explanation**: Understand complex code sections
- **Refactoring Suggestions**: Improve code quality

#### Best Practices
1. Use AI Assistant to generate boilerplate code
2. Review generated code for security implications
3. Leverage "Explain Code" for understanding complex sections
4. Use "Generate Tests" to create test cases
5. Always run existing tests after AI-generated changes

## Cursor IDE

Cursor is an AI-first IDE built on VS Code:

### Setup
1. Open the project in Cursor
2. Install the same extensions as VS Code (see above)
3. Cursor's AI will automatically understand the codebase

### AI Features
- **Ctrl/Cmd + K**: AI command palette
- **Ctrl/Cmd + L**: AI chat
- Inline AI editing
- Codebase-wide understanding

### Tips
- Reference specific files in AI prompts: "@src/client/proxmox-client.ts"
- Use AI to explain Proxmox API patterns
- Generate tests with AI based on existing test patterns

## Sublime Text

### Setup

1. **Install Package Control**
   - https://packagecontrol.io/installation

2. **Install Packages**
   ```
   - TypeScript
   - LSP (Language Server Protocol)
   - LSP-typescript
   - LSP-eslint
   - Prettier
   - SublimeLinter
   ```

3. **Configure LSP**
   - Preferences → Package Settings → LSP → Settings
   - Add TypeScript server configuration

### Usage
- **Ctrl/Cmd + P**: Go to file
- **Ctrl/Cmd + R**: Go to symbol
- **F12**: Go to definition

## Neovim/Vim

### Setup with LSP

1. **Install Plugins** (using vim-plug or packer)
   ```vim
   " TypeScript LSP
   Plug 'neovim/nvim-lspconfig'
   Plug 'jose-elias-alvarez/typescript.nvim'
   
   " Completion
   Plug 'hrsh7th/nvim-cmp'
   
   " ESLint
   Plug 'dense-analysis/ale'
   
   " Prettier
   Plug 'prettier/vim-prettier'
   ```

2. **Configure LSP**
   ```lua
   -- init.lua or init.vim
   require('lspconfig').tsserver.setup{}
   require('typescript').setup({})
   ```

3. **Configure Prettier**
   ```vim
   " .vimrc
   let g:prettier#autoformat = 1
   let g:prettier#autoformat_require_pragma = 0
   ```

### GitHub Copilot for Neovim
```vim
Plug 'github/copilot.vim'
```

## Emacs

### Setup

1. **Install Packages**
   ```elisp
   ;; init.el
   (require 'package)
   (add-to-list 'package-archives '("melpa" . "https://melpa.org/packages/"))
   (package-initialize)
   
   ;; Install packages
   (package-install 'typescript-mode)
   (package-install 'tide)  ; TypeScript IDE
   (package-install 'flycheck)  ; Linting
   (package-install 'prettier-js)  ; Formatting
   ```

2. **Configure TIDE**
   ```elisp
   (defun setup-tide-mode ()
     (interactive)
     (tide-setup)
     (flycheck-mode +1)
     (setq flycheck-check-syntax-automatically '(save mode-enabled))
     (eldoc-mode +1)
     (tide-hl-identifier-mode +1))
   
   (add-hook 'typescript-mode-hook #'setup-tide-mode)
   ```

## Command Line Tools

### TypeScript Language Server

For any editor supporting LSP:

```bash
# Install globally
npm install -g typescript typescript-language-server

# Or use the project's local TypeScript
npx typescript-language-server --stdio
```

### ESLint

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Prettier

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

## Testing in IDEs

### VS Code
- Use the Test Explorer extension
- Run tests from the sidebar
- Debug tests with breakpoints

### JetBrains
- Right-click test files → Run tests
- View test results in the Run panel
- Debug tests with breakpoints

### Command Line
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Debugging

### VS Code Debug Configuration

Create or update `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug MCP Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/dist/index.js",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "env": {
        "PROXMOX_HOST": "proxmox.example.com",
        "PROXMOX_USERNAME": "root",
        "PROXMOX_TOKEN_ID": "test-token",
        "PROXMOX_TOKEN_SECRET": "test-secret"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test"],
      "console": "integratedTerminal"
    }
  ]
}
```

### JetBrains Debug Configuration

1. Click "Add Configuration" → Node.js
2. Set JavaScript file: `dist/index.js`
3. Add environment variables
4. Run in debug mode

## Code Navigation

### Go to Definition
- **VS Code**: F12 or Ctrl/Cmd + Click
- **JetBrains**: Ctrl/Cmd + B
- **Neovim**: gd (with LSP)

### Find References
- **VS Code**: Shift + F12
- **JetBrains**: Alt + F7
- **Neovim**: gr (with LSP)

### Peek Definition
- **VS Code**: Alt + F12
- **JetBrains**: Ctrl/Cmd + Shift + I

## Troubleshooting IDE Issues

### TypeScript Errors in IDE
```bash
# Rebuild the project
npm run build

# Restart TypeScript server (VS Code)
# Ctrl/Cmd + Shift + P → "TypeScript: Restart TS Server"
```

### ESLint Not Working
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart IDE
```

### Prettier Not Formatting
1. Check that Prettier is installed: `npm list prettier`
2. Verify `.prettierrc.json` exists
3. Check IDE settings for Prettier integration
4. Restart IDE

### IntelliSense Not Working
1. Verify TypeScript is installed: `npm list typescript`
2. Check `tsconfig.json` is valid
3. Restart TypeScript language server
4. Check for TypeScript errors in output panel

## Performance Tips

### VS Code
- Exclude large folders from search (already configured in `.vscode/settings.json`)
- Use TypeScript project references for large codebases
- Disable unnecessary extensions

### JetBrains
- Increase IDE memory: Help → Edit Custom VM Options
- Exclude `node_modules` from indexing (usually automatic)
- Use power save mode when not coding

## Resources

- [VS Code TypeScript Documentation](https://code.visualstudio.com/docs/languages/typescript)
- [JetBrains TypeScript Support](https://www.jetbrains.com/help/webstorm/typescript-support.html)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [LSP Specification](https://microsoft.github.io/language-server-protocol/)
