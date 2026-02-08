/**
 * Core type definitions for Proxmox MCP Server
 */

export interface ProxmoxConfig {
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

export interface ProxmoxNode {
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

export interface ProxmoxVM {
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

export interface ProxmoxContainer {
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

export interface ProxmoxStorage {
  storage: string;
  type: string;
  content: string;
  active: number;
  avail?: number;
  total?: number;
  used?: number;
  enabled?: number;
}

export interface ProxmoxBackup {
  volid: string;
  content: string;
  ctime: number;
  format: string;
  size: number;
  vmid?: number;
}

export interface VMCreateParams {
  node: string;
  vmid: number;
  name?: string;
  cores?: number;
  memory?: number;
  disk?: string;
  ostype?: string;
  iso?: string;
  net0?: string;
  storage?: string;
}

export interface ContainerCreateParams {
  node: string;
  vmid: number;
  hostname?: string;
  cores?: number;
  memory?: number;
  rootfs?: string;
  ostemplate: string;
  password?: string;
  net0?: string;
  storage?: string;
}

export interface SecurityAuditLog {
  timestamp: number;
  operation: string;
  user: string;
  resource: string;
  result: 'success' | 'failure';
  details?: string;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface SafetyControl {
  requireConfirmation: boolean;
  allowedOperations: string[];
  deniedOperations: string[];
  dryRun: boolean;
}
