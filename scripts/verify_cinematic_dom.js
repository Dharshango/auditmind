const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../clonmel-flood-simulator/node_modules/puppeteer-core'));

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  const evaluation = await page.evaluate(() => {
    const video = document.querySelector('video.bg-video');
    const videoSource = video ? video.querySelector('source')?.getAttribute('src') : null;
    const isMuted = video ? video.muted : false;
    const isLoop = video ? video.loop : false;

    const logo = document.querySelector('header a[title="AUDITMIND Home"]');
    const logoImg = logo ? logo.querySelector('img') : null;

    const nav = document.querySelector('header nav');
    const navLinks = nav ? Array.from(nav.querySelectorAll('a')).map(a => a.textContent.trim()) : [];
    const threeDots = nav ? nav.querySelectorAll('span.w-\\[3px\\]').length : 0;

    const headline = document.querySelector('h1');
    const headlineSpans = headline ? Array.from(headline.querySelectorAll('span')).map(s => s.textContent.trim()) : [];
    const headlineComputed = headline ? window.getComputedStyle(headline) : null;

    const subheading = document.querySelector('main p');
    const subheadingText = subheading ? subheading.textContent.trim() : null;

    const cta = document.querySelector('main a[href="/login"], main a[href="/dashboard"]');
    const ctaText = cta ? cta.textContent.trim() : null;

    const footer = document.querySelector('footer');
    const footerCols = footer ? Array.from(footer.querySelectorAll('div.flex-col')).map(col => {
      const top = col.querySelector('div.flex')?.textContent.replace(/\s+/g, ' ').trim();
      const label = col.querySelector('div.mt-0\\.5, div.text-\\[12px\\]')?.textContent.trim();
      return { top, label };
    }) : [];

    const trustBadge = document.querySelector('main i.fa-microsoft, main i.fa-amazon, main i.fa-google');

    return {
      videoFound: Boolean(video),
      videoSource,
      isMuted,
      isLoop,
      logoFound: Boolean(logo),
      logoImgFound: Boolean(logoImg),
      navLinks,
      threeDotsCount: threeDots,
      headlineSpans,
      fontFamily: headlineComputed ? headlineComputed.fontFamily : null,
      subheadingText,
      ctaText,
      footerCols,
      trustBadgeFound: Boolean(trustBadge)
    };
  });

  console.log('=== DOM AUDIT RESULTS ===');
  console.log(JSON.stringify(evaluation, null, 2));

  await browser.close();
}

verify().catch(console.error);
