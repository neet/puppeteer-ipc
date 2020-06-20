import { Page } from "puppeteer";
import EventEmitter, { ValidEventTypes, EventNames, EventArgs } from "eventemitter3";

import { serialize as s } from "../utils/serialize";

export class IPC<T extends ValidEventTypes> extends EventEmitter<T> {
  private constructor(private readonly page: Page) {
    super();
  }

  static async init(page: Page) {
    const ipc = new IPC(page);
    ipc.page.exposeFunction("__TO_NODE__", ipc.receive);
    ipc.page.waitForFunction("() => __TO_NODE__ != null");
    return ipc;
  }

  private receive = <U extends EventNames<T>>(name: U, ...payload: EventArgs<T, U>) => {
    this.emit(name, ...payload);
  };

  async send<U extends EventNames<T>>(name: U, payload: EventArgs<T, U>) {
    await this.page.evaluate(
      s`window.__TO_BROWSER__.emit(${name}, ${payload})`
    );
  }
}
