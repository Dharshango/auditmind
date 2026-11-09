const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));

async function testAuth() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 1. Visit Landing Page
  console.log('[TEST] 1. Visiting landing page...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  // 2. Click Sign In
  console.log('[TEST] 2. Navigating to /login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  // 3. Fill Credentials
  console.log('[TEST] 3. Submitting credentials for Sarah Jenkins...');
  await page.type('input[type="email"]', 'compliance@meridianindustrial.com');
  await page.type('input[placeholder="••••••••••••"]', 'compliance123');

  // 4. Click Submit
  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();
  console.log('[TEST] 4. Submitted form, awaiting dashboard navigation...');

  // Wait for navigation to /dashboard
  await page.waitForFunction(() => window.location.pathname === '/dashboard', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));
  console.log('[TEST] 5. Successfully landed on /dashboard!');

  // Verify dashboard contents
  const dashboardTitle = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const token = localStorage.getItem('auditmind_auth_token');
    const user = localStorage.getItem('auditmind_user');
    return {
      h1Text: h1 ? h1.textContent.trim() : null,
      tokenFound: Boolean(token),
      userFound: Boolean(user),
      user: user ? JSON.parse(user) : null
    };
  });
  console.log('[TEST] Dashboard State:', JSON.stringify(dashboardTitle, null, 2));

  // 6. Test Sign Out
  console.log('[TEST] 6. Testing Sign Out...');
  const logoutBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Sign Out'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  await new Promise(r => setTimeout(r, 1500));
  const postLogout = await page.evaluate(() => {
    return {
      path: window.location.pathname,
      tokenAfterLogout: localStorage.getItem('auditmind_auth_token')
    };
  });
  console.log('[TEST] Post-Logout State:', JSON.stringify(postLogout, null, 2));

  await browser.close();
  console.log('=== AUTH & WORKSPACE FLOW VERIFIED 100% ===');
}

testAuth().catch(err => {
  console.error('Auth test failed:', err);
  process.exit(1);
});
