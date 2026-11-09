const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));
const fs = require('fs');

const ROUTES = [
  { name: '00_landing_page_desktop', path: '/', viewport: { width: 1920, height: 1080 } },
  { name: '00_landing_page_mobile', path: '/', viewport: { width: 390, height: 844, isMobile: true } },
  { name: '01_login_desktop', path: '/login', viewport: { width: 1920, height: 1080 } },
  { name: '02_product_desktop', path: '/product', viewport: { width: 1920, height: 1080 } },
  { name: '03_case_studies_desktop', path: '/case-studies', viewport: { width: 1920, height: 1080 } },
  { name: '04_contact_desktop', path: '/contact', viewport: { width: 1920, height: 1080 } },
  { name: '05_dashboard_desktop', path: '/dashboard', viewport: { width: 1920, height: 1080 } },
  { name: '06_facilities_desktop', path: '/facilities', viewport: { width: 1920, height: 1080 } },
  { name: '07_audits_desktop', path: '/audits', viewport: { width: 1920, height: 1080 } },
  { name: '08_findings_desktop', path: '/findings', viewport: { width: 1920, height: 1080 } },
  { name: '09_memory_desktop', path: '/memory', viewport: { width: 1920, height: 1080 } },
  { name: '10_recurring_desktop', path: '/recurring', viewport: { width: 1920, height: 1080 } },
  { name: '11_capa_desktop', path: '/capa', viewport: { width: 1920, height: 1080 } },
  { name: '12_evidence_desktop', path: '/evidence', viewport: { width: 1920, height: 1080 } },
  { name: '13_agent_desktop', path: '/agent', viewport: { width: 1920, height: 1080 } },
];

async function run() {
  const outDir = path.join(__dirname, '..', 'docs', 'screenshots', 'after');
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Starting Reference Cinematic QA Screen Capture to: ${outDir}`);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--hide-scrollbars'
    ]
  });

  const page = await browser.newPage();

  // Set auth credentials so dashboard routes render authenticated views
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem("auditmind_auth_token", "demo-token");
    localStorage.setItem("auditmind_user", JSON.stringify({ email: "sarah.j@meridian-ind.com", name: "Sarah Jenkins" }));
    document.cookie = "auditmind_auth_token=demo-token; path=/; max-age=86400; SameSite=Lax";
  });

  for (const r of ROUTES) {
    const url = `http://localhost:3000${r.path}`;
    console.log(`Navigating to ${r.name} (${url}) [${r.viewport.width}x${r.viewport.height}]...`);
    try {
      await page.setViewport(r.viewport);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      // Allow CSS transitions, fonts, and count-up timers to finish
      await new Promise(res => setTimeout(res, 2000));

      const screenshotPath = path.join(outDir, `${r.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved: ${screenshotPath}`);
    } catch (e) {
      console.error(`Error capturing ${r.name}:`, e.message);
    }
  }

  // Also capture mobile menu open on landing page
  try {
    console.log('Capturing Landing Page Mobile Menu Open state...');
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(res => setTimeout(res, 1200));
    const hamburgerBtn = await page.$('button[aria-label="Open menu"]');
    if (hamburgerBtn) {
      await hamburgerBtn.click();
      await new Promise(res => setTimeout(res, 800));
      const mobileMenuPath = path.join(outDir, '00_landing_mobile_menu_open.png');
      await page.screenshot({ path: mobileMenuPath, fullPage: false });
      console.log(`Saved: ${mobileMenuPath}`);
    }
  } catch (e) {
    console.error('Error capturing mobile menu:', e.message);
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
}

run().catch(err => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
