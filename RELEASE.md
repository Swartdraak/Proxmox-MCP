# Release Process

This document describes the automated release process for the Proxmox MCP Server.

## Overview

The project uses GitHub Actions to automate releases for multiple platforms and conditional npm publishing. The release workflow is triggered when you push a version tag to the repository.

## Release Types

The project follows [Semantic Versioning](https://semver.org/):

- **Major versions** (e.g., `v2.0.0`, `v3.0.0`): Breaking changes or significant new features
- **Minor versions** (e.g., `v1.1.0`, `v1.2.0`): New features, backward compatible
- **Patch versions** (e.g., `v1.0.1`, `v1.0.2`): Bug fixes and minor improvements

## Publishing Rules

### GitHub Releases

GitHub releases are **always created** for all version types (Major, Minor, and Patch). Each release includes:

- Platform-specific packages for Linux, Windows, and macOS
- Release notes with changelog and commit history
- Installation instructions

### npm Publishing

npm publishing follows conditional rules based on version type and change nature:

| Version Type | Bugfix | Publish to npm? |
|--------------|--------|----------------|
| **Major** (x.0.0) | Any | ✅ **Always** |
| **Minor** (x.y.0) | ✅ Yes | ✅ **Yes** |
| **Minor** (x.y.0) | ❌ No | ❌ **No** |
| **Patch** (x.y.z) | ✅ Yes | ✅ **Yes** |
| **Patch** (x.y.z) | ❌ No | ❌ **No** |

**Summary:**
- **Major versions**: Always published to npm (breaking changes or major features)
- **Minor versions**: Published to npm **only if** the changes include bug fixes
- **Patch versions**: Published to npm **only if** the changes include bug fixes

## Creating a Release

### Prerequisites

1. Ensure all changes are committed and pushed to the main branch
2. Update `CHANGELOG.md` with the new version and changes
3. Update version in `package.json` if needed
4. Ensure all CI checks pass

### Step 1: Decide on Version Number

Choose the appropriate version number based on the changes:

- **Major** (x.0.0): Breaking API changes, major refactoring
- **Minor** (x.y.0): New features, non-breaking changes
- **Patch** (x.y.z): Bug fixes, small improvements

### Step 2: Create and Push the Tag

#### For Bugfix Releases

If your release includes bug fixes, include "fix", "bug", "bugfix", "hotfix", or "patch" in your commit messages or tag annotation:

```bash
# Create an annotated tag with bugfix mention
git tag -a v1.1.0 -m "Minor release v1.1.0 - Fixes authentication bug and improves error handling"

# Or for patch releases
git tag -a v1.0.1 -m "Patch release v1.0.1 - Fix critical security vulnerability"

# Push the tag
git push origin v1.1.0
```

#### For Feature Releases (No Bugs)

For releases that only add features without bug fixes:

```bash
# Create an annotated tag
git tag -a v1.1.0 -m "Minor release v1.1.0 - Add new VM cloning feature"

# Push the tag
git push origin v1.1.0
```

#### For Major Releases

Major releases are always published to npm regardless of content:

```bash
# Create an annotated tag
git tag -a v2.0.0 -m "Major release v2.0.0 - Breaking API changes"

# Push the tag
git push origin v2.0.0
```

### Step 3: Monitor the Release Workflow

1. Go to the [Actions tab](https://github.com/Swartdraak/Proxmox-MCP/actions) in your repository
2. Watch the "Release" workflow run
3. The workflow will:
   - Analyze the version type and determine publishing strategy
   - Build packages for Linux, Windows, and macOS
   - Create a GitHub release with all platform packages
   - Conditionally publish to npm based on the rules above

### Step 4: Verify the Release

After the workflow completes:

1. **GitHub Release**: Check the [Releases page](https://github.com/Swartdraak/Proxmox-MCP/releases)
   - Verify the release notes are correct
   - Download and test platform-specific packages
   
2. **npm Package** (if published): Check [npm package page](https://www.npmjs.com/package/@swartdraak/proxmox-mcp-server)
   - Verify the version is available
   - Test installation: `npm install -g @swartdraak/proxmox-mcp-server@<version>`

## Bugfix Detection

The workflow automatically detects if a release is a bugfix by checking:

1. **Commit messages** since the last tag for keywords:
   - fix, bug, bugfix, hotfix, patch, repair, correct, resolve

2. **Tag annotation** for the same keywords

If any of these keywords are found (case-insensitive), the release is marked as a bugfix.

## Examples

### Example 1: Major Release (Always Published)

```bash
# Update CHANGELOG.md
# Update package.json version to 2.0.0

git add .
git commit -m "feat: Major API refactoring with breaking changes"
git tag -a v2.0.0 -m "Major release v2.0.0 - Breaking API changes"
git push origin main v2.0.0
```

**Result:**
- ✅ GitHub release created
- ✅ Published to npm (Major version)

### Example 2: Minor Release with Bugfix (Published)

```bash
# Update CHANGELOG.md
# Update package.json version to 1.1.0

git add .
git commit -m "feat: Add new storage management tools\n\nAlso fixes authentication timeout issue"
git tag -a v1.1.0 -m "Minor release v1.1.0 - New features and bug fixes"
git push origin main v1.1.0
```

**Result:**
- ✅ GitHub release created
- ✅ Published to npm (Minor with bugfix)

### Example 3: Minor Release without Bugfix (Not Published)

```bash
# Update CHANGELOG.md
# Update package.json version to 1.2.0

git add .
git commit -m "feat: Add VM snapshot functionality"
git tag -a v1.2.0 -m "Minor release v1.2.0 - Add VM snapshot functionality"
git push origin main v1.2.0
```

**Result:**
- ✅ GitHub release created
- ❌ NOT published to npm (Minor without bugfix)

### Example 4: Patch Release with Bugfix (Published)

```bash
# Update CHANGELOG.md
# Update package.json version to 1.0.1

git add .
git commit -m "fix: Correct SSL certificate validation issue"
git tag -a v1.0.1 -m "Patch release v1.0.1 - Fix SSL certificate validation"
git push origin main v1.0.1
```

**Result:**
- ✅ GitHub release created
- ✅ Published to npm (Patch with bugfix)

## Troubleshooting

### Release workflow didn't trigger

- Ensure you pushed the tag: `git push origin v1.0.0`
- Verify the tag format matches `v*.*.*` (e.g., `v1.0.0`, not `1.0.0`)
- Check the Actions tab for any errors

### npm publish failed

- Verify `NPM_TOKEN` secret is set in repository settings
- Ensure the token has publish permissions
- Check if the version already exists on npm (cannot republish)

### Wrong npm publishing decision

- Review commit messages and tag annotation for bugfix keywords
- The workflow shows its decision in the job summary
- If incorrect, delete the tag, fix the messages, and re-tag

### Platform-specific build failed

- Check the build logs for the specific platform
- Ensure dependencies are platform-compatible
- Test builds locally on that platform

## Manual Release (Fallback)

If the automated workflow fails, you can manually create a release:

```bash
# Build the project
npm ci
npm run build

# Publish to npm (if desired)
npm publish --access public

# Create GitHub release manually via the web interface
```

## Secrets Required

The release workflow requires the following secrets to be configured in GitHub repository settings:

- `NPM_TOKEN`: npm authentication token with publish permissions
  - Get from: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
  - Required permissions: "Automation" or "Publish"

To add secrets:
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add `NPM_TOKEN` with your npm token

## CI/CD Architecture

The project uses two separate workflows:

1. **CI Pipeline** (`.github/workflows/ci.yml`):
   - Runs on every push and pull request
   - Performs linting, security audits, and builds
   - Ensures code quality before merging

2. **Release Workflow** (`.github/workflows/release.yml`):
   - Runs only when version tags are pushed
   - Creates releases and conditionally publishes to npm
   - Generates platform-specific packages

This separation ensures:
- Fast feedback on regular commits
- Controlled, deliberate releases
- Clear distinction between CI checks and release process

## Best Practices

1. **Always update CHANGELOG.md** before creating a release
2. **Test locally** before tagging a release
3. **Use semantic versioning** correctly
4. **Write clear tag annotations** that describe the changes
5. **Include "fix" or "bug"** in messages if the release includes bug fixes
6. **Review the workflow output** to ensure correct publishing decisions
7. **Test the published package** after release to ensure it works correctly

## Support

If you encounter issues with the release process:

1. Check the workflow logs in the Actions tab
2. Review this documentation for proper procedures
3. Open an issue with details about the problem
4. Contact the maintainers for assistance
