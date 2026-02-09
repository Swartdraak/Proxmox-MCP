# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows

### ci.yml - Continuous Integration Pipeline

Runs on every push and pull request to validate code quality:

- **Linting**: TypeScript type checking
- **Security**: npm audit and dependency review
- **Build**: Multi-platform build verification (Linux, Windows, macOS)

**Triggers:**
- Push to any branch
- Pull requests to main/master

### release.yml - Automated Release Workflow

Handles automated releases with conditional npm publishing:

- **Version Analysis**: Determines version type (major/minor/patch) and bugfix status
- **Multi-Platform Builds**: Creates packages for Linux, Windows, and macOS
- **GitHub Releases**: Creates releases with platform-specific artifacts
- **Conditional npm Publishing**: Publishes based on version type and bugfix status

**Triggers:**
- Push of version tags (v*.*.*)

**Publishing Rules:**
- Major versions (v2.0.0): Always publish to npm
- Minor versions (v1.1.0): Publish only if bugfix detected
- Patch versions (v1.0.1): Publish only if bugfix detected

See [RELEASE.md](../../RELEASE.md) for detailed documentation.

## Testing

### test-version-logic.sh

A test script to validate the version detection and publishing decision logic used in the release workflow.

**Usage:**
```bash
cd .github/workflows
./test-version-logic.sh
```

This script simulates various version scenarios to verify the correct publishing decisions are made.

## Secrets Required

The following secrets must be configured in repository settings for the workflows to function:

- `NPM_TOKEN`: npm authentication token with publish permissions
  - Generate at: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
  - Required permissions: "Automation" or "Publish"

## Support

For issues with workflows:
1. Check the [Actions tab](https://github.com/Swartdraak/Proxmox-MCP/actions) for detailed logs
2. Review [RELEASE.md](../../RELEASE.md) for release process documentation
3. Open an issue with workflow logs and details
