import { z } from 'zod';

/**
 * Configuration schema with comprehensive validation
 */
export const ProxmoxConfigSchema = z.object({
  host: z.string().min(1, 'Host is required').regex(/^[a-zA-Z0-9.-]+$/, 'Invalid host format'),
  port: z.number().int().min(1).max(65535).default(8006),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(),
  tokenId: z.string().optional(),
  tokenSecret: z.string().optional(),
  realm: z.string().default('pam'),
  verifySSL: z.boolean().default(true),
  timeout: z.number().int().min(1000).max(60000).default(30000),
}).refine(
  (data) => data.password || (data.tokenId && data.tokenSecret),
  {
    message: 'Either password or both tokenId and tokenSecret must be provided',
  }
);

/**
 * VM creation parameters schema
 */
export const VMCreateParamsSchema = z.object({
  node: z.string().min(1),
  vmid: z.number().int().min(100).max(999999999),
  name: z.string().min(1).max(63).regex(/^[a-zA-Z0-9-]+$/).optional(),
  cores: z.number().int().min(1).max(128).default(1),
  memory: z.number().int().min(16).max(8388608).default(512),
  disk: z.string().optional(),
  ostype: z.enum(['l26', 'l24', 'win10', 'win11', 'other']).default('l26'),
  iso: z.string().optional(),
  net0: z.string().optional(),
  storage: z.string().default('local-lvm'),
});

/**
 * Container creation parameters schema
 */
export const ContainerCreateParamsSchema = z.object({
  node: z.string().min(1),
  vmid: z.number().int().min(100).max(999999999),
  hostname: z.string().min(1).max(63).regex(/^[a-zA-Z0-9-]+$/).optional(),
  cores: z.number().int().min(1).max(128).default(1),
  memory: z.number().int().min(16).max(8388608).default(512),
  rootfs: z.string().optional(),
  ostemplate: z.string().min(1),
  password: z.string().min(5).optional(),
  net0: z.string().optional(),
  storage: z.string().default('local-lvm'),
});

/**
 * VMID validation schema
 */
export const VMIDSchema = z.number().int().min(100).max(999999999);

/**
 * Node name validation schema
 */
export const NodeNameSchema = z.string().min(1).max(63).regex(/^[a-zA-Z0-9-]+$/);

/**
 * Storage name validation schema
 */
export const StorageNameSchema = z.string().min(1).max(100);

/**
 * Operation type validation
 */
export const OperationTypeSchema = z.enum([
  'vm.list',
  'vm.create',
  'vm.start',
  'vm.stop',
  'vm.delete',
  'vm.clone',
  'vm.status',
  'container.list',
  'container.create',
  'container.start',
  'container.stop',
  'container.delete',
  'node.list',
  'node.status',
  'storage.list',
  'storage.status',
  'backup.list',
  'backup.create',
  'backup.restore',
]);

/**
 * Safety control schema
 */
export const SafetyControlSchema = z.object({
  requireConfirmation: z.boolean().default(true),
  allowedOperations: z.array(OperationTypeSchema).default([]),
  deniedOperations: z.array(OperationTypeSchema).default([]),
  dryRun: z.boolean().default(false),
});

export type ValidatedProxmoxConfig = z.infer<typeof ProxmoxConfigSchema>;
export type ValidatedVMCreateParams = z.infer<typeof VMCreateParamsSchema>;
export type ValidatedContainerCreateParams = z.infer<typeof ContainerCreateParamsSchema>;
export type ValidatedSafetyControl = z.infer<typeof SafetyControlSchema>;
