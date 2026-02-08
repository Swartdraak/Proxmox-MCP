#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ProxmoxClient } from './client/proxmox-client.js';
import { VMTools } from './tools/vm-tools.js';
import { ContainerTools } from './tools/container-tools.js';
import { NodeTools } from './tools/node-tools.js';
import { StorageTools } from './tools/storage-tools.js';
import { ProxmoxConfig } from './types/index.js';

/**
 * Proxmox VE MCP Server
 * Industry-standard, security-first Model Context Protocol server for Proxmox VE
 */
class ProxmoxMCPServer {
  private server: Server;
  private client?: ProxmoxClient;
  private vmTools?: VMTools;
  private containerTools?: ContainerTools;
  private nodeTools?: NodeTools;
  private storageTools?: StorageTools;

  constructor() {
    this.server = new Server(
      {
        name: 'proxmox-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  /**
   * Initialize Proxmox client from environment variables
   */
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

    if (!config.host || !config.username) {
      throw new Error('PROXMOX_HOST and PROXMOX_USERNAME environment variables are required');
    }

    if (!config.password && (!config.tokenId || !config.tokenSecret)) {
      throw new Error('Either PROXMOX_PASSWORD or both PROXMOX_TOKEN_ID and PROXMOX_TOKEN_SECRET must be provided');
    }

    this.client = new ProxmoxClient(config);
    this.vmTools = new VMTools(this.client);
    this.containerTools = new ContainerTools(this.client);
    this.nodeTools = new NodeTools(this.client);
    this.storageTools = new StorageTools(this.client);
  }

  /**
   * Setup request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
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
          description: 'Get the status of a specific storage',
          inputSchema: {
            type: 'object',
            properties: {
              node: { type: 'string', description: 'Node name' },
              storage: { type: 'string', description: 'Storage name' },
            },
            required: ['node', 'storage'],
          },
        },
        {
          name: 'list_storage_content',
          description: 'List content in a storage',
          inputSchema: {
            type: 'object',
            properties: {
              node: { type: 'string', description: 'Node name' },
              storage: { type: 'string', description: 'Storage name' },
              content: { type: 'string', description: 'Content type filter' },
            },
            required: ['node', 'storage'],
          },
        },
      ],
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
          result = await this.vmTools!.listVMs();
        } else if (name === 'get_vm_status') {
          result = await this.vmTools!.getVMStatus(args.node as string, args.vmid as number);
        } else if (name === 'start_vm') {
          result = await this.vmTools!.startVM(args.node as string, args.vmid as number);
        } else if (name === 'stop_vm') {
          result = await this.vmTools!.stopVM(args.node as string, args.vmid as number, args.force as boolean);
        } else if (name === 'restart_vm') {
          result = await this.vmTools!.restartVM(args.node as string, args.vmid as number);
        } else if (name === 'create_vm') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result = await this.vmTools!.createVM(args as any);
        } else if (name === 'delete_vm') {
          result = await this.vmTools!.deleteVM(args.node as string, args.vmid as number, args.purge as boolean);
        } else if (name === 'clone_vm') {
          result = await this.vmTools!.cloneVM(
            args.node as string,
            args.vmid as number,
            args.newid as number,
            args.name as string,
            args.full as boolean
          );
        } else if (name === 'get_vm_config') {
          result = await this.vmTools!.getVMConfig(args.node as string, args.vmid as number);
        }
        // Container operations
        else if (name === 'list_containers') {
          result = await this.containerTools!.listContainers();
        } else if (name === 'get_container_status') {
          result = await this.containerTools!.getContainerStatus(args.node as string, args.vmid as number);
        } else if (name === 'start_container') {
          result = await this.containerTools!.startContainer(args.node as string, args.vmid as number);
        } else if (name === 'stop_container') {
          result = await this.containerTools!.stopContainer(args.node as string, args.vmid as number, args.force as boolean);
        } else if (name === 'create_container') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result = await this.containerTools!.createContainer(args as any);
        } else if (name === 'delete_container') {
          result = await this.containerTools!.deleteContainer(args.node as string, args.vmid as number, args.purge as boolean);
        }
        // Node operations
        else if (name === 'list_nodes') {
          result = await this.nodeTools!.listNodes();
        } else if (name === 'get_node_status') {
          result = await this.nodeTools!.getNodeStatus(args.node as string);
        }
        // Storage operations
        else if (name === 'list_storage') {
          result = await this.storageTools!.listStorage();
        } else if (name === 'get_storage_status') {
          result = await this.storageTools!.getStorageStatus(args.node as string, args.storage as string);
        } else if (name === 'list_storage_content') {
          result = await this.storageTools!.listStorageContent(args.node as string, args.storage as string, args.content as string);
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

    // List prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: 'create-vm-wizard',
          description: 'Interactive wizard to create a new virtual machine',
          arguments: [
            {
              name: 'node',
              description: 'Node name',
              required: true,
            },
          ],
        },
        {
          name: 'vm-health-check',
          description: 'Check the health status of all VMs',
        },
        {
          name: 'cluster-overview',
          description: 'Get an overview of the entire Proxmox cluster',
        },
      ],
    }));

    // Get prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'create-vm-wizard') {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `I want to create a new VM on node ${args?.node || '[specify node]'}. Please help me configure it step by step.`,
              },
            },
          ],
        };
      } else if (name === 'vm-health-check') {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: 'Please check the health status of all VMs and report any issues.',
              },
            },
          ],
        };
      } else if (name === 'cluster-overview') {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: 'Please provide a comprehensive overview of the Proxmox cluster including nodes, VMs, containers, and resource usage.',
              },
            },
          ],
        };
      }

      throw new Error(`Unknown prompt: ${name}`);
    });

    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'proxmox://cluster/overview',
          name: 'Cluster Overview',
          description: 'Overview of the entire Proxmox cluster',
          mimeType: 'application/json',
        },
        {
          uri: 'proxmox://audit/logs',
          name: 'Security Audit Logs',
          description: 'Security audit logs for all operations',
          mimeType: 'application/json',
        },
      ],
    }));

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (!this.client) {
        this.initializeClient();
      }

      if (uri === 'proxmox://cluster/overview') {
        const nodes = await this.nodeTools!.listNodes();
        const vms = await this.vmTools!.listVMs();
        const containers = await this.containerTools!.listContainers();

        const overview = {
          nodes: nodes.length,
          vms: vms.length,
          containers: containers.length,
          details: { nodes, vms, containers },
        };

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(overview, null, 2),
            },
          ],
        };
      } else if (uri === 'proxmox://audit/logs') {
        const logs = this.client!.getAuditLogs();

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(logs, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error): void => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async (): Promise<void> => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the server
   */
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
