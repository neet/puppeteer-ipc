import { EventEmitter } from 'eventemitter3';

class IPC extends EventEmitter {
  constructor() {
    super();
    window.__TO_BROWSER__ = this.receive;
  }

  private receive = (name: string, ...args: unknown[]) => {
    this.emit(name, ...args);
  };

  async send(name: string, ...args: unknown[]) {
    await window.__TO_MAIN__(name, ...args);
  }

  async request(name: string, ...args: unknown[]) {
    return new Promise((resolve) => {
      this.once(`${name}_response`, resolve);
      this.send(name, ...args);
    });
  }

  respond(name: string, fn: (...args: unknown[]) => unknown) {
    this.once(name, (data) => {
      this.send(`${name}_response`, fn(data));
    });
  }
}

export const ipc = new IPC();
