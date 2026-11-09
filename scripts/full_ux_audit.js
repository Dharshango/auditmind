const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));
const fs = require('fs');

const ROUTES = [
  { name: 'Dashboard', path: '/' },
  { name: 'Facilities', path: '/facilities' },
  { name: 'Audits', path: '/audits' },
  { name: 'Findings', path: '/findings' },
  { name: 'Memory', path: '/memory' },
  { name: 'Recurring', path: '/recurring' },
  { name: 'CAPA', path: '/capa' },
  { name: 'Evidence', path: '/evidence' },
  { name: 'Agent', path: '/agent' },
];

async function runUXAudit() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const auditResults = [];

  for (const r of ROUTES) {
    const url = `http://localhost:3000${r.path}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(res => setTimeout(res, 800));

    const pageAudit = await page.evaluate((routeName) => {
      // 1. Text elements analysis
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
        tag: h.tagName,
        text: h.innerText.trim(),
        length: h.innerText.trim().length
      }));

      const paragraphs = Array.from(document.querySelectorAll('p, .text-xs, .text-sm')).map(p => p.innerText.trim()).filter(t => t.length > 0);

      // 2. Scan for broken or corrupted tokens
      const textContent = document.body.innerText;
      const issues = [];

      const brokenPatterns = ['undefined', 'null', 'NaN', 'TODO', 'FIXME', 'Lorem ipsum', '[object Object]'];
      brokenPatterns.forEach(pattern => {
        if (textContent.includes(pattern)) {
          issues.push({ type: 'CORRUPTED_TEXT', pattern });
        }
      });

      // 3. Scan for wordy sentences (> 25 words)
      const longSentences = [];
      paragraphs.forEach(p => {
        const sentences = p.split(/[.!?]+/);
        sentences.forEach(s => {
          const wordCount = s.trim().split(/\s+/).length;
          if (wordCount > 25) {
            longSentences.push({ text: s.trim().substring(0, 120) + '...', words: wordCount });
          }
        });
      });

      // 4. Check buttons & interactive elements
      const buttons = Array.from(document.querySelectorAll('button, a')).map(b => b.innerText.trim()).filter(t => t.length > 0 && t.length < 50);

      // 5. Check inputs & filters
      const inputs = Array.from(document.querySelectorAll('input, select')).map(i => ({
        type: i.tagName,
        placeholder: i.placeholder || '',
        value: i.value || ''
      }));

      return {
        routeName,
        title: headings.find(h => h.tag === 'H1')?.text || 'No H1',
        subtitle: paragraphs[0] || '',
        headingsCount: headings.length,
        headingsSample: headings.slice(0, 5),
        issuesFound: issues,
        longSentenceCount: longSentences.length,
        longSentencesSample: longSentences.slice(0, 4),
        buttonLabels: buttons.slice(0, 8),
        inputsSample: inputs.slice(0, 4)
      };
    }, r.name);

    auditResults.push(pageAudit);
  }

  // Mobile responsiveness check (390x844)
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  for (const r of [ROUTES[0], ROUTES[8]]) {
    await page.goto(`http://localhost:3000${r.path}`, { waitUntil: 'networkidle0', timeout: 15000 });
    const mobileCheck = await page.evaluate((rName) => {
      const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
      return {
        routeName: rName,
        hasHorizontalScroll,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth
      };
    }, r.name);
    auditResults.push({ mobileCheck });
  }

  await browser.close();
  console.log(JSON.stringify(auditResults, null, 2));
}

runUXAudit().catch(err => {
  console.error("Audit script failed:", err);
  process.exit(1);
});
