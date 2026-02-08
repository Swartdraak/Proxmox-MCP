import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import https from 'https';
import { ProxmoxConfig } from '../types/index.js';
import { ProxmoxConfigSchema } from '../types/schemas.js';
import { SecurityManager } from '../security/manager.js';
import { RateLimiter } from '../security/rate-limiter.js';

/**
 * Secure Proxmox API Client with authentication, rate limiting, and security features
 */
export class ProxmoxClient {
  private client: AxiosInstance;
  private config: ProxmoxConfig;
  private ticket?: string;
  private csrfToken?: string;
  private securityManager: SecurityManager;
  private rateLimiter: RateLimiter;
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor(config: ProxmoxConfig) {
    // Validate configuration
    const validatedConfig = ProxmoxConfigSchema.parse(config);
    this.config = validatedConfig;

    // Initialize security components
    this.securityManager = new SecurityManager();
    this.rateLimiter = new RateLimiter({ maxRequests: 100, windowMs: 60000 });

    // Create axios instance with security settings
    const httpsAgent = new https.Agent({
      rejectUnauthorized: this.config.verifySSL ?? true,
      minVersion: 'TLSv1.2',
    });

    this.client = axios.create({
      baseURL: `https://${this.config.host}:${this.config.port ?? 8006}/api2/json`,
      timeout: this.config.timeout ?? 30000,
      httpsAgent,
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.ticket && this.csrfToken) {
          config.headers['Cookie'] = `PVEAuthCookie=${this.ticket}`;
          config.headers['CSRFPreventionToken'] = this.csrfToken;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Authenticate with Proxmox VE using form-encoded credentials
   */
  async authenticate(): Promise<void> {
    try {
      // Check rate limit
      if (!this.rateLimiter.tryAcquire()) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (this.config.tokenId && this.config.tokenSecret) {
        // API token authentication
        const tokenHeader = `PVEAPIToken=${this.config.username}@${this.config.realm ?? 'pam'}!${this.config.tokenId}=${this.config.tokenSecret}`;
        this.client.defaults.headers.common['Authorization'] = tokenHeader;
        
        // Log successful authentication
        this.securityManager.logAccess('authenticate', 'api_token', 'success');
        return;
      }

      if (!this.config.password) {
        throw new Error('Invalid authentication configuration');
      }

      // Password authentication with form encoding
      const formData = new URLSearchParams();
      formData.append('username', `${this.config.username}@${this.config.realm ?? 'pam'}`);
      formData.append('password', this.config.password);

      const response = await this.client.post('/access/ticket', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data?.data?.ticket && response.data?.data?.CSRFPreventionToken) {
        this.ticket = response.data.data.ticket;
        this.csrfToken = response.data.data.CSRFPreventionToken;
        this.retryCount = 0; // Reset retry count on successful auth
        
        // Log successful authentication
        this.securityManager.logAccess('authenticate', this.config.username, 'success');
      } else {
        throw new Error('Invalid authentication response');
      }
    } catch (error) {
      this.securityManager.logAccess('authenticate', this.config.username, 'failure', 
        error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make a secure API request with rate limiting and bounded retry
   */
  async request<T>(
    method: string,
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    // Check rate limit
    if (!this.rateLimiter.tryAcquire()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Ensure authenticated
    if (!this.ticket && !this.client.defaults.headers.common['Authorization']) {
      await this.authenticate();
    }

    try {
      const response = await this.client.request({
        method,
        url: path,
        data,
        ...config,
      });

      // Log successful request
      this.securityManager.logAccess(path, this.config.username, 'success');
      
      // Reset retry count on successful request
      this.retryCount = 0;

      return response.data?.data as T;
    } catch (error) {
      // Log failed request
      this.securityManager.logAccess(path, this.config.username, 'failure',
        error instanceof Error ? error.message : 'Unknown error');

      // Handle authentication expiration with retry limit
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (this.retryCount >= this.maxRetries) {
          throw new Error(`Authentication failed after ${this.maxRetries} retries. Please check credentials.`);
        }
        
        this.retryCount++;
        this.ticket = undefined;
        this.csrfToken = undefined;
        
        // Wait briefly before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
        
        await this.authenticate();
        return this.request(method, path, data, config);
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', path, undefined, config);
  }

  /**
   * POST request
   */
  async post<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('POST', path, data, config);
  }

  /**
   * PUT request
   */
  async put<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PUT', path, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', path, undefined, config);
  }

  /**
   * Get security audit logs
   */
  getAuditLogs(): Array<{ timestamp: number; operation: string; user: string; resource: string; result: 'success' | 'failure'; details?: string }> {
    return this.securityManager.getAuditLogs();
  }
}
