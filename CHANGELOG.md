# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-08

### Added
- Initial release of Proxmox VE MCP Server
- Complete MCP server implementation with stdio transport
- Virtual Machine (QEMU) management tools
  - List, create, start, stop, restart, delete, clone VMs
  - Get VM status and configuration
- Container (LXC) management tools
  - List, create, start, stop, delete, clone containers
  - Get container status and configuration
- Node management tools
  - List nodes and get node status
  - View node resources and tasks
- Storage management tools
  - List storage and view storage status
  - List storage content
- Security features
  - Input validation and sanitization using Zod
  - Rate limiting with token bucket algorithm
  - Security audit logging
  - SSL/TLS certificate validation
  - Secure credential handling
- Comprehensive test suite
  - Unit tests with Vitest (>80% coverage)
  - Fuzzing tests for security validation
- CI/CD pipeline
  - Automated testing on multiple Node.js versions
  - ESLint and Prettier checks
  - Security audits
  - Automated dependency updates
- Documentation
  - Comprehensive README with examples
  - API documentation
  - Security guidelines
  - Contributing guidelines
- TypeScript strict mode configuration
- ESLint with security plugin
- Prettier code formatting

### Security
- Input validation prevents injection attacks
- Rate limiting prevents abuse
- Audit logging tracks all operations
- SSL/TLS validation enabled by default
- No credential exposure in logs or errors

## [Unreleased]

### Planned Features
- Backup and restore operations
- Cluster-wide operations
- Proxmox Backup Server integration
- Webhook support for events
- Custom VM/container templates
- Resource scheduling
- Prometheus metrics export
