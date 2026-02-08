import { describe, it, expect, beforeEach } from 'vitest';
import { SecurityManager } from '../../src/security/manager.js';

describe('SecurityManager', () => {
  let manager: SecurityManager;

  beforeEach(() => {
    manager = new SecurityManager();
  });

  describe('logAccess', () => {
    it('should log successful access', () => {
      manager.logAccess('test_operation', 'testuser', 'success');
      const logs = manager.getAuditLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0]?.operation).toBe('test_operation');
      expect(logs[0]?.user).toBe('testuser');
      expect(logs[0]?.result).toBe('success');
    });

    it('should log failed access with details', () => {
      manager.logAccess('test_operation', 'testuser', 'failure', 'Access denied');
      const logs = manager.getAuditLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0]?.result).toBe('failure');
      expect(logs[0]?.details).toBe('Access denied');
    });

    it('should include timestamp in logs', () => {
      const beforeTime = Date.now();
      manager.logAccess('test_operation', 'testuser', 'success');
      const afterTime = Date.now();

      const logs = manager.getAuditLogs();
      expect(logs[0]?.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(logs[0]?.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('getAuditLogs', () => {
    it('should return all logs', () => {
      manager.logAccess('op1', 'user1', 'success');
      manager.logAccess('op2', 'user2', 'failure');

      const logs = manager.getAuditLogs();
      expect(logs).toHaveLength(2);
    });

    it('should return limited logs when specified', () => {
      for (let i = 0; i < 10; i++) {
        manager.logAccess(`op${i}`, 'user', 'success');
      }

      const logs = manager.getAuditLogs(5);
      expect(logs).toHaveLength(5);
    });

    it('should return a copy of logs', () => {
      manager.logAccess('op1', 'user1', 'success');
      const logs1 = manager.getAuditLogs();
      const logs2 = manager.getAuditLogs();

      expect(logs1).not.toBe(logs2);
    });
  });

  describe('clearAuditLogs', () => {
    it('should clear all logs', () => {
      manager.logAccess('op1', 'user1', 'success');
      manager.logAccess('op2', 'user2', 'success');

      manager.clearAuditLogs();
      const logs = manager.getAuditLogs();

      expect(logs).toHaveLength(0);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove special characters', () => {
      const result = manager.sanitizeInput('test<script>alert()</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should preserve alphanumeric and common characters', () => {
      const result = manager.sanitizeInput('test-name_123.txt');
      expect(result).toContain('test');
      expect(result).toContain('name');
      expect(result).toContain('123');
    });
  });

  describe('validateOperation', () => {
    it('should allow any operation when no restrictions', () => {
      expect(manager.validateOperation('any_operation', [])).toBe(true);
    });

    it('should allow operations in allowed list', () => {
      const allowed = ['vm.list', 'vm.start', 'vm.stop'];
      expect(manager.validateOperation('vm.list', allowed)).toBe(true);
      expect(manager.validateOperation('vm.start', allowed)).toBe(true);
    });

    it('should deny operations not in allowed list', () => {
      const allowed = ['vm.list', 'vm.start'];
      expect(manager.validateOperation('vm.delete', allowed)).toBe(false);
    });
  });
});
