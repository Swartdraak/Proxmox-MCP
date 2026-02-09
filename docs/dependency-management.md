# Dependency Management Guide

## Overview

This document explains how dependency management works in the Proxmox-MCP project and how to keep dependencies up to date.

## Automated Dependency Updates

### Dependabot

The project uses GitHub Dependabot for automated dependency updates. Dependabot is configured in `.github/dependabot.yml` and provides:

- **Weekly Updates**: Checks for updates every Monday at midnight UTC
- **Grouped Updates**: Minor and patch updates are grouped together to reduce PR noise
- **Separate PRs for Major Updates**: Major version updates create separate PRs for careful review
- **Security Updates**: Immediate security vulnerability patches
- **GitHub Actions Updates**: Keeps workflow actions up to date

#### Configuration Details

- **npm Dependencies**: Groups development and production dependencies separately (minor and patch updates only)
- **Major Version Updates**: Create separate PRs for careful manual review
- **Pull Request Limits**: 
  - Up to 10 npm dependency PRs at a time
  - Up to 5 GitHub Actions PRs at a time
- **Auto-assignment**: PRs are automatically assigned to @Swartdraak for review
- **Labels**: PRs are labeled with `dependencies` and ecosystem-specific tags

### Why Not Custom GitHub Actions?

Previously, the project had a custom GitHub Actions workflow (`dependency-updates.yml`) that attempted to create PRs automatically. This was removed because:

1. **Permission Issues**: GitHub Actions' `GITHUB_TOKEN` doesn't have permission to create or approve PRs by default (security feature)
2. **Better Alternative**: Dependabot is GitHub's native solution and works seamlessly
3. **More Features**: Dependabot provides better grouping, security alerts, and configuration options
4. **Less Maintenance**: No custom workflow to maintain

## Manual Dependency Updates

### Checking for Updates

To check which dependencies have available updates:

```bash
npm outdated
```

This will show:
- Current version
- Wanted version (respects semver)
- Latest version available

### Updating Dependencies

#### Update All Dependencies (Respecting Semver)

```bash
npm update
```

This updates all dependencies to the latest version that satisfies the semver range in `package.json`.

#### Update Specific Package

```bash
npm update <package-name>
```

#### Update to Latest Major Version

To update beyond semver constraints (e.g., major version updates):

```bash
npm install <package-name>@latest
```

For all packages:
```bash
npx npm-check-updates -u
npm install
```

### Security Updates

#### Check for Security Vulnerabilities

```bash
npm audit
```

#### Automatically Fix Vulnerabilities

```bash
npm audit fix
```

For more aggressive fixes (may introduce breaking changes):
```bash
npm audit fix --force
```

## Testing After Updates

**Always test after updating dependencies!**

1. **Run Tests**:
   ```bash
   npm test
   ```

2. **Run Type Checking**:
   ```bash
   npm run typecheck
   ```

3. **Run Linting**:
   ```bash
   npm run lint
   ```

4. **Run Security Audit**:
   ```bash
   npm run security:audit
   ```

5. **Build the Project**:
   ```bash
   npm run build
   ```

6. **Run Full CI Suite**:
   ```bash
   npm run lint && npm run typecheck && npm test && npm run build
   ```

## Reviewing Dependabot PRs

When Dependabot creates a PR:

1. **Review the Changes**: Check the changelog/release notes for breaking changes
2. **Check CI Results**: Ensure all CI checks pass
3. **Test Locally**: If needed, check out the branch and test locally
4. **Merge**: If everything looks good, merge the PR

### Auto-merging

For minor and patch updates that pass all CI checks, you can configure auto-merge:

1. Enable auto-merge in repository settings
2. Dependabot PRs can be configured to auto-merge when CI passes

## Best Practices

### Dependency Pinning

- **Production Dependencies**: Use exact versions or narrow ranges (`^1.2.3` or `~1.2.3`)
- **Dev Dependencies**: More lenient ranges are acceptable (`^1.0.0`)
- **Lock File**: Always commit `package-lock.json` for reproducible builds

### Security First

1. **Monitor Security Alerts**: GitHub will alert you to vulnerabilities
2. **Prioritize Security Updates**: Apply security patches immediately
3. **Review Major Updates**: Major version updates may have breaking changes
4. **Use `npm audit`**: Regularly run security audits

### Version Strategy

- **Patch Updates** (`1.0.x`): Bug fixes, apply automatically
- **Minor Updates** (`1.x.0`): New features, backward compatible, apply with testing
- **Major Updates** (`x.0.0`): Breaking changes, require careful review

## CI/CD Integration

The CI/CD pipeline (`.github/workflows/ci.yml`) automatically:

- Installs dependencies using `npm ci` (uses lock file)
- Runs security audits via `npm audit`
- Uses dependency review action on PRs
- Runs comprehensive tests across platforms

This ensures that dependency updates don't break the build or introduce vulnerabilities.

## Troubleshooting

### Dependency Conflicts

If you encounter dependency conflicts:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Audit Failures

If `npm audit` reports vulnerabilities:

1. Try `npm audit fix` first
2. If that doesn't work, check if there's an update available: `npm update <package>`
3. If no fix is available, consider:
   - Finding an alternative package
   - Waiting for upstream fix
   - If low severity and no fix available, document as known issue

### Lock File Issues

If you see warnings about lock file conflicts:

```bash
npm install --package-lock-only
```

This regenerates the lock file without reinstalling packages.

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [npm audit Documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [Semantic Versioning](https://semver.org/)

## Summary

- ✅ Dependabot handles automated updates
- ✅ Manual updates available via `npm update`
- ✅ Security updates via `npm audit fix`
- ✅ Comprehensive CI/CD testing
- ✅ Clear review process for updates

For questions or issues, please [open an issue](https://github.com/Swartdraak/Proxmox-MCP/issues).
