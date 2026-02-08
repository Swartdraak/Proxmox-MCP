import { ProxmoxConfig } from '../types/index.js';
import { ProxmoxConfigSchema } from '../types/schemas.js';

/**
 * Configuration loader with environment variable support
 */
export class ConfigLoader {
  /**
   * Load configuration from environment variables
   */
  static loadFromEnv(): ProxmoxConfig {
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

    return ProxmoxConfigSchema.parse(config);
  }

  /**
   * Load configuration from object
   */
  static load(config: ProxmoxConfig): ProxmoxConfig {
    return ProxmoxConfigSchema.parse(config);
  }

  /**
   * Validate configuration
   */
  static validate(config: ProxmoxConfig): boolean {
    try {
      ProxmoxConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }
}
