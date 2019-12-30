export type PixelPosition = [number, number] | null;

/**
 * Helper to build a pixel array from "natural" movements. Supports
 * non-integer movements, and converts to integers when returning the
 * built array.
 */

export default class PixelBuilder {
  private currentX: number = 0;
  private currentY: number = 0;

  private readonly pixels: PixelPosition[] = [];

  skip() {
    this.pixels.push(null);
  }

  left(amount: number = 1) {
    this.shift([-amount, 0]);
  }

  right(amount: number = 1) {
    this.shift([amount, 0]);
  }

  up(amount: number = 1) {
    this.shift([0, -amount]);
  }

  down(amount: number = 1) {
    this.shift([0, amount]);
  }

  again() {
    this.push();
  }

  shift(translation: [number, number]): void {
    this.currentX += translation[0];
    this.currentY += translation[1];

    this.push();
  }

  jump(position: [number, number]): void {
    this.currentX = position[0];
    this.currentY = position[1];

    this.push();
  }

  getPixels(): Iterable<PixelPosition> {
    return this.pixels.map((p) => p === null ? null : [Math.round(p[0]), Math.round(p[1])]);
  }

  private push(): void {
    this.pixels.push([this.currentX, this.currentY]);
  }
}