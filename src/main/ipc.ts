import EventEmitter, {
  EventArgs,
  EventNames,
  ValidEventTypes,
} from 'eventemitter3';
import { Page } from 'puppeteer';

import { serialize as s } from '../utils/serialize';

export interface IPCInitParams {
  distPath?: string;
  skipBrowserInitialization?: boolean;
}

export class IPC<T extends ValidEventTypes = string> extends EventEmitter<T> {
  constructor(
    private readonly page: Page,
    private readonly options: IPCInitParams = {},
  ) {
    super();
  }

  async start() {
    const ipc = new IPC(this.page);

    if (!this.options.skipBrowserInitialization) {
      await ipc.page.addScriptTag({
        path:
          this.options?.distPath ?? require.resolve('puppeteer-ipc/browser'),
      });
      await ipc.page.waitForFunction(
        "() => window['puppeteer-ipc/browser'] != null",
      );
    }

    await ipc.page.exposeFunction('__TO_MAIN__', ipc.receive);
    await ipc.page.waitForFunction('() => __TO_MAIN__ != null');
    return ipc;
  }

  private receive = <U extends EventNames<T>>(
    name: U,
    ...payload: EventArgs<T, U>
  ) => {
    this.emit(name, ...payload);
  };

  async send<U extends EventNames<T>>(
    name: U,
    ...payloads: EventArgs<T, U>[0]
  ) {
    await this.page.evaluate(s`window.__TO_BROWSER__(${name}, ...${payloads})`);
  }
}
