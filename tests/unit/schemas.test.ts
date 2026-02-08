import { describe, it, expect } from 'vitest';
import {
  ProxmoxConfigSchema,
  VMCreateParamsSchema,
  ContainerCreateParamsSchema,
  VMIDSchema,
  NodeNameSchema,
} from '../../src/types/schemas.js';

describe('Schema Validation', () => {
  describe('ProxmoxConfigSchema', () => {
    it('should validate valid password-based config', () => {
      const config = {
        host: 'proxmox.example.com',
        port: 8006,
        username: 'root',
        password: 'secret123',
        realm: 'pam',
      };

      expect(() => ProxmoxConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate valid token-based config', () => {
      const config = {
        host: 'proxmox.example.com',
        username: 'root',
        tokenId: 'test-token',
        tokenSecret: 'secret',
      };

      expect(() => ProxmoxConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject config without credentials', () => {
      const config = {
        host: 'proxmox.example.com',
        username: 'root',
      };

      expect(() => ProxmoxConfigSchema.parse(config)).toThrow();
    });

    it('should reject invalid host', () => {
      const config = {
        host: 'invalid_host!',
        username: 'root',
        password: 'secret',
      };

      expect(() => ProxmoxConfigSchema.parse(config)).toThrow();
    });

    it('should apply default values', () => {
      const config = {
        host: 'proxmox.example.com',
        username: 'root',
        password: 'secret',
      };

      const result = ProxmoxConfigSchema.parse(config);
      expect(result.port).toBe(8006);
      expect(result.realm).toBe('pam');
      expect(result.verifySSL).toBe(true);
    });
  });

  describe('VMCreateParamsSchema', () => {
    it('should validate valid VM params', () => {
      const params = {
        node: 'pve',
        vmid: 100,
        name: 'test-vm',
        cores: 2,
        memory: 2048,
      };

      expect(() => VMCreateParamsSchema.parse(params)).not.toThrow();
    });

    it('should reject invalid VMID', () => {
      const params = {
        node: 'pve',
        vmid: 50,
        name: 'test-vm',
      };

      expect(() => VMCreateParamsSchema.parse(params)).toThrow();
    });

    it('should reject invalid VM name', () => {
      const params = {
        node: 'pve',
        vmid: 100,
        name: 'test_vm!',
      };

      expect(() => VMCreateParamsSchema.parse(params)).toThrow();
    });

    it('should apply default values', () => {
      const params = {
        node: 'pve',
        vmid: 100,
      };

      const result = VMCreateParamsSchema.parse(params);
      expect(result.cores).toBe(1);
      expect(result.memory).toBe(512);
      expect(result.storage).toBe('local-lvm');
    });
  });

  describe('ContainerCreateParamsSchema', () => {
    it('should validate valid container params', () => {
      const params = {
        node: 'pve',
        vmid: 100,
        hostname: 'test-ct',
        ostemplate: 'local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst',
      };

      expect(() => ContainerCreateParamsSchema.parse(params)).not.toThrow();
    });

    it('should require ostemplate', () => {
      const params = {
        node: 'pve',
        vmid: 100,
      };

      expect(() => ContainerCreateParamsSchema.parse(params)).toThrow();
    });
  });

  describe('VMIDSchema', () => {
    it('should accept valid VMIDs', () => {
      expect(() => VMIDSchema.parse(100)).not.toThrow();
      expect(() => VMIDSchema.parse(999999)).not.toThrow();
    });

    it('should reject invalid VMIDs', () => {
      expect(() => VMIDSchema.parse(99)).toThrow();
      expect(() => VMIDSchema.parse(1000000000)).toThrow();
    });
  });

  describe('NodeNameSchema', () => {
    it('should accept valid node names', () => {
      expect(() => NodeNameSchema.parse('pve')).not.toThrow();
      expect(() => NodeNameSchema.parse('pve-01')).not.toThrow();
    });

    it('should reject invalid node names', () => {
      expect(() => NodeNameSchema.parse('pve_01')).toThrow();
      expect(() => NodeNameSchema.parse('a'.repeat(64))).toThrow();
    });
  });
});
