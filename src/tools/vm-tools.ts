import { ProxmoxClient } from '../client/proxmox-client.js';
import { ProxmoxVM } from '../types/index.js';
import { VMIDSchema, NodeNameSchema, VMCreateParamsSchema } from '../types/schemas.js';
import { InputValidator } from '../security/validator.js';

/**
 * VM Management Tools for Proxmox VE
 */
export class VMTools {
  constructor(private client: ProxmoxClient) {}

  /**
   * List all VMs across all nodes
   */
  async listVMs(): Promise<ProxmoxVM[]> {
    const nodes = await this.client.get<Array<{ node: string }>>('/nodes');
    const allVMs: ProxmoxVM[] = [];

    for (const node of nodes) {
      try {
        const vms = await this.client.get<ProxmoxVM[]>(`/nodes/${node.node}/qemu`);
        allVMs.push(...vms.map((vm) => ({ ...vm, node: node.node })));
      } catch (error) {
        console.warn(`Failed to list VMs for node ${node.node}:`, error);
      }
    }

    return allVMs;
  }

  /**
   * Get VM status
   */
  async getVMStatus(node: string, vmid: number): Promise<ProxmoxVM> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    return this.client.get<ProxmoxVM>(`/nodes/${node}/qemu/${vmid}/status/current`);
  }

  /**
   * Start a VM
   */
  async startVM(node: string, vmid: number): Promise<string> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    await this.client.post(`/nodes/${node}/qemu/${vmid}/status/start`);
    return `VM ${vmid} on node ${node} started successfully`;
  }

  /**
   * Stop a VM
   */
  async stopVM(node: string, vmid: number, force = false): Promise<string> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    const action = force ? 'stop' : 'shutdown';
    await this.client.post(`/nodes/${node}/qemu/${vmid}/status/${action}`);
    return `VM ${vmid} on node ${node} ${force ? 'stopped' : 'shutdown initiated'} successfully`;
  }

  /**
   * Restart a VM
   */
  async restartVM(node: string, vmid: number): Promise<string> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    await this.client.post(`/nodes/${node}/qemu/${vmid}/status/reboot`);
    return `VM ${vmid} on node ${node} restarted successfully`;
  }

  /**
   * Create a new VM
   */
  async createVM(params: {
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
  }): Promise<string> {
    const validated = VMCreateParamsSchema.parse(params);

    const vmData: Record<string, unknown> = {
      vmid: validated.vmid,
      cores: validated.cores,
      memory: validated.memory,
      ostype: validated.ostype,
    };

    if (validated.name) {
      vmData.name = InputValidator.sanitizeString(validated.name);
    }
    if (validated.disk) {
      vmData.scsi0 = validated.disk;
    }
    if (validated.iso) {
      vmData.cdrom = validated.iso;
    }
    if (validated.net0) {
      vmData.net0 = validated.net0;
    }

    await this.client.post(`/nodes/${validated.node}/qemu`, vmData);
    return `VM ${validated.vmid} created successfully on node ${validated.node}`;
  }

  /**
   * Delete a VM
   */
  async deleteVM(node: string, vmid: number, purge = false): Promise<string> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    await this.client.delete(`/nodes/${node}/qemu/${vmid}${purge ? '?purge=1' : ''}`);
    return `VM ${vmid} on node ${node} deleted successfully`;
  }

  /**
   * Clone a VM
   */
  async cloneVM(
    node: string,
    vmid: number,
    newid: number,
    name?: string,
    full = false
  ): Promise<string> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);
    VMIDSchema.parse(newid);

    const cloneData: Record<string, unknown> = {
      newid,
      full: full ? 1 : 0,
    };

    if (name) {
      cloneData.name = InputValidator.sanitizeString(name);
    }

    await this.client.post(`/nodes/${node}/qemu/${vmid}/clone`, cloneData);
    return `VM ${vmid} cloned to ${newid} on node ${node} successfully`;
  }

  /**
   * Get VM configuration
   */
  async getVMConfig(node: string, vmid: number): Promise<Record<string, unknown>> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    return this.client.get<Record<string, unknown>>(`/nodes/${node}/qemu/${vmid}/config`);
  }

  /**
   * Update VM configuration
   */
  async updateVMConfig(
    node: string,
    vmid: number,
    config: Record<string, unknown>
  ): Promise<string> {
    NodeNameSchema.parse(node);
    VMIDSchema.parse(vmid);

    await this.client.put(`/nodes/${node}/qemu/${vmid}/config`, config);
    return `VM ${vmid} configuration updated successfully`;
  }
}
