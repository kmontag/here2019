/// <reference types="node" />

declare module 'get-pixels' {
  import * as ndarray from 'ndarray';

  type GetPixelsCallback = (err: Error|null, pixels: ndarray|undefined) => any;

  function getPixels(url: string, cb: GetPixelsCallback): void;
  function getPixels(url: string|Buffer, type: string, cb: GetPixelsCallback): void;

  export = getPixels;
}