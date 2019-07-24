include <BOSL/constants.scad>
include <MCAD/boxes.scad>
include <MCAD/triangles.scad>
use <BOSL/transforms.scad>

// smaller for higher-res curves
$fs = 0.1;
epsilon = 0.01;

debug = false;

stripWidth = 12;
stripHeight = 4.5;

coneLockHoleRadius = 1.5; // M3 screw
coneLockBoltWidth = 5.5 + 0.2; // Expected + real-world adjustment

lockPadHeight = 1;

leeway = 0.3;

solderDepth = 7;
solderWindowDepth = 3.7;
wallWidth = 0.9;
capDepth = solderDepth + 2 * wallWidth + coneLockBoltWidth + 2 * leeway;
capWidth = stripWidth + 2 * wallWidth;
capHeight = stripHeight + 2 * wallWidth;

radius = 0.2;

numPins = 3;
pinRadius = 1.1;

slideLeeway = 0.35;

conePlacement = debug ? 0 : capWidth + wallWidth * 2 + 5;
coneAlpha = debug ? 0.8 : 1;

coneCubeWallWidth = wallWidth;
wireRadius = 2.2;
wireClench = 0.08;
wireClenchLength = 5;
coneLength = 33;
coneTipLength = 8;
coneMaxRadius = (2 * slideLeeway + 2 * coneCubeWallWidth + capHeight) / 2;

coneCubeDepth = capDepth;
coneCubeOuterWidth = capWidth + 2 * slideLeeway + 2 * coneCubeWallWidth;


// main endcap
translate([0, 0, debug ? capDepth : 0]) mirror([0, 0, debug ? 1 : 0]) union() {

  difference() {
    union() {
      smoothingInset = 0.15;
      difference() {
        translate([capWidth / 2, capHeight / 2, capDepth / 2]) {
          roundedBox([capWidth, capHeight, capDepth], radius, false);
        }

        // hole for lock bolt, leave a partial edge at the top so we
        // can keep it smooth after adding the hexagon shape
        translate([0, -capHeight / 2, 0]) {
          translate([wallWidth + stripWidth / 2, wallWidth + stripHeight / 2, 2 * wallWidth + solderDepth + coneLockBoltWidth / 2 + leeway - radius / 2]) {
            cube([coneLockBoltWidth + 2 * leeway, capHeight + 0.1, coneLockBoltWidth + 2 * leeway - radius], true);
          }
          translate([wallWidth + stripWidth / 2, wallWidth + stripHeight / 2, 2 * wallWidth + solderDepth + coneLockBoltWidth / 2 + leeway + 0.1]) {
            cube([coneLockBoltWidth / 2 + leeway + 2 * smoothingInset, capHeight + 0.1, coneLockBoltWidth + 2 * leeway + 0.2], true);
          }
        }

        // hole over soldered parts for gluing
        translate([capWidth / 2, capHeight / 2, 2 * wallWidth]) {
          difference() {
            rotate([90, 0, 0]) {
              cylinder(capHeight + 2 * epsilon, solderWindowDepth, solderWindowDepth, true);
            }
            translate([-capWidth / 2, -capHeight / 2, -solderWindowDepth]) {
              cube([capWidth, capHeight, solderWindowDepth], false);
            }
          }
        }
      }


      // hexagonal lock bolt shape
      translate([0, -capHeight / 2, 0]) {
        difference() {
          union() {
            for (i = [0:3]) {
              translate([capWidth / 2, 0, 2 * wallWidth + solderDepth + (coneLockBoltWidth + 2 * leeway) / 2]) {
                mirror([0, 0, i % 2]) mirror([floor(i / 2), 0, 0]) {

                  translate([-(coneLockBoltWidth + 2 * leeway) / 2, capHeight, (coneLockBoltWidth + 2 * leeway) / 2]) rotate([90, 90, 0]) {
                    triangle((coneLockBoltWidth + 2 * leeway) / 4, (coneLockBoltWidth + 2 * leeway) / 2, capHeight / 2);
                  }
                }
              }
            }
          }

          // smooth top edge
          translate([capWidth / 2, capHeight / 2, capDepth]) {
            cube([(coneLockBoltWidth + 2 * leeway), capHeight + 0.1, 2 * radius], true);
            cube([coneLockBoltWidth / 2 + leeway + 2 * smoothingInset, capHeight + 0.1, coneLockBoltWidth], true);
          }
        }
      }
    }

    // main center
    translate([wallWidth, wallWidth, wallWidth]) {
      cube([stripWidth, stripHeight, (capDepth - wallWidth) + 0.1]);
    }

    // pins
    translate([wallWidth, wallWidth + stripHeight / 2, wallWidth / 2]) {
      for (i = [1:numPins]) {
        translate([(i * stripWidth / numPins) - (stripWidth / numPins / 2), 0, 0]) {
          cylinder(wallWidth + 0.1, pinRadius, pinRadius, true);
        }
      }
    }

  }

  // locking pad below screw, for additional compression
  translate([capWidth / 2, capHeight - (lockPadHeight / 2) - wallWidth, capDepth - (coneLockBoltWidth / 2) - leeway]) {
    rotate([90, 0, 0]) {
      cylinder(lockPadHeight, coneLockBoltWidth / 2, coneLockBoltWidth / 2 - lockPadHeight, true);
    }
  }
}

// additional fitting over wire
translate([conePlacement + (capWidth) / 2, -coneCubeWallWidth - slideLeeway, 0]) {

  mirror([0, 0, 1]) translate([0, coneMaxRadius, -coneLength - coneCubeDepth]) {

    difference() {
      // Offset from center in either direction for one of the cones.
      xOffset = wireRadius + wallWidth;

      // main cone shape
      color("blue", coneAlpha)  union() {
        for (i = [-1, 1]) {
          right(i * xOffset)
            translate([0, 0, coneTipLength / 2])
            cylinder(coneTipLength, wireRadius + wallWidth + leeway, wireRadius + wallWidth + leeway, true);
          hull() {
            right(i * xOffset) translate([0, 0, coneTipLength])
              translate([0, 0, (coneLength - coneTipLength) / 2])
              cylinder(coneLength - coneTipLength, wireRadius + wallWidth + leeway, coneMaxRadius, true);
            translate([0, 0, coneLength + coneCubeDepth / 2])
              roundedBox([coneCubeOuterWidth, coneMaxRadius * 2, coneCubeDepth], radius, false);
          }
        }
      }

      // carve out inner main cone shape. leaves extra width on the
      // cube wall, we'll carve this out below and create a ridge.
      color("white") union() {
        for (i = [-1, 1]) {
          right(i * xOffset) translate([0, 0, wireClenchLength / 2]) {
            cylinder(wireClenchLength + 0.1, wireRadius + leeway, wireRadius + leeway - wireClench, true);
          }
          right(i * xOffset) translate([0, 0, wireClenchLength + (coneTipLength - wireClenchLength) / 2]) {
            cylinder(coneTipLength - wireClenchLength + 0.1, wireRadius + leeway - wireClench, wireRadius + leeway - wireClench, true);
          }

          hull() {
            translate([0, 0, coneTipLength]) {
              right(i * xOffset) translate([0, 0, (coneLength - coneTipLength) / 2]) {
                cylinder(coneLength - coneTipLength, wireRadius + leeway - wireClench, coneMaxRadius - coneCubeWallWidth - slideLeeway, true);
              }
            }

            translate([0, 0, coneLength + coneCubeDepth / 2]) {
              cube([capWidth, (coneMaxRadius - coneCubeWallWidth - slideLeeway) * 2, coneCubeDepth + 0.1], true);
            }
          }
        }
      }

      // hole for lock
      translate([0, -coneMaxRadius, coneLength + wallWidth + solderDepth + wallWidth + (coneLockBoltWidth + 2 * leeway) / 2]) {
        rotate([90, 0, 0]) {
          cylinder(coneMaxRadius * 2 + 0.1, coneLockHoleRadius + leeway, coneLockHoleRadius + leeway, true);
        }
      }

      // carve out additional cube area, create ridge to catch main
      // endcap.
      translate([0, 0, coneLength]) {
        hull() {
          slopeHeight = 0.5;
          translate([0, 0, 0.01]) {
            cube([capWidth, (coneMaxRadius - coneCubeWallWidth - slideLeeway) * 2, 0.02], true);
          }
          translate([0, 0, slopeHeight + (coneCubeDepth - slopeHeight) / 2 + 0.1]) {
            cube([capWidth + 2 * slideLeeway + 0.1, capHeight + 2 * slideLeeway + 0.1, coneCubeDepth - slopeHeight + 0.2], true);
          }
        }
      }

    }

  }
}
