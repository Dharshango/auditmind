const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));
const fs = require('fs');

const ROUTES = [
  { name: 'Landing Page', path: '/' },
  { name: 'Product Page', path: '/product' },
  { name: 'Case Studies', path: '/case-studies' },
  { name: 'Contact Page', path: '/contact' },
  { name: 'Login Page', path: '/login' },
  { name: 'Executive Overview', path: '/dashboard' },
  { name: 'Facility Network', path: '/facilities' },
  { name: 'Audit Management', path: '/audits' },
  { name: 'Findings Ledger', path: '/findings' },
  { name: 'Memory Explorer', path: '/memory' },
  { name: 'Recurring Failures', path: '/recurring' },
  { name: 'CAPA Center', path: '/capa' },
  { name: 'Evidence Vault', path: '/evidence' },
  { name: 'AI Compliance Agent', path: '/agent' },
];

async function runContrastAudit() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Set auth credentials in localStorage so dashboard routes render
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem("auditmind_auth_token", "demo-token");
    localStorage.setItem("auditmind_user", JSON.stringify({ email: "sarah.j@meridian-ind.com", name: "Sarah Jenkins" }));
    document.cookie = "auditmind_auth_token=demo-token; path=/; max-age=86400; SameSite=Lax";
  });

  const auditResults = [];

  for (const r of ROUTES) {
    const url = `http://localhost:3000${r.path}`;
    console.log(`Auditing text & contrast on ${r.name} (${url})...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise(res => setTimeout(res, 1500));

      const pageAnalysis = await page.evaluate((routeName, routePath) => {
        // Luminance calculation
        function parseRgb(colorStr) {
          const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (!m) return null;
          return {
            r: parseInt(m[1], 10),
            g: parseInt(m[2], 10),
            b: parseInt(m[3], 10),
            a: m[4] !== undefined ? parseFloat(m[4]) : 1
          };
        }

        function getLuminance(r, g, b) {
          const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
        }

        function getContrast(rgb1, rgb2) {
          const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
          const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
          return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        }

        function getEffectiveBg(el) {
          let curr = el;
          while (curr && curr !== document.documentElement) {
            const style = window.getComputedStyle(curr);
            const bg = parseRgb(style.backgroundColor);
            if (bg && bg.a > 0.5) {
              return bg;
            }
            curr = curr.parentElement;
          }
          return { r: 0, g: 0, b: 0, a: 1 }; // default black
        }

        const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, label, input, kbd, th, td'));
        const issues = [];
        let totalChecked = 0;

        for (const el of elements) {
          const text = el.innerText ? el.innerText.trim() : (el.value || el.placeholder || '');
          if (!text || text.length === 0 || el.children.length > 3) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(el).display === 'none') continue;

          totalChecked++;
          const style = window.getComputedStyle(el);
          const fg = parseRgb(style.color);
          const bg = getEffectiveBg(el);

          if (fg && bg) {
            // Check effective opacity
            let effectiveFg = { ...fg };
            let p = el;
            let totalOpacity = 1;
            while (p && p !== document.body) {
              totalOpacity *= parseFloat(window.getComputedStyle(p).opacity || '1');
              p = p.parentElement;
            }

            const fontSize = parseFloat(style.fontSize);
            const isBold = parseInt(style.fontWeight, 10) >= 600;
            const isLarge = fontSize >= 18 || (fontSize >= 14 && isBold);
            const requiredRatio = isLarge ? 3.0 : 4.5;

            // Blend fg with black or bg if opacity < 1
            const blendedFg = {
              r: Math.round(effectiveFg.r * totalOpacity + bg.r * (1 - totalOpacity)),
              g: Math.round(effectiveFg.g * totalOpacity + bg.g * (1 - totalOpacity)),
              b: Math.round(effectiveFg.b * totalOpacity + bg.b * (1 - totalOpacity)),
            };

            const ratio = getContrast(blendedFg, bg);
            if (ratio < requiredRatio) {
              issues.push({
                tag: el.tagName.toLowerCase(),
                text: text.slice(0, 40),
                fg: style.color,
                bg: `rgb(${bg.r},${bg.g},${bg.b})`,
                opacity: totalOpacity,
                fontSize: `${fontSize}px`,
                fontWeight: style.fontWeight,
                ratio: ratio.toFixed(2),
                required: requiredRatio
              });
            }
          }
        }

        return {
          route: routeName,
          path: routePath,
          totalChecked,
          issueCount: issues.length,
          issues: issues.slice(0, 15) // Top 15 issues
        };
      }, r.name, r.path);

      auditResults.push(pageAnalysis);
    } catch (err) {
      console.error(`Error auditing ${r.name}:`, err.message);
      auditResults.push({
        route: r.name,
        path: r.path,
        error: err.message
      });
    }
  }

  await browser.close();

  fs.writeFileSync(
    path.join(__dirname, '..', 'docs', 'raw_contrast_audit.json'),
    JSON.stringify(auditResults, null, 2)
  );
  console.log('Contrast audit complete. Results saved to docs/raw_contrast_audit.json');
}

runContrastAudit().catch(console.error);
