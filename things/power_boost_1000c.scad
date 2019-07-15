include <BOSL/constants.scad>
use <BOSL/shapes.scad>
use <BOSL/transforms.scad>
use <math.scad>


powerBoostSize = [22.86, 36.2, 5];
switchBodySize = [4, 11.6, 5.4];
switchSize = [2, 4, 2];
pcbHeight = 1.65;

bodyInset = 14.4;
switchBodyPosition = [powerBoostSize[0] - switchBodySize[0], bodyInset, pcbHeight];
switchPosition = [
  powerBoostSize[0] - switchBodySize[0] / 2 - switchSize[0] / 2,
  bodyInset + switchBodySize[1] / 2 - switchSize[1] / 2,
  switchBodySize[2] + pcbHeight
];

module powerBoost1000C(switch = true) {

  // These are just approximate values to get the unscaled STL to
  // [0, 0, 0] in the correct powerBoostSize.
  superBoostScale = 10;
  scale([superBoostScale, superBoostScale, superBoostScale])
    right(2.893)
    down(0.445)
    back(1.645)
    xrot(90)import("SuperBoost1000C.stl");

  if (switch) {
    cuboid(size=switchBodySize, p1=switchBodyPosition);
    cuboid(size=switchSize, p1=switchPosition);
  }

  // Cover the main board with a solid shape, so we don't leave
  // holes when using it as a mask.
}

/**
 * Incomplete, but contains everything we need.
 */
module powerBoost1000CMask(slop=PRINTER_SLOP, switch=true) {
  boardSize = [powerBoostSize[0], powerBoostSize[1], pcbHeight];
  slop(slop=slop, size=boardSize) cuboid(size=boardSize, p1=[0, 0, 0]);
  // Switch
  if (switch) {
    translate(switchBodyPosition) slop(slop=slop, size=switchBodySize) cuboid(size=switchBodySize, p1=[0, 0, 0]);
    translate(switchPosition) slop(slop=slop, size=switchSize) cuboid(size=switchSize, p1=[0, 0, 0]);
  }
}

function powerBoost1000CSize(switch = true) = [
  powerBoostSize[0],
  powerBoostSize[1],
  switch ? pcbHeight + switchBodySize[2] : powerBoostSize[2]
];

powerBoost1000C();
color("white", alpha=0.1) powerBoost1000CMask();
