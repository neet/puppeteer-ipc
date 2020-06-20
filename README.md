# puppeteer-ipc

![NPM](https://img.shields.io/npm/v/puppeteer-ipc.svg)
![Node.js CI](https://github.com/neet/puppeteer-ipc/workflows/Node.js%20CI/badge.svg)

Lightweight wrapper for mutual communication on Puppeteer, inspired by Electron.

## Install

```
npm i puppeteer puppeteer-ipc
```

## Usage

```js
import puppeteer from "puppeteer";
import { IPC } from "puppeteer-ipc/main";

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto("https://example.com");

const ipc = new IPC(page);
await ipc.start();

// ----- Browser side -----
await page.evaluate(`
  const { IPC } = window['puppeteer-ipc/browser'];
  const ipc = new IPC();

  ipc.on('ping', () => {
    ipc.send('pong', 'hello');
  });
`);

// ----- Node.js side -----
ipc.on("pong", (data) => {
  console.log(`Message from the browser: ${data.message}`);
  browser.close();
});
await ipc.send("ping");

// Output: Message from the browser: hello
```

## How It Works

`puppeteer-ipc` uses APIs below to make mutual communication possible:

- [`page.evaluate`](https://pptr.dev/#?product=Puppeteer&show=api-pageevaluatepagefunction-args) to send data to the browser from Node.js process
- [`page.exposeFunction`](https://pptr.dev/#?product=Puppeteer&show=api-pageexposefunctionname-puppeteerfunction) to send data to Node.js from the browser process

## API

### `IPC` (`puppeteer-ipc/main`)

- page `Page` Puppeteer's page instance
- options.distPath `string` Path for JS file of `puppeteer-ipc/browser`
- options.skipBrowserInitialization `boolean` Whether or not to skip initialization such as loading JS file on browser.

This is a class that controls IPC on Node.js side. Since this class extends `EventEmitter`, you can also inherited methods such as `on`, `off` and `once`.

#### `start`

- returns: `Promise<void>` Nothing

Exposes Node.js APIs on the browser and wait for them to be loaded.

#### `send`

- `name` `string` Name of the event
- `...payloads` `unknown[]` Payloads of the event which will be passed to the callback function
- returns: `Promise<void>` Nothing

A method that sends event to browser from Node.js.

### `IPC` (`puppeteer-ipc/browser`)

This is a class that controls IPC on Node.js side. Since this class extends `EventEmitter`, you can also inherited methods such as `on`, `off` and `once`.

#### `IPC.send`

- `name` `string` Name of the event
- `...payloads` `unknown[]` Payloads of the event which will be passed to the callback function
- returns: `Promise<void>` Nothing

A method that sends event to browser from Node.js.

## TypeScript

`puppeteer-ipc` is written in TypeScript and fully supports its major features.

### Event Callbacks

You can pass map of event name and it's argument to IPC as a generic parameter:

```ts
const ipc = new IPC<{
  my_event: [string, number];
  [key: string]: [unknown];
}>(page);

ipc.on("my_event", (a, b) => {
  // `a` and `b` are type-safe.
});
```

### Typing Module on Browser

If you use JS bundler for browsers such as webpack, then you can use safely-typed import statement as well as browser side.

```ts
// Browser side
import { IPC } from "puppeteer-ipc/browser";
```

In this case, you can pass option `skipBrowserInitialization: true` to avoid creating IPC instance twice:

```ts
// Node.js side
const ipc = new IPC(page, { skipBrowserInitialization: true });
```

## Related Projects

- [Electron](https://www.electronjs.org/) ─ A desktop app framework which also uses IPC technique to communicate mutually between Node.js and Chromium process.
- [electron-better-ipc](https://github.com/sindresorhus/electron-better-ipc) ─ Electron IPC wrapper for synchronous communication.

## License

MIT
