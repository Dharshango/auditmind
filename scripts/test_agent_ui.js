const puppeteer = require('c:/Users/dhars/OneDrive/Desktop/Projects/clonmel-flood-simulator/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Navigating to http://localhost:3000/login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

    // Set demo token & user in localStorage
    await page.evaluate(() => {
      localStorage.setItem('auditmind_token', 'demo-token');
      localStorage.setItem('auditmind_user', JSON.stringify({
        id: 'usr-1',
        name: 'Sarah Chen',
        email: 'sarah.chen@meridian.com',
        role: 'Safety Director',
        organization: 'Meridian Manufacturing'
      }));
      // Clear previous agent conversation to show pristine benchmark state
      localStorage.removeItem('auditmind_agent_sessions_v3');
    });

    console.log('Navigating to http://localhost:3000/agent...');
    await page.goto('http://localhost:3000/agent', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Capture Welcome Screen with 5 Benchmark Scenarios
    const screenDir = 'c:/Users/dhars/OneDrive/Desktop/Projects/AUDITMIND/docs/screenshots';
    if (!fs.existsSync(screenDir)) {
      fs.mkdirSync(screenDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(screenDir, 'agent_welcome_benchmarks.png'), fullPage: false });
    console.log('Saved agent_welcome_benchmarks.png');

    // Click on Benchmark 2: "Why is Warehouse A repeatedly experiencing fire-safety documentation problems?"
    console.log('Testing Benchmark 2...');
    const buttons = await page.$$('button');
    let clicked = false;
    for (const b of buttons) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text.includes('Warehouse Fire-Safety Recurrence') || text.includes('Why is Warehouse A')) {
        await b.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      console.log('Fallback: Typing Benchmark 2 into composer...');
      await page.type('textarea', 'Why is Warehouse A repeatedly experiencing fire-safety documentation problems?');
      await page.keyboard.press('Enter');
    }

    // Wait for response to render
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(screenDir, 'agent_benchmark_2_modular_response.png'), fullPage: false });
    console.log('Saved agent_benchmark_2_modular_response.png');

    // Test Benchmark 3: "Was the last corrective action effective?"
    console.log('Testing Benchmark 3: Was the last corrective action effective?');
    await page.type('textarea', 'Was the last corrective action effective?');
    const sendBtn = await page.$('button[title*="Send"], button:has(svg.lucide-send)');
    if (sendBtn) {
      await sendBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(screenDir, 'agent_benchmark_3_durability_response.png'), fullPage: false });
    console.log('Saved agent_benchmark_3_durability_response.png');

    // Test Benchmark 1: "How many facilities currently have open findings?"
    console.log('Testing Benchmark 1: How many facilities currently have open findings?');
    await page.type('textarea', 'How many facilities currently have open findings?');
    await page.keyboard.press('Enter');

    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(screenDir, 'agent_benchmark_1_factual_response.png'), fullPage: false });
    console.log('Saved agent_benchmark_1_factual_response.png');

    console.log('All agent browser UI tests completed successfully!');
  } catch (err) {
    console.error('Puppeteer error:', err);
  } finally {
    await browser.close();
  }
}

run();
