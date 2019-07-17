include <BOSL/constants.scad>
use <BOSL/shapes.scad>
use <BOSL/transforms.scad>

epsilon = 1;
module outerBox(
  // Inner dimesions
  size,
  wallWidth,
  fillet,
) {
  width = size[0];
  length = size[1];
  height = size[2];
  difference() {
    cuboid(size=[width + 2 * wallWidth, length + 2 * wallWidth, height + 2 * wallWidth], p1=[-wallWidth, -wallWidth, -wallWidth], fillet=fillet);
    cuboid(size=[width, length, height + epsilon], p1=[0, 0, 0]);
    cuboid(
      size=[width + 2 * wallWidth + epsilon, length + 2 * wallWidth + epsilon, wallWidth + epsilon],
      p1=[-wallWidth - epsilon / 2, -wallWidth - epsilon / 2, height]
    );
  }
}

module outerBoxLid(
  size,
  wallWidth,
  fillet,
  insetWidth,
  insetDepth,
  slop=PRINTER_SLOP
) {
  difference() {
    cuboid(size=[size[0] + 2 * wallWidth, size[1] + 2 * wallWidth, size[2] + 2 * wallWidth], p1=[-wallWidth, -wallWidth, -wallWidth], fillet=fillet);
    cuboid(size=[size[0] + 2 * wallWidth + 2 * epsilon, size[1] + 2 * wallWidth + 2 * epsilon, size[2] + wallWidth + epsilon],
           p1=((-wallWidth - epsilon) * [1, 1, 1]));
  }
  up(size[2] - insetDepth) difference() {
    cuboid(size=[size[0] - 2 * slop, size[1] - 2 * slop, insetDepth], p1=[slop, slop, 0]);
    cuboid(size=[size[0] - 2 * insetWidth - 2 * slop, size[1] - 2 * insetWidth - 2 * slop, insetDepth + epsilon], p1=[slop + insetWidth, slop + insetWidth, -epsilon]);
  }
}

outerBox(size=[10, 10, 10], wallWidth=1, fillet=0.5);
right(15)
  outerBoxLid(size=[10, 10, 10], wallWidth=1, fillet=0.5, insetWidth=1, insetDepth=2);