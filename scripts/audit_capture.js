const puppeteer = require('c:/Users/dhars/OneDrive/Desktop/Projects/clonmel-flood-simulator/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve(__dirname, '../docs/screenshots/dashboard_audit');

const ROUTES = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'facilities', path: '/facilities' },
  { name: 'audits', path: '/audits' },
  { name: 'findings', path: '/findings' },
  { name: 'memory', path: '/memory' },
  { name: 'recurring', path: '/recurring' },
  { name: 'capa', path: '/capa' },
  { name: 'evidence', path: '/evidence' },
  { name: 'agent', path: '/agent' },
];

async function run() {
  console.log('Launching Chrome for Dashboard UI Audit...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // Set auth cookie/token if needed
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

  const auditResults = [];

  for (const r of ROUTES) {
    const url = `${BASE_URL}${r.path}`;
    console.log(`Auditing ${r.name} (${url})...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      // Wait for content render
      await new Promise((res) => setTimeout(res, 2000));

      const screenshotFile = path.join(OUT_DIR, `${r.name}_current.png`);
      await page.screenshot({ path: screenshotFile, fullPage: true });

      const metrics = await page.evaluate(() => {
        const textElements = Array.from(document.querySelectorAll('h1, h2, h3, p, span, button, a, td, th'));
        const cardLikeElements = Array.from(document.querySelectorAll('.rounded-2xl, .rounded-xl, .bg-\\[\\#111113\\], .bg-\\[\\#18181B\\]'));
        return {
          title: document.title,
          heading: document.querySelector('h1')?.innerText || '',
          textCount: textElements.length,
          cardCount: cardLikeElements.length,
          bodyBg: window.getComputedStyle(document.body).backgroundColor,
        };
      });

      auditResults.push({
        route: r.path,
        name: r.name,
        screenshot: screenshotFile,
        metrics,
        status: 'OK',
      });
      console.log(`Captured ${r.name}: cards=${metrics.cardCount}, heading="${metrics.heading}"`);
    } catch (err) {
      console.error(`Failed ${r.name}:`, err.message);
      auditResults.push({
        route: r.path,
        name: r.name,
        error: err.message,
        status: 'ERROR',
      });
    }
  }

  await browser.close();

  fs.writeFileSync(
    path.resolve(__dirname, '../docs/dashboard_audit_data.json'),
    JSON.stringify(auditResults, null, 2)
  );
  console.log('Dashboard audit capture completed successfully.');
}

run().catch((err) => {
  console.error('Fatal audit run error:', err);
  process.exit(1);
});
