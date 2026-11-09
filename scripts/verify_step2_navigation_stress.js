const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));
const fs = require('fs');

async function testNavigationStress() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('=== STEP 2: STRESS-TESTING NAVIGATION TRANSITIONS (>=10 CYCLES) ===\n');

  // Seed authentication
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem("auditmind_auth_token", "demo-token");
    localStorage.setItem("auditmind_user", JSON.stringify({ email: "sarah.j@meridian-ind.com", name: "Sarah Jenkins" }));
    document.cookie = "auditmind_auth_token=demo-token; path=/; max-age=86400; SameSite=Lax";
  });

  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const cyclesData = [];
  const TOTAL_CYCLES = 12; // Test 12 cycles (>10)

  for (let cycle = 1; cycle <= TOTAL_CYCLES; cycle++) {
    const cycleRecord = {
      cycle,
      steps: []
    };

    // Step A: Switch to /facilities
    await page.click('aside nav a[href="/facilities"]');

    // Sampling at 0ms (immediate), 20ms, 60ms, 120ms, 250ms
    const sampleDelays = [0, 20, 60, 120, 250];
    for (const delay of sampleDelays) {
      if (delay > 0) await new Promise(r => setTimeout(r, delay));
      const activeState = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('aside nav a'));
        const activeLinks = links.filter(l => l.classList.contains('border-white/15'));
        const pips = links.filter(l => {
          const pip = l.querySelector('span.rounded-full.bg-white');
          return pip && window.getComputedStyle(pip).opacity === '1';
        });

        return {
          activeCount: activeLinks.length,
          activeHrefs: activeLinks.map(l => l.getAttribute('href')),
          pipHrefs: pips.map(l => l.getAttribute('href')),
          url: window.location.pathname
        };
      });

      cycleRecord.steps.push({
        target: '/facilities',
        delay: `${delay}ms`,
        ...activeState
      });

      // Strict validation
      if (activeState.activeCount !== 1) {
        throw new Error(`Cycle ${cycle} to /facilities at ${delay}ms: Expected 1 active link, found ${activeState.activeCount} (${JSON.stringify(activeState.activeHrefs)})`);
      }
      if (activeState.activeHrefs[0] !== '/facilities') {
        throw new Error(`Cycle ${cycle} to /facilities at ${delay}ms: Expected ['/facilities'], got ${JSON.stringify(activeState.activeHrefs)}`);
      }
    }

    // Step B: Switch back to /dashboard
    await page.click('aside nav a[href="/dashboard"]');

    for (const delay of sampleDelays) {
      if (delay > 0) await new Promise(r => setTimeout(r, delay));
      const activeState = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('aside nav a'));
        const activeLinks = links.filter(l => l.classList.contains('border-white/15'));
        const pips = links.filter(l => {
          const pip = l.querySelector('span.rounded-full.bg-white');
          return pip && window.getComputedStyle(pip).opacity === '1';
        });

        return {
          activeCount: activeLinks.length,
          activeHrefs: activeLinks.map(l => l.getAttribute('href')),
          pipHrefs: pips.map(l => l.getAttribute('href')),
          url: window.location.pathname
        };
      });

      cycleRecord.steps.push({
        target: '/dashboard',
        delay: `${delay}ms`,
        ...activeState
      });

      if (activeState.activeCount !== 1) {
        throw new Error(`Cycle ${cycle} to /dashboard at ${delay}ms: Expected 1 active link, found ${activeState.activeCount} (${JSON.stringify(activeState.activeHrefs)})`);
      }
      if (activeState.activeHrefs[0] !== '/dashboard') {
        throw new Error(`Cycle ${cycle} to /dashboard at ${delay}ms: Expected ['/dashboard'], got ${JSON.stringify(activeState.activeHrefs)}`);
      }
    }

    cyclesData.push(cycleRecord);
    console.log(`Cycle ${cycle}/${TOTAL_CYCLES} PASSED: zero flicker, exactly 1 active link at all sample points (T+0ms, T+20ms, T+60ms, T+120ms, T+250ms).`);
  }

  // Capture frame proof screenshot on settled state
  const navProofPath = path.join(__dirname, '..', 'docs', 'screenshots', 'after', '05_nav_transition_proof.png');
  await page.screenshot({ path: navProofPath, fullPage: false });

  // Save report
  fs.writeFileSync(
    path.join(__dirname, '..', 'docs', 'step2_navigation_stress_results.json'),
    JSON.stringify(cyclesData, null, 2)
  );

  await browser.close();

  console.log(`\nALL ${TOTAL_CYCLES} STRESS NAVIGATION CYCLES PASSED WITH ZERO FLICKER!`);
}

testNavigationStress().catch(e => {
  console.error('Navigation stress test failed:', e);
  process.exit(1);
});
