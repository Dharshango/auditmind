const puppeteer = require('c:/Users/dhars/OneDrive/Desktop/Projects/clonmel-flood-simulator/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

async function verifySidebar() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // 1. Desktop 1920x1080
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Extract computed metrics
  const metrics = await page.evaluate(() => {
    const brand = document.querySelector('aside a span.font-bold');
    const brandComputed = brand ? window.getComputedStyle(brand) : null;

    const sectionHeader = document.querySelector('aside nav div > div');
    const sectionComputed = sectionHeader ? window.getComputedStyle(sectionHeader) : null;

    const navItems = Array.from(document.querySelectorAll('aside nav a'));
    const firstNavItem = navItems[0];
    const navComputed = firstNavItem ? window.getComputedStyle(firstNavItem) : null;

    const navLabel = firstNavItem ? firstNavItem.querySelector('span.truncate') : null;
    const labelComputed = navLabel ? window.getComputedStyle(navLabel) : null;

    const navIcon = firstNavItem ? firstNavItem.querySelector('svg') : null;
    const iconComputed = navIcon ? window.getComputedStyle(navIcon) : null;
    const iconRect = navIcon ? navIcon.getBoundingClientRect() : null;

    const activeItem = navItems.find(el => el.getAttribute('aria-current') === 'page') || navItems[0];
    const activeComputed = activeItem ? window.getComputedStyle(activeItem) : null;

    const sidebar = document.querySelector('aside');
    const sidebarComputed = sidebar ? window.getComputedStyle(sidebar) : null;
    const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;

    const itemDetails = navItems.map(item => {
      const label = item.querySelector('span.truncate')?.textContent?.trim() || '';
      const rect = item.getBoundingClientRect();
      const style = window.getComputedStyle(item);
      return {
        label,
        href: item.getAttribute('href'),
        width: rect.width,
        height: rect.height,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        fontWeight: style.fontWeight,
        fontFamily: style.fontFamily
      };
    });

    return {
      sidebar: {
        width: sidebarRect?.width,
        height: sidebarRect?.height,
        backgroundColor: sidebarComputed?.backgroundColor,
        borderRight: sidebarComputed?.borderRight
      },
      brand: {
        text: brand?.textContent?.trim(),
        fontFamily: brandComputed?.fontFamily,
        fontSize: brandComputed?.fontSize,
        fontWeight: brandComputed?.fontWeight,
        letterSpacing: brandComputed?.letterSpacing,
        lineHeight: brandComputed?.lineHeight
      },
      sectionHeader: {
        text: sectionHeader?.textContent?.trim(),
        fontFamily: sectionComputed?.fontFamily,
        fontSize: sectionComputed?.fontSize,
        fontWeight: sectionComputed?.fontWeight,
        letterSpacing: sectionComputed?.letterSpacing,
        color: sectionComputed?.color
      },
      navItemBox: {
        height: firstNavItem?.getBoundingClientRect().height,
        padding: navComputed?.padding,
        gap: navComputed?.gap
      },
      navIcon: {
        width: iconRect?.width,
        height: iconRect?.height
      },
      navLabel: {
        fontFamily: labelComputed?.fontFamily,
        fontSize: labelComputed?.fontSize,
        fontWeight: labelComputed?.fontWeight,
        letterSpacing: labelComputed?.letterSpacing,
        lineHeight: labelComputed?.lineHeight,
        color: labelComputed?.color
      },
      activeItem: {
        borderLeft: activeComputed?.borderLeft,
        backgroundColor: activeComputed?.backgroundColor,
        color: activeComputed?.color
      },
      itemDetails
    };
  });

  const screenshotsDir = path.join(__dirname, 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Screenshot 1: Desktop Expanded
  await page.screenshot({ path: path.join(screenshotsDir, 'phase1_desktop_sidebar_expanded.png'), fullPage: false });

  // Collapse sidebar
  const collapseBtn = await page.$('aside button[aria-label*="Collapse"]');
  if (collapseBtn) {
    await collapseBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(screenshotsDir, 'phase1_desktop_sidebar_collapsed.png'), fullPage: false });
  }

  // 2. Laptop 1440x900
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/facilities', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(screenshotsDir, 'phase1_laptop_sidebar.png'), fullPage: false });

  // 3. Tablet 1024x768
  await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/audits', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(screenshotsDir, 'phase1_tablet_sidebar.png'), fullPage: false });

  // 4. Mobile 375x812
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  
  // Click hamburger menu
  const menuBtn = await page.$('header button[aria-label*="drawer"]');
  if (menuBtn) {
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }
  await page.screenshot({ path: path.join(screenshotsDir, 'phase1_mobile_drawer_open.png'), fullPage: false });

  await browser.close();

  fs.writeFileSync(
    path.join(__dirname, 'docs', 'phase1_sidebar_metrics.json'),
    JSON.stringify(metrics, null, 2),
    'utf-8'
  );

  console.log('Verification completed successfully!');
  console.log('Metrics:', JSON.stringify(metrics, null, 2));
}

verifySidebar().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
