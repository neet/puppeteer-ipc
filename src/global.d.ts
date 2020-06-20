import EventEmitter from 'eventemitter3';

declare global {
  export interface Window {
    __TO_BROWSER__: any
    __TO_MAIN__: (name: unknown, ...payloads: unknown[]) => Promise<void>;
  }
}
