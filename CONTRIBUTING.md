# Contributing to Proxmox VE MCP Server

Thank you for your interest in contributing to Proxmox VE MCP Server! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Environment details** (OS, Node.js version, Proxmox version)
- **Logs and error messages**

### Suggesting Features

Feature requests are welcome! When suggesting a feature:

- **Use a clear title and description**
- **Explain the use case**
- **Describe the expected behavior**
- **Provide examples** if possible

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** (use ESLint and Prettier)
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Ensure all tests pass**
6. **Write clear commit messages**

#### Commit Message Format

Use conventional commits:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(vm): add support for VM snapshots

Added new tools for creating and managing VM snapshots.

Closes #123
```

### Development Workflow

1. **Clone and setup**
   ```bash
   git clone https://github.com/Swartdraak/Proxmox-MCP.git
   cd Proxmox-MCP
   npm install
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and test**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit and push**
   ```bash
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**

### Coding Standards

- **TypeScript**: Use strict mode
- **ESLint**: Follow the configured rules
- **Prettier**: Use for code formatting
- **Comments**: Add JSDoc comments for public APIs
- **Tests**: Maintain >80% code coverage
- **Security**: Follow security best practices

### Testing

- Write unit tests for new functionality
- Ensure all tests pass before submitting PR
- Add integration tests for complex features
- Run fuzzing tests for security-critical code

```bash
npm test                  # Run all tests
npm run test:coverage     # Check coverage
npm run test:fuzz         # Run fuzzing tests
```

### Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new functions/classes
- Update API documentation in docs/
- Add examples for new features

## Project Structure

```
src/
├── index.ts              # Main server entry point
├── client/               # Proxmox API client
│   └── proxmox-client.ts
├── tools/                # MCP tools
│   ├── vm-tools.ts
│   ├── container-tools.ts
│   ├── node-tools.ts
│   └── storage-tools.ts
├── security/             # Security components
│   ├── manager.ts
│   ├── rate-limiter.ts
│   └── validator.ts
├── types/                # Type definitions
│   ├── index.ts
│   └── schemas.ts
└── config/               # Configuration
    └── loader.ts
```

## Security

### Reporting Security Issues

**Do not open public issues for security vulnerabilities.**

Instead, report security concerns via [GitHub Security Advisories](https://github.com/Swartdraak/Proxmox-MCP/security/advisories/new).

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Guidelines

- Always validate and sanitize input
- Use Zod schemas for validation
- Never log sensitive data
- Use rate limiting for public endpoints
- Keep dependencies updated
- Follow OWASP best practices

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a git tag: `git tag -a v1.x.x -m "Release v1.x.x"`
4. Push tag: `git push origin v1.x.x`
5. GitHub Actions will automatically publish to npm

## Questions?

- Open a [Discussion](https://github.com/Swartdraak/Proxmox-MCP/discussions)
- Check existing [Issues](https://github.com/Swartdraak/Proxmox-MCP/issues)
- Read the [Documentation](docs/)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
