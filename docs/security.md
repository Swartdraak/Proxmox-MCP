# Security Guidelines

## Overview

Proxmox VE MCP Server is built with security as a top priority. This document outlines security best practices and guidelines.

## Authentication

### API Tokens (Recommended)

Use API tokens instead of passwords for better security:

1. **Create a dedicated user** for the MCP server
2. **Generate an API token** with minimal required permissions
3. **Store token securely** in environment variables
4. **Rotate tokens regularly**

```bash
export PROXMOX_USERNAME="mcp-user"
export PROXMOX_TOKEN_ID="mcp-token"
export PROXMOX_TOKEN_SECRET="your-secret-here"
```

### Password Authentication

If using passwords:

1. **Use strong passwords** (16+ characters, mixed case, numbers, symbols)
2. **Never commit passwords** to version control
3. **Use environment variables** for password storage
4. **Enable 2FA** on Proxmox if possible

## Proxmox Permissions

### Minimum Required Permissions

Create a role with only necessary permissions:

```
VM.Audit       - View VM information
VM.Console     - Access VM console
VM.PowerMgmt   - Start/Stop VMs
VM.Allocate    - Create VMs
VM.Config.*    - Configure VMs
Datastore.Audit - View storage
Sys.Audit      - View node information
```

### Permission Scope

Limit token/user permissions to specific:
- **Nodes**: Only nodes that should be managed
- **Pools**: Specific resource pools
- **Storage**: Only required storage

## Network Security

### SSL/TLS

Always verify SSL certificates in production:

```bash
export PROXMOX_VERIFY_SSL="true"
```

For development with self-signed certificates:

```bash
export PROXMOX_VERIFY_SSL="false"  # Only for development!
```

### Network Isolation

- Run Proxmox on a **private network**
- Use **VPN** for remote access
- Implement **firewall rules** to limit access
- Use **network segmentation**

## Input Validation

The server implements multiple layers of input validation:

### Schema Validation

All inputs are validated using Zod schemas:

```typescript
// Automatically validated
const vmid = VMIDSchema.parse(100);  // Valid
const vmid = VMIDSchema.parse(50);   // Throws error
```

### Sanitization

User inputs are sanitized to prevent injection:

```typescript
const safe = InputValidator.sanitizeString(userInput);
```

### Type Safety

TypeScript strict mode ensures type safety:

```typescript
// Compiler error if types don't match
function startVM(node: string, vmid: number): Promise<string>
```

## Rate Limiting

Built-in rate limiting prevents abuse:

- **100 requests per minute** by default
- **Token bucket algorithm** for fair distribution
- **Per-client limiting** (future enhancement)

```typescript
const limiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000
});
```

## Audit Logging

All operations are logged for security auditing:

```typescript
// Access logs include:
// - Timestamp
// - Operation
// - User
// - Result (success/failure)
// - Details (if error)

const logs = client.getAuditLogs();
```

### Log Review

Regularly review audit logs for:
- Unusual activity patterns
- Failed authentication attempts
- Unauthorized access attempts
- Suspicious operations

## Sensitive Data

### Credentials

- **Never log credentials**
- **Never expose in errors**
- **Clear from memory** when possible
- **Use environment variables**

### Configuration

Secure configuration files:

```bash
# Secure permissions
chmod 600 ~/.env
chown $USER:$USER ~/.env
```

## Dependencies

### Security Scanning

Automated security scanning:

```bash
# Run npm audit
npm run security:audit

# Check for vulnerabilities
npm audit --audit-level=moderate
```

### Updates

Keep dependencies updated:

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### Dependency Review

- Review dependencies before adding
- Use reputable, maintained packages
- Check for known vulnerabilities
- Minimize dependency count

## Runtime Security

### Environment

Run with minimal privileges:

```bash
# Don't run as root
npm start

# Use a dedicated user
sudo -u mcp-user npm start
```

### Isolation

Use containerization for isolation:

```dockerfile
FROM node:18-alpine
USER node
WORKDIR /app
COPY --chown=node:node . .
RUN npm ci --only=production
CMD ["npm", "start"]
```

## Proxmox Hardening

### API Security

1. **Enable HTTPS only**
2. **Disable unused APIs**
3. **Implement IP restrictions**
4. **Use strong ciphers**

### User Management

1. **Disable root login** (use sudo)
2. **Remove unused users**
3. **Enforce password policies**
4. **Enable audit logging**

### System Security

1. **Keep Proxmox updated**
2. **Enable firewall**
3. **Configure fail2ban**
4. **Monitor logs**

## Incident Response

### If Credentials Are Compromised

1. **Immediately revoke** the token/password
2. **Generate new credentials**
3. **Review audit logs** for unauthorized access
4. **Check for suspicious activity**
5. **Update security measures**

### If System Is Compromised

1. **Isolate affected systems**
2. **Preserve logs** for investigation
3. **Review all access logs**
4. **Rebuild from clean backups**
5. **Conduct security audit**

## Security Checklist

### Deployment

- [ ] Use API tokens instead of passwords
- [ ] Enable SSL/TLS verification
- [ ] Set minimum required permissions
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Review firewall rules
- [ ] Use environment variables for secrets
- [ ] Set secure file permissions
- [ ] Run security audit
- [ ] Test backup/restore procedures

### Ongoing

- [ ] Review audit logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate credentials quarterly
- [ ] Conduct security audits annually
- [ ] Monitor for unusual activity
- [ ] Test incident response procedures

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT open a public issue**
2. **Email security concerns** to: [security email]
3. **Include detailed information**
4. **Allow time for fix** before disclosure

We take security seriously and will respond promptly to all reports.

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Proxmox Security](https://pve.proxmox.com/wiki/Security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Security Updates

Subscribe to security advisories:

- Watch the GitHub repository
- Enable security notifications
- Join the mailing list
- Follow on Twitter/X

---

**Remember**: Security is an ongoing process, not a one-time setup. Stay vigilant and keep systems updated.
