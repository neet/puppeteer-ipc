const puppeteer = require('puppeteer');
const { IPC } = require('./main');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://neet.love');
  const ipc = new IPC(page, { distPath: require.resolve('./browser') });
  await ipc.start();

  page.evaluate(async () => {
    const { ipc } = window['puppeteer-ipc/browser'];
    await ipc.respond('getHref', () => location.href);
  });

  ipc.respond('getCwd', () => process.cwd());
})();
