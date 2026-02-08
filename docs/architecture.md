# Architecture Overview

## System Architecture

Proxmox VE MCP Server is designed as a secure, modular system that bridges AI assistants with Proxmox VE infrastructure.

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Assistant (Claude)                   │
└────────────────────────┬────────────────────────────────────┘
                         │ MCP Protocol (stdio)
┌────────────────────────▼────────────────────────────────────┐
│                   Proxmox MCP Server                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              MCP Protocol Handler                       │ │
│  │  - Tools      - Prompts      - Resources               │ │
│  └─────┬──────────────┬──────────────┬────────────────────┘ │
│        │              │              │                       │
│  ┌─────▼──────┐ ┌────▼────┐ ┌──────▼────────┐             │
│  │  VM Tools  │ │Container│ │  Node/Storage │             │
│  │            │ │  Tools  │ │     Tools     │             │
│  └─────┬──────┘ └────┬────┘ └──────┬────────┘             │
│        │              │              │                       │
│  ┌─────▼──────────────▼──────────────▼────────────────────┐ │
│  │           Proxmox API Client                            │ │
│  │  - Authentication  - Rate Limiting  - Retry Logic      │ │
│  └─────┬───────────────────────────────────────────────────┘ │
│        │                                                      │
│  ┌─────▼───────────────────────────────────────────────────┐ │
│  │           Security Layer                                 │ │
│  │  - Input Validation  - Audit Logging  - Sanitization   │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/TLS
┌────────────────────────▼────────────────────────────────────┐
│                  Proxmox VE API                              │
│                  (Port 8006)                                 │
└──────────────────────────────────────────────────────────────┘
```

## Component Overview

### 1. MCP Server (`src/index.ts`)

The main server that implements the Model Context Protocol specification.

**Responsibilities:**
- Handle MCP protocol communication (stdio transport)
- Register and expose tools, prompts, and resources
- Route requests to appropriate handlers
- Manage server lifecycle

**Key Features:**
- Tool execution with error handling
- Prompt templates for common workflows
- Resource providers for cluster data
- Graceful shutdown handling

### 2. Proxmox Client (`src/client/`)

HTTP client for Proxmox VE API communication.

**Responsibilities:**
- Authenticate with Proxmox VE
- Make secure API requests
- Handle request/response lifecycle
- Manage authentication tokens

**Key Features:**
- Multiple authentication methods (password/token)
- Automatic token refresh
- Request/response interceptors
- SSL/TLS configuration
- Timeout handling

### 3. Tools Layer (`src/tools/`)

Domain-specific tools for Proxmox operations.

#### VM Tools (`vm-tools.ts`)
- Virtual machine lifecycle management
- VM configuration and status
- Cloning and templating

#### Container Tools (`container-tools.ts`)
- LXC container management
- Container configuration
- Container lifecycle operations

#### Node Tools (`node-tools.ts`)
- Cluster node monitoring
- Node status and resources
- Service management

#### Storage Tools (`storage-tools.ts`)
- Storage pool management
- Content listing and management
- Storage status monitoring

### 4. Security Layer (`src/security/`)

Comprehensive security infrastructure.

#### Security Manager (`manager.ts`)
- Audit logging
- Access control validation
- Operation tracking

#### Rate Limiter (`rate-limiter.ts`)
- Token bucket algorithm
- Request throttling
- Abuse prevention

#### Input Validator (`validator.ts`)
- Schema validation
- Input sanitization
- Type checking
- Format validation

### 5. Type System (`src/types/`)

TypeScript type definitions and validation schemas.

#### Type Definitions (`index.ts`)
- Interface definitions
- Type unions and enums
- Domain models

#### Validation Schemas (`schemas.ts`)
- Zod schema definitions
- Runtime validation
- Type inference

### 6. Configuration (`src/config/`)

Configuration management and loading.

#### Config Loader (`loader.ts`)
- Environment variable parsing
- Configuration validation
- Default value application

## Data Flow

### Request Flow

```
1. User query → Claude
2. Claude → MCP Server (tool call)
3. MCP Server → Security validation
4. MCP Server → Tool execution
5. Tool → Proxmox Client
6. Proxmox Client → Proxmox API (HTTPS)
7. Proxmox API → Response
8. Response → Security logging
9. Response → Claude
10. Claude → User answer
```

### Authentication Flow

```
1. Load credentials from environment
2. Validate configuration
3. Connect to Proxmox API
4. Authenticate (password or token)
5. Store auth ticket/token
6. Use for subsequent requests
7. Auto-refresh on expiration
```

## Security Architecture

### Defense in Depth

Multiple security layers:

1. **Input Layer**: Schema validation, type checking
2. **Processing Layer**: Rate limiting, sanitization
3. **API Layer**: Authentication, authorization
4. **Transport Layer**: SSL/TLS encryption
5. **Audit Layer**: Comprehensive logging

### Security Controls

- **Input Validation**: All inputs validated before processing
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Audit Logging**: All operations logged for compliance
- **Secure Transport**: TLS 1.2+ required
- **Credential Protection**: No credential exposure

## Scalability Considerations

### Current Design

- Single-instance server
- Synchronous request processing
- In-memory rate limiting
- Local audit logging

### Future Enhancements

- Multi-instance deployment
- Distributed rate limiting (Redis)
- Persistent audit logs (database)
- Queue-based job processing
- Webhook support

## Error Handling

### Error Propagation

```
Error Source → Tool → MCP Server → Claude → User
```

### Error Types

1. **Validation Errors**: Input validation failures
2. **Authentication Errors**: Auth failures
3. **Authorization Errors**: Permission denied
4. **Rate Limit Errors**: Too many requests
5. **Network Errors**: Connection issues
6. **API Errors**: Proxmox API errors
7. **Internal Errors**: Server errors

### Error Recovery

- Automatic token refresh on 401
- Retry logic for transient failures
- Graceful degradation
- User-friendly error messages

## Testing Architecture

### Test Pyramid

```
        ┌─────────────┐
        │  E2E Tests  │  (Future)
        └─────────────┘
      ┌───────────────────┐
      │ Integration Tests │  (Future)
      └───────────────────┘
    ┌───────────────────────┐
    │     Unit Tests         │  (>80% coverage)
    └───────────────────────┘
  ┌─────────────────────────────┐
  │   Fuzzing Tests              │
  └─────────────────────────────┘
```

### Test Coverage

- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **Fuzzing Tests**: Security and robustness testing
- **E2E Tests**: Full workflow testing

## Deployment Architecture

### Standalone Mode

```
┌──────────────────┐
│  Claude Desktop  │
│                  │
│  ┌────────────┐  │
│  │ MCP Server │  │
│  │  (stdio)   │  │
│  └────────────┘  │
└──────────────────┘
```

### Docker Mode (Future)

```
┌──────────────────┐
│   Docker Host    │
│  ┌────────────┐  │
│  │ Container  │  │
│  │ MCP Server │  │
│  │  (stdio)   │  │
│  └────────────┘  │
└──────────────────┘
```

### Server Mode (Future)

```
     ┌────────────┐
     │  Clients   │
     └─────┬──────┘
           │ SSE/WebSocket
     ┌─────▼──────┐
     │ MCP Server │
     │  (Server)  │
     └────────────┘
```

## Performance Characteristics

### Current Performance

- **Startup Time**: <1 second
- **Request Latency**: 50-500ms (network dependent)
- **Memory Usage**: ~50-100MB
- **CPU Usage**: Minimal (I/O bound)

### Optimization Strategies

1. **Connection Pooling**: Reuse HTTP connections
2. **Caching**: Cache frequently accessed data
3. **Parallel Requests**: Concurrent API calls
4. **Lazy Loading**: Load components on demand

## Monitoring and Observability

### Current Capabilities

- Console logging (stderr)
- Audit logs (in-memory)
- Error tracking

### Future Enhancements

- Structured logging (JSON)
- Metrics export (Prometheus)
- Distributed tracing
- Health check endpoints
- Performance monitoring

## Extension Points

### Adding New Tools

1. Create tool class in `src/tools/`
2. Implement tool methods
3. Register in `src/index.ts`
4. Add tests
5. Update documentation

### Adding New Transports

1. Implement transport interface
2. Register in server
3. Update configuration
4. Add tests

### Adding New Security Controls

1. Implement in `src/security/`
2. Integrate into client
3. Add validation
4. Add tests

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.7+
- **MCP SDK**: @modelcontextprotocol/sdk
- **HTTP Client**: Axios
- **Validation**: Zod
- **Testing**: Vitest
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions

## Design Principles

1. **Security First**: Security at every layer
2. **Type Safety**: Leverage TypeScript strict mode
3. **Modularity**: Clear separation of concerns
4. **Testability**: Design for testing
5. **Documentation**: Comprehensive docs
6. **Standards**: Follow industry standards
7. **Simplicity**: Keep it simple and maintainable

## Future Roadmap

### Phase 1 (Current)
- ✅ Core MCP server
- ✅ VM/Container/Node/Storage tools
- ✅ Security infrastructure
- ✅ Comprehensive tests
- ✅ CI/CD pipeline

### Phase 2 (Next)
- [ ] Backup and restore operations
- [ ] Cluster-wide operations
- [ ] Enhanced error handling
- [ ] Performance optimization

### Phase 3 (Future)
- [ ] Proxmox Backup Server integration
- [ ] Webhook support
- [ ] Template management
- [ ] Resource scheduling
- [ ] Metrics export

### Phase 4 (Long-term)
- [ ] Multi-tenant support
- [ ] Advanced RBAC
- [ ] Custom plugin system
- [ ] Web UI dashboard
