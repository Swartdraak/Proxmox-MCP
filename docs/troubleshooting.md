# Troubleshooting Guide

## Common Issues and Solutions

### Connection Issues

#### "Connection refused" or "ECONNREFUSED"

**Symptoms:**
- Cannot connect to Proxmox server
- Error: `connect ECONNREFUSED`

**Solutions:**

1. **Check Proxmox host and port**
   ```bash
   # Verify host is reachable
   ping proxmox.example.com
   
   # Verify port is open
   telnet proxmox.example.com 8006
   ```

2. **Check firewall rules**
   ```bash
   # On Proxmox server
   iptables -L -n | grep 8006
   
   # Allow port 8006
   iptables -A INPUT -p tcp --dport 8006 -j ACCEPT
   ```

3. **Verify Proxmox service is running**
   ```bash
   # On Proxmox server
   systemctl status pveproxy
   systemctl start pveproxy
   ```

#### "SSL certificate error" or "self-signed certificate"

**Symptoms:**
- SSL validation errors
- Self-signed certificate warnings

**Solutions:**

1. **For development (NOT production)**
   ```bash
   export PROXMOX_VERIFY_SSL="false"
   ```

2. **For production - add certificate to trusted store**
   ```bash
   # Download certificate
   openssl s_client -connect proxmox.example.com:8006 < /dev/null | \
     sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > proxmox.crt
   
   # Add to system trust store (varies by OS)
   # Ubuntu/Debian
   sudo cp proxmox.crt /usr/local/share/ca-certificates/
   sudo update-ca-certificates
   ```

### Authentication Issues

#### "Authentication failed"

**Symptoms:**
- Login failures
- 401 Unauthorized errors

**Solutions:**

1. **Verify credentials**
   ```bash
   # Test with curl
   curl -k -d "username=root@pam&password=yourpassword" \
     https://proxmox.example.com:8006/api2/json/access/ticket
   ```

2. **Check username format**
   ```bash
   # Correct format: username@realm
   export PROXMOX_USERNAME="root"
   export PROXMOX_REALM="pam"
   
   # NOT: root@pam (automatically combined)
   ```

3. **Verify API token format**
   ```bash
   # Correct format
   export PROXMOX_USERNAME="root"
   export PROXMOX_TOKEN_ID="test-token"
   export PROXMOX_TOKEN_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```

#### "Token expired" or "Ticket not valid"

**Symptoms:**
- Intermittent authentication failures
- Works initially, then fails

**Solutions:**

1. **Token automatically refreshes** - verify logs show re-authentication
2. **For API tokens** - verify token hasn't been revoked in Proxmox
3. **Check system time** - ensure server time is synchronized
   ```bash
   # Check time sync
   timedatectl status
   
   # Sync time
   sudo ntpdate pool.ntp.org
   ```

### Rate Limiting Issues

#### "Rate limit exceeded"

**Symptoms:**
- `Rate limit exceeded. Please try again later.`
- Requests failing after many operations

**Solutions:**

1. **Wait for rate limit window to reset** (60 seconds)
2. **Reduce request frequency**
3. **For development - increase limits** (modify `src/client/proxmox-client.ts`)

### Permission Issues

#### "Permission denied" or "403 Forbidden"

**Symptoms:**
- Specific operations fail
- 403 errors for certain actions

**Solutions:**

1. **Check Proxmox permissions**
   ```bash
   # In Proxmox web UI:
   # Datacenter → Permissions → Users/API Tokens
   # Verify user/token has required permissions
   ```

2. **Required permissions for common operations:**
   - **List VMs**: `VM.Audit`
   - **Start/Stop VMs**: `VM.PowerMgmt`
   - **Create VMs**: `VM.Allocate`
   - **Modify VMs**: `VM.Config.*`
   - **Delete VMs**: `VM.Allocate`

3. **Grant minimum required permissions**
   ```bash
   # Via Proxmox CLI
   pveum role add MCPRole -privs "VM.Audit VM.PowerMgmt VM.Allocate VM.Config.Disk VM.Config.CPU VM.Config.Memory"
   pveum aclmod / -user mcp-user@pam -role MCPRole
   ```

### Tool Execution Issues

#### "Unknown tool" error

**Symptoms:**
- Tool not found errors
- Tool name not recognized

**Solutions:**

1. **Check tool name spelling** - must match exactly
2. **Verify server version** - tool may not exist in your version
3. **Check server logs** for startup errors

#### "Invalid parameters" error

**Symptoms:**
- Parameter validation errors
- Schema validation failures

**Solutions:**

1. **Check parameter types**
   ```typescript
   // Correct
   { node: "pve", vmid: 100 }
   
   // Incorrect
   { node: "pve", vmid: "100" }  // vmid must be number
   ```

2. **Check required vs optional parameters**
3. **Verify parameter formats** (see API documentation)

### VM/Container Operations

#### "VM not found" or "Container not found"

**Symptoms:**
- Operations fail for specific VMID
- Resource doesn't exist errors

**Solutions:**

1. **Verify VMID exists**
   ```bash
   # Use list tool first
   list_vms
   list_containers
   ```

2. **Check correct node name**
3. **Verify resource hasn't been moved/deleted**

#### "VM is locked"

**Symptoms:**
- Cannot perform operations on VM
- "Resource is locked" errors

**Solutions:**

1. **Wait for current operation to complete**
2. **Check Proxmox web UI** for running tasks
3. **If stuck, unlock manually** (in Proxmox UI or CLI)

### Environment Configuration

#### Environment variables not loaded

**Symptoms:**
- "PROXMOX_HOST is required" errors
- Configuration not found

**Solutions:**

1. **Verify environment variables are set**
   ```bash
   echo $PROXMOX_HOST
   echo $PROXMOX_USERNAME
   ```

2. **For Claude Desktop - check config file syntax**
   ```json
   {
     "mcpServers": {
       "proxmox": {
         "command": "npx",
         "args": ["-y", "@swartdraak/proxmox-mcp-server"],
         "env": {
           "PROXMOX_HOST": "proxmox.example.com",
           "PROXMOX_USERNAME": "root"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop** after configuration changes

### Build and Installation Issues

#### "Module not found" errors

**Symptoms:**
- Import errors
- Cannot find module

**Solutions:**

1. **Clean install**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Rebuild**
   ```bash
   npm run build
   ```

3. **Check Node.js version**
   ```bash
   node --version  # Should be 18+
   ```

#### TypeScript compilation errors

**Symptoms:**
- Build fails
- Type errors

**Solutions:**

1. **Update TypeScript**
   ```bash
   npm update typescript
   ```

2. **Clean build directory**
   ```bash
   rm -rf dist/
   npm run build
   ```

### Performance Issues

#### Slow response times

**Symptoms:**
- Operations take long time
- Timeouts

**Solutions:**

1. **Check network latency**
   ```bash
   ping proxmox.example.com
   ```

2. **Increase timeout**
   ```bash
   export PROXMOX_TIMEOUT="60000"  # 60 seconds
   ```

3. **Check Proxmox server load**

#### High memory usage

**Symptoms:**
- Process uses excessive memory
- Out of memory errors

**Solutions:**

1. **Restart the server**
2. **Check for memory leaks** (report if found)
3. **Monitor with system tools**
   ```bash
   # Monitor Node.js memory
   node --inspect dist/index.js
   ```

## Debugging

### Enable Debug Logging

```bash
# Enable verbose logging
export NODE_ENV="development"
export DEBUG="proxmox:*"
```

### Check Logs

```bash
# View console output (stderr)
# Server logs to stderr by default

# Check Claude Desktop logs
# macOS: ~/Library/Logs/Claude/
# Windows: %APPDATA%\Claude\logs\
```

### Test Proxmox API Directly

```bash
# Get ticket
curl -k -d "username=root@pam&password=yourpassword" \
  https://proxmox.example.com:8006/api2/json/access/ticket

# Test API call
curl -k -H "Cookie: PVEAuthCookie=YOUR_TICKET" \
  https://proxmox.example.com:8006/api2/json/nodes
```

### Verify MCP Server

```bash
# Run server directly
node dist/index.js

# Should output: "Proxmox MCP Server running on stdio"
```

## Getting Help

If you're still experiencing issues:

1. **Check existing issues**: https://github.com/Swartdraak/Proxmox-MCP/issues
2. **Review documentation**: https://github.com/Swartdraak/Proxmox-MCP/tree/main/docs
3. **Join discussions**: https://github.com/Swartdraak/Proxmox-MCP/discussions
4. **Open an issue**: Include:
   - Error messages
   - Steps to reproduce
   - Environment details (OS, Node.js version, Proxmox version)
   - Relevant logs (redact sensitive information)

## Reporting Bugs

When reporting bugs, include:

```markdown
**Environment:**
- OS: [e.g., Ubuntu 22.04]
- Node.js: [e.g., 18.19.0]
- Proxmox VE: [e.g., 8.1.3]
- MCP Server Version: [e.g., 1.0.0]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [etc.]

**Expected Behavior:**
[What you expected to happen]

**Actual Behavior:**
[What actually happened]

**Error Messages:**
```
[Paste error messages here]
```

**Additional Context:**
[Any other relevant information]
```

## FAQ

### Q: Can I use this with Proxmox VE 6.x?
A: The server is designed for Proxmox VE 7.x+. Some features may work on 6.x, but it's not officially supported.

### Q: Does this work with Proxmox Backup Server?
A: Not yet. PBS support is planned for a future release.

### Q: Can I run multiple instances?
A: Yes, but rate limiting is per-instance. Future versions will support shared rate limiting.

### Q: Is Windows supported?
A: Yes, the server works on Windows, macOS, and Linux.

### Q: Can I contribute?
A: Absolutely! See CONTRIBUTING.md for guidelines.

### Q: How do I report security issues?
A: Email security concerns to [security email]. Do not open public issues for security vulnerabilities.
