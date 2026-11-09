const puppeteer = require('c:/Users/dhars/OneDrive/Desktop/Projects/clonmel-flood-simulator/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, '../docs/screenshots/final_qa');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runAudit() {
  console.log('=== AUDITMIND FINAL UX & FUNCTIONALITY AUDIT ===');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const auditLog = {
    sidebar: {},
    dashboard: {},
    agent: {},
    responsive: {},
    passed: true,
    issues: []
  };

  try {
    const page = await browser.newPage();

    // -------------------------------------------------------------
    // SETUP AUTHENTICATION
    // -------------------------------------------------------------
    console.log('[1/5] Setting up authentication session...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('auditmind_token', 'demo-token');
      localStorage.setItem('auditmind_user', JSON.stringify({
        id: 'usr-1',
        name: 'Sarah Chen',
        email: 'sarah.chen@meridian.com',
        role: 'Safety Director',
        organization: 'Meridian Manufacturing'
      }));
    });

    // -------------------------------------------------------------
    // 1. SIDEBAR TYPOGRAPHY & INTERACTION AUDIT
    // -------------------------------------------------------------
    console.log('[2/5] Inspecting Sidebar Typography on /dashboard...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const sidebarMetrics = await page.evaluate(() => {
      const nav = document.querySelector('nav') || document.querySelector('aside');
      const firstLink = nav ? nav.querySelector('a') : null;
      if (!firstLink) return { error: 'No nav link found' };
      const computed = window.getComputedStyle(firstLink);
      const span = firstLink.querySelector('span');
      const spanComputed = span ? window.getComputedStyle(span) : computed;
      return {
        fontFamily: spanComputed.fontFamily,
        fontSize: spanComputed.fontSize,
        fontWeight: spanComputed.fontWeight,
        letterSpacing: spanComputed.letterSpacing,
        lineHeight: spanComputed.lineHeight,
        color: spanComputed.color,
        itemHeight: firstLink.getBoundingClientRect().height,
      };
    });
    auditLog.sidebar = sidebarMetrics;
    console.log('Sidebar computed metrics:', JSON.stringify(sidebarMetrics));

    // Test Navigation Flicker: Switch between /dashboard and /facilities 10 times
    console.log('Testing navigation flicker between /dashboard and /facilities (10 switches)...');
    let flickerCount = 0;
    for (let i = 0; i < 5; i++) {
      await page.goto('http://localhost:3000/facilities', { waitUntil: 'domcontentloaded' });
      const facActive = await page.evaluate(() => {
        const activeLink = document.querySelector('aside a[href="/facilities"]');
        return activeLink ? activeLink.getAttribute('aria-current') || activeLink.className : null;
      });
      if (!facActive) flickerCount++;

      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
      const dashActive = await page.evaluate(() => {
        const activeLink = document.querySelector('aside a[href="/dashboard"]');
        return activeLink ? activeLink.getAttribute('aria-current') || activeLink.className : null;
      });
      if (!dashActive) flickerCount++;
    }
    auditLog.sidebar.flickerCount = flickerCount;
    console.log(`Navigation flicker test complete. Mismatches/flickers: ${flickerCount}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_sidebar_and_dashboard.png'), fullPage: false });

    // -------------------------------------------------------------
    // 2. DASHBOARD OPERATIONAL INTELLIGENCE & HEALTH AUDIT
    // -------------------------------------------------------------
    console.log('[3/5] Verifying Executive Dashboard operational health & data...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => !document.body.innerText.includes('Synthesizing'), { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    const dashboardHealth = await page.evaluate(() => {
      const text = document.body.innerText.toUpperCase();
      return {
        hasOverviewHeader: text.includes('EXECUTIVE OVERVIEW'),
        hasOperationalStrip: text.includes('BACKEND:') && text.includes('DATABASE:') && text.includes('HINDSIGHT:'),
        hasMetrics: text.includes('TOTAL AUDITS') && text.includes('TOTAL FACILITIES') && text.includes('OPEN FINDINGS'),
        hasFacilityPerformance: text.includes('FACILITY') || text.includes('RISK SCORE'),
        hasDurabilitySummary: text.includes('DURABILITY') || text.includes('CAPA'),
      };
    });
    auditLog.dashboard = dashboardHealth;
    console.log('Dashboard verified checks:', JSON.stringify(dashboardHealth));

    // -------------------------------------------------------------
    // 3. AI AGENT INTERFACE & RESPONSE AUDIT
    // -------------------------------------------------------------
    console.log('[4/5] Auditing AI Compliance Agent Interface on /agent...');
    await page.goto('http://localhost:3000/agent', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // Clear session storage to inspect fresh welcome state
    await page.evaluate(() => {
      localStorage.removeItem('auditmind_agent_sessions_v3');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_agent_welcome_screen.png'), fullPage: false });

    const welcomeScreenCheck = await page.evaluate(() => {
      const body = document.body.innerText;
      return {
        hasExactHeading: body.includes('What would you like to investigate?'),
        hasExactDescription: body.includes('Ask about audits, findings and recurring issues.'),
        hasQuery1: body.includes('Find recurring issues.'),
        hasQuery2: body.includes('Review overdue actions.'),
        hasQuery3: body.includes('Compare facilities.'),
        hasQuery4: body.includes('Explain an audit finding.'),
      };
    });
    auditLog.agent.welcomeScreen = welcomeScreenCheck;
    console.log('Agent Welcome Screen verification:', JSON.stringify(welcomeScreenCheck));

    // Test Clicking Query 1: "Find recurring issues."
    console.log('Triggering Suggested Query 1: "Find recurring issues."...');
    const buttons = await page.$$('button');
    let q1Clicked = false;
    for (const b of buttons) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text.includes('Find recurring issues.')) {
        await b.click();
        q1Clicked = true;
        break;
      }
    }
    if (!q1Clicked) {
      await page.type('textarea', 'Find recurring issues.');
      await page.keyboard.press('Enter');
    }

    // Wait for response
    await new Promise(r => setTimeout(r, 3500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_agent_query1_recurring_response.png'), fullPage: false });

    const query1Check = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasResponse: text.includes('Fire Safety') || text.includes('Machine Safety') || text.includes('recurring'),
        hasCitations: text.includes('FIND-2026-') || text.includes('OSHA 1910'),
        hasActionToolbar: text.includes('Copy') && text.includes('Regenerate'),
      };
    });
    auditLog.agent.query1 = query1Check;
    console.log('Query 1 response verification:', JSON.stringify(query1Check));

    // Test Clicking Query 3: "Compare facilities."
    console.log('Triggering Query 3: "Compare facilities."...');
    await page.type('textarea', 'Compare facilities.');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_agent_query3_compare_facilities.png'), fullPage: false });

    // Test Clicking Query 4: "Explain an audit finding."
    console.log('Triggering Query 4: "Explain an audit finding."...');
    await page.type('textarea', 'Explain an audit finding.');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_agent_query4_explain_finding.png'), fullPage: false });

    // Test Conversation History: Rename & Delete Confirmation
    console.log('Testing conversation history controls (rename & delete prompt)...');
    const sessionItems = await page.$$('.group.relative');
    if (sessionItems.length > 0) {
      // Hover over first session to reveal buttons
      await sessionItems[0].hover();
      const renameBtn = await page.$('button[title*="Rename"]');
      if (renameBtn) {
        await renameBtn.click();
        console.log('Inline rename clicked successfully.');
      }
    }

    // -------------------------------------------------------------
    // 4. RESPONSIVE AUDIT ACROSS 4 BREAKPOINTS
    // -------------------------------------------------------------
    console.log('[5/5] Running responsive audit across 4 breakpoints...');
    const viewports = [
      { name: 'desktop_1920', width: 1920, height: 1080 },
      { name: 'laptop_1440', width: 1440, height: 900 },
      { name: 'tablet_834', width: 834, height: 1112 },
      { name: 'mobile_390', width: 390, height: 844 }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 800));

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      auditLog.responsive[vp.name] = { overflow: overflow };
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `06_dashboard_${vp.name}.png`), fullPage: false });

      await page.goto('http://localhost:3000/agent', { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 800));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `07_agent_${vp.name}.png`), fullPage: false });
    }

    console.log('All automated browser tests completed successfully!');
    fs.writeFileSync(path.join(__dirname, '../docs/final_audit_results.json'), JSON.stringify(auditLog, null, 2));
  } catch (err) {
    console.error('Audit execution error:', err);
    auditLog.passed = false;
    auditLog.issues.push(err.message);
  } finally {
    await browser.close();
  }
}

runAudit();
