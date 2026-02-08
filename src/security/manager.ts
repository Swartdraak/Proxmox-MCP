import { SecurityAuditLog } from '../types/index.js';

/**
 * Security Manager for audit logging and access control
 */
export class SecurityManager {
  private auditLogs: SecurityAuditLog[] = [];
  private maxLogSize = 10000;

  /**
   * Log an access attempt with sanitization to prevent log injection
   */
  logAccess(
    operation: string,
    user: string,
    result: 'success' | 'failure',
    details?: string
  ): void {
    const log: SecurityAuditLog = {
      timestamp: Date.now(),
      operation,
      user,
      resource: operation,
      result,
      details,
    };

    this.auditLogs.push(log);

    // Trim logs if they exceed max size
    if (this.auditLogs.length > this.maxLogSize) {
      this.auditLogs = this.auditLogs.slice(-this.maxLogSize);
    }

    // Also log to console for monitoring with sanitized inputs
    const safeOperation = this.sanitizeInput(operation);
    const safeUser = this.sanitizeInput(user);
    const safeDetails = details ? this.sanitizeInput(details) : undefined;
    const logLevel = result === 'success' ? 'info' : 'warn';
    // eslint-disable-next-line security/detect-object-injection
    console[logLevel](
      `[AUDIT] ${safeOperation} by ${safeUser}: ${result}${safeDetails ? ` - ${safeDetails}` : ''}`
    );
  }

  /**
   * Get audit logs
   */
  getAuditLogs(limit?: number): SecurityAuditLog[] {
    if (limit) {
      return this.auditLogs.slice(-limit);
    }
    return [...this.auditLogs];
  }

  /**
   * Clear audit logs
   */
  clearAuditLogs(): void {
    this.auditLogs = [];
  }

  /**
   * Sanitize input to prevent injection attacks
   */
  sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input.replace(/[^\w\s.-]/g, '');
  }

  /**
   * Validate that an operation is allowed
   */
  validateOperation(operation: string, allowedOperations: string[]): boolean {
    if (allowedOperations.length === 0) {
      return true; // No restrictions
    }
    return allowedOperations.includes(operation);
  }
}
