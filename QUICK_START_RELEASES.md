# Quick Start Guide for Releases

This is a quick reference for creating releases. For complete details, see [RELEASE.md](RELEASE.md).

## Prerequisites

1. Ensure `NPM_TOKEN` secret is configured in GitHub repository settings
2. Update version in `package.json`
3. Update `CHANGELOG.md` with release notes

## Quick Release Commands

### Major Release (Always Published to npm)

Breaking changes or major new features:

```bash
git add .
git commit -m "feat!: major refactoring with breaking changes"
git tag -a v2.0.0 -m "Major release v2.0.0 - Breaking API changes"
git push origin main v2.0.0
```

**Result**: ✅ GitHub Release + ✅ npm Published

---

### Minor Release with Bugfix (Published to npm)

New features with bug fixes:

```bash
git add .
git commit -m "feat: add VM snapshots\n\nfix: resolve authentication timeout"
git tag -a v1.1.0 -m "Minor release v1.1.0 - New features and bug fixes"
git push origin main v1.1.0
```

**Result**: ✅ GitHub Release + ✅ npm Published

---

### Minor Release without Bugfix (NOT Published to npm)

Feature-only release:

```bash
git add .
git commit -m "feat: add VM snapshot functionality"
git tag -a v1.2.0 -m "Minor release v1.2.0 - Add VM snapshots"
git push origin main v1.2.0
```

**Result**: ✅ GitHub Release + ❌ npm NOT Published

---

### Patch Release with Bugfix (Published to npm)

Bug fixes and small improvements:

```bash
git add .
git commit -m "fix: correct SSL certificate validation issue"
git tag -a v1.0.1 -m "Patch release v1.0.1 - Fix SSL validation"
git push origin main v1.0.1
```

**Result**: ✅ GitHub Release + ✅ npm Published

---

## Publishing Decision Matrix

| Version | Include "fix" keyword? | Published to npm? |
|---------|------------------------|-------------------|
| v2.0.0  | Doesn't matter         | ✅ Always         |
| v1.1.0  | ✅ Yes                 | ✅ Yes            |
| v1.1.0  | ❌ No                  | ❌ No             |
| v1.0.1  | ✅ Yes                 | ✅ Yes            |
| v1.0.1  | ❌ No                  | ❌ No             |

## Bugfix Keywords

Include any of these keywords (case-insensitive) in your commit messages or tag annotation to mark as bugfix:

- `fix`
- `bug`
- `bugfix`
- `hotfix`
- `patch`
- `repair`
- `correct`
- `resolve`

## Monitoring the Release

After pushing a tag:

1. Go to https://github.com/Swartdraak/Proxmox-MCP/actions
2. Click on the "Release" workflow run
3. Check the job summary for publishing decision
4. Verify the release at https://github.com/Swartdraak/Proxmox-MCP/releases
5. If published, verify at https://www.npmjs.com/package/@swartdraak/proxmox-mcp-server

## Common Scenarios

### "I want to release a new feature"

If no bugs fixed:
```bash
# This creates GitHub release only
git tag -a v1.2.0 -m "Minor release v1.2.0 - Add storage management"
git push origin v1.2.0
```

### "I want to release a bug fix"

```bash
# This creates GitHub release AND publishes to npm
git commit -m "fix: resolve memory leak in container management"
git tag -a v1.0.1 -m "Patch release v1.0.1 - Fix memory leak"
git push origin v1.0.1
```

### "I want to release breaking changes"

```bash
# Major versions are ALWAYS published
git tag -a v2.0.0 -m "Major release v2.0.0 - New API structure"
git push origin v2.0.0
```

### "I want to release features AND bug fixes"

```bash
# Include "fix" in commits or tag message
git commit -m "feat: add VM cloning\n\nfix: correct timeout handling"
git tag -a v1.1.0 -m "Minor release v1.1.0 - New features and bug fixes"
git push origin v1.1.0
```

## Troubleshooting

### Workflow didn't run

- Ensure tag format is `v*.*.*` (e.g., `v1.0.0` not `1.0.0`)
- Check: `git tag -l` to verify tag exists
- Check: `git push --tags` to ensure tag is pushed

### Wrong npm publishing decision

- Review commit messages and tag annotation
- Ensure bugfix keywords are present if needed
- Delete and recreate tag if incorrect

### npm publish failed

- Verify `NPM_TOKEN` secret is set correctly
- Check token has publish permissions
- Ensure version doesn't already exist on npm

## Need Help?

- 📖 [Complete Release Guide](RELEASE.md)
- 🏗️ [Implementation Details](IMPLEMENTATION.md)
- ⚙️ [Workflow Documentation](.github/workflows/README.md)
- 🐛 [Report Issues](https://github.com/Swartdraak/Proxmox-MCP/issues)
