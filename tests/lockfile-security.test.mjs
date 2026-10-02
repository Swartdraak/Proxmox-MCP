// Regression guard for issue #29: the checked-in package-lock.json must pin the
// security-audited packages to versions that clear every npm advisory npm audit
// currently reports as "fix available via npm audit fix".
//
// Rationale: the vulnerable packages are all transitive deps of
// @modelcontextprotocol/sdk (plus the direct dep axios). They are only bound by
// the lockfile, so a future `npm install <anything>` that re-resolves the tree
// can silently re-pin them to a vulnerable version and the CI audit job (which
// still runs with continue-on-error true) will keep passing. This test fails
// loudly in `npm test` if any of the locked versions drops back into an
// advisory-affected range.
//
// Run: node --test tests/  (or: npm test, once the placeholder test script is
// replaced by `node --test tests/`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// Minimum locked versions that clear the public high-severity advisories listed
// in issue #29 (each "fixed in" boundary verified against the GHSA advisories
// npm audit reports as of the 2026-09-19 assessment, 2026-09-20 re-verification).
const MIN_LOCKED_VERSIONS = {
  // host confusion / SSRF / path traversal: fixed in fast-uri 3.1.6+ (locked 3.1.8)
  'fast-uri': [3, 1, 6],
  // serveStatic traversal / CORS / cookie+JWT flaws: fixed in hono 4.13.5+ (locked 4.13.8)
  'hono': [4, 13, 5],
  // same hono family, node adapter: fixed in @hono/node-server 1.19.15+ (locked 1.19.17)
  '@hono/node-server': [1, 19, 15],
  // Address4 leading-zero octet SSRF + Address6 XSS: fixed in ip-address 10.3.1+ (locked 10.7.2)
  'ip-address': [10, 3, 1],
  // DoS + ReDoS: fixed in path-to-regexp 8.3.1+ (locked 8.4.2)
  'path-to-regexp': [8, 3, 1],
  // CRLF injection in multipart fields: fixed in form-data 4.0.6 (locked 4.0.6)
  'form-data': [4, 0, 6],
  // IPv4-mapped IPv6 rate-limit bypass: fixed in express-rate-limit 8.5.1+ (locked 8.7.0)
  'express-rate-limit': [8, 5, 1],
  // prototype pollution / SSRF / CRLF / unbounded allocation: fixed in axios 1.17.1+ (locked 1.20.0)
  'axios': [1, 17, 1],
  // moderate, same lockfile refresh: follow-redirects 1.15.12+ (locked 1.16.0)
  'follow-redirects': [1, 15, 12],
  // moderate: qs 6.15.4+ (locked 6.16.0)
  'qs': [6, 15, 4],
  // moderate: body-parser 2.2.3+ (locked 2.3.0)
  'body-parser': [2, 2, 3],
  // moderate: ajv 8.17.2+ (locked 8.20.0)
  'ajv': [8, 17, 2],
};

function compareVersions(a, b) {
  // returns -1/0/1 for a < == > b (numeric, segment-wise, up to length of b)
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0;
}

test('package-lock.json exists at repo root', () => {
  assert.ok(existsSync(join(repoRoot, 'package-lock.json')), 'package-lock.json missing from repo root');
});

test('lockfile pins security-audited packages at or above their fixed-in versions (issue #29)', () => {
  const lock = JSON.parse(readFileSync(join(repoRoot, 'package-lock.json'), 'utf8'));
  const packages = lock.packages || {};

  for (const [name, min] of Object.entries(MIN_LOCKED_VERSIONS)) {
    const entry = packages['node_modules/' + name];
    assert.ok(entry, `lockfile has no entry for node_modules/${name}`);
    const got = (entry.version || '').split('.').map((s) => parseInt(s, 10));
    assert.ok(got.every((n) => Number.isFinite(n)), `lockfile version for ${name} is not numeric: ${entry.version}`);
    const cmp = compareVersions(got, min);
    assert.ok(
      cmp >= 0,
      `LOCKED ${name}@${entry.version} is below the fixed-in version ${min.join('.')}; ` +
      `issue #29 would regress (npm audit high gate would fail again).`
    );
  }
});

test('package.json carries no issue-#29 remediation change (the fix stays lockfile-only)', () => {
  // The remediation must not introduce a direct-dependency spec change of its
  // own: the only direct specs on this branch are the ones Dependabot PRs
  // #25 (sdk ^1.27.1, axios ^1.13.6) and #22 (@types/node ^25.2.3) already
  // landed on main; the issue #29 commit adds nothing beyond that. If a
  // future remediation does need a spec change, update these assertions with
  // the new commit's justification.
  const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
  assert.equal(pkg.dependencies?.axios, '^1.13.6', 'axios direct spec is the Dependabot PR #25 value (spec bumps are Dependabot-owned, not part of the #29 lockfile fix)');
  assert.equal(pkg.dependencies?.['@modelcontextprotocol/sdk'], '^1.27.1', 'sdk direct spec is the Dependabot PR #25 value (spec bumps are Dependabot-owned, not part of the #29 lockfile fix)');
  assert.equal(pkg.dependencies?.['https-proxy-agent'], '^7.0.5');
  assert.equal(pkg.dependencies?.['fast-uri'], undefined, 'fast-uri is transitive — must not become a direct dependency');
});

test('npm audit --audit-level=high reports 0 vulnerabilities (issue #29 acceptance)', { timeout: 120000 }, (t) => {
  // This shell-invoking test keeps the regression net honest end-to-end: if the
  // lockfile ever re-resolves to a vulnerable transitive, the audit gate fails
  // and this test fails with npm's own report as diagnostic output.
  // npm audit exits non-zero ONLY when it finds vulnerabilities at the given
  // level. Exit 0 with "found 0 vulnerabilities" is the pass condition.
  try {
    const out = execFileSync('npm', ['audit', '--audit-level=high'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    assert.match(out, /found 0 vulnerabilities|No dependencies/i, 'expected a clean audit report');
  } catch (e) {
    // npm audit exits non-zero only when vulnerabilities are found
    t.diagnostic(e.stdout || '');
    t.diagnostic(e.stderr || '');
    assert.fail('npm audit --audit-level=high failed: ' + (e.stderr || e.message));
  }
});
