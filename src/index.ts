#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import https from 'https';
import { URLSearchParams } from 'url';

// ============================================================================
// Types & Validation
// ============================================================================

interface ProxmoxConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  tokenId?: string;
  tokenSecret?: string;
  realm: string;
  verifySSL: boolean;
  timeout: number;
}

interface ProxmoxVM {
  vmid: number;
  name?: string;
  status?: string;
  uptime?: number;
  node?: string;
  [key: string]: unknown;
}

interface ProxmoxContainer {
  vmid: number;
  hostname?: string;
  status?: string;
  uptime?: number;
  node?: string;
  [key: string]: unknown;
}

interface ProxmoxNode {
  node: string;
  status?: string;
  uptime?: number;
  [key: string]: unknown;
}

// Simple validation functions
function validateVMID(vmid: number): boolean {
  return Number.isInteger(vmid) && vmid >= 100 && vmid <= 999999999;
}

function validateNodeName(name: string): boolean {
  return /^[a-zA-Z0-9-]+$/.test(name) && name.length >= 1 && name.length <= 63;
}

function validateStorageName(name: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(name) && name.length >= 1 && name.length <= 100;
}

function sanitizeString(input: string): string {
  // Remove null bytes and control characters
  return input.replace(/[\x00-\x1F\x7F]/g, '');
}

// ============================================================================
// Proxmox API Client
// ============================================================================

class ProxmoxClient {
  private client: AxiosInstance;
  private config: ProxmoxConfig;
  private ticket?: string;
  private csrfToken?: string;

  constructor(config: ProxmoxConfig) {
    if (!config.host || !config.username) {
      throw new Error('PROXMOX_HOST and PROXMOX_USERNAME environment variables are required');
    }

    if (!config.password && (!config.tokenId || !config.tokenSecret)) {
      throw new Error(
        'Either PROXMOX_PASSWORD or both PROXMOX_TOKEN_ID and PROXMOX_TOKEN_SECRET must be provided'
      );
    }

    this.config = config;

    // Create axios instance with security settings
    const httpsAgent = new https.Agent({
      rejectUnauthorized: config.verifySSL ?? true,
      minVersion: 'TLSv1.2',
    });

    this.client = axios.create({
      baseURL: `https://${config.host}:${config.port}/api2/json`,
      timeout: config.timeout ?? 30000,
      httpsAgent,
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.ticket && this.csrfToken) {
          config.headers['Cookie'] = `PVEAuthCookie=${this.ticket}`;
          config.headers['CSRFPreventionToken'] = this.csrfToken;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async authenticate(): Promise<void> {
    try {
      if (this.config.tokenId && this.config.tokenSecret) {
        // API token authentication
        const tokenHeader = `PVEAPIToken=${this.config.username}@${this.config.realm}!${this.config.tokenId}=${this.config.tokenSecret}`;
        this.client.defaults.headers.common['Authorization'] = tokenHeader;
        return;
      }

      if (!this.config.password) {
        throw new Error('Invalid authentication configuration');
      }

      // Password authentication with form encoding
      const formData = new URLSearchParams();
      formData.append('username', `${this.config.username}@${this.config.realm}`);
      formData.append('password', this.config.password);

      const response = await this.client.post('/access/ticket', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data?.data?.ticket && response.data?.data?.CSRFPreventionToken) {
        this.ticket = response.data.data.ticket;
        this.csrfToken = response.data.data.CSRFPreventionToken;
      } else {
        throw new Error('Invalid authentication response');
      }
    } catch (error) {
      throw new Error(
        `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async request<T>(
    method: string,
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    // Ensure authenticated
    if (!this.ticket && !this.client.defaults.headers.common['Authorization']) {
      await this.authenticate();
    }

    try {
      const response = await this.client.request({
        method,
        url: path,
        data,
        ...config,
      });

      return response.data?.data as T;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`API request failed: ${message}`);
    }
  }

  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', path, undefined, config);
  }

  async post<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('POST', path, data, config);
  }

  async put<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PUT', path, data, config);
  }

  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', path, undefined, config);
  }
}

// ============================================================================
// Tool Handlers
// ============================================================================

async function listVMs(client: ProxmoxClient): Promise<ProxmoxVM[]> {
  const nodes = await client.get<Array<{ node: string }>>('/nodes');
  const allVMs: ProxmoxVM[] = [];

  for (const node of nodes) {
    try {
      const vms = await client.get<ProxmoxVM[]>(`/nodes/${node.node}/qemu`);
      allVMs.push(...vms.map((vm) => ({ ...vm, node: node.node })));
    } catch {
      // Continue on error
    }
  }

  return allVMs;
}

async function getVMStatus(client: ProxmoxClient, node: string, vmid: number): Promise<ProxmoxVM> {
  if (!validateNodeName(node) || !validateVMID(vmid)) {
    throw new Error('Invalid node name or VM ID');
  }
  return client.get<ProxmoxVM>(`/nodes/${node}/qemu/${vmid}/status/current`);
}

async function startVM(client: ProxmoxClient, node: string, vmid: number): Promise<string> {
  if (!validateNodeName(node) || !validateVMID(vmid)) {
    throw new Error('Invalid node name or VM ID');
  }
  await client.post(`/nodes/${node}/qemu/${vmid}/status/start`);
  return `VM ${vmid} on node ${node} started successfully`;
}

async function stopVM(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  force = false
): Promise<string> {
  if (!validateNodeName(node) || !validateVMID(vmid)) {
    throw new Error('Invalid node name or VM ID');
  }
  const action = force ? 'stop' : 'shutdown';
  await client.post(`/nodes/${node}/qemu/${vmid}/status/${action}`);
  return `VM ${vmid} on node ${node} ${force ? 'stopped' : 'shutdown initiated'} successfully`;
}

async function restartVM(client: ProxmoxClient, node: string, vmid: number): Promise<string> {
  if (!validateNodeName(node) || !validateVMID(vmid)) {
    throw new Error('Invalid node name or VM ID');
  }
  await client.post(`/nodes/${node}/qemu/${vmid}/status/reboot`);
  return `VM ${vmid} on node ${node} restarted successfully`;
}

async function createVM(
  client: ProxmoxClient,
  params: {
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
): Promise<string> {
  if (!validateNodeName(params.node) || !validateVMID(params.vmid)) {
    throw new Error('Invalid node name or VM ID');
  }

  const vmData: Record<string, unknown> = {
    vmid: params.vmid,
    cores: params.cores ?? 1,
    memory: params.memory ?? 512,
    ostype: params.ostype ?? 'l26',
  };

  if (params.name) {
    vmData.name = sanitizeString(params.name);
  }
  if (params.disk) vmData.disk = params.disk;
  if (params.iso) vmData.iso = params.iso;
  if (params.net0) vmData.net0 = params.net0;
  if (params.storage) vmData.storage = params.storage;

  await client.post(`/nodes/${params.node}/qemu`, vmData);
  return `VM ${params.vmid} created successfully`;
}

async function deleteVM(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  purge = false
): Promise<string> {
  if (!validateNodeName(node) || !validateVMID(vmid)) {
    throw new Error('Invalid node name or VM ID');
  }
  const params = purge ? '?purge=1' : '';
  await client.delete(`/nodes/${node}/qemu/${vmid}${params}`);
  return `VM ${vmid} deleted successfully`;
}

async function cloneVM(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  newid: number,
  name?: string,
  full = false
): Promise<string> {
  if (!validateNodeName(node) || !validateVMID(vmid) || !validateVMID(newid)) {
    throw new Error('Invalid node name or VM ID');
  }

  const data: Record<string, unknown> = {
    newid,
    full,
  };
  if (name) data.name = sanitizeString(name);

  await client.post(`/nodes/${node}/qemu/${vmid}/clone`, data);
  return `VM ${vmid} cloned to ${newid} successfully`;
}

async function getVMConfig(client: ProxmoxClient, node: string, vmid: number): Promise<ProxmoxVM> {
  if (!validateNodeName(node) || !validateVMID(vmid)) {
    throw new Error('Invalid node name or VM ID');
  }
  return client.get<ProxmoxVM>(`/nodes/${node}/qemu/${vmid}/config`);
}

async function listContainers(client: ProxmoxClient): Promise<ProxmoxContainer[]> {
  const nodes = await client.get<Array<{ node: string }>>('/nodes');
  const allContainers: ProxmoxContainer[] = [];

  for (const node of nodes) {
    try {
      const containers = await client.get<ProxmoxContainer[]>(`/nodes/${node.node}/lxc`);
      allContainers.push(...containers.map((c) => ({ ...c, node: node.node })));
    } catch {
      // Continue on error
    }
  }

  return allContainers;
}

async function getContainerStatus(
  client: ProxmoxClient,
  node: string,
  vmid: number
): Promise<ProxmoxContainer> {
  if (!validateNodeName(node) || !validateVMID(vmid)) {
    throw new Error('Invalid node name or container ID');
  }
  return client.get<ProxmoxContainer>(`/nodes/${node}/lxc/${vmid}/status/current`);
}

async function startContainer(client: ProxmoxClient, node: string, vmid: number): Promise<string> {
  if (!validateNodeName(node) || !validateVMID(vmid)) {
    throw new Error('Invalid node name or container ID');
  }
  await client.post(`/nodes/${node}/lxc/${vmid}/status/start`);
  return `Container ${vmid} on node ${node} started successfully`;
}

async function stopContainer(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  force = false
): Promise<string> {
  if (!validateNodeName(node) || !validateVMID(vmid)) {
    throw new Error('Invalid node name or container ID');
  }
  const action = force ? 'stop' : 'shutdown';
  await client.post(`/nodes/${node}/lxc/${vmid}/status/${action}`);
  return `Container ${vmid} on node ${node} ${force ? 'stopped' : 'shutdown initiated'} successfully`;
}

async function createContainer(
  client: ProxmoxClient,
  params: {
    node: string;
    vmid: number;
    hostname?: string;
    cores?: number;
    memory?: number;
    ostemplate: string;
    rootfs?: string;
    net0?: string;
    storage?: string;
  }
): Promise<string> {
  if (!validateNodeName(params.node) || !validateVMID(params.vmid)) {
    throw new Error('Invalid node name or container ID');
  }
  if (!params.ostemplate) {
    throw new Error('ostemplate is required');
  }

  const data: Record<string, unknown> = {
    vmid: params.vmid,
    cores: params.cores ?? 1,
    memory: params.memory ?? 512,
    ostemplate: params.ostemplate,
  };

  if (params.hostname) data.hostname = sanitizeString(params.hostname);
  if (params.rootfs) data.rootfs = params.rootfs;
  if (params.net0) data.net0 = params.net0;
  if (params.storage) data.storage = params.storage;

  await client.post(`/nodes/${params.node}/lxc`, data);
  return `Container ${params.vmid} created successfully`;
}

async function deleteContainer(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  purge = false
): Promise<string> {
  if (!validateNodeName(node) || !validateVMID(vmid)) {
    throw new Error('Invalid node name or container ID');
  }
  const params = purge ? '?purge=1' : '';
  await client.delete(`/nodes/${node}/lxc/${vmid}${params}`);
  return `Container ${vmid} deleted successfully`;
}

async function listNodes(client: ProxmoxClient): Promise<ProxmoxNode[]> {
  return client.get<ProxmoxNode[]>('/nodes');
}

async function getNodeStatus(client: ProxmoxClient, node: string): Promise<ProxmoxNode> {
  if (!validateNodeName(node)) {
    throw new Error('Invalid node name');
  }
  return client.get<ProxmoxNode>(`/nodes/${node}/status`);
}

async function listStorage(client: ProxmoxClient): Promise<Array<{ storage: string }>> {
  return client.get<Array<{ storage: string }>>('/storage');
}

async function getStorageStatus(
  client: ProxmoxClient,
  node: string,
  storage: string
): Promise<unknown> {
  if (!validateNodeName(node) || !validateStorageName(storage)) {
    throw new Error('Invalid node name or storage name');
  }
  return client.get(`/nodes/${node}/storage/${storage}/content`);
}

// ============================================================================
// MCP Server
// ============================================================================

class ProxmoxMCPServer {
  private server: Server;
  private client?: ProxmoxClient;

  constructor() {
    this.server = new Server(
      {
        name: 'proxmox-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private initializeClient(): void {
    const config: ProxmoxConfig = {
      host: process.env.PROXMOX_HOST || '',
      port: process.env.PROXMOX_PORT ? parseInt(process.env.PROXMOX_PORT, 10) : 8006,
      username: process.env.PROXMOX_USERNAME || '',
      password: process.env.PROXMOX_PASSWORD,
      tokenId: process.env.PROXMOX_TOKEN_ID,
      tokenSecret: process.env.PROXMOX_TOKEN_SECRET,
      realm: process.env.PROXMOX_REALM || 'pam',
      verifySSL: process.env.PROXMOX_VERIFY_SSL !== 'false',
      timeout: process.env.PROXMOX_TIMEOUT ? parseInt(process.env.PROXMOX_TIMEOUT, 10) : 30000,
    };

    this.client = new ProxmoxClient(config);
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getToolList(),
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.client) {
        this.initializeClient();
      }

      const { name, arguments: args = {} } = request.params;

      try {
        let result: unknown;

        // VM operations
        if (name === 'list_vms') {
          result = await listVMs(this.client!);
        } else if (name === 'get_vm_status') {
          result = await getVMStatus(this.client!, args.node as string, args.vmid as number);
        } else if (name === 'start_vm') {
          result = await startVM(this.client!, args.node as string, args.vmid as number);
        } else if (name === 'stop_vm') {
          result = await stopVM(
            this.client!,
            args.node as string,
            args.vmid as number,
            args.force as boolean
          );
        } else if (name === 'restart_vm') {
          result = await restartVM(this.client!, args.node as string, args.vmid as number);
        } else if (name === 'create_vm') {
          result = await createVM(this.client!, args as Parameters<typeof createVM>[1]);
        } else if (name === 'delete_vm') {
          result = await deleteVM(
            this.client!,
            args.node as string,
            args.vmid as number,
            args.purge as boolean
          );
        } else if (name === 'clone_vm') {
          result = await cloneVM(
            this.client!,
            args.node as string,
            args.vmid as number,
            args.newid as number,
            args.name as string,
            args.full as boolean
          );
        } else if (name === 'get_vm_config') {
          result = await getVMConfig(this.client!, args.node as string, args.vmid as number);
        }
        // Container operations
        else if (name === 'list_containers') {
          result = await listContainers(this.client!);
        } else if (name === 'get_container_status') {
          result = await getContainerStatus(this.client!, args.node as string, args.vmid as number);
        } else if (name === 'start_container') {
          result = await startContainer(this.client!, args.node as string, args.vmid as number);
        } else if (name === 'stop_container') {
          result = await stopContainer(
            this.client!,
            args.node as string,
            args.vmid as number,
            args.force as boolean
          );
        } else if (name === 'create_container') {
          result = await createContainer(
            this.client!,
            args as Parameters<typeof createContainer>[1]
          );
        } else if (name === 'delete_container') {
          result = await deleteContainer(
            this.client!,
            args.node as string,
            args.vmid as number,
            args.purge as boolean
          );
        }
        // Node operations
        else if (name === 'list_nodes') {
          result = await listNodes(this.client!);
        } else if (name === 'get_node_status') {
          result = await getNodeStatus(this.client!, args.node as string);
        }
        // Storage operations
        else if (name === 'list_storage') {
          result = await listStorage(this.client!);
        } else if (name === 'get_storage_status') {
          result = await getStorageStatus(this.client!, args.node as string, args.storage as string);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getToolList(): Tool[] {
    return [
      // VM Tools
      {
        name: 'list_vms',
        description: 'List all virtual machines across all nodes',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_vm_status',
        description: 'Get the current status of a virtual machine',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'VM ID' },
          },
          required: ['node', 'vmid'],
        },
      },
      {
        name: 'start_vm',
        description: 'Start a virtual machine',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'VM ID' },
          },
          required: ['node', 'vmid'],
        },
      },
      {
        name: 'stop_vm',
        description: 'Stop a virtual machine (graceful shutdown)',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'VM ID' },
            force: { type: 'boolean', description: 'Force stop', default: false },
          },
          required: ['node', 'vmid'],
        },
      },
      {
        name: 'restart_vm',
        description: 'Restart a virtual machine',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'VM ID' },
          },
          required: ['node', 'vmid'],
        },
      },
      {
        name: 'create_vm',
        description: 'Create a new virtual machine',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'VM ID' },
            name: { type: 'string', description: 'VM name' },
            cores: { type: 'number', description: 'Number of CPU cores', default: 1 },
            memory: { type: 'number', description: 'Memory in MB', default: 512 },
            disk: { type: 'string', description: 'Disk configuration' },
            ostype: { type: 'string', description: 'OS type', default: 'l26' },
            iso: { type: 'string', description: 'ISO image path' },
            net0: { type: 'string', description: 'Network configuration' },
            storage: { type: 'string', description: 'Storage name', default: 'local-lvm' },
          },
          required: ['node', 'vmid'],
        },
      },
      {
        name: 'delete_vm',
        description: 'Delete a virtual machine',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'VM ID' },
            purge: { type: 'boolean', description: 'Purge all data', default: false },
          },
          required: ['node', 'vmid'],
        },
      },
      {
        name: 'clone_vm',
        description: 'Clone a virtual machine',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'Source VM ID' },
            newid: { type: 'number', description: 'New VM ID' },
            name: { type: 'string', description: 'New VM name' },
            full: { type: 'boolean', description: 'Full clone', default: false },
          },
          required: ['node', 'vmid', 'newid'],
        },
      },
      {
        name: 'get_vm_config',
        description: 'Get virtual machine configuration',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'VM ID' },
          },
          required: ['node', 'vmid'],
        },
      },
      // Container Tools
      {
        name: 'list_containers',
        description: 'List all containers (LXC) across all nodes',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_container_status',
        description: 'Get the current status of a container',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'Container ID' },
          },
          required: ['node', 'vmid'],
        },
      },
      {
        name: 'start_container',
        description: 'Start a container',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'Container ID' },
          },
          required: ['node', 'vmid'],
        },
      },
      {
        name: 'stop_container',
        description: 'Stop a container (graceful shutdown)',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'Container ID' },
            force: { type: 'boolean', description: 'Force stop', default: false },
          },
          required: ['node', 'vmid'],
        },
      },
      {
        name: 'create_container',
        description: 'Create a new container',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'Container ID' },
            hostname: { type: 'string', description: 'Container hostname' },
            cores: { type: 'number', description: 'Number of CPU cores', default: 1 },
            memory: { type: 'number', description: 'Memory in MB', default: 512 },
            ostemplate: { type: 'string', description: 'OS template' },
            storage: { type: 'string', description: 'Storage name', default: 'local-lvm' },
          },
          required: ['node', 'vmid', 'ostemplate'],
        },
      },
      {
        name: 'delete_container',
        description: 'Delete a container',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            vmid: { type: 'number', description: 'Container ID' },
            purge: { type: 'boolean', description: 'Purge all data', default: false },
          },
          required: ['node', 'vmid'],
        },
      },
      // Node Tools
      {
        name: 'list_nodes',
        description: 'List all nodes in the Proxmox cluster',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_node_status',
        description: 'Get the status of a specific node',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
          },
          required: ['node'],
        },
      },
      // Storage Tools
      {
        name: 'list_storage',
        description: 'List all storage across all nodes',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_storage_status',
        description: 'Get the status of storage content',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Node name' },
            storage: { type: 'string', description: 'Storage name' },
          },
          required: ['node', 'storage'],
        },
      },
    ];
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error): void => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async (): Promise<void> => {
      await this.server.close();
      process.exit(0);
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Proxmox MCP Server running on stdio');
  }
}

// Start the server
const server = new ProxmoxMCPServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
