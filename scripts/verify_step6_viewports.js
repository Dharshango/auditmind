const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));
const fs = require('fs');

const VIEWPORTS = [
  { name: 'Desktop (1920x1080)', width: 1920, height: 1080, suffix: 'desktop' },
  { name: 'Laptop (1366x768)', width: 1366, height: 768, suffix: 'laptop_1366' },
  { name: 'Mobile (390x844)', width: 390, height: 844, isMobile: true, suffix: 'mobile' }
];

const ROUTES_TO_TEST = [
  { name: 'Landing', path: '/' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Audits', path: '/audits' },
  { name: 'Agent', path: '/agent' }
];

async function testViewports() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const outDir = path.join(__dirname, '..', 'docs', 'screenshots', 'viewports');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('=== STEP 6: TESTING RESPONSIVE VIEWPORTS (DESKTOP, LAPTOP, MOBILE) ===\n');

  // Seed authentication
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem("auditmind_auth_token", "demo-token");
    localStorage.setItem("auditmind_user", JSON.stringify({ email: "sarah.j@meridian-ind.com", name: "Sarah Jenkins" }));
    document.cookie = "auditmind_auth_token=demo-token; path=/; max-age=86400; SameSite=Lax";
  });

  const viewportResults = [];

  for (const vp of VIEWPORTS) {
    console.log(`\nTesting Viewport: ${vp.name}...`);
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: !!vp.isMobile });

    for (const r of ROUTES_TO_TEST) {
      const url = `http://localhost:3000${r.path}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise(res => setTimeout(res, 1200));

      const layoutMetrics = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const hasHorizontalOverflow = docWidth > winWidth + 2;
        return {
          docWidth,
          winWidth,
          hasHorizontalOverflow
        };
      });

      const shotName = `${r.name.toLowerCase()}_${vp.suffix}.png`;
      const shotPath = path.join(outDir, shotName);
      await page.screenshot({ path: shotPath, fullPage: false });

      viewportResults.push({
        viewport: vp.name,
        route: r.name,
        path: r.path,
        hasHorizontalOverflow: layoutMetrics.hasHorizontalOverflow,
        scrollWidth: layoutMetrics.docWidth,
        windowWidth: layoutMetrics.winWidth,
        screenshot: shotName
      });

      console.log(`  [${r.name}] Overflow: ${layoutMetrics.hasHorizontalOverflow ? 'FAIL' : 'PASS'} | Saved: ${shotName}`);
    }
  }

  await browser.close();

  fs.writeFileSync(
    path.join(__dirname, '..', 'docs', 'step6_viewport_results.json'),
    JSON.stringify(viewportResults, null, 2)
  );

  const anyFail = viewportResults.some(v => v.hasHorizontalOverflow);
  if (anyFail) {
    console.error('FAILED: Horizontal overflow detected on one or more viewports!');
    process.exit(1);
  } else {
    console.log('\nSTEP 6 COMPLETE: Desktop (1920x1080), Laptop (1366x768), and Mobile (390x844) all pass with zero horizontal scroll bleed!');
  }
}

testViewports().catch(e => {
  console.error('Viewport test failed:', e);
  process.exit(1);
});
