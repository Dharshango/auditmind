const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1920,1080']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000/agent', { waitUntil: 'networkidle0' });

  // Find and click the first scenario card
  const buttons = await page.$$('button');
  let benchmarkBtn = null;
  for (const b of buttons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('Recurring Fire Egress Drift')) {
      benchmarkBtn = b;
      break;
    }
  }

  if (benchmarkBtn) {
    console.log('Found scenario button, clicking...');
    await benchmarkBtn.click();
    console.log('Clicked. Waiting for assistant response...');

    // Wait until response arrives or 25s
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('Finding') || text.includes('Historical Context') || text.includes('Agent Execution Note');
    }, { timeout: 30000 }).catch(e => console.log('Wait timeout:', e.message));

    const responseInfo = await page.evaluate(() => {
      const userText = document.querySelector('.bg-atelier-obsidian')?.innerText;
      const assistantText = document.querySelector('.rounded-tl-none')?.innerText;
      return {
        userText: userText ? userText.slice(0, 120) : null,
        assistantLength: assistantText ? assistantText.length : 0,
        assistantSnippet: assistantText ? assistantText.slice(0, 300) : null,
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean)
      };
    });

    console.log('Result:', JSON.stringify(responseInfo, null, 2));
    await page.screenshot({ path: path.join(__dirname, '../docs/screenshots/after/test_agent_turn.png') });
    console.log('Saved screenshot of test turn.');
  }

  await browser.close();
})();
