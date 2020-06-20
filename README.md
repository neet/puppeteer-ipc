# puppeteer-ipc

## Usage

**Node.js side:**

```js
import puppeteer from 'puppeteer';
import { createIpc } from 'puppeteer-ipc';

const browser = await puppeteer.launch();
const page = await browser.open(...);
const ipc = await createIpc(page);

await ipc.emit('ping');

ipc.on('pong', (data) => {
  console.log(`Message from the browser: ${data.message}`);
});
```

**Browser side:**

```js
import { ipc } from 'puppeteer-ipc/browser';

ipc.on('ping', () => {
  ipc.send('pong', { message: `Hello from ${navigator.appVersion}` });
});
```
