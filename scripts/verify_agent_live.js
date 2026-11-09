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

  console.log('Navigating to http://localhost:3000/agent ...');
  await page.goto('http://localhost:3000/agent', { waitUntil: 'networkidle0', timeout: 20000 });

  // 1. Check Empty State & Scope selectors
  const scopeData = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select')).map(s => Array.from(s.options).map(o => o.text));
    const evidenceBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Attach evidence'));
    return {
      selects,
      hasEvidenceBtn: Boolean(evidenceBtn)
    };
  });
  console.log('Scope selector options:', JSON.stringify(scopeData, null, 2));

  // 2. Click the Benchmark Scenario "Recurring Fire Egress Drift"
  console.log('Clicking benchmark scenario card...');
  const scenarioClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const sc = btns.find(b => b.innerText.includes('Recurring Fire Egress Drift'));
    if (sc) {
      sc.click();
      return true;
    }
    return false;
  });
  console.log('Scenario clicked:', scenarioClicked);

  // 3. Wait for the assistant response to appear
  console.log('Waiting for assistant response from Groq & Hindsight...');
  await page.waitForFunction(() => {
    const bubbles = document.querySelectorAll('.rounded-tl-none');
    return bubbles.length > 0;
  }, { timeout: 40000 });

  await new Promise(r => setTimeout(r, 1500));

  // 4. Inspect the rendered response
  const assistantMsgData = await page.evaluate(() => {
    const bubble = document.querySelector('.rounded-tl-none');
    if (!bubble) return null;

    const text = bubble.innerText;
    const hasToolTrace = Boolean(bubble.querySelector('button') && text.includes('Agent activity'));
    const hasHindsightBadge = text.includes('Hindsight memory recalled');
    const citationBtns = Array.from(bubble.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t => t.includes('FIND-') || t.includes('AUD-') || t.includes('FAC-'));
    const followUpBtns = Array.from(bubble.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t => t.includes('?') || t.includes('Compare') || t.includes('Draft'));

    return {
      textLength: text.length,
      hasToolTrace,
      hasHindsightBadge,
      citationCount: citationBtns.length,
      citationsSample: citationBtns,
      followUpCount: followUpBtns.length,
      followUpsSample: followUpBtns,
      snippet: text.slice(0, 350)
    };
  });

  console.log('Assistant Message Evaluation:', JSON.stringify(assistantMsgData, null, 2));

  // 5. Test Citation Modal Click
  if (assistantMsgData && assistantMsgData.citationCount > 0) {
    console.log('Testing citation modal click on first citation...');
    const modalTriggered = await page.evaluate(() => {
      const bubble = document.querySelector('.rounded-tl-none');
      const citBtn = Array.from(bubble.querySelectorAll('button')).find(b => b.innerText.includes('FIND-') || b.innerText.includes('AUD-'));
      if (citBtn) {
        citBtn.click();
        return true;
      }
      return false;
    });

    await new Promise(r => setTimeout(r, 1500));

    const modalData = await page.evaluate(() => {
      const modal = document.querySelector('.shadow-elevated');
      return {
        isOpen: Boolean(modal),
        title: modal?.querySelector('h3')?.innerText,
        text: modal?.innerText.slice(0, 200)
      };
    });
    console.log('Citation Modal Evaluation:', JSON.stringify(modalData, null, 2));
  }

  // 6. Save Screenshot
  const outPath = path.join(__dirname, '../docs/screenshots/after/09_agent_live_turn.png');
  await page.screenshot({ path: outPath, fullPage: false });
  console.log('Saved screenshot to:', outPath);

  await browser.close();
  console.log('Verification completed successfully!');
})();
