// CI-safe Playwright installer. Skips on Vercel/CI; installs locally.
const { execSync } = require('node:child_process');

const isCI = !!process.env.CI || !!process.env.VERCEL || process.env.VERCEL_ENV;

if (isCI) {
  console.log('[prepare] CI/Vercel detected — skipping Playwright browsers install.');
  process.exit(0);
}

try {
  console.log('[prepare] Installing Playwright browsers locally...');
  // Install browsers without Linux system deps; local devs handle their OS deps
  execSync('npx playwright install', { stdio: 'inherit' });
  console.log('[prepare] Playwright install completed.');
} catch (err) {
  console.warn('[prepare] Playwright install failed (non-fatal for local dev). Error:', err?.message || err);
  process.exit(0);
}
