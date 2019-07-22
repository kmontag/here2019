include <MCAD/boxes.scad>
include <BOSL/constants.scad>
use <BOSL/transforms.scad>
use <math.scad>
use <nut_holder.scad>

$fn=25;

module boxLowProfile(chipLength, chipWidth, lidInsetDepth) {
  epsilon = 0.05;
  leeway = 0.3;
  debug = false;

  radius = 0.75;
  wallWidth = 1.5;

  panelMountRadius = 3.9 + leeway;
  panelMountEdgeRadius = 5.5 + leeway;
  panelMountDepth = 14;

  cableRadius = 2.75 + leeway;
  cableStrainReliefMinLength = 8;

  lidInsetWallWidth = 1;

  channelHeight = 2;
  chipHeight = 2; // actual board
  chipClearanceHeight = chipHeight + wallWidth; // additional height needed for parts to clear the stuff on the board
  separatorHeight = 4;

  // The chip needs to sit this far "into" the wall to allow USB inserts
  chipYAdjustment = wallWidth - 1;

  switchWidth = 13.2;
  switchHeight = 8.6 + 2 * leeway;
  switchRadius = 0.5;
  switchOffsetHeight = channelHeight + chipHeight + 2 * leeway;

  // dims for access hole
  usbWidth = 13;
  usbHeight = 8;
  usbAccessRadius = 1;

  // approx height of actual port
  usbPortHeight = 2.5;

  // inner dimensions
  width = max(chipWidth, 2 * panelMountEdgeRadius + 2 * wallWidth + cableStrainReliefMinLength + 2 * cableRadius, chipWidth);
  length = chipLength - chipYAdjustment + panelMountDepth;
  height = max(channelHeight + chipHeight + usbPortHeight, 2 * panelMountEdgeRadius, channelHeight + switchHeight + switchOffsetHeight) + lidInsetDepth + 2 * leeway;

  platformWidth = chipWidth / 2;
  platformEdgeSpace = 4;

  // Inset of the nut holder from an inner corner.
  nutHolderInsetY = [20, 6];
  nutHolderInsetZ = 2;

  nutVertexDistance = 6.5 + leeway;
  nutEdgeDistance = 5.65 + leeway;
  screwDiameter = 3 + leeway;

  translate([wallWidth, wallWidth, wallWidth]) {
    // strain relief walls
    translate([0, 2 * cableRadius, 0]) {
      difference() {
        cube([width - 2 * cableRadius - 2 * panelMountEdgeRadius - wallWidth, wallWidth, height], false);
        translate([0, -epsilon, height - lidInsetDepth - 4 * leeway]) {
          cube([lidInsetWallWidth + 4 * leeway, wallWidth + 2 * epsilon, lidInsetDepth + 4 * leeway + epsilon]);
        }
      }

    }
    translate([width - 2 * panelMountEdgeRadius - wallWidth, 0, 0]) {
      difference() {
        cube([wallWidth, panelMountDepth, height], false);
        translate([-epsilon, 0, height - lidInsetDepth - 4 * leeway]) {
          cube([wallWidth + 2 * epsilon, lidInsetWallWidth + 4 * leeway, lidInsetDepth + 4 *leeway + epsilon]);
        }

      }
    }

    // platform and rail if necessary
    translate([width - chipWidth / 2, length - chipLength / 2, channelHeight / 2]) {
      cube([platformWidth, chipLength - 2 * platformEdgeSpace, channelHeight], true);
    }
    if (chipWidth < width) {
      translate([width - chipWidth - wallWidth, panelMountDepth + switchWidth + 2 * wallWidth, 0]) {
        cube([wallWidth, length - panelMountDepth - switchWidth - 2 * wallWidth, separatorHeight], false);
      }
    }

    // lid
    translate(debug ? [0, 0, height]: [width + 5 * wallWidth, 0, 0]) difference() {
      union() {
        rotate([0, debug ? 180 : 0, debug ? 180 : 0]) forward(debug ? length : 0) {
          // main lid
          difference() {
            translate([-wallWidth, -wallWidth, -wallWidth]) {
              dims = [width + 2 * wallWidth, length + 2 * wallWidth, 2 * wallWidth];
              translate(dims / 2) roundedBox(dims, radius, false);
            }
            translate([-wallWidth - epsilon, -wallWidth - epsilon, 0]) {
              cube([2 * wallWidth + width + 2 * epsilon, 2 * wallWidth + length + 2 * epsilon, wallWidth + epsilon], false);
            }
          }

          // inset
          translate([leeway, leeway, 0]) {
            difference() {
              cube([width - 2 * leeway, length - 2 * leeway, lidInsetDepth - leeway], false);
              translate([lidInsetWallWidth, lidInsetWallWidth, 0]) {
                cube([width - 2 * leeway - 2 * lidInsetWallWidth, length - 2 * leeway - 2 * lidInsetWallWidth, lidInsetDepth + epsilon], false);
              }
            }
          }

          // Hold feather in place vertically.
          postDim = 2.5;
          back(leeway)
            right(width - postDim - leeway)
            cuboid([postDim, postDim, height - channelHeight - chipHeight - leeway], p1=[0, 0, 0]);

          for (i = [0, 1]) {
            right((1 - i) * width)
              xscale(i == 0 ? -1 : 1) // conditional xflip
              right(leeway)
              yscale(i == 0 ? -1 : 1)
              back(nutHolderInsetY[i])
              back((i - 1) * length) {

              wallWidthLeft=wallWidth;
              wallWidthRight=wallWidth;
              wallWidthFront=1;
              wallWidthTop=1;
              nutDepth=3;

              cuboid(
                size=[nutDepth + wallWidthLeft + wallWidthRight, nutVertexDistance + wallWidthFront, nutHolderInsetZ],
                p1=[0, -wallWidthFront, 0]
              );

              up(nutHolderInsetZ) nutHolder(
                nutVertexDistance=nutVertexDistance,
                nutEdgeDistance=nutEdgeDistance,

                nutDepth=nutDepth,

                screwDiameter=screwDiameter,

                wallWidthLeft=wallWidthLeft,
                wallWidthRight=wallWidthRight,
                wallWidthFront=wallWidthFront,
                wallWidthTop=wallWidthTop
              );
            }
          }
        }
      }
      // Pinhole
      pinholeDiameter = 2;
      back(pinholeDiameter + 2 * wallWidth + leeway)
        right(width / 2)
        zcyl(l=height, d=pinholeDiameter);



    }


    // main box
    color(alpha=(debug ? 0.3 : 1)) difference() {
      translate([-wallWidth, -wallWidth, -wallWidth]) {
        dims = [width + 2 * wallWidth, length + 2 * wallWidth, height + 2 * wallWidth];
        translate(dims / 2) roundedBox(dims, radius, false);
      }

      // carve out middle
      cube([width, length, height + epsilon]);

      // carve off top
      translate([-wallWidth - epsilon, -wallWidth - epsilon, height]) {
        cube([width + 2 * wallWidth + 2 * epsilon, length + 2 * wallWidth + 2 * epsilon, wallWidth + epsilon], false);
      }

      // carve out panel mount
      translate([width - panelMountEdgeRadius, 0, panelMountEdgeRadius]) {
        rotate([90, 0, 0]) {
          cylinder(2 * wallWidth + epsilon, panelMountRadius, panelMountRadius, true);
        }
      }

      // carve out hole for wire
      translate([wallWidth + cableRadius, -epsilon, panelMountEdgeRadius]) {
        rotate([90, 0, 0]) {
          cylinder(2 * wallWidth + epsilon, cableRadius, cableRadius, true);
        }
      }

      // carve out switch
      translate([-wallWidth / 2, panelMountDepth + switchWidth / 2 + wallWidth, switchHeight / 2 + switchOffsetHeight]) {
        roundedBox([wallWidth + 2 * switchRadius, switchWidth, switchHeight], switchRadius, false);
      }


      // carve out USB
      usbOverhang = 5;
      usbSize = [7.5, 4.5 + usbOverhang, 2.6];
      // Slight adjustments needed to line up the port in practice
      translate([width - chipWidth / 2 + 0.3, length, chipHeight + channelHeight + usbSize[2] / 2 + 0.3])
        slop(slop=0.5, size=usbSize)
        cuboid(usbSize);
      /* translate([width - chipWidth / 2, length, chipHeight + channelHeight + usbPortHeight / 2]) { */
      /*   roundedBox([usbWidth, wallWidth + 2 * usbAccessRadius, usbHeight], usbAccessRadius, false); */
      /* } */

      // care out inlay on the back wall so the USB port is accessible
      right(width - chipWidth - wallWidth)
        back(length - epsilon)
        cuboid([chipWidth + wallWidth, chipYAdjustment + epsilon, height * 3 / 4], p1=[0, 0, 0]);

      // carve out screw holes
      for (i = [-1, 1]) {
        back((i + 1) * length / 2)
          right((1 - i) * width / 2)
          forward(i * nutHolderInsetY[(1 + i) / 2])
          yscale(-i)
          up(height - nutHolderInsetZ) zflip()
          nutHolderMask(
            nutVertexDistance=nutVertexDistance,
            nutEdgeDistance=nutEdgeDistance,
            screwDiameter=screwDiameter,
            l=width / 2
          );
      }


    }

  }
}

leeway = 0.3;
boxLowProfile(53.65 + 2 * leeway, 22.8 + 2 * leeway, 2);