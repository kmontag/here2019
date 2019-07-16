include <BOSL/constants.scad>
use <BOSL/shapes.scad>
use <BOSL/transforms.scad>
use <openscad-rpi-library/misc_parts.scad>
use <math.scad>
use <nut_holder.scad>
use <outer_box.scad>
use <pi_zero_w.scad>
use <power_boost_1000C.scad>
use <rotary_encoder.scad>


$fn=30;

epsilon = 0.1;

wallWidth = 2;
length = 68;
width = 31;
height = 35;

fillet = 2;

piWidth = 30;
piLength = 65;
piXInset = 9; // From the left wall
piYInset = 1; // From the back wall, to make the SD card jut out a bit
              // less

batterySize = [5, 62, 34];

powerBoostFloatHeight = 7;

rotaryEncoderFloatHeight = (height - rotaryEncoderBoxSize()[2]) / 2;
rotaryEncoderInset = 2;
rotaryEncoderPlatformLength = 22;


pcbHeight = 1.4;

nutVertexDistance = 6.5 + PRINTER_SLOP;
nutEdgeDistance = 5.65 + PRINTER_SLOP;
nutDepth = 3;
screwDiameter = 3 + PRINTER_SLOP;
nutHolderWallWidth = 1;

// Post to lock the rotary encoder.
postWidth = nutHolderWallWidth + nutVertexDistance;
postLength = 2 * nutHolderWallWidth + nutDepth;
postExtraFloatHeight = 3;


lidInsetWidth = 1;
lidInsetDepth = 2;



// Might be useful for debugging, this makes renders much slower though.
showRealBoards = false;

module circuit() {
  alpha = showRealBoards ? 0.1 : 1;

  // Battery
  batteryPosition = [PRINTER_SLOP + lidInsetWidth, length - batterySize[1] - 2 * PRINTER_SLOP - lidInsetWidth, PRINTER_SLOP];
  color("red") translate(batteryPosition) slop(size=batterySize) cuboid(size=batterySize, p1=[0, 0, 0]);

  right(piXInset) back(length - PRINTER_SLOP - piYInset) zrot(180) up(piWidth) yrot(-90) {
    zrot(90) {
      if (showRealBoards) {
        color("green") piZeroW();
      }
      color("green", alpha=alpha) piZeroWMask(PRINTER_SLOP);
    }
    sdCardLeeway = 0.7;
    // For the mask
    sdCardSize = [11 + sdCardLeeway * 2, 15, 1 + sdCardLeeway * 2];
    color(alpha=alpha)
      up(pcbHeight - sdCardLeeway)
      left(16.8 -(sdCardSize[0]) / 2)
      forward(wallWidth * 3)
      xflip() cuboid(size=sdCardSize, p1=[0, 0, 0]);
  }

  // PowerBoost and plug
  union() {
    size = powerBoost1000CSize();
    right(width - size[2] + 1)
      up(powerBoostFloatHeight)
      back(length)
      yrot(90)
      zrot(180)
    {
      if (showRealBoards) {
        color("blue")  powerBoost1000C();
      }
      color("blue", alpha=alpha) powerBoost1000CMask();
      down(wallWidth)
        powerBoostBacker();
    }


    // 1mm is the max wall width at the connection point.
    back(length + 1)
      left(size[2] - pcbHeight - 1.5)
      up(powerBoostFloatHeight + size[0] / 2)
      right(width)
      yrot(90)
      zscale(1.1)
      // Scale to leave a bit of extra space for the input.
      scale([1.2, 1.2, 1.2])
      usb_male_micro_b_connector();
  }


  // Rotary encoder
  union() {
    size = rotaryEncoderBoxSize();
    color("gray")
      right(width - size[0] - rotaryEncoderInset) {
      up(rotaryEncoderFloatHeight + PRINTER_SLOP)
        rotaryEncoder();

      back(rotaryEncoderPlatformLength - wallWidth)
        right(size[0] / 2)
        up(PRINTER_SLOP + postExtraFloatHeight)
        // z-dimension isn't correct but doesn't really matter here
        slop(size=[postWidth, postLength, rotaryEncoderFloatHeight])
        rotaryEncoderPost();

    }

  }
}

// Hacky helper so we can iteratively output nut holders.
module positionNutHolder(i) {
  if (i == 1) {
    up(height - lidInsetDepth)
      right(width)
      back(rotaryEncoderPlatformLength)
      xflip()
      zflip()
      children();
  } else if (i == 2) {
    up(height - lidInsetDepth)
      right(piXInset + pcbHeight + nutVertexDistance + nutHolderWallWidth * 2)
      back(length - nutDepth - 2 * nutHolderWallWidth)
      zflip()
      zrot(90)
      children();
  }
}


// Gets inserted behind the rotary encoder after placing it. Attach a
// spacer to push the encoder into position.
module rotaryEncoderPost() {
  color("gray") {
    cuboid(size=[postWidth, postLength, rotaryEncoderFloatHeight],
           p1=[-postWidth / 2, -postLength, 0]);
    up(rotaryEncoderFloatHeight)
      right(postWidth / 2 - nutHolderWallWidth)
      xflip()
      zrot(-90)
      nutHolder(
        nutVertexDistance=nutVertexDistance,
        nutEdgeDistance=nutEdgeDistance,
        nutDepth=nutDepth,

        screwDiameter=screwDiameter,

        wallWidthLeft=nutHolderWallWidth,
        wallWidthFront=nutHolderWallWidth,
        wallWidthRight=nutHolderWallWidth,
        wallWidthTop=wallWidth
      );
  }
}

// Gets inserted being the powerboost board after placing it. Makes it
// easier to insert the board, otherwise there isn't really room to
// place the switch through the wall.
module powerBoostBacker() {
  size = powerBoost1000CSize();
  color("black") cuboid(size=[size[0] / 2, size[1], wallWidth], p1=[0, 0, 0]);
}

module piBox(fadecandy=false) {
  up(wallWidth) right(wallWidth) back(wallWidth) {
    //circuit();
    difference() {
      union() {

        // Pi and battery platforms
        union() {
          piPlatformInset = 20;
          piHeaderInset = 7;
          cuboid(size=[piPlatformInset, length - piLength + piHeaderInset, 10], p1=[0, 0, 0]);
          back(length - piHeaderInset) cuboid(size=[piPlatformInset, piHeaderInset, 14], p1=[0, 0, 0]);
        }

        // PowerBoost platform
        union() {
          size = powerBoost1000CSize();
          backAngleStartHeight = powerBoostFloatHeight + 2;
          backAngleHeight = 4.5;
          backAngleSupportLength = 4;
          backAngleInternalLength = 3;
          platformInset = size[2] + 2 * wallWidth; // - wallWidth covers the adjustment of the board to push the switch through the wall.

          translate([
                      width - platformInset,
                      length - size[1],
                      0,
                    ]) {

            // Back support
            forward(backAngleSupportLength) {
              cuboid(size=[
                       platformInset,
                       backAngleSupportLength,
                       backAngleStartHeight + backAngleHeight,
                     ], p1=[0, 0, 0]);
              back(backAngleSupportLength)
                cuboid(size=[
                         platformInset,
                         backAngleInternalLength,
                         powerBoostFloatHeight,
                       ], p1=[0, 0, 0]);
              back(backAngleSupportLength)
                up(backAngleStartHeight + backAngleHeight)
                right(platformInset)
                zrot(90)
                zflip()
                right_triangle([backAngleInternalLength, platformInset, backAngleHeight]);
            }

            // Front support
            frontSupportLength = 4;
            back(size[1] - frontSupportLength)
              cuboid(size=[
                       platformInset,
                       frontSupportLength,
                       powerBoostFloatHeight + 6,
                     ], p1=[0, 0, 0]);
          }
        }

        // Rotary encoder platform
        union() {
          size = rotaryEncoderBoxSize();
          holderWallWidth = [4, 2];
          holderWallHeight = 6;
          holderWallLength = 2;
          backWallWidth = 3;
          backSupportWidth = 4;
          backSupportLength = 8;
          platformWidth = holderWallWidth[0] + holderWallWidth[1] + size[0];
          right(width - size[0] - rotaryEncoderInset - holderWallWidth[0]) {

            // Main platform
            cuboid(size=[platformWidth, rotaryEncoderPlatformLength, rotaryEncoderFloatHeight], p1=[0, 0, 0]);

            // Walls near output
            for (i = [0, 1]) {
              right(i * (platformWidth - holderWallWidth[i]))
                up(rotaryEncoderFloatHeight)
                cuboid(size=[holderWallWidth[i], holderWallLength, holderWallHeight], p1=[0, 0, 0]);
            }
          }
        }
      }

      circuit();
    }

    // Outer box
    difference() {
      color(alpha=0.3) outerBox(
        wallWidth=wallWidth,
        size=[width, length, height],
        fillet=fillet
      );
      circuit();
      for (i = [1, 2]) {
        positionNutHolder(i) nutHolderMask(
          nutVertexDistance=nutVertexDistance,
          nutEdgeDistance=nutEdgeDistance,
          screwDiameter=screwDiameter,
          l=(length / 2)
        );
      }
    }

    // Lid
    right(2 * width + 10) yrot(180) down(height)
      difference() {
      union() {
        outerBoxLid(
          wallWidth=wallWidth,
          size=[width, length, height],
          fillet=fillet,
          insetWidth=lidInsetWidth,
          insetDepth=lidInsetDepth
        );

        for (i = [1, 2]) {
          positionNutHolder(i) {
            forward(wallWidth) cuboid(size=[nutDepth + 2 * nutHolderWallWidth, nutVertexDistance + wallWidth, lidInsetDepth], p1=[0, 0, -lidInsetDepth]);
            nutHolder(
              nutVertexDistance=nutVertexDistance,
              nutEdgeDistance=nutEdgeDistance,
              nutDepth=nutDepth,

              screwDiameter=screwDiameter,

              wallWidthLeft=nutHolderWallWidth,
              wallWidthFront=wallWidth,
              wallWidthRight=nutHolderWallWidth,
              wallWidthTop=wallWidth
            );
          }
        }

        holderWallWidth = 2;

        // Hold pi in place vertically
        right(piXInset + pcbHeight / 2)
          up(height)
          zflip()
          back(length - 35)
          cuboid(size=[pcbHeight + holderWallWidth * 2, 10, height - piWidth + 3], p1=[-holderWallWidth - pcbHeight / 2, 0, 0]);

        // Hold PowerBoost in place vertically
        right(width)
          up(height)
          zflip()
          back(length)
          yflip()
          xflip()
          cuboid(size=[powerBoost1000CSize()[2] + wallWidth, 3, height - powerBoost1000CSize()[0] - powerBoostFloatHeight + 2], p1=[0, 0, 0]);

      }
      circuit();
    }
  }

  // Little parts.
  right(width * 2 + 22) {
    up(postWidth / 2) yrot(90) xrot(-90) rotaryEncoderPost();
    back(25) powerBoostBacker();
  }
}

piBox();