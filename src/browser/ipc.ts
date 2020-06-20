import {
  EventEmitter,
  ValidEventTypes,
  EventNames,
  EventArgs,
} from "eventemitter3";

export class IPC<T extends ValidEventTypes> extends EventEmitter<T> {
  constructor() {
    super();
    window.__TO_BROWSER__ = this.receive;
  }

  private receive = <U extends EventNames<T>>(
    name: U,
    ...payloads: EventArgs<T, U>
  ) => {
    this.emit(name, ...payloads);
  };

  async send<U extends EventNames<T>>(name: U, ...payloads: EventArgs<T, U>) {
    await window.__TO_MAIN__(name, ...payloads);
  }
}
