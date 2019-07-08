/// <reference types="node" />

declare module 'opc/parser' {
  import { Transform } from 'stream';

  namespace createParser {
    export interface Parser extends Transform {}
    export interface ParserMessage {
      channel: number,
      command: number,
      data: Buffer,
    }
  }

  function createParser(): createParser.Parser;
  export = createParser;
}
