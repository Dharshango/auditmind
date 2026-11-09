const puppeteer = require('c:/Users/dhars/OneDrive/Desktop/Projects/clonmel-flood-simulator/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve(__dirname, '../docs/screenshots/dashboard_redesign');

const ROUTES = [
  { name: 'landing_reference', path: '/' },
  { name: 'dashboard_desktop', path: '/dashboard' },
  { name: 'facilities_desktop', path: '/facilities' },
  { name: 'audits_desktop', path: '/audits' },
  { name: 'findings_desktop', path: '/findings' },
  { name: 'memory_desktop', path: '/memory' },
  { name: 'recurring_desktop', path: '/recurring' },
  { name: 'capa_desktop', path: '/capa' },
  { name: 'evidence_desktop', path: '/evidence' },
  { name: 'agent_desktop', path: '/agent' },
];

const VIEWPORTS = [
  { name: 'laptop', width: 1366, height: 768, routes: ['/dashboard', '/facilities', '/agent'] },
  { name: 'mobile', width: 390, height: 844, routes: ['/dashboard', '/facilities', '/agent'] },
];

async function run() {
  console.log('Launching Chrome for Visual QA & Multi-Viewport Verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set mock authenticated user
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('auditmind_auth_token', 'demo-token-bypass');
    localStorage.setItem(
      'auditmind_user',
      JSON.stringify({
        id: 'user-sarah-jenkins',
        email: 'sarah.jenkins@meridian.com',
        full_name: 'Sarah Jenkins',
        role: 'VP of Quality & Regulatory Affairs',
        organization_id: '00000000-0000-0000-0000-000000000001',
        organization_name: 'Meridian Industrial Group',
      })
    );
  });

  // 1. Desktop 1920x1080 Captures
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  for (const r of ROUTES) {
    console.log(`Capturing ${r.name} (${r.path}) at 1920x1080...`);
    await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise((res) => setTimeout(res, 2000));
    const dest = path.join(OUT_DIR, `${r.name}.png`);
    await page.screenshot({ path: dest, fullPage: true });
  }

  // 2. Responsive Viewports (Laptop & Mobile)
  for (const vp of VIEWPORTS) {
    console.log(`Setting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });

    for (const routePath of vp.routes) {
      const cleanName = routePath.replace('/', '') + `_${vp.name}`;
      console.log(`Capturing ${cleanName} (${routePath})...`);
      await page.goto(`${BASE_URL}${routePath}`, { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise((res) => setTimeout(res, 1500));
      const dest = path.join(OUT_DIR, `${cleanName}.png`);
      await page.screenshot({ path: dest, fullPage: true });
    }
  }

  // 3. Test Interactive Modals on Desktop
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // Test Facility Detail Modal
  console.log('Testing Facility Detail Modal...');
  await page.goto(`${BASE_URL}/facilities`, { waitUntil: 'networkidle2' });
  await new Promise((res) => setTimeout(res, 1500));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.innerText.includes('Open Deep Audit Workspace')
    );
    if (btn) btn.click();
  });
  await new Promise((res) => setTimeout(res, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'facility_detail_modal.png') });

  // Test Audit Detail Modal
  console.log('Testing Audit Detail Modal...');
  await page.goto(`${BASE_URL}/audits`, { waitUntil: 'networkidle2' });
  await new Promise((res) => setTimeout(res, 1500));
  await page.evaluate(() => {
    const row = document.querySelector('tbody tr');
    if (row) row.click();
  });
  await new Promise((res) => setTimeout(res, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'audit_detail_modal.png') });

  await browser.close();
  console.log('All visual verification screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Visual verification error:', err);
  process.exit(1);
});
