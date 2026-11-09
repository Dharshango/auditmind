const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));

async function testNav() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button[type="submit"]');

  // Set demo credentials directly in localStorage or submit form
  await page.evaluate(() => {
    localStorage.setItem("auditmind_auth_token", "demo-token");
    localStorage.setItem("auditmind_user", JSON.stringify({ email: "sarah.j@meridian-ind.com", name: "Sarah Jenkins" }));
    document.cookie = "auditmind_auth_token=demo-token; path=/; max-age=86400; SameSite=Lax";
  });

  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Current URL on dashboard:', page.url());

  // Check initial state
  const initialLinks = await page.$$eval('aside nav a', els => els.map(e => ({
    text: e.innerText.trim(),
    href: e.getAttribute('href'),
    isActive: e.className.includes('bg-[#18181B]'),
    hasPip: !!e.querySelector('span.absolute')
  })));
  console.log('Initial links state:');
  console.table(initialLinks);

  // Monitor DOM mutations on aside
  await page.evaluate(() => {
    window.__navLog = [];
    const observer = new MutationObserver((mutations) => {
      const activeLinks = Array.from(document.querySelectorAll('aside nav a'))
        .filter(el => el.classList.contains('bg-[#18181B]'))
        .map(el => el.getAttribute('href'));
      window.__navLog.push({
        time: Math.round(performance.now()),
        pathname: window.location.pathname,
        active: activeLinks
      });
    });
    observer.observe(document.querySelector('aside'), { attributes: true, subtree: true, childList: true });
  });

  console.log('--- Clicking Facility Network ---');
  await page.click('aside nav a[href="/facilities"]');

  // Monitor for 2 seconds in small increments
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 100));
    const active = await page.$$eval('aside nav a', els =>
      els.filter(e => e.className.includes('bg-[#18181B]')).map(e => e.getAttribute('href'))
    );
    console.log(`[${(i + 1) * 100}ms] pathname: ${new URL(page.url()).pathname} | active in DOM:`, active);
  }

  const logs = await page.evaluate(() => window.__navLog || []);
  console.log('\n--- Mutation Observer Log ---');
  console.log(JSON.stringify(logs, null, 2));

  console.log('\n--- Now clicking back to Executive Overview ---');
  await page.click('aside nav a[href="/dashboard"]');

  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 100));
    const active = await page.$$eval('aside nav a', els =>
      els.filter(e => e.className.includes('bg-[#18181B]')).map(e => e.getAttribute('href'))
    );
    console.log(`[${(i + 1) * 100}ms] pathname: ${new URL(page.url()).pathname} | active in DOM:`, active);
  }

  await browser.close();
}

testNav().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
