/// <reference types="node" />

declare module 'opc' {
  import { PassThrough } from 'stream';
  class OPCStream extends PassThrough {
    writeMessage: (channel: number, command: number, data: Buffer|Uint8Array) => boolean;
    writePixels: (channel: number, pixels: Buffer|Uint8Array) => boolean;
    writeColorCorrection: (config: object) => boolean;
  }
  type createOPCStream = (size: number) => OPCStream;
  export = createOPCStream;
}