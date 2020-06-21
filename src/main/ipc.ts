import EventEmitter from 'eventemitter3';
import { Page } from 'puppeteer';

import { serialize as s } from '../utils/serialize';

export interface IPCInitParams {
  distPath?: string;
  skipBrowserInitialization?: boolean;
}

export class IPC extends EventEmitter {
  constructor(
    private readonly page: Page,
    private readonly options: IPCInitParams = {},
  ) {
    super();
  }

  async start() {
    if (!this.options.skipBrowserInitialization) {
      await this.page.addScriptTag({
        path:
          this.options?.distPath ?? require.resolve('puppeteer-ipc/browser'),
      });
      await this.page.waitForFunction(
        "() => window['puppeteer-ipc/browser'] != null",
      );
    }

    await this.page.exposeFunction('__TO_MAIN__', this.receive);
    await this.page.waitForFunction('() => __TO_MAIN__ != null');
    return this;
  }

  private receive = (name: string, ...args: unknown[]) => {
    this.emit(name, ...args);
  };

  async send(name: string, ...args: any[]) {
    await this.page.evaluate(s`window.__TO_BROWSER__(${name}, ...${args})`);
  }

  async request(name: string, ...args: unknown[]) {
    return new Promise((resolve) => {
      this.once(`${name}_response`, resolve);
      this.send(name, ...args);
    });
  }

  respond(name: string, fn: (...payload: unknown[]) => any) {
    this.once(name, (data) => {
      this.send(`${name}_response`, fn(...data));
    });
  }
}
