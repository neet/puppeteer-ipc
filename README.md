# puppeteer-ipc

## Usage

```js
import puppeteer from 'puppeteer';
import { IPC } from 'puppeteer-ipc/main';

const browser = await puppeteer.launch();
const page = await browser.open(...);
const ipc = await IPC.init(page);


// Browser side
await page.evaluate(`
  const { IPC } = window['puppeteer-ipc'];
  const ipc = new IPC();

  ipc.on('ping', () => {
    ipc.send('pong', 'hello');
  });
`);

// Node.js side
await ipc.send('ping');

ipc.on('pong', (data) => {
  console.log(`Message from the browser: ${data.message}`);
});
```
