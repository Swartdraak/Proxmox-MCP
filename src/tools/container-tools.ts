import { ProxmoxClient } from '../client/proxmox-client.js';
import { ProxmoxContainer } from '../types/index.js';
import { VMIDSchema, NodeNameSchema, ContainerCreateParamsSchema } from '../types/schemas.js';
import { InputValidator } from '../security/validator.js';

/**
 * Container (LXC) Management Tools for Proxmox VE
 */
export class ContainerTools {
  constructor(private client: ProxmoxClient) {}

  /**
   * List all containers across all nodes
   */
  async listContainers(): Promise<ProxmoxContainer[]> {
    const nodes = await this.client.get<Array<{ node: string }>>('/nodes');
    const allContainers: ProxmoxContainer[] = [];

    for (const node of nodes) {
      try {
        const containers = await this.client.get<ProxmoxContainer[]>(`/nodes/${node.node}/lxc`);
        allContainers.push(...containers.map((ct) => ({ ...ct, node: node.node })));
      } catch (error) {
        console.warn(`Failed to list containers for node ${node.node}:`, error);
      }
    }

    return allContainers;
  }

  /**
   * Get container status
   */
  async getContainerStatus(node: string, vmid: number): Promise<ProxmoxContainer> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    return this.client.get<ProxmoxContainer>(`/nodes/${node}/lxc/${vmid}/status/current`);
  }

  /**
   * Start a container
   */
  async startContainer(node: string, vmid: number): Promise<string> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    await this.client.post(`/nodes/${node}/lxc/${vmid}/status/start`);
    return `Container ${vmid} on node ${node} started successfully`;
  }

  /**
   * Stop a container
   */
  async stopContainer(node: string, vmid: number, force = false): Promise<string> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    const action = force ? 'stop' : 'shutdown';
    await this.client.post(`/nodes/${node}/lxc/${vmid}/status/${action}`);
    return `Container ${vmid} on node ${node} ${force ? 'stopped' : 'shutdown initiated'} successfully`;
  }

  /**
   * Restart a container
   */
  async restartContainer(node: string, vmid: number): Promise<string> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    await this.client.post(`/nodes/${node}/lxc/${vmid}/status/reboot`);
    return `Container ${vmid} on node ${node} restarted successfully`;
  }

  /**
   * Create a new container
   */
  async createContainer(params: {
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
  }): Promise<string> {
    const validated = ContainerCreateParamsSchema.parse(params);

    const ctData: Record<string, unknown> = {
      vmid: validated.vmid,
      cores: validated.cores,
      memory: validated.memory,
      ostemplate: validated.ostemplate,
      storage: validated.storage,
    };

    if (validated.hostname) {
      ctData.hostname = InputValidator.sanitizeString(validated.hostname);
    }
    if (validated.rootfs) {
      ctData.rootfs = validated.rootfs;
    }
    if (validated.password) {
      ctData.password = validated.password;
    }
    if (validated.net0) {
      ctData.net0 = validated.net0;
    }

    await this.client.post(`/nodes/${validated.node}/lxc`, ctData);
    return `Container ${validated.vmid} created successfully on node ${validated.node}`;
  }

  /**
   * Delete a container
   */
  async deleteContainer(node: string, vmid: number, purge = false): Promise<string> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    await this.client.delete(`/nodes/${node}/lxc/${vmid}${purge ? '?purge=1' : ''}`);
    return `Container ${vmid} on node ${node} deleted successfully`;
  }

  /**
   * Clone a container
   */
  async cloneContainer(
    node: string,
    vmid: number,
    newid: number,
    hostname?: string,
    full = false
  ): Promise<string> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);
    VMIDSchema.parse(newid);

    const cloneData: Record<string, unknown> = {
      newid,
      full: full ? 1 : 0,
    };

    if (hostname) {
      cloneData.hostname = InputValidator.sanitizeString(hostname);
    }

    await this.client.post(`/nodes/${node}/lxc/${vmid}/clone`, cloneData);
    return `Container ${vmid} cloned to ${newid} on node ${node} successfully`;
  }

  /**
   * Get container configuration
   */
  async getContainerConfig(node: string, vmid: number): Promise<Record<string, unknown>> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    return this.client.get<Record<string, unknown>>(`/nodes/${node}/lxc/${vmid}/config`);
  }

  /**
   * Update container configuration
   */
  async updateContainerConfig(
    node: string,
    vmid: number,
    config: Record<string, unknown>
  ): Promise<string> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    await this.client.put(`/nodes/${node}/lxc/${vmid}/config`, config);
    return `Container ${vmid} configuration updated successfully`;
  }
}
