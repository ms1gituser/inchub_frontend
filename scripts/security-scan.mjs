#!/usr/bin/env node
/**
 * scripts/security-scan.mjs
 *
 * Zero-dependency pre-flight security scanner.
 * Runs automatically before: dev, build, start
 * Runs automatically after:  npm install  (via postinstall hook)
 *
 * Modes
 * ─────
 *   (default)        — full source + env + config + npm audit scan
 *   --post-install   — full scan PLUS deep node_modules lifecycle audit
 *
 * Exit codes
 * ──────────
 *   0  — PASS (safe to proceed)
 *   1  — FAIL (critical / high threat found — PROCESS IS BLOCKED)
 *
 * Suppression
 * ───────────
 * Add  // nosec  on the SAME line to suppress a specific finding.
 * Use sparingly and only when the risk is fully understood.
 */

import fs   from 'node:fs';
import path from 'node:path';
import { execSync }    from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, 'src');
const POST_INSTALL_MODE = process.argv.includes('--post-install');

// ─── ANSI colours ─────────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', cyan: '\x1b[36m', white: '\x1b[37m',
  bgRed: '\x1b[41m', bgYellow: '\x1b[43m', bgGreen: '\x1b[42m',
};
const emoji = { pass: '✅', fail: '🚨', warn: '⚠️ ', info: 'ℹ️ ', scan: '🔍', lock: '🔒', pkg: '📦' };

// ─── Source-code threat patterns ──────────────────────────────────────────────
const SOURCE_PATTERNS = [
  // Code execution
  { id:'EXEC-001', severity:'critical', description:'eval() — dynamic code execution',
    regex:/\beval\s*\(/, note:'eval() executes arbitrary strings as code.' },
  { id:'EXEC-002', severity:'critical', description:'new Function() — dynamic code execution',
    regex:/new\s+Function\s*\(/, note:'Equivalent to eval().' },
  { id:'EXEC-003', severity:'critical', description:'child_process import in frontend source',
    regex:/require\s*\(\s*['"]child_process['"]\s*\)/, note:'Never valid in Next.js frontend.' },
  { id:'EXEC-004', severity:'critical', description:'Shell execution: execSync / spawnSync',
    regex:/\b(execSync|spawnSync|execFileSync)\s*\(/, note:'Shell calls in frontend = red flag.' },

  // XSS / DOM injection
  { id:'XSS-001', severity:'high', description:'document.write() — DOM injection',
    regex:/document\s*\.\s*write\s*\(/, note:'Classic XSS vector.' },
  { id:'XSS-002', severity:'high', description:'innerHTML / outerHTML assignment',
    regex:/\.(innerHTML|outerHTML)\s*=(?!=)/, note:'Direct HTML assignment bypasses React XSS protection.' },
  { id:'XSS-003', severity:'high', description:'dangerouslySetInnerHTML in JSX',
    regex:/dangerouslySetInnerHTML\s*=\s*\{/, note:'Only acceptable with fully sanitised content.' },
  { id:'XSS-004', severity:'moderate', description:'javascript: URL protocol',
    regex:/href\s*=\s*['"]javascript:/, note:'Enables inline script execution.' },

  // Obfuscation / exfiltration
  { id:'OBFS-001', severity:'high', description:'Base64 decode: atob() or Buffer.from(…,"base64")',
    regex:/\batob\s*\(|Buffer\.from\s*\([^)]+,\s*['"]base64['"]\s*\)/,
    note:'Decoding base64 at runtime is a common malware obfuscation technique.' },
  { id:'OBFS-002', severity:'moderate', description:'btoa() — base64 encode',
    regex:/\bbtoa\s*\(/, note:'Verify this is not used to exfiltrate data.' },
  { id:'OBFS-003', severity:'high', description:'Long hex / unicode escape sequence (obfuscated payload)',
    regex:/(\\x[0-9a-fA-F]{2}){6,}|(\\u[0-9a-fA-F]{4}){6,}/,
    note:'Typical code-obfuscation fingerprint.' },

  // Secret leakage
  { id:'SECRET-001', severity:'high', description:'Hardcoded credential literal',
    regex:/\b(password|passwd|secret|api_key|apiKey|private_key|client_secret)\s*[:=]\s*['"][^'"]{4,}['"]/i,
    note:'Secrets must never be embedded in source code.' },
  { id:'SECRET-002', severity:'high', description:'Non-public env var referenced in client component',
    regex:/process\.env\.(?!NEXT_PUBLIC_)[A-Z][A-Z0-9_]{2,}/,
    clientOnly: true,
    note:'Only NEXT_PUBLIC_* vars are safe in browser bundles.' },

  // Dangerous APIs
  { id:'API-001', severity:'moderate', description:'Insecure WebSocket (ws:// instead of wss://)',
    regex:/new\s+WebSocket\s*\(\s*['"]ws:\/\//, note:'Use wss:// for encrypted connections.' },
  { id:'API-002', severity:'low', description:'navigator.sendBeacon usage',
    regex:/navigator\s*\.\s*sendBeacon\s*\(/, note:'Verify this is legitimate analytics.' },

  // Crypto-mining
  { id:'MINE-001', severity:'critical', description:'Crypto-miner signature (CoinHive / Stratum)',
    regex:/coinhive|cryptonight|stratum\+tcp/i, note:'Known crypto-mining library signature.' },

  // Supply chain
  { id:'SC-001', severity:'high', description:'Dynamic require() with non-literal argument',
    regex:/require\s*\(\s*(?!['"`])[a-zA-Z$_]/, note:'Can load attacker-controlled modules.' },
  { id:'SC-002', severity:'moderate', description:'Inline <script> tag in JSX/TSX',
    regex:/<script[\s>]/i, note:'Use next/script instead of raw <script> tags.' },
];

// ─── .env threat patterns ─────────────────────────────────────────────────────
const ENV_PATTERNS = [
  { id:'ENV-001', severity:'high', description:'Suspiciously short secret / key (< 8 chars)',
    regex:/^(SECRET|KEY|TOKEN|PASSWORD|PASS|API_KEY|PRIVATE_KEY)\s*=\s*.{1,7}$/im,
    note:'Secrets shorter than 8 characters are dangerously weak.' },
  { id:'ENV-002', severity:'moderate', description:'Plaintext password in .env',
    regex:/^(DB_PASSWORD|DATABASE_PASSWORD|MYSQL_PASSWORD|POSTGRES_PASSWORD)\s*=\s*.+$/im,
    note:'Confirm this .env file is in .gitignore and never committed.' },
  { id:'ENV-003', severity:'high', description:'Suspicious data-exfiltration URL in env value',
    regex:/=\s*(https?:\/\/(?!localhost|127\.|0\.0\.0\.0)[^\s]{20,})/i,
    note:'Verify this external URL is an expected API endpoint.' },
  { id:'ENV-004', severity:'critical', description:'Bash command injection pattern in env value',
    regex:/=.*(\$\(|`[^`]+`)/, note:'Command substitution in env values is a serious injection risk.' },
];

// ─── Config-file threat patterns ──────────────────────────────────────────────
const CONFIG_PATTERNS = [
  { id:'CFG-001', severity:'critical', description:'eval() inside config file',
    regex:/\beval\s*\(/, note:'Never use eval in build configuration.' },
  { id:'CFG-002', severity:'high', description:'Suspicious rewrites/redirects pointing to external host',
    regex:/destination\s*:\s*['"]https?:\/\/(?!localhost|127\.)/,
    note:'External redirect destinations can be used for phishing.' },
  { id:'CFG-003', severity:'moderate', description:'allowedOrigins / CORS wildcard (*)',
    regex:/allowedOrigins.*['"\[]?\s*\*\s*['"\]]?/,
    note:'Wildcard CORS disables cross-origin protections.' },
];

// ─── Files to scan for each category ─────────────────────────────────────────
const ENV_FILES    = ['.env', '.env.local', '.env.development', '.env.production', '.env.test'];
const CONFIG_FILES = ['next.config.ts', 'next.config.js', 'next.config.mjs',
                      'postcss.config.mjs', 'postcss.config.js',
                      'tailwind.config.ts', 'tailwind.config.js',
                      'eslint.config.mjs', 'eslint.config.js'];

// Source extensions and skip directories
const SRC_EXTS  = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'out', '.cache', 'scripts']);

// Suspicious patterns in npm lifecycle scripts (postinstall deep scan)
const DANGEROUS_SCRIPT_PATTERNS = [
  /\bcurl\b/, /\bwget\b/, /\bnc\b/, /netcat/,
  /\beval\b/, /\bexec\b/, /base64/i,
  /http:\/\//i, /https:\/\/(?!registry\.npmjs\.org|registry\.yarnpkg\.com)/i,
  /\brm\s+-rf\b/, /del\s+\//, /format\s+c:/i,
  /powershell/i, /cmd\.exe/i, /\/bin\/sh/, /\/bin\/bash/,
  /process\.env/,
];
const DANGEROUS_LIFECYCLE_KEYS = ['preinstall', 'postinstall', 'install', 'prepare', 'prepack', 'postpack'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function* walkSrc(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) { yield* walkSrc(full); continue; }
    if (entry.isFile() && SRC_EXTS.has(path.extname(entry.name))) yield full;
  }
}

function readFileSafe(fp) {
  try { return fs.readFileSync(fp, 'utf8'); } catch { return null; }
}

function severityColour(sev) {
  return { critical: C.bgRed+C.white+C.bold, high: C.red+C.bold, moderate: C.yellow+C.bold, low: C.cyan }[sev] ?? C.white;
}

function severityLabel(sev) {
  const col = severityColour(sev);
  return `${col} ${sev.toUpperCase()} ${C.reset}`;
}

// ─── Scanners ─────────────────────────────────────────────────────────────────

function scanLines(content, patterns, filePath, opts = {}) {
  const findings = [];
  const rel = path.relative(ROOT, filePath);
  const isClient = content.includes("'use client'") || content.includes('"use client"');
  const lines = content.split('\n');

  for (const pattern of patterns) {
    if (pattern.clientOnly && !isClient) continue;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('// nosec')) continue;
      const trimmed = line.trimStart();
      if (!opts.allowComments && (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('#'))) continue;
      if (pattern.regex.test(line)) {
        findings.push({
          ...pattern,
          file: rel,
          lineNum: i + 1,
          col: Math.max(1, line.search(pattern.regex) + 1),
          content: line.trim().slice(0, 140),
        });
      }
    }
  }
  return findings;
}

function scanSourceFiles() {
  const findings = [];
  let count = 0;
  for (const fp of walkSrc(SRC)) {
    count++;
    const src = readFileSafe(fp);
    if (src) findings.push(...scanLines(src, SOURCE_PATTERNS, fp));
  }
  return { findings, count };
}

function scanEnvFiles() {
  const findings = [];
  const scanned = [];
  for (const name of ENV_FILES) {
    const fp = path.join(ROOT, name);
    if (!fs.existsSync(fp)) continue;
    scanned.push(name);
    const src = readFileSafe(fp);
    if (src) findings.push(...scanLines(src, ENV_PATTERNS, fp, { allowComments: false }));
  }
  return { findings, scanned };
}

function scanConfigFiles() {
  const findings = [];
  const scanned = [];
  for (const name of CONFIG_FILES) {
    const fp = path.join(ROOT, name);
    if (!fs.existsSync(fp)) continue;
    scanned.push(name);
    const src = readFileSafe(fp);
    if (src) findings.push(...scanLines(src, CONFIG_PATTERNS, fp));
  }
  return { findings, scanned };
}

function scanNodeModulesLifecycle() {
  /**
   * Walk node_modules/* /package.json (direct deps only).
   * Flag packages whose lifecycle scripts contain dangerous commands.
   */
  const nmDir = path.join(ROOT, 'node_modules');
  if (!fs.existsSync(nmDir)) return [];
  const findings = [];

  const entries = fs.readdirSync(nmDir, { withFileTypes: true });
  for (const entry of entries) {
    // Handle scoped packages (@org/pkg)
    const pkgDirs = [];
    if (entry.name.startsWith('@') && entry.isDirectory()) {
      const scopeDir = path.join(nmDir, entry.name);
      for (const scoped of fs.readdirSync(scopeDir, { withFileTypes: true })) {
        if (scoped.isDirectory()) pkgDirs.push(path.join(scopeDir, scoped.name));
      }
    } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
      pkgDirs.push(path.join(nmDir, entry.name));
    }

    for (const pkgDir of pkgDirs) {
      const pkgJson = path.join(pkgDir, 'package.json');
      if (!fs.existsSync(pkgJson)) continue;
      let pkg;
      try { pkg = JSON.parse(fs.readFileSync(pkgJson, 'utf8')); } catch { continue; }

      for (const key of DANGEROUS_LIFECYCLE_KEYS) {
        const scriptVal = pkg.scripts?.[key];
        if (!scriptVal) continue;

        const matches = DANGEROUS_SCRIPT_PATTERNS.filter(p => p.test(scriptVal));
        if (matches.length > 0) {
          findings.push({
            id: 'PKG-001',
            severity: 'high',
            description: `Suspicious lifecycle script "${key}" in package`,
            package: `${pkg.name}@${pkg.version ?? 'unknown'}`,
            script: `"${key}": "${scriptVal.slice(0, 120)}"`,
            note: `Matched patterns: ${matches.map(r => r.source.slice(0,30)).join(', ')}`,
          });
        }
      }
    }
  }
  return findings;
}

function runNpmAudit() {
  try {
    execSync('npm audit --json', { cwd: ROOT, stdio: 'pipe' });
    return { critical:0, high:0, moderate:0, low:0 };
  } catch (err) {
    try {
      const json = JSON.parse(err.stdout?.toString() ?? '{}');
      const m = json.metadata?.vulnerabilities ?? {};
      return { critical: m.critical??0, high: m.high??0, moderate: m.moderate??0, low: m.low??0 };
    } catch { return null; }
  }
}

// ─── Reporting ────────────────────────────────────────────────────────────────

function printFinding(f) {
  console.log(`  ${severityLabel(f.severity)} ${C.bold}[${f.id}] ${f.description}${C.reset}`);
  if (f.package) {
    console.log(`    ${C.dim}Package :${C.reset} ${C.yellow}${f.package}${C.reset}`);
    console.log(`    ${C.dim}Script  :${C.reset} ${C.yellow}${f.script}${C.reset}`);
  } else {
    console.log(`    ${C.dim}Location:${C.reset} ${f.file}:${f.lineNum}:${f.col}`);
    console.log(`    ${C.dim}Code    :${C.reset} ${C.yellow}${f.content}${C.reset}`);
  }
  console.log(`    ${C.dim}Risk    :${C.reset} ${f.note}`);
  if (!f.package) {
    console.log(`    ${C.dim}Suppress:${C.reset} Add ${C.cyan}// nosec${C.reset} to that line only if risk is intentional.`);
  }
  console.log();
}

function section(title) {
  console.log(`\n${C.bold}${C.blue}── ${title} ${'─'.repeat(Math.max(0, 58 - title.length))}${C.reset}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const t0 = Date.now();

  console.log();
  console.log(`${C.bold}${C.blue}╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║        🛡️  CRM Frontend — Pre-flight Security Scanner         ║`);
  if (POST_INSTALL_MODE)
  console.log(`║                  Mode: POST-INSTALL AUDIT                     ║`);
  console.log(`╚══════════════════════════════════════════════════════════════╝${C.reset}`);

  const allBlocking = [];
  const allWarnings = [];

  // ── 1. Source files ──────────────────────────────────────────────────────────
  section(`${emoji.scan} Source files  (src/**)`);
  const { findings: srcFindings, count: srcCount } = scanSourceFiles();
  if (srcFindings.length === 0) {
    console.log(`  ${emoji.pass} ${C.green}${srcCount} files scanned — clean.${C.reset}`);
  } else {
    console.log(`  ${srcCount} files scanned — ${srcFindings.length} finding(s):\n`);
    srcFindings.forEach(f => {
      printFinding(f);
      if (f.severity === 'critical' || f.severity === 'high') {
        allBlocking.push(f);
      } else {
        allWarnings.push(f);
      }
    });
  }

  // ── 2. .env files ────────────────────────────────────────────────────────────
  section(`${emoji.lock} Environment files  (.env.*)`);
  const { findings: envFindings, scanned: envScanned } = scanEnvFiles();
  if (envScanned.length === 0) {
    console.log(`  ${emoji.info} No .env files found — skipping.`);
  } else if (envFindings.length === 0) {
    console.log(`  ${emoji.pass} ${C.green}Scanned: ${envScanned.join(', ')} — clean.${C.reset}`);
  } else {
    console.log(`  Scanned: ${envScanned.join(', ')} — ${envFindings.length} finding(s):\n`);
    envFindings.forEach(f => {
      printFinding(f);
      if (f.severity === 'critical' || f.severity === 'high') {
        allBlocking.push(f);
      } else {
        allWarnings.push(f);
      }
    });
  }

  // ── 3. Config files ───────────────────────────────────────────────────────────
  section(`${emoji.scan} Config files  (next.config / tailwind / postcss / eslint)`);
  const { findings: cfgFindings, scanned: cfgScanned } = scanConfigFiles();
  if (cfgScanned.length === 0) {
    console.log(`  ${emoji.info} No config files found.`);
  } else if (cfgFindings.length === 0) {
    console.log(`  ${emoji.pass} ${C.green}Scanned: ${cfgScanned.join(', ')} — clean.${C.reset}`);
  } else {
    console.log(`  Scanned: ${cfgScanned.join(', ')} — ${cfgFindings.length} finding(s):\n`);
    cfgFindings.forEach(f => {
      printFinding(f);
      if (f.severity === 'critical' || f.severity === 'high') {
        allBlocking.push(f);
      } else {
        allWarnings.push(f);
      }
    });
  }

  // ── 4. package.json own scripts ───────────────────────────────────────────────
  section(`${emoji.pkg} package.json lifecycle scripts`);
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const ownDangerous = DANGEROUS_LIFECYCLE_KEYS.filter(k => pkg.scripts?.[k]);
  if (ownDangerous.length === 0) {
    console.log(`  ${emoji.pass} ${C.green}No dangerous lifecycle scripts in package.json.${C.reset}`);
  } else {
    console.log(`  ${emoji.warn} ${C.yellow}Lifecycle scripts present — verify they are intentional:${C.reset}`);
    for (const k of ownDangerous) {
      console.log(`    ${C.yellow}"${k}": "${pkg.scripts[k]}"${C.reset}`);
    }
  }

  // ── 5. node_modules lifecycle audit (post-install mode OR always) ─────────────
  section(`${emoji.pkg} node_modules — package lifecycle script audit`);
  if (!fs.existsSync(path.join(ROOT, 'node_modules'))) {
    console.log(`  ${emoji.info} node_modules not found — run npm install first.`);
  } else {
    process.stdout.write(`  ${emoji.scan} Scanning all installed packages …`);
    const pkgFindings = scanNodeModulesLifecycle();
    process.stdout.write(` done.\n\n`);
    if (pkgFindings.length === 0) {
      console.log(`  ${emoji.pass} ${C.green}No suspicious lifecycle scripts found in node_modules.${C.reset}`);
    } else {
      console.log(`  ${pkgFindings.length} suspicious package(s) found:\n`);
      pkgFindings.forEach(f => {
        printFinding(f);
        allBlocking.push(f); // package lifecycle findings are always blocking
      });
    }
  }

  // ── 6. npm audit ─────────────────────────────────────────────────────────────
  section(`${emoji.lock} npm audit — known CVEs`);
  const audit = runNpmAudit();
  if (!audit) {
    console.log(`  ${emoji.warn} ${C.yellow}Could not parse npm audit output. Run \`npm audit\` manually.${C.reset}`);
  } else {
    const total = audit.critical + audit.high + audit.moderate + audit.low;
    if (total === 0) {
      console.log(`  ${emoji.pass} ${C.green}No known vulnerabilities.${C.reset}`);
    } else {
      if (audit.critical) { console.log(`  ${severityLabel('critical')} ${audit.critical} vulnerability(ies)`); }
      if (audit.high)     { console.log(`  ${severityLabel('high')}     ${audit.high} vulnerability(ies)`); }
      if (audit.moderate) { console.log(`  ${severityLabel('moderate')} ${audit.moderate} vulnerability(ies)`); }
      if (audit.low)      { console.log(`  ${severityLabel('low')}      ${audit.low} vulnerability(ies)`); }
      console.log(`\n  ${C.dim}Run \`npm audit\` for full details.${C.reset}`);
      if (audit.critical) allBlocking.push({ id:'NPM-CRIT', severity:'critical', description:'Critical CVE in dependency' });
      if (audit.high)     allBlocking.push({ id:'NPM-HIGH', severity:'high',     description:'High CVE in dependency' });
    }
  }

  // ── Verdict ───────────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`\n${'═'.repeat(66)}`);

  if (allBlocking.length > 0) {
    console.log(`\n${C.bgRed}${C.white}${C.bold}  🚨  SECURITY SCAN FAILED — BUILD / DEV SERVER BLOCKED  🚨  ${C.reset}\n`);
    console.log(`  ${C.red}${C.bold}${allBlocking.length} blocking issue(s) found.${C.reset}`);
    console.log(`  ${C.red}Fix all CRITICAL and HIGH findings above before proceeding.${C.reset}`);
    if (allWarnings.length) {
      console.log(`  ${C.yellow}(${allWarnings.length} moderate/low warning(s) also found — address when possible.)${C.reset}`);
    }
    console.log(`\n  ${C.dim}Scan time: ${elapsed}s${C.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${C.bgGreen}${C.white}${C.bold}  ✅  SECURITY SCAN PASSED — Safe to proceed  ${C.reset}\n`);
    if (allWarnings.length) {
      console.log(`  ${C.yellow}${allWarnings.length} low/moderate warning(s) — review when possible:${C.reset}`);
      for (const w of allWarnings) console.log(`    ${C.dim}[${w.id}] ${w.description} — ${w.file ?? w.package}${C.reset}`);
      console.log();
    }
    console.log(`  ${C.dim}Scan time: ${elapsed}s${C.reset}\n`);
    process.exit(0);
  }
}

main();
