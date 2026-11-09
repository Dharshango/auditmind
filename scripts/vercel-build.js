const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[AUDITMIND] Starting Vercel production build sequence...');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');

try {
  // 1. Compile the Next.js production bundle inside frontend
  console.log('[AUDITMIND] Compiling Next.js application in frontend/...');
  execSync('npm run build', {
    cwd: frontendDir,
    stdio: 'inherit',
    env: process.env,
  });

  // 2. Mirror .next build output to repository root for Vercel framework runtime
  const srcNext = path.join(frontendDir, '.next');
  const destNext = path.join(rootDir, '.next');

  if (fs.existsSync(srcNext)) {
    console.log('[AUDITMIND] Mirroring .next build artifacts to project root...');
    if (fs.existsSync(destNext)) {
      fs.rmSync(destNext, { recursive: true, force: true });
    }
    fs.cpSync(srcNext, destNext, { recursive: true });
  }

  // 3. Mirror public directory to project root for static asset resolution
  const srcPublic = path.join(frontendDir, 'public');
  const destPublic = path.join(rootDir, 'public');

  if (fs.existsSync(srcPublic) && !fs.existsSync(destPublic)) {
    console.log('[AUDITMIND] Mirroring public/ assets to project root...');
    fs.cpSync(srcPublic, destPublic, { recursive: true });
  }

  console.log('[AUDITMIND] Production build and artifact synchronization complete!');
} catch (err) {
  console.error('[AUDITMIND] Build failed:', err.message);
  process.exit(1);
}
