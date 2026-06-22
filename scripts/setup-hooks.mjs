/**
 * scripts/setup-hooks.mjs
 *
 * Automatically installs Git hooks (pre-commit, pre-push, post-merge) that run
 * the security scanner to keep the frontend repository safe during run, build, push, and pull.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const gitDir = path.join(repoRoot, '.git');
const hooksDir = path.join(gitDir, 'hooks');

if (!fs.existsSync(gitDir)) {
  console.error('Error: .git directory not found. Please initialize git repository first.');
  process.exit(1);
}

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

function installHook(hookName, friendlyName, hookScript) {
  const hookPath = path.join(hooksDir, hookName);
  const content = `#!/bin/sh
# IncHub Security Git Hook: ${friendlyName}

echo ""
echo "============================================================"
echo "      IncHub CRM Frontend Git Hook: ${friendlyName}          "
echo "============================================================"

${hookScript}
`.trim() + '\n';

  try {
    fs.writeFileSync(hookPath, content, { mode: 0o755 });
    console.log(`✓ Successfully installed ${hookName} Git hook.`);
  } catch (error) {
    console.error(`Failed to install ${hookName} Git hook:`, error.message);
  }
}

// 1. pre-commit hook script (blocks commit on scan failure)
const preCommitScript = `
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
exit 0
`.trim();

// 2. pre-push hook script (blocks push on scan failure)
const prePushScript = `
node scripts/security-scan.mjs
SCAN_STATUS=$?

if [ $SCAN_STATUS -ne 0 ]; then
  echo "🚨 CRITICAL: Security scan failed! Blocked push."
  echo "Please resolve the security threats flagged above before pushing."
  echo "============================================================"
  exit 1
fi

echo "✅ Security scan passed. Proceeding with push..."
echo "============================================================"
exit 0
`.trim();

// 3. post-merge hook script (runs scan after pulling updates from GitHub, warns if threats introduced)
const postMergeScript = `
node scripts/security-scan.mjs
SCAN_STATUS=$?

if [ $SCAN_STATUS -ne 0 ]; then
  echo "⚠️ WARNING: Newly pulled changes contain security threats!"
  echo "Please review the security scan details above."
  echo "============================================================"
else
  echo "✅ Pulled changes are clean."
  echo "============================================================"
fi
exit 0
`.trim();

installHook('pre-commit', 'Pre-Commit Scan', preCommitScript);
installHook('pre-push', 'Pre-Push Scan', prePushScript);
installHook('post-merge', 'Post-Merge Scan', postMergeScript);
console.log('All frontend Git hooks configured successfully!');
