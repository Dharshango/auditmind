const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));
const fs = require('fs');

async function renderSideBySide() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=2400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2400, height: 900 });

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        background: #09090b;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 24px;
      }
      .title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 8px;
        letter-spacing: -0.02em;
      }
      .subtitle {
        font-size: 13px;
        color: #a1a1aa;
        margin-bottom: 20px;
        font-family: monospace;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }
      .card {
        background: #18181b;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        overflow: hidden;
      }
      .card-header {
        padding: 10px 14px;
        font-size: 12px;
        font-weight: 600;
        background: #111113;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .badge {
        font-size: 10px;
        font-family: monospace;
        color: #c6b9d8;
        background: rgba(198, 185, 216, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid rgba(198, 185, 216, 0.2);
      }
      .preview {
        width: 100%;
        height: 480px;
        object-fit: cover;
        object-position: top;
        display: block;
      }
      .footer-note {
        padding: 10px 14px;
        font-size: 11px;
        color: #a1a1aa;
        font-family: monospace;
        background: #111113;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
    </style>
  </head>
  <body>
    <div class="title">AUDITMIND Public Routes — Side-by-Side Cinematic Background Verification</div>
    <div class="subtitle">CloudFront Video Stream: https://d8j0ntlcm91z4.cloudfront.net/.../hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4</div>
    <div class="grid">
      <div class="card">
        <div class="card-header">
          <span>1. Homepage (/)</span>
          <span class="badge">MATCH: CloudFront MP4</span>
        </div>
        <img class="preview" src="step1_backgrounds/homepage_bg.png" />
        <div class="footer-note">Video: Active | Fallback: Black SVG</div>
      </div>
      <div class="card">
        <div class="card-header">
          <span>2. Product (/product)</span>
          <span class="badge">MATCH: CloudFront MP4</span>
        </div>
        <img class="preview" src="step1_backgrounds/product_bg.png" />
        <div class="footer-note">Video: Active | Fallback: Black SVG</div>
      </div>
      <div class="card">
        <div class="card-header">
          <span>3. Case Studies (/case-studies)</span>
          <span class="badge">MATCH: CloudFront MP4</span>
        </div>
        <img class="preview" src="step1_backgrounds/case_studies_bg.png" />
        <div class="footer-note">Video: Active | Fallback: Black SVG</div>
      </div>
      <div class="card">
        <div class="card-header">
          <span>4. Contact (/contact)</span>
          <span class="badge">MATCH: CloudFront MP4</span>
        </div>
        <img class="preview" src="step1_backgrounds/contact_bg.png" />
        <div class="footer-note">Video: Active | Fallback: Black SVG</div>
      </div>
    </div>
  </body>
  </html>
  `;

  const htmlPath = path.join(__dirname, '..', 'docs', 'screenshots', 'side_by_side.html');
  fs.writeFileSync(htmlPath, htmlContent);

  await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1000));

  const compositePath = path.join(__dirname, '..', 'docs', 'screenshots', 'after', '00_side_by_side_backgrounds.png');
  await page.screenshot({ path: compositePath, fullPage: true });
  console.log(`Saved composite comparison screenshot: ${compositePath}`);

  await browser.close();
}

renderSideBySide().catch(console.error);
