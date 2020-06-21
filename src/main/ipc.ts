import EventEmitter from 'eventemitter3';
import { Page } from 'puppeteer';

import { serialize as s } from '../utils/serialize';

export interface IPCInitParams {
  distPath?: string;
  useESM?: boolean;
}

class IPC extends EventEmitter {
  private constructor(
    private readonly page: Page,
    private readonly options: IPCInitParams = {},
  ) {
    super();
  }

  static async init(page: Page, options?: IPCInitParams) {
    const ipc = new IPC(page, options);
    if (!options?.useESM) await ipc.loadUMD();
    await ipc.expose();
    return ipc;
  }

  private async expose() {
    await this.page.exposeFunction('__TO_MAIN__', this.receive);
    await this.page.waitForFunction('() => __TO_MAIN__ != null');
  }

  private async loadUMD() {
    const distPath =
      this.options?.distPath ?? require.resolve('puppeteer-ipc/browser');

    await this.page.addScriptTag({ path: distPath });
    await this.page.waitForFunction('() => ipc != null');
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

export const createIPCSession = async (page: Page, options?: IPCInitParams) => {
  const ipc = await IPC.init(page, options);
  return ipc;
};
