/**
 * Input validator to prevent injection attacks and ensure data integrity
 */
export class InputValidator {
  /**
   * Validate VMID format
   */
  static validateVMID(vmid: number): boolean {
    return Number.isInteger(vmid) && vmid >= 100 && vmid <= 999999999;
  }

  /**
   * Validate node name format
   */
  static validateNodeName(name: string): boolean {
    return /^[a-zA-Z0-9-]+$/.test(name) && name.length >= 1 && name.length <= 63;
  }

  /**
   * Validate hostname format
   */
  static validateHostname(hostname: string): boolean {
    return /^[a-zA-Z0-9-]+$/.test(hostname) && hostname.length >= 1 && hostname.length <= 63;
  }

  /**
   * Validate storage name format
   */
  static validateStorageName(name: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(name) && name.length >= 1 && name.length <= 100;
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    // Remove null bytes and control characters
    // eslint-disable-next-line no-control-regex
    return input.replace(/[\x00-\x1F\x7F]/g, '');
  }

  /**
   * Validate IP address format
   */
  static validateIPAddress(ip: string): boolean {
    // IPv4 validation with proper range checking
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipv4Match = ip.match(ipv4Regex);
    if (ipv4Match) {
      const octets = ipv4Match.slice(1).map(Number);
      return octets.every((octet) => octet >= 0 && octet <= 255);
    }
    
    // IPv6 validation (basic) - intentionally simple for security
    // eslint-disable-next-line security/detect-unsafe-regex
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
    return ipv6Regex.test(ip);
  }

  /**
   * Validate port number
   */
  static validatePort(port: number): boolean {
    return Number.isInteger(port) && port >= 1 && port <= 65535;
  }

  /**
   * Validate memory size (in MB)
   */
  static validateMemory(memory: number): boolean {
    return Number.isInteger(memory) && memory >= 16 && memory <= 8388608;
  }

  /**
   * Validate CPU cores
   */
  static validateCores(cores: number): boolean {
    return Number.isInteger(cores) && cores >= 1 && cores <= 128;
  }
}
