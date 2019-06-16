/// <reference types="node" />

declare module 'opc/strand' {
  type Strand = {
    readonly buffer: Buffer;
    readonly length: number;
    readonly setPixel: (index: number, r: number, g: number, b: number) => void;
    readonly getPixel: (index: number) => [number, number, number];
    readonly slice: (start: number, end: number) => Buffer;
  }
  type createStrand = (length: number) => Strand;
  export = createStrand;
}
