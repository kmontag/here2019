/// <reference types="node" />

declare module 'opc/strand' {
  namespace createStrand {
    export interface Strand {
      readonly buffer: Buffer;
      readonly length: number;
      readonly setPixel: (index: number, r: number, g: number, b: number) => void;
      readonly getPixel: (index: number) => [number, number, number];
      readonly slice: (start: number, end: number) => Buffer;
    }
  }
  function createStrand(length: number): createStrand.Strand;
  export = createStrand;
}
