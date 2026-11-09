const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));
const fs = require('fs');

const ROUTES = [
  { name: '01_dashboard', path: '/' },
  { name: '02_facilities', path: '/facilities' },
  { name: '03_audits', path: '/audits' },
  { name: '04_findings', path: '/findings' },
  { name: '05_memory', path: '/memory' },
  { name: '06_recurring', path: '/recurring' },
  { name: '07_capa', path: '/capa' },
  { name: '08_evidence', path: '/evidence' },
  { name: '09_agent', path: '/agent' },
];

async function capture(targetDir = 'before') {
  const outDir = path.join(__dirname, '..', 'docs', 'screenshots', targetDir);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Starting screen capture to: ${outDir}`);

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
  await page.setViewport({ width: 1920, height: 1080 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  // 1. Capture Light Mode for all routes
  for (const r of ROUTES) {
    const url = `http://localhost:3000${r.path}`;
    console.log(`Navigating to ${r.name} (${url}) [Light Mode]...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(res => setTimeout(res, 1200));

      const screenshotPath = path.join(outDir, `${r.name}_light.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved: ${screenshotPath}`);
    } catch (e) {
      console.error(`Error capturing ${r.name}:`, e.message);
    }
  }

  // 2. Switch to Dark Mode and capture selected key routes (Dashboard, Memory, Agent)
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('auditmind_theme', 'dark');
  });
  await new Promise(res => setTimeout(res, 500));

  const darkRoutes = [
    { name: '01_dashboard_dark', path: '/' },
    { name: '05_memory_dark', path: '/memory' },
    { name: '09_agent_dark', path: '/agent' }
  ];

  for (const r of darkRoutes) {
    const url = `http://localhost:3000${r.path}`;
    console.log(`Navigating to ${r.name} (${url}) [Dark Mode]...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });
      await new Promise(res => setTimeout(res, 1000));

      const screenshotPath = path.join(outDir, `${r.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved: ${screenshotPath}`);
    } catch (e) {
      console.error(`Error capturing ${r.name}:`, e.message);
    }
  }

  // 3. Capture Responsive Mobile View (Dashboard on 375x812 iPhone)
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(res => setTimeout(res, 1000));
  const mobilePath = path.join(outDir, '01_dashboard_mobile.png');
  await page.screenshot({ path: mobilePath, fullPage: false });
  console.log(`Saved mobile: ${mobilePath}`);

  await browser.close();
  console.log(`Capture complete for ${targetDir}!`);
}

const target = process.argv[2] || 'before';
capture(target);
