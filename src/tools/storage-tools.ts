import { ProxmoxClient } from '../client/proxmox-client.js';
import { ProxmoxStorage } from '../types/index.js';
import { NodeNameSchema, StorageNameSchema } from '../types/schemas.js';

/**
 * Storage Management Tools for Proxmox VE
 */
export class StorageTools {
  constructor(private client: ProxmoxClient) {}

  /**
   * List all storage across all nodes
   */
  async listStorage(): Promise<ProxmoxStorage[]> {
    return this.client.get<ProxmoxStorage[]>('/storage');
  }

  /**
   * Get storage status
   */
  async getStorageStatus(node: string, storage: string): Promise<ProxmoxStorage> {
    NodeNameSchema.parse(node);
    StorageNameSchema.parse(storage);

    return this.client.get<ProxmoxStorage>(`/nodes/${node}/storage/${storage}/status`);
  }

  /**
   * List storage content
   */
  async listStorageContent(node: string, storage: string, content?: string): Promise<unknown[]> {
    NodeNameSchema.parse(node);
    StorageNameSchema.parse(storage);

    const query = content ? `?content=${content}` : '';
    return this.client.get<unknown[]>(`/nodes/${node}/storage/${storage}/content${query}`);
  }

  /**
   * Upload ISO to storage
   */
  async uploadISO(node: string, storage: string, _filename: string): Promise<string> {
    NodeNameSchema.parse(node);
    StorageNameSchema.parse(storage);

    // Note: File upload would require multipart/form-data handling
    // This is a placeholder for the interface
    throw new Error('File upload not yet implemented in this version');
  }

  /**
   * Delete storage content
   */
  async deleteStorageContent(node: string, storage: string, volid: string): Promise<string> {
    NodeNameSchema.parse(node);
    StorageNameSchema.parse(storage);

    await this.client.delete(
      `/nodes/${node}/storage/${storage}/content/${encodeURIComponent(volid)}`
    );
    return `Content ${volid} deleted from storage ${storage} successfully`;
  }
}
