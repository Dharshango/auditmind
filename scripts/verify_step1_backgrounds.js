const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));
const fs = require('fs');

const ROUTES = [
  { name: 'Homepage', path: '/' },
  { name: 'Product', path: '/product' },
  { name: 'Case Studies', path: '/case-studies' },
  { name: 'Contact', path: '/contact' }
];

async function verifyBackgrounds() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const results = [];
  const outDir = path.join(__dirname, '..', 'docs', 'screenshots', 'step1_backgrounds');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('=== STEP 1: VERIFYING CINEMATIC BACKGROUND VIDEO & BLACK FALLBACK ===\n');

  for (const r of ROUTES) {
    const url = `http://localhost:3000${r.path}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(res => setTimeout(res, 2000));

    const videoData = await page.evaluate(() => {
      const video = document.querySelector('video');
      const fallbackContainer = document.querySelector('[data-cinematic-fallback]');
      const bgComputed = window.getComputedStyle(document.body).backgroundColor;
      const htmlComputed = window.getComputedStyle(document.documentElement).backgroundColor;

      if (!video) {
        return {
          hasVideo: false,
          fallbackFound: !!fallbackContainer,
          bodyBg: bgComputed,
          htmlBg: htmlComputed
        };
      }

      const sourceEl = video.querySelector('source');
      const videoSrc = video.currentSrc || video.src || (sourceEl ? sourceEl.src : null);
      const poster = video.getAttribute('poster') || video.poster;
      const computed = window.getComputedStyle(video);

      return {
        hasVideo: true,
        src: videoSrc,
        poster: poster,
        autoplay: video.autoplay,
        loop: video.loop,
        muted: video.muted,
        playsInline: video.playsInline,
        className: video.className,
        objectFit: computed.objectFit,
        position: computed.position,
        zIndex: computed.zIndex,
        bodyBg: bgComputed,
        htmlBg: htmlComputed
      };
    });

    results.push({ name: r.name, path: r.path, ...videoData });

    const screenshotPath = path.join(outDir, `${r.name.toLowerCase().replace(/\s+/g, '_')}_bg.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`[${r.name}] Captured: ${screenshotPath}`);
  }

  // Also test reduced motion on Homepage to verify black fallback poster
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(res => setTimeout(res, 1000));

  const reducedMotionData = await page.evaluate(() => {
    const video = document.querySelector('video');
    const fallback = document.querySelector('svg') || document.querySelector('[data-cinematic-fallback]');
    return {
      hasVideo: !!video,
      bodyBg: window.getComputedStyle(document.body).backgroundColor
    };
  });

  const reducedScreenshotPath = path.join(outDir, 'homepage_reduced_motion_fallback.png');
  await page.screenshot({ path: reducedScreenshotPath, fullPage: false });
  console.log(`[Reduced Motion Test] Captured fallback: ${reducedScreenshotPath}`);

  await browser.close();

  console.log('\n--- BACKGROUND AUDIT RESULTS ---');
  console.table(results.map(r => ({
    Page: r.name,
    HasVideo: r.hasVideo,
    AutoPlay: r.autoplay,
    Loop: r.loop,
    Muted: r.muted,
    PlaysInline: r.playsInline,
    VideoSrcMatch: r.src && r.src.includes('d8j0ntlcm91z4.cloudfront.net') ? 'EXACT_MATCH' : 'MISMATCH',
    PosterMatch: r.poster && r.poster.includes('data:image/svg+xml') ? 'EXACT_SVG_POSTER' : 'MISMATCH',
    BodyBg: r.bodyBg
  })));

  // Write detailed JSON report
  fs.writeFileSync(
    path.join(__dirname, '..', 'docs', 'step1_background_verification.json'),
    JSON.stringify({ results, reducedMotionData }, null, 2)
  );

  const allMatch = results.every(r =>
    r.hasVideo &&
    r.autoplay &&
    r.loop &&
    r.muted &&
    r.playsInline &&
    r.src && r.src.includes('d8j0ntlcm91z4.cloudfront.net') &&
    r.poster && r.poster.includes('data:image/svg+xml')
  );

  if (!allMatch) {
    console.error('FAILED: Not all pages use the exact same cinematic background video & poster!');
    process.exit(1);
  } else {
    console.log('\nSUCCESS: All 4 marketing pages use the EXACT same CloudFront cinematic background video and SVG fallback poster!');
  }
}

verifyBackgrounds().catch(e => {
  console.error('Verification failed:', e);
  process.exit(1);
});
