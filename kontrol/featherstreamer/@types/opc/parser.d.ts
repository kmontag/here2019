/// <reference types="node" />

declare module 'opc/parser' {
  import { Transform } from 'stream';

  interface Parser extends Transform {}
  interface ParserMessage {
    channel: number,
    command: number,
    data: Buffer,
  }

  type createParser = () => Parser;
  export = createParser;
}
