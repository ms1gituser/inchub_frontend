/**
 * scripts/setup-hooks.mjs
 *
 * Automatically installs a pre-commit Git hook that runs the security scanner
 * before any commit is finalized in the frontend repository.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const gitDir = path.join(repoRoot, '.git');
const hooksDir = path.join(gitDir, 'hooks');
const preCommitHookPath = path.join(hooksDir, 'pre-commit');

if (!fs.existsSync(gitDir)) {
  console.error('Error: .git directory not found. Please initialize git repository first.');
  process.exit(1);
}

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

const hookContent = `#!/bin/sh
# IncHub Frontend Security Pre-commit Hook

echo ""
console_width=60
echo "============================================================"
echo "      IncHub CRM Frontend Git Hook: Pre-Commit Scan        "
echo "============================================================"

# Run frontend security scanner
node scripts/security-scan.mjs
SCAN_STATUS=$?

if [ $SCAN_STATUS -ne 0 ]; then
  echo "🚨 CRITICAL: Security scan failed! Blocked commit."
  echo "Please resolve the security threats flagged above before committing."
  echo "============================================================"
  exit 1
fi

echo "✅ Security scan passed. Proceeding with commit..."
echo "============================================================"
echo ""
exit 0
`.trim() + '\n';

try {
  fs.writeFileSync(preCommitHookPath, hookContent, { mode: 0o755 });
  console.log('✓ Successfully installed pre-commit Git hook at:');
  console.log(`  ${preCommitHookPath}`);
} catch (error) {
  console.error('Failed to install Git hook:', error.message);
  process.exit(1);
}
