import { ProxmoxClient } from '../client/proxmox-client.js';
import { ProxmoxNode } from '../types/index.js';
import { NodeNameSchema } from '../types/schemas.js';

/**
 * Node Management Tools for Proxmox VE
 */
export class NodeTools {
  constructor(private client: ProxmoxClient) {}

  /**
   * List all nodes in the cluster
   */
  async listNodes(): Promise<ProxmoxNode[]> {
    return this.client.get<ProxmoxNode[]>('/nodes');
  }

  /**
   * Get node status
   */
  async getNodeStatus(node: string): Promise<ProxmoxNode> {
    NodeNameSchema.parse(node);
    return this.client.get<ProxmoxNode>(`/nodes/${node}/status`);
  }

  /**
   * Get node version information
   */
  async getNodeVersion(node: string): Promise<Record<string, unknown>> {
    NodeNameSchema.parse(node);
    return this.client.get<Record<string, unknown>>(`/nodes/${node}/version`);
  }

  /**
   * Get node network configuration
   */
  async getNodeNetwork(node: string): Promise<unknown[]> {
    NodeNameSchema.parse(node);
    return this.client.get<unknown[]>(`/nodes/${node}/network`);
  }

  /**
   * Get node services
   */
  async getNodeServices(node: string): Promise<unknown[]> {
    NodeNameSchema.parse(node);
    return this.client.get<unknown[]>(`/nodes/${node}/services`);
  }

  /**
   * Get node subscription information
   */
  async getNodeSubscription(node: string): Promise<Record<string, unknown>> {
    NodeNameSchema.parse(node);
    return this.client.get<Record<string, unknown>>(`/nodes/${node}/subscription`);
  }

  /**
   * Get node tasks
   */
  async getNodeTasks(node: string, limit = 50): Promise<unknown[]> {
    NodeNameSchema.parse(node);
    return this.client.get<unknown[]>(`/nodes/${node}/tasks?limit=${limit}`);
  }

  /**
   * Reboot a node
   */
  async rebootNode(node: string): Promise<string> {
    NodeNameSchema.parse(node);
    await this.client.post(`/nodes/${node}/status`, { command: 'reboot' });
    return `Node ${node} reboot initiated successfully`;
  }

  /**
   * Shutdown a node
   */
  async shutdownNode(node: string): Promise<string> {
    NodeNameSchema.parse(node);
    await this.client.post(`/nodes/${node}/status`, { command: 'shutdown' });
    return `Node ${node} shutdown initiated successfully`;
  }
}
