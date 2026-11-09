const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));

async function testCleanNav() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem("auditmind_auth_token", "demo-token");
    localStorage.setItem("auditmind_user", JSON.stringify({ email: "sarah.j@meridian-ind.com", name: "Sarah Jenkins" }));
    document.cookie = "auditmind_auth_token=demo-token; path=/; max-age=86400; SameSite=Lax";
  });

  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Testing 10 Navigation Cycles between /dashboard and /facilities...');

  for (let cycle = 1; cycle <= 10; cycle++) {
    // 1. Click Facility Network
    await page.click('aside nav a[href="/facilities"]');
    // Check state immediately (after 20ms)
    await new Promise(r => setTimeout(r, 20));
    let activeHrefs = await page.$$eval('aside nav a', els =>
      els.filter(e => e.className.includes('border-white/15')).map(e => e.getAttribute('href'))
    );
    if (activeHrefs.length !== 1 || activeHrefs[0] !== '/facilities') {
      throw new Error(`Cycle ${cycle} [Immediate Facilities]: expected ['/facilities'], got ${JSON.stringify(activeHrefs)}`);
    }

    // Wait 200ms
    await new Promise(r => setTimeout(r, 200));
    activeHrefs = await page.$$eval('aside nav a', els =>
      els.filter(e => e.className.includes('border-white/15')).map(e => e.getAttribute('href'))
    );
    if (activeHrefs.length !== 1 || activeHrefs[0] !== '/facilities') {
      throw new Error(`Cycle ${cycle} [Settled Facilities]: expected ['/facilities'], got ${JSON.stringify(activeHrefs)}`);
    }

    // 2. Click Executive Overview
    await page.click('aside nav a[href="/dashboard"]');
    await new Promise(r => setTimeout(r, 20));
    activeHrefs = await page.$$eval('aside nav a', els =>
      els.filter(e => e.className.includes('border-white/15')).map(e => e.getAttribute('href'))
    );
    if (activeHrefs.length !== 1 || activeHrefs[0] !== '/dashboard') {
      throw new Error(`Cycle ${cycle} [Immediate Dashboard]: expected ['/dashboard'], got ${JSON.stringify(activeHrefs)}`);
    }

    await new Promise(r => setTimeout(r, 200));
    activeHrefs = await page.$$eval('aside nav a', els =>
      els.filter(e => e.className.includes('border-white/15')).map(e => e.getAttribute('href'))
    );
    if (activeHrefs.length !== 1 || activeHrefs[0] !== '/dashboard') {
      throw new Error(`Cycle ${cycle} [Settled Dashboard]: expected ['/dashboard'], got ${JSON.stringify(activeHrefs)}`);
    }

    console.log(`Cycle ${cycle}/10 passed: instant, clean, single active tab.`);
  }

  // Test browser back & forward
  console.log('Testing Browser Back & Forward...');
  await page.click('aside nav a[href="/facilities"]');
  await new Promise(r => setTimeout(r, 300));
  await page.goBack();
  await new Promise(r => setTimeout(r, 300));
  let backActive = await page.$$eval('aside nav a', els =>
    els.filter(e => e.className.includes('border-white/15')).map(e => e.getAttribute('href'))
  );
  console.log('After Browser Back (expected /dashboard):', backActive);
  if (backActive[0] !== '/dashboard') throw new Error('Browser Back failed');

  await page.goForward();
  await new Promise(r => setTimeout(r, 300));
  let forwardActive = await page.$$eval('aside nav a', els =>
    els.filter(e => e.className.includes('border-white/15')).map(e => e.getAttribute('href'))
  );
  console.log('After Browser Forward (expected /facilities):', forwardActive);
  if (forwardActive[0] !== '/facilities') throw new Error('Browser Forward failed');

  // Test page reload
  console.log('Testing Page Reload...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  let reloadActive = await page.$$eval('aside nav a', els =>
    els.filter(e => e.className.includes('border-white/15')).map(e => e.getAttribute('href'))
  );
  console.log('After Page Reload on /facilities:', reloadActive);
  if (reloadActive[0] !== '/facilities') throw new Error('Reload active state failed');

  await browser.close();
  console.log('\nALL 10 NAVIGATION CYCLES + BROWSER BACK/FORWARD/RELOAD PASSED 100%!');
}

testCleanNav().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
