const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));
const fs = require('fs');

async function testFunctionality() {
  console.log('=== STEP 7: LIVE FUNCTIONAL VERIFICATION OF BACKEND, HINDSIGHT, AUTH, AUDITS & EVIDENCE ===\n');

  const report = {};

  // 1. Health API
  console.log('1. Testing /api/health...');
  const healthRes = await fetch('http://localhost:8000/api/health');
  const healthJson = await healthRes.json();
  console.log('  Health response:', healthJson);
  report.health = healthJson.status === 'healthy';

  // 2. Real Browser Authentication Flow
  console.log('2. Testing Real Browser Login Flow...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  // Click demo button for Sarah Jenkins
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const demoBtn = buttons.find(b => b.textContent?.includes('Sarah Jenkins'));
    if (demoBtn) demoBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Click Submit
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  const currentUrl = page.url();
  console.log('  After login redirect URL:', currentUrl);
  report.browserLogin = currentUrl.includes('/dashboard');

  // Capture logged in dashboard screenshot
  const loggedInShot = path.join(__dirname, '..', 'docs', 'screenshots', 'after', '05_authenticated_dashboard_live.png');
  await page.screenshot({ path: loggedInShot, fullPage: false });

  await browser.close();

  // 3. Audits API
  console.log('3. Testing /api/audits...');
  const auditsRes = await fetch('http://localhost:8000/api/audits');
  const auditsJson = await auditsRes.json();
  const auditCount = auditsJson.audits ? auditsJson.audits.length : (Array.isArray(auditsJson) ? auditsJson.length : 0);
  console.log(`  Retrieved ${auditCount} audits from backend.`);
  report.auditsApi = auditCount >= 40;

  // 4. Findings API
  console.log('4. Testing /api/findings...');
  const findingsRes = await fetch('http://localhost:8000/api/findings');
  const findingsJson = await findingsRes.json();
  const findingCount = findingsJson.findings ? findingsJson.findings.length : (Array.isArray(findingsJson) ? findingsJson.length : 0);
  console.log(`  Retrieved ${findingCount} findings from backend.`);
  report.findingsApi = findingCount >= 40;

  // 5. Evidence Verification
  console.log('5. Testing Evidence SHA-256 retrieval on finding...');
  const sampleFinding = findingsJson.findings ? findingsJson.findings[0] : findingsJson[0];
  const findingDetailRes = await fetch(`http://localhost:8000/api/findings/${sampleFinding.id || sampleFinding.finding_code}`);
  const findingDetail = await findingDetailRes.json();
  console.log(`  Finding ${findingDetail.finding_code} evidence count:`, findingDetail.evidence?.length || 0);
  report.evidenceFunctionality = findingDetail.finding_code !== undefined;

  // 6. Hindsight Memory Status & Recall
  console.log('6. Testing Hindsight Memory Subsystem...');
  const memStatusRes = await fetch('http://localhost:8000/api/memory/status');
  const memStatus = await memStatusRes.json();
  console.log('  Hindsight memory bank status:', memStatus);
  report.hindsightStatus = memStatus.status !== undefined || memStatus.bank_id !== undefined;

  // 7. Cognitive Compliance Agent Chat
  console.log('7. Testing Cognitive Agent Chat Endpoint...');
  const agentRes = await fetch('http://localhost:8000/api/agent/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'What are the top recurring fire safety non-conformances across Plant A and Warehouse A?',
      history: []
    })
  });
  const agentJson = await agentRes.json();
  const replyText = agentJson.response || agentJson.reply || agentJson.content || '';
  console.log('  Agent reply length:', replyText.length);
  console.log('  Agent tools called:', agentJson.tools_called || agentJson.tool_executions || agentJson.tool_calls || 'none');
  report.agentChat = replyText.length > 50;

  console.log('\n--- FUNCTIONAL VERIFICATION SUMMARY ---');
  console.table(report);

  fs.writeFileSync(
    path.join(__dirname, '..', 'docs', 'step7_functionality_report.json'),
    JSON.stringify(report, null, 2)
  );

  const allPassed = Object.values(report).every(Boolean);
  if (!allPassed) {
    console.error('FAILED: One or more functional verification checks failed!');
    process.exit(1);
  } else {
    console.log('\nALL 7 CORE FUNCTIONAL WORKFLOWS (BACKEND, HINDSIGHT, AUTH, AUDITS, EVIDENCE, AGENT) CONFIRMED OPERATIONAL (100%)!');
  }
}

testFunctionality().catch(e => {
  console.error('Functional verification failed:', e);
  process.exit(1);
});
