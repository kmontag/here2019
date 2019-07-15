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

wallWidth = 1;
length = 75;
width = 35;
height = 35;
fadecandyExtraWidth =

fillet = 1;

piWidth = 30;
piLength = 65;
piXInset = 3;
piBatterySpacing = 8;

batterySize = [5, 62, 34];

powerBoostFloatHeight = 6;

rotaryEncoderFloatHeight = (height - rotaryEncoderBoxSize()[2]) / 2;
rotaryEncoderInset = 2;

pcbHeight = 1.4;

nutVertexDistance = 6.5 + PRINTER_SLOP;
nutEdgeDistance = 5.65 + PRINTER_SLOP;
nutDepth = 3;
screwDiameter = 3 + PRINTER_SLOP;

lidInsetWidth = 1;
lidInsetDepth = 2;



// Might be useful for debugging, this makes renders much slower though.
showRealBoards = false;

module circuit() {
  alpha = showRealBoards ? 0.1 : 1;
  right(piXInset) back(length - PRINTER_SLOP) zrot(180) up(piWidth) yrot(-90) {
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

  // Battery
  batteryPosition = [piXInset + pcbHeight + piBatterySpacing, length - batterySize[1] - 2 * PRINTER_SLOP - lidInsetWidth, PRINTER_SLOP];
  color("red") translate(batteryPosition) slop(size=batterySize) cuboid(size=batterySize, p1=[0, 0, 0]);


  // PowerBoost and plug
  union() {
    size = powerBoost1000CSize();
    right(width - size[2])
      up(powerBoostFloatHeight)
      back(length)
      yrot(90)
      zrot(180)
    {
      if (showRealBoards) {
        color("blue")  powerBoost1000C();
      }
      color("blue", alpha=alpha) powerBoost1000CMask();
    }
    back(length + wallWidth + 1)
      left(size[2] - pcbHeight - 1.5)
      up(powerBoostFloatHeight + size[0] / 2)
      right(width)
      yrot(90)
      zscale(1.1)
      usb_male_micro_b_connector();
  }


  // Rotary encoder
  union() {
    size = rotaryEncoderBoxSize();
    color("gray")
      right(width - size[0] - rotaryEncoderInset)
      up(rotaryEncoderFloatHeight + PRINTER_SLOP)
      rotaryEncoder();
  }
}

// Hacky helper so we can iteratively output nut holders.
module positionNutHolder(i) {
  if (i == 1) {
    up(height - lidInsetDepth)
      right(piXInset + pcbHeight + piBatterySpacing + batterySize[0])
      zflip()
      zrot(90)
      children();
  } else if (i == 2) {
    up(height - lidInsetDepth)
      right(piXInset + pcbHeight + piBatterySpacing + batterySize[0] + nutVertexDistance + wallWidth * 2)
      back(length - nutDepth - 2 * wallWidth)
      zflip()
      zrot(90)
      children();
  }
}

module piBox(fadecandy=false) {
  up(wallWidth) right(wallWidth) back(wallWidth) {
    //circuit();
    difference() {
      union() {

        // Pi and battery platforms
        union() {
          piPlatformInset = 20;
          piPlatformHeight = 10;
          piHeaderInset = 7;
          cuboid(size=[piPlatformInset, length - piLength + piHeaderInset, piPlatformHeight], p1=[0, 0, 0]);
          back(length - piHeaderInset) cuboid(size=[piPlatformInset, piHeaderInset, piPlatformHeight], p1=[0, 0, 0]);
        }

        // PowerBoost platform
        union() {
          size = powerBoost1000CSize();
          backAngleStartHeight = powerBoostFloatHeight + 2;
          backAngleHeight = 4.5;
          backAngleSupportLength = 4;
          backAngleInternalLength = 3;
          platformInset = size[2] + 2;//  - wallWidth; // - wallWidth covers the adjustment of the board to push the switch through the wall.
          platformWidth = 4 + pcbHeight;

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
                         platformWidth,
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

            // Middle support
            back(12)
              cuboid(size=[
                       platformWidth,
                       8,
                       powerBoostFloatHeight + 4,
                     ], p1=[0, 0, 0]);

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
          channelLength = 15 + size[1];
          holderWallWidth = 2;
          holderWallHeight = 6;
          backWallWidth = 3;
          backSupportWidth = 4;
          backSupportLength = 8;
          platformWidth = 2 * holderWallWidth + size[0];
          right(width - size[0] - rotaryEncoderInset - holderWallWidth) {

            // Main platform
            cuboid(size=[platformWidth, size[1] + channelLength, rotaryEncoderFloatHeight], p1=[0, 0, 0]);

            // Walls near output
            for (i = [0, 1]) {
              right(i * (platformWidth - holderWallWidth))
                up(rotaryEncoderFloatHeight)
                cuboid(size=[holderWallWidth, size[1], holderWallHeight], p1=[0, 0, 0]);
            }

            // Screw goes through here and attaches to a spacer
            back(channelLength + size[1]) difference() {
              cuboid(size=[platformWidth, backWallWidth, rotaryEncoderFloatHeight + size[2]], p1=[0, 0, 0]);
              up(rotaryEncoderFloatHeight + size[2] / 2)
                right(size[0] / 2 + holderWallWidth)
                back(epsilon)
                ycyl(d=screwDiameter, h=backWallWidth * 2);
            }

            // Extra supports for the screw wall.
            for (i = [0, 1]) {
              right(i * (platformWidth - backSupportWidth))
                back(channelLength + size[1] + backWallWidth)
                right_triangle(
                  size=[backSupportWidth, backSupportLength, rotaryEncoderFloatHeight + size[2]],
                  orient=ORIENT_X
                );

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
            forward(wallWidth) cuboid(size=[nutDepth + 2 * wallWidth, nutVertexDistance + wallWidth, lidInsetDepth], p1=[0, 0, -lidInsetDepth]);
            nutHolder(
              nutVertexDistance=nutVertexDistance,
              nutEdgeDistance=nutEdgeDistance,
              nutDepth=nutDepth,

              screwDiameter=screwDiameter,

              wallWidthLeft=wallWidth,
              wallWidthFront=wallWidth,
              wallWidthRight=wallWidth,
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
}

piBox();