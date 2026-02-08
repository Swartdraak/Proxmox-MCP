# Security Advisory

## Current Status

This document outlines the current security status of the Proxmox MCP Server, including known vulnerabilities and mitigation strategies.

**Last Updated**: 2024-02-08

## Known Issues

### Development Dependencies (Dev-only, Low Risk)

#### Issue: esbuild vulnerability in development server
- **Severity**: Moderate
- **Scope**: Development dependencies only
- **CVE**: GHSA-67mh-4wv8-2f99
- **Affected Versions**: esbuild <=0.24.2
- **Impact**: Development server could potentially allow websites to send requests to the development server
- **Risk Assessment**: **LOW** - This only affects the development environment and does not impact production deployments

**Affected Dependencies**:
- `esbuild` (via `vite`)
- `vite` (via `vitest`)
- `vitest` (test framework)
- `@vitest/coverage-v8` (test coverage)

**Mitigation**:
1. This vulnerability only affects the development server, not production builds
2. The MCP server does not use or expose the esbuild development server in production
3. The packaged npm module does not include these dev dependencies
4. CI/CD pipeline includes security scanning

**Resolution Plan**:
- Monitor for non-breaking updates to vitest that include esbuild fixes
- Consider updating to vitest v4 in a future major release (breaking change)
- Current version (vitest v2.1.8) is stable and widely used

**Why Not Fixed Immediately**:
- Updating to vitest v4 would be a breaking change
- The vulnerability does not affect production deployments
- The risk is minimal in development environments with proper network isolation
- Maintaining stability is prioritized over non-critical dev dependency updates

## Production Dependencies

### Status: ✅ All Clear

All production dependencies are up to date and have no known security vulnerabilities:

- `@modelcontextprotocol/sdk`: ^1.0.4 - ✅ Secure
- `axios`: ^1.7.9 - ✅ Secure
- `https-proxy-agent`: ^7.0.5 - ✅ Secure
- `zod`: ^3.24.1 - ✅ Secure

## Security Practices

### Build Security
1. **Strict TypeScript**: All code is type-checked with strict mode enabled
2. **ESLint Security Plugin**: Code is scanned for security issues during linting
3. **No Runtime Dependencies on Dev Tools**: The published package does not include development dependencies
4. **Minimal Dependencies**: Only essential runtime dependencies are included

### Runtime Security
1. **Input Validation**: All inputs are validated using Zod schemas
2. **Rate Limiting**: Built-in rate limiting prevents abuse
3. **Audit Logging**: Comprehensive security audit logging
4. **SSL/TLS Verification**: Enforced by default
5. **No Credential Exposure**: Credentials are never logged or exposed

### CI/CD Security
1. **Automated Security Scanning**: Every PR and commit is scanned
2. **Dependency Review**: GitHub Dependency Review action reviews all dependency changes
3. **Multi-platform Testing**: Tests run on Ubuntu, Windows, and macOS
4. **Coverage Reporting**: Code coverage tracked via Codecov

## Vulnerability Reporting

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email the maintainers directly (see GitHub profile)
3. Include details about the vulnerability and potential impact
4. Allow time for the issue to be addressed before public disclosure

### What to Report
- Security vulnerabilities in production code
- Authentication or authorization bypasses
- Input validation issues
- Credential leakage
- Remote code execution possibilities
- Any security-related issues in production dependencies

### What NOT to Report
- Known issues in development dependencies (already documented here)
- Issues that only affect development environments
- Theoretical vulnerabilities without proof of concept
- Issues in third-party dependencies (report to those projects directly)

## Security Audit History

### 2024-02-08
- ✅ Completed comprehensive security audit
- ✅ All production dependencies verified secure
- ✅ Development dependency vulnerabilities documented
- ✅ Security practices validated
- ✅ CI/CD security measures confirmed

## Dependency Update Policy

### Production Dependencies
- **Critical/High Severity**: Updated immediately
- **Moderate Severity**: Updated within 7 days
- **Low Severity**: Updated in next minor release

### Development Dependencies
- **Critical/High Severity**: Updated within 14 days or workarounds documented
- **Moderate Severity**: Updated in next minor release or documented
- **Low Severity**: Updated in next major release

## Security Contact

For security concerns, contact:
- GitHub: [@Swartdraak](https://github.com/Swartdraak)
- Issue tracker: https://github.com/Swartdraak/Proxmox-MCP/issues (for non-sensitive issues only)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [GitHub Security Advisories](https://github.com/advisories)

## Acknowledgments

We appreciate the security research community and responsible disclosure practices that help keep open source software secure.
