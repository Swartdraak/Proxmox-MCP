// MCP regression suite for issue #31: server behavior over a real stdio
// transport (no live Proxmox needed).
//
// Covers the issue's minimum acceptance criteria:
//   1. config validation — env-var driven Proxmox host/port/credentials;
//      missing/invalid values rejected as documented;
//   2. MCP `initialize` handshake over stdio (protocolVersion 2024-11-05,
//      serverInfo.name `proxmox-mcp-server`);
//   3. tool listing/registration for the shipped Proxmox tools.
//
// Run: node --test tests/  (the package.json `test` script runs exactly that).
// The stdio tests spawn the BUILT server (dist/index.js), so `npm run build`
// must have run first (npm ci's prepare script does this automatically).
//
// Observed server behavior (verified 2026-09-26 against main @ 3b23d50):
// - The server boots without any PROXMOX_* env vars; config validation is
//   deferred to the first tools/call (documented in .onyx/project.yaml).
// - A tools/call whose client init throws (config validation failure) is
//   reported as a JSON-RPC error (code -32603) with the underlying message —
//   the MCP Server wrapper converts rejected request handlers into error
//   responses.
// - A tools/call with valid config reaches the tool dispatch; dispatch errors
//   are returned as MCP content with isError=true (the tool handler's
//   try/catch), and tool invocations may take up to ~30s (axios default
//   timeout) before failing against an unreachable host.
// Tests assert the actual observed shapes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// The 19 tools the server ships (src/index.ts getToolList).
const EXPECTED_TOOLS = [
  'list_vms',
  'get_vm_status',
  'start_vm',
  'stop_vm',
  'restart_vm',
  'create_vm',
  'delete_vm',
  'clone_vm',
  'get_vm_config',
  'list_containers',
  'get_container_status',
  'start_container',
  'stop_container',
  'create_container',
  'delete_container',
  'list_nodes',
  'get_node_status',
  'list_storage',
  'get_storage_status',
];

// A minimal MCP client over the server's stdio transport. The SDK's Server is
// a JSON-RPC 2.0 implementation over newline-delimited JSON, so a small
// request/reply dispatcher is sufficient and keeps the test dependency-free.
class StdioMcpClient {
  constructor(env = {}) {
    this.child = spawn(process.execPath, [join(repoRoot, 'dist', 'index.js')], {
      cwd: repoRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
    });
    this.pending = new Map();
    this.nextId = 1;
    this.stderr = '';
    this._buffer = '';
    this.child.stdout.on('data', (d) => this._onData(d.toString()));
    this.child.stderr.on('data', (d) => { this.stderr += d.toString(); });
    this.exitPromise = new Promise((resolve) => this.child.once('exit', resolve));
  }

  _onData(chunk) {
    this._buffer += chunk;
    let idx;
    while ((idx = this._buffer.indexOf('\n')) >= 0) {
      const line = this._buffer.slice(0, idx).trim();
      this._buffer = this._buffer.slice(idx + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { continue; }
      if (msg.id !== undefined && this.pending.has(msg.id)) {
        const { resolve, timer } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        clearTimeout(timer);
        resolve(msg);
      }
    }
  }

  request(method, params, timeoutMs = 30000) {
    const id = this.nextId++;
    this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timed out waiting for response to ${method} (stderr: ${this.stderr})`));
        }
      }, timeoutMs);
      this.pending.set(id, { resolve, timer });
    });
  }

  notify(method, params) {
    this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
  }

  async close() {
    try { this.child.kill('SIGTERM'); } catch { /* already gone */ }
    await this.exitPromise;
  }
}

// ---------------------------------------------------------------------------
// 1. Config validation
// ---------------------------------------------------------------------------

test('config validation: missing host/username rejected with documented error', async () => {
  const client = new StdioMcpClient({
    PROXMOX_HOST: '',
    PROXMOX_PORT: '8006',
    PROXMOX_USERNAME: '',
    PROXMOX_PASSWORD: '',
    PROXMOX_REALM: 'pam',
  });
  try {
    const res = await client.request('tools/call', { name: 'list_vms', arguments: {} });
    // Config validation is deferred to the first tool call (documented in
    // .onyx/project.yaml): the server boots clean, the call is rejected with
    // the documented message. The SDK Server wrapper reports rejected request
    // handlers as a JSON-RPC error with the underlying message.
    assert.ok(res.error, 'expected a JSON-RPC error for invalid config');
    assert.match(res.error.message, /PROXMOX_HOST and PROXMOX_USERNAME environment variables are required/);
  } finally {
    await client.close();
  }
});

test('config validation: no password and no complete API-token pair is rejected', async () => {
  const client = new StdioMcpClient({
    PROXMOX_HOST: 'synthetic-host.invalid',
    PROXMOX_PORT: '8006',
    PROXMOX_USERNAME: 'synthetic-user',
    PROXMOX_PASSWORD: '',
    PROXMOX_TOKEN_ID: '',
    PROXMOX_TOKEN_SECRET: '',
    PROXMOX_REALM: 'pam',
  });
  try {
    const res = await client.request('tools/call', { name: 'list_vms', arguments: {} });
    assert.ok(res.error, 'expected a JSON-RPC error for incomplete auth config');
    assert.match(res.error.message, /Either PROXMOX_PASSWORD or both PROXMOX_TOKEN_ID and PROXMOX_TOKEN_SECRET must be provided/);
  } finally {
    await client.close();
  }
});

test('config validation: valid credentials pass validation (failure only at the network layer)', async () => {
  // With a syntactically complete config the documented validation errors must
  // NOT appear: the failure happens at the network layer against the synthetic
  // (unresolvable) host, i.e. config validation itself succeeded.
  const client = new StdioMcpClient({
    PROXMOX_HOST: 'config-validation-test.invalid',
    PROXMOX_PORT: '8006',
    PROXMOX_USERNAME: 'synthetic-user',
    PROXMOX_PASSWORD: 'synthetic-password',
    PROXMOX_REALM: 'pam',
  });
  try {
    // Tool invocations may take up to ~30s (axios default timeout) against an
    // unreachable host; allow 45s.
    const res = await client.request('tools/call', { name: 'list_vms', arguments: {} }, 45000);
    const text = res.result && res.result.content && res.result.content[0].text;
    assert.ok(text, 'expected tool-level content, got: ' + JSON.stringify(res));
    assert.equal(res.result.isError, true, 'expected isError=true for a network failure');
    assert.ok(
      !/PROXMOX_HOST and PROXMOX_USERNAME|Either PROXMOX_PASSWORD or both/.test(text),
      'a config-validation error leaked into the result: ' + text
    );
    assert.match(text, /Authentication failed|API request failed/, 'expected a network-layer failure text');
  } finally {
    await client.close();
  }
});

// ---------------------------------------------------------------------------
// 2. MCP initialize handshake over stdio
// ---------------------------------------------------------------------------

test('MCP initialize handshake: protocolVersion 2024-11-05 + serverInfo proxmox-mcp-server', async () => {
  const client = new StdioMcpClient({});
  try {
    const res = await client.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'issue-31-test', version: '1.0.0' },
    });
    assert.equal(res.error, undefined, 'initialize errored: ' + JSON.stringify(res.error));
    assert.equal(res.result.protocolVersion, '2024-11-05');
    assert.equal(res.result.serverInfo.name, 'proxmox-mcp-server');
    assert.ok(res.result.serverInfo.version, 'serverInfo.version missing');
    assert.ok(res.result.capabilities.tools, 'tools capability not advertised');
    client.notify('notifications/initialized', {});
  } finally {
    await client.close();
  }
});

// ---------------------------------------------------------------------------
// 3. Tool listing / registration
// ---------------------------------------------------------------------------

test('tools/list returns exactly the 19 shipped Proxmox tools with valid schemas', async () => {
  const client = new StdioMcpClient({});
  try {
    await client.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'issue-31-test', version: '1.0.0' },
    });
    client.notify('notifications/initialized', {});
    const list = await client.request('tools/list', {});
    assert.equal(list.error, undefined, 'tools/list errored: ' + JSON.stringify(list.error));
    const tools = list.result.tools;
    assert.ok(Array.isArray(tools), 'tools must be an array');
    const names = tools.map((t) => t.name).sort();
    assert.deepEqual(names, [...EXPECTED_TOOLS].sort(), 'shipped tool set drifted from src/index.ts');
    for (const tool of tools) {
      assert.ok(tool.description, `tool ${tool.name} missing description`);
      assert.equal(tool.inputSchema.type, 'object', `tool ${tool.name} inputSchema.type`);
      assert.ok(tool.inputSchema.properties, `tool ${tool.name} missing inputSchema.properties`);
      for (const req of tool.inputSchema.required || []) {
        assert.ok(
          tool.inputSchema.properties[req],
          `tool ${tool.name} declares required property ${req} without a schema entry`
        );
      }
    }
  } finally {
    await client.close();
  }
});

test('tools/call with an unknown tool name returns a documented error (no crash)', async () => {
  // Config must be valid so dispatch reaches the tool router. The router's
  // `Unknown tool` throw is inside the tool handler's try/catch, so the
  // observed shape is MCP content with isError=true carrying the message.
  const client = new StdioMcpClient({
    PROXMOX_HOST: 'synthetic-host.invalid',
    PROXMOX_PORT: '8006',
    PROXMOX_USERNAME: 'synthetic-user',
    PROXMOX_PASSWORD: 'synthetic-password',
    PROXMOX_REALM: 'pam',
  });
  try {
    await client.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'issue-31-test', version: '1.0.0' },
    });
    client.notify('notifications/initialized', {});
    const call = await client.request('tools/call', { name: 'not_a_real_tool', arguments: {} });
    assert.equal(call.error, undefined, 'expected content-level error, got JSON-RPC error: ' + JSON.stringify(call.error));
    assert.equal(call.result.isError, true, 'expected isError=true');
    assert.match(call.result.content[0].text, /Unknown tool: not_a_real_tool/);
  } finally {
    await client.close();
  }
});
