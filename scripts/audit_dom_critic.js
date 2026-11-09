const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));

const ROUTES = [
  '/',
  '/facilities',
  '/audits',
  '/findings',
  '/memory',
  '/recurring',
  '/capa',
  '/evidence',
  '/agent',
];

async function runCriticAudit() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const auditReport = [];

  for (const route of ROUTES) {
    const url = `http://localhost:3000${route}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 800));

    const pageCritique = await page.evaluate((rPath) => {
      // 1. Check loaded fonts on headings and body
      const bodyFont = window.getComputedStyle(document.body).fontFamily;
      const h1El = document.querySelector('h1');
      const h1Font = h1El ? window.getComputedStyle(h1El).fontFamily : 'None';
      const h1FontSize = h1El ? window.getComputedStyle(h1El).fontSize : 'None';

      // 2. Scan all elements for rogue colors (blues, indigos, purples, generic teals)
      const allElements = Array.from(document.querySelectorAll('*'));
      const rogueClasses = [];
      const colorSamples = [];

      allElements.forEach(el => {
        const cls = el.className;
        if (typeof cls === 'string') {
          // Check for legacy classes
          if (cls.includes('text-blue-') || cls.includes('bg-blue-') || 
              cls.includes('text-indigo-') || cls.includes('bg-indigo-') ||
              cls.includes('text-purple-') || cls.includes('bg-purple-') ||
              cls.includes('teal-intelligence') || cls.includes('brand-navy')) {
            rogueClasses.push({ tag: el.tagName, class: cls.substring(0, 100) });
          }
        }
      });

      // 3. Check contrast on buttons and badges
      const buttons = Array.from(document.querySelectorAll('button')).slice(0, 10).map(b => {
        const style = window.getComputedStyle(b);
        return {
          text: b.innerText.trim().substring(0, 25),
          color: style.color,
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
          fontFamily: style.fontFamily
        };
      });

      // 4. Check horizontal overflow (bad layouts)
      const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;

      // 5. Check cards padding and border-radii
      const cards = Array.from(document.querySelectorAll('.rounded-xl, .rounded-2xl')).slice(0, 5).map(c => {
        const style = window.getComputedStyle(c);
        return {
          padding: style.padding,
          borderRadius: style.borderRadius,
          backgroundColor: style.backgroundColor,
          border: style.border
        };
      });

      return {
        route: rPath,
        bodyFont,
        h1Font,
        h1FontSize,
        hasHorizontalScroll,
        rogueClassCount: rogueClasses.length,
        rogueSample: rogueClasses.slice(0, 5),
        buttonCount: buttons.length,
        sampleButtons: buttons.slice(0, 4),
        cardCount: cards.length,
        sampleCard: cards[0] || null
      };
    }, route);

    auditReport.push(pageCritique);
  }

  await browser.close();
  console.log(JSON.stringify(auditReport, null, 2));
}

runCriticAudit().catch(err => {
  console.error("Critic audit failed:", err);
  process.exit(1);
});
