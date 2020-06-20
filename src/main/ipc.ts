import { Page } from "puppeteer";
import EventEmitter, { ValidEventTypes, EventNames, EventArgs } from 'eventemitter3';

import { serialize as s } from "../utils/serialize";

export class IPC<T extends ValidEventTypes> extends EventEmitter<T> {
  private constructor(private readonly page: Page) {
    super();
  }

  static async init(page: Page) {
    const ipc = new IPC(page);
    await ipc.page.exposeFunction("__TO_MAIN__", ipc.receive);
    await ipc.page.waitForFunction("() => __TO_MAIN__ != null");
    return ipc;
  }

  private receive = <U extends EventNames<T>>(name: U, ...payload: EventArgs<T, U>) => {
    this.emit(name, ...payload);
  };

  async send<U extends EventNames<T>>(name: U, payload: EventArgs<T, U>[0]) {
    await this.page.evaluate(
      s`window.__TO_BROWSER__(${name}, ${payload})`
    );
  }
}
