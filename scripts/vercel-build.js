const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[AUDITMIND] Starting Vercel production build sequence...');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');

try {
  // 1. Compile the Next.js production bundle inside frontend/
  console.log('[AUDITMIND] Compiling Next.js application in frontend/...');
  execSync('npm run build', {
    cwd: frontendDir,
    stdio: 'inherit',
    env: process.env,
  });

  // 2. Ensure root .next does not shadow frontend/.next
  const rootNext = path.join(rootDir, '.next');
  if (fs.existsSync(rootNext)) {
    fs.rmSync(rootNext, { recursive: true, force: true });
  }

  console.log('[AUDITMIND] Production build complete at frontend/.next!');
} catch (err) {
  console.error('[AUDITMIND] Build failed:', err.message);
  process.exit(1);
}
