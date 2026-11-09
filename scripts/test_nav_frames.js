const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));
const fs = require('fs');

async function testFrames() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem("auditmind_auth_token", "demo-token");
    localStorage.setItem("auditmind_user", JSON.stringify({ email: "sarah.j@meridian-ind.com", name: "Sarah Jenkins" }));
    document.cookie = "auditmind_auth_token=demo-token; path=/; max-age=86400; SameSite=Lax";
  });

  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));

  const frameDir = path.join(__dirname, '..', 'docs', 'nav_frames');
  fs.mkdirSync(frameDir, { recursive: true });

  console.log('Capturing frame 0 before click...');
  await page.screenshot({ path: path.join(frameDir, 'frame_00_before.png') });

  // Get coordinates of Facility Network link
  const linkRect = await page.$eval('aside nav a[href="/facilities"]', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  console.log('Mouse move to Facility Network at', linkRect);
  await page.mouse.move(linkRect.x, linkRect.y);
  await page.screenshot({ path: path.join(frameDir, 'frame_01_hover.png') });

  console.log('Mouse down on Facility Network...');
  await page.mouse.down();
  await page.screenshot({ path: path.join(frameDir, 'frame_02_mousedown.png') });

  console.log('Mouse up on Facility Network...');
  await page.mouse.up();
  await page.screenshot({ path: path.join(frameDir, 'frame_03_mouseup.png') });

  // Fast capture frames
  for (let i = 1; i <= 10; i++) {
    await new Promise(r => setTimeout(r, 60));
    const activeInfo = await page.$$eval('aside nav a', els => {
      return els.map(e => ({
        href: e.getAttribute('href'),
        classes: e.className,
        hasPip: !!e.querySelector('span.w-1')
      }));
    });
    console.log(`Frame ${i} (after ${i * 60}ms):`, activeInfo.slice(0, 2));
    await page.screenshot({ path: path.join(frameDir, `frame_${String(i + 3).padStart(2, '0')}.png`) });
  }

  await browser.close();
  console.log('Done capturing frames.');
}

testFrames().catch(console.error);
