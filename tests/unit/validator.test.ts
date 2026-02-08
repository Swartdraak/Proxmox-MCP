import { describe, it, expect } from 'vitest';
import { InputValidator } from '../../src/security/validator.js';

describe('InputValidator', () => {
  describe('validateVMID', () => {
    it('should accept valid VMIDs', () => {
      expect(InputValidator.validateVMID(100)).toBe(true);
      expect(InputValidator.validateVMID(999)).toBe(true);
      expect(InputValidator.validateVMID(100000)).toBe(true);
    });

    it('should reject invalid VMIDs', () => {
      expect(InputValidator.validateVMID(99)).toBe(false);
      expect(InputValidator.validateVMID(0)).toBe(false);
      expect(InputValidator.validateVMID(-1)).toBe(false);
      expect(InputValidator.validateVMID(1000000000)).toBe(false);
    });

    it('should reject non-integer VMIDs', () => {
      expect(InputValidator.validateVMID(100.5)).toBe(false);
    });
  });

  describe('validateNodeName', () => {
    it('should accept valid node names', () => {
      expect(InputValidator.validateNodeName('pve')).toBe(true);
      expect(InputValidator.validateNodeName('pve-1')).toBe(true);
      expect(InputValidator.validateNodeName('node01')).toBe(true);
    });

    it('should reject invalid node names', () => {
      expect(InputValidator.validateNodeName('')).toBe(false);
      expect(InputValidator.validateNodeName('pve_1')).toBe(false);
      expect(InputValidator.validateNodeName('pve.local')).toBe(false);
      expect(InputValidator.validateNodeName('a'.repeat(64))).toBe(false);
    });
  });

  describe('validateHostname', () => {
    it('should accept valid hostnames', () => {
      expect(InputValidator.validateHostname('myvm')).toBe(true);
      expect(InputValidator.validateHostname('web-server-01')).toBe(true);
    });

    it('should reject invalid hostnames', () => {
      expect(InputValidator.validateHostname('')).toBe(false);
      expect(InputValidator.validateHostname('my_vm')).toBe(false);
      expect(InputValidator.validateHostname('my.vm')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove control characters', () => {
      expect(InputValidator.sanitizeString('hello\x00world')).toBe('helloworld');
      expect(InputValidator.sanitizeString('test\x1Fstring')).toBe('teststring');
    });

    it('should preserve valid characters', () => {
      expect(InputValidator.sanitizeString('hello world')).toBe('hello world');
      expect(InputValidator.sanitizeString('test-123')).toBe('test-123');
    });
  });

  describe('validateIPAddress', () => {
    it('should accept valid IPv4 addresses', () => {
      expect(InputValidator.validateIPAddress('192.168.1.1')).toBe(true);
      expect(InputValidator.validateIPAddress('10.0.0.1')).toBe(true);
    });

    it('should reject invalid IP addresses', () => {
      expect(InputValidator.validateIPAddress('256.1.1.1')).toBe(false);
      expect(InputValidator.validateIPAddress('not-an-ip')).toBe(false);
    });
  });

  describe('validatePort', () => {
    it('should accept valid ports', () => {
      expect(InputValidator.validatePort(80)).toBe(true);
      expect(InputValidator.validatePort(8006)).toBe(true);
      expect(InputValidator.validatePort(65535)).toBe(true);
    });

    it('should reject invalid ports', () => {
      expect(InputValidator.validatePort(0)).toBe(false);
      expect(InputValidator.validatePort(65536)).toBe(false);
      expect(InputValidator.validatePort(-1)).toBe(false);
    });
  });

  describe('validateMemory', () => {
    it('should accept valid memory sizes', () => {
      expect(InputValidator.validateMemory(512)).toBe(true);
      expect(InputValidator.validateMemory(2048)).toBe(true);
    });

    it('should reject invalid memory sizes', () => {
      expect(InputValidator.validateMemory(8)).toBe(false);
      expect(InputValidator.validateMemory(10000000)).toBe(false);
    });
  });

  describe('validateCores', () => {
    it('should accept valid core counts', () => {
      expect(InputValidator.validateCores(1)).toBe(true);
      expect(InputValidator.validateCores(4)).toBe(true);
      expect(InputValidator.validateCores(128)).toBe(true);
    });

    it('should reject invalid core counts', () => {
      expect(InputValidator.validateCores(0)).toBe(false);
      expect(InputValidator.validateCores(129)).toBe(false);
    });
  });
});
