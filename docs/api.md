# API Documentation

## Proxmox Client

### ProxmoxClient

Main client for interacting with Proxmox VE API.

#### Constructor

```typescript
constructor(config: ProxmoxConfig)
```

**Parameters:**
- `config`: Configuration object
  - `host`: Proxmox host (required)
  - `port`: Port number (default: 8006)
  - `username`: Username (required)
  - `password`: Password (optional, required if no token)
  - `tokenId`: API token ID (optional)
  - `tokenSecret`: API token secret (optional)
  - `realm`: Authentication realm (default: 'pam')
  - `verifySSL`: Verify SSL certificates (default: true)
  - `timeout`: Request timeout in ms (default: 30000)

#### Methods

##### authenticate()

Authenticate with Proxmox VE server.

```typescript
async authenticate(): Promise<void>
```

##### get()

Make a GET request.

```typescript
async get<T>(path: string, config?: AxiosRequestConfig): Promise<T>
```

##### post()

Make a POST request.

```typescript
async post<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
```

##### put()

Make a PUT request.

```typescript
async put<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
```

##### delete()

Make a DELETE request.

```typescript
async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T>
```

## VM Tools

### VMTools

Tools for managing virtual machines.

#### Methods

##### listVMs()

List all VMs across all nodes.

```typescript
async listVMs(): Promise<ProxmoxVM[]>
```

**Returns:** Array of VM objects

##### getVMStatus()

Get status of a specific VM.

```typescript
async getVMStatus(node: string, vmid: number): Promise<ProxmoxVM>
```

**Parameters:**
- `node`: Node name
- `vmid`: VM ID (100-999999999)

##### startVM()

Start a VM.

```typescript
async startVM(node: string, vmid: number): Promise<string>
```

##### stopVM()

Stop a VM (graceful shutdown).

```typescript
async stopVM(node: string, vmid: number, force?: boolean): Promise<string>
```

**Parameters:**
- `force`: If true, force stop instead of graceful shutdown

##### restartVM()

Restart a VM.

```typescript
async restartVM(node: string, vmid: number): Promise<string>
```

##### createVM()

Create a new VM.

```typescript
async createVM(params: VMCreateParams): Promise<string>
```

**Parameters:**
- `node`: Node name (required)
- `vmid`: VM ID (required, 100-999999999)
- `name`: VM name (optional, alphanumeric and hyphens only)
- `cores`: Number of CPU cores (default: 1)
- `memory`: Memory in MB (default: 512)
- `disk`: Disk configuration (optional)
- `ostype`: OS type (default: 'l26')
- `iso`: ISO image path (optional)
- `net0`: Network configuration (optional)
- `storage`: Storage name (default: 'local-lvm')

##### deleteVM()

Delete a VM.

```typescript
async deleteVM(node: string, vmid: number, purge?: boolean): Promise<string>
```

**Parameters:**
- `purge`: If true, purge all VM data

##### cloneVM()

Clone a VM.

```typescript
async cloneVM(
  node: string,
  vmid: number,
  newid: number,
  name?: string,
  full?: boolean
): Promise<string>
```

**Parameters:**
- `vmid`: Source VM ID
- `newid`: New VM ID
- `name`: New VM name (optional)
- `full`: Full clone vs linked clone (default: false)

##### getVMConfig()

Get VM configuration.

```typescript
async getVMConfig(node: string, vmid: number): Promise<Record<string, unknown>>
```

##### updateVMConfig()

Update VM configuration.

```typescript
async updateVMConfig(
  node: string,
  vmid: number,
  config: Record<string, unknown>
): Promise<string>
```

## Container Tools

### ContainerTools

Tools for managing LXC containers.

#### Methods

Similar to VMTools but for containers:
- `listContainers()`
- `getContainerStatus()`
- `startContainer()`
- `stopContainer()`
- `restartContainer()`
- `createContainer()`
- `deleteContainer()`
- `cloneContainer()`
- `getContainerConfig()`
- `updateContainerConfig()`

## Node Tools

### NodeTools

Tools for managing cluster nodes.

#### Methods

##### listNodes()

List all nodes in the cluster.

```typescript
async listNodes(): Promise<ProxmoxNode[]>
```

##### getNodeStatus()

Get node status and resource usage.

```typescript
async getNodeStatus(node: string): Promise<ProxmoxNode>
```

##### getNodeVersion()

Get node version information.

```typescript
async getNodeVersion(node: string): Promise<Record<string, unknown>>
```

##### getNodeNetwork()

Get node network configuration.

```typescript
async getNodeNetwork(node: string): Promise<unknown[]>
```

##### getNodeServices()

Get node services status.

```typescript
async getNodeServices(node: string): Promise<unknown[]>
```

##### getNodeTasks()

Get node tasks.

```typescript
async getNodeTasks(node: string, limit?: number): Promise<unknown[]>
```

## Storage Tools

### StorageTools

Tools for managing storage.

#### Methods

##### listStorage()

List all storage.

```typescript
async listStorage(): Promise<ProxmoxStorage[]>
```

##### getStorageStatus()

Get storage status.

```typescript
async getStorageStatus(node: string, storage: string): Promise<ProxmoxStorage>
```

##### listStorageContent()

List storage content.

```typescript
async listStorageContent(
  node: string,
  storage: string,
  content?: string
): Promise<unknown[]>
```

**Parameters:**
- `content`: Content type filter (optional)

##### deleteStorageContent()

Delete content from storage.

```typescript
async deleteStorageContent(
  node: string,
  storage: string,
  volid: string
): Promise<string>
```

## Security Components

### SecurityManager

Manages security audit logging and access control.

#### Methods

##### logAccess()

Log an access attempt.

```typescript
logAccess(
  operation: string,
  user: string,
  result: 'success' | 'failure',
  details?: string
): void
```

##### getAuditLogs()

Get audit logs.

```typescript
getAuditLogs(limit?: number): SecurityAuditLog[]
```

##### validateOperation()

Validate if an operation is allowed.

```typescript
validateOperation(operation: string, allowedOperations: string[]): boolean
```

### RateLimiter

Token bucket rate limiter.

#### Constructor

```typescript
constructor(config: RateLimitConfig)
```

**Parameters:**
- `maxRequests`: Maximum requests
- `windowMs`: Time window in milliseconds

#### Methods

##### tryAcquire()

Try to acquire a token.

```typescript
tryAcquire(): boolean
```

##### reset()

Reset the rate limiter.

```typescript
reset(): void
```

### InputValidator

Static methods for input validation.

#### Methods

- `validateVMID(vmid: number): boolean`
- `validateNodeName(name: string): boolean`
- `validateHostname(hostname: string): boolean`
- `validateStorageName(name: string): boolean`
- `sanitizeString(input: string): string`
- `validateIPAddress(ip: string): boolean`
- `validatePort(port: number): boolean`
- `validateMemory(memory: number): boolean`
- `validateCores(cores: number): boolean`

## Types

### ProxmoxConfig

```typescript
interface ProxmoxConfig {
  host: string;
  port?: number;
  username: string;
  password?: string;
  tokenId?: string;
  tokenSecret?: string;
  realm?: string;
  verifySSL?: boolean;
  timeout?: number;
}
```

### ProxmoxVM

```typescript
interface ProxmoxVM {
  vmid: number;
  name?: string;
  status: string;
  node: string;
  cpus?: number;
  maxmem?: number;
  maxdisk?: number;
  uptime?: number;
  pid?: number;
  template?: number;
}
```

### ProxmoxContainer

```typescript
interface ProxmoxContainer {
  vmid: number;
  name?: string;
  status: string;
  node: string;
  cpus?: number;
  maxmem?: number;
  maxdisk?: number;
  uptime?: number;
  template?: number;
}
```

### ProxmoxNode

```typescript
interface ProxmoxNode {
  node: string;
  status: string;
  cpu?: number;
  maxcpu?: number;
  mem?: number;
  maxmem?: number;
  disk?: number;
  maxdisk?: number;
  uptime?: number;
}
```

### ProxmoxStorage

```typescript
interface ProxmoxStorage {
  storage: string;
  type: string;
  content: string;
  active: number;
  avail?: number;
  total?: number;
  used?: number;
  enabled?: number;
}
```

## Error Handling

All methods may throw errors. Common error scenarios:

- **Authentication errors**: Invalid credentials or expired token
- **Validation errors**: Invalid input parameters
- **Rate limit errors**: Too many requests
- **Network errors**: Connection issues
- **API errors**: Proxmox API errors

Always wrap API calls in try-catch blocks:

```typescript
try {
  const vms = await vmTools.listVMs();
  console.log(vms);
} catch (error) {
  console.error('Failed to list VMs:', error.message);
}
```
