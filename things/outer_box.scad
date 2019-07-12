include <BOSL/shapes.scad>

module outerBox(
  // Inner dimesions
  width,
  length,
  height,
  wallWidth,
  fillet,
) {
  epsilon = 1;
  difference() {
    cuboid(size=[width + 2 * wallWidth, length + 2 * wallWidth, height + 2 * wallWidth], p1=[-wallWidth, -wallWidth, -wallWidth], fillet=fillet);
    cuboid(size=[width, length, height + epsilon], p1=[0, 0, 0]);
    cuboid(
      size=[width + 2 * wallWidth + epsilon, length + 2 * wallWidth + epsilon, wallWidth + epsilon],
      p1=[-wallWidth - epsilon / 2, -wallWidth - epsilon / 2, height]
    );
  }
}