const puppeteer = require('c:/Users/dhars/OneDrive/Desktop/Projects/clonmel-flood-simulator/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

async function verifyDashboard() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const screenshotsDir = path.join(__dirname, 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Desktop 1920x1080
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Extract DOM data
  const data = await page.evaluate(() => {
    const title = document.querySelector('h1')?.textContent?.trim();
    const subtitle = document.querySelector('h1 + p')?.textContent?.trim();

    // Health strip items
    const healthNodes = Array.from(document.querySelectorAll('div.bg-\\[\\#09090B\\] div.flex.items-center.gap-2')).map(el => el.textContent?.trim().replace(/\s+/g, ' '));

    // Metric items
    const metricBoxes = Array.from(document.querySelectorAll('div.bg-\\[\\#101012\\] div.p-3, div.bg-\\[\\#101012\\] div.sm\\:p-4')).map(el => {
      const label = el.querySelector('div:first-child')?.textContent?.trim();
      const value = el.querySelector('div:nth-child(2)')?.textContent?.trim();
      const sub = el.querySelector('div:last-child')?.textContent?.trim();
      return { label, value, sub };
    }).filter(m => m.label && m.value);

    // Priority Intelligence items
    const priorityHeaders = Array.from(document.querySelectorAll('h2'));
    const priorityH2 = priorityHeaders.find(h => h.textContent.includes('Priority Intelligence'));
    const prioritySection = priorityH2 ? priorityH2.closest('div.bg-\\[\\#101012\\]') : null;
    const priorityCards = Array.from(prioritySection?.querySelectorAll('div.p-4.rounded-xl') || []);
    const priorityData = priorityCards.map(el => ({
      title: el.querySelector('h3')?.textContent?.trim(),
      explanation: el.querySelector('p')?.textContent?.trim(),
      badge: el.querySelector('span.text-\\[9\\.5px\\]')?.textContent?.trim(),
      facility: el.querySelector('span.font-mono')?.textContent?.trim(),
    }));

    // Facility items
    const facilityH2 = priorityHeaders.find(h => h.textContent.includes('Facility Performance Matrix'));
    const facilitySection = facilityH2 ? facilityH2.closest('div.bg-\\[\\#101012\\]') : null;
    const facilityCards = Array.from(facilitySection?.querySelectorAll('div.py-3\\.5') || []);
    const facilityData = facilityCards.map(el => ({
      name: el.querySelector('span.font-semibold.text-sm')?.textContent?.trim(),
      code: el.querySelector('span.text-\\[10px\\]')?.textContent?.trim(),
      risk: el.querySelector('div.text-xs.font-mono')?.textContent?.trim(),
    }));

    // CAPA Effectiveness
    const capaH2 = priorityHeaders.find(h => h.textContent.includes('Corrective Action Effectiveness'));
    const capaSection = capaH2 ? capaH2.closest('div.bg-\\[\\#101012\\]') : null;
    const capaBoxes = Array.from(capaSection?.querySelectorAll('div.p-3\\.5.rounded-xl') || []).map(el => ({
      label: el.querySelector('div:first-child')?.textContent?.trim(),
      value: el.querySelector('div:nth-child(2)')?.textContent?.trim(),
    }));
    const durabilityRate = capaSection?.querySelector('span.font-mono.text-white.font-bold')?.textContent?.trim();

    return {
      title,
      subtitle,
      healthNodes,
      metricBoxes,
      priorityCount: priorityData.length,
      priorityData,
      facilityCount: facilityData.length,
      facilityData,
      capaBoxes,
      durabilityRate
    };
  });

  // Capture Screenshot 1: Desktop Full Dashboard
  await page.screenshot({ path: path.join(screenshotsDir, 'phase2_desktop_dashboard.png'), fullPage: false });

  // Test Facility Filter Interactivity: click dropdown and select FAC-001
  await page.evaluate(() => {
    // Open facility dropdown
    const buttons = Array.from(document.querySelectorAll('button'));
    const facBtn = buttons.find(b => b.textContent.includes('Facilities') || b.textContent.includes('Sites'));
    if (facBtn) facBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const plantABtn = buttons.find(b => b.textContent.includes('Apex Plant A'));
    if (plantABtn) plantABtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(screenshotsDir, 'phase2_desktop_filtered_plantA.png'), fullPage: false });

  // 2. Laptop 1440x900
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(screenshotsDir, 'phase2_laptop_dashboard.png'), fullPage: false });

  // 3. Tablet 1024x768
  await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(screenshotsDir, 'phase2_tablet_dashboard.png'), fullPage: false });

  // 4. Mobile 375x812
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(screenshotsDir, 'phase2_mobile_dashboard.png'), fullPage: false });

  await browser.close();

  fs.writeFileSync(
    path.join(__dirname, 'docs', 'phase2_dashboard_verification.json'),
    JSON.stringify(data, null, 2),
    'utf-8'
  );

  console.log('Phase 2 verification completed successfully!');
  console.log('Results:', JSON.stringify(data, null, 2));
}

verifyDashboard().catch(err => {
  console.error('Error during Phase 2 dashboard verification:', err);
  process.exit(1);
});
