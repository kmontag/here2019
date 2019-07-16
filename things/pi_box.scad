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

// From the left wall, clear the battery with some leeway for pins.
piXInset = 9;

 // From the back wall, to make the SD card jut out a bit less.
piYInset = 0.5;

batterySize = [5, 62, 34];

powerBoostFloatHeight = 7;
powerBoostBackerSize=[powerBoost1000CSize()[0] / 2, powerBoost1000CSize()[1], wallWidth + 1];

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

// Accomodates pins and the USB mini plug w/ terminal block.
fadeCandyRightSpacing = 10;
fadeCandyLeftSpacing = 10;

// Channel width, should be roughly the cable diameter.
fadeCandyCableGapWidth = 6;

fadeCandySize = [pcbHeight + 2 * PRINTER_SLOP, 38 + 2 * PRINTER_SLOP, 20 + 2 * PRINTER_SLOP];
fadeCandyExtraWidth = // Computed from right to left
  fadeCandyRightSpacing +
  fadeCandySize[0] +
  fadeCandyLeftSpacing +
  wallWidth +
  2 * fadeCandyCableGapWidth;

// Covers the USB plug in the Pi.
fadeCandyExtraHeight = 5;

// Accomodates the USB mini plug w/ terminal block.
fadeCandyFloatHeight = 18 - fadeCandySize[2] / 2;

// Might be useful for debugging, this makes renders much slower though.
showRealBoards = false;

module circuit(fadeCandy, powerBoostAdditionalMask = false) {
  alpha = showRealBoards ? 0.1 : 1;

  // Battery
  batteryPosition = [PRINTER_SLOP + lidInsetWidth, length - batterySize[1] - 2 * PRINTER_SLOP - lidInsetWidth, PRINTER_SLOP];
  color("red") translate(batteryPosition) slop(size=batterySize) cuboid(size=batterySize, p1=[0, 0, 0]);

  // Pi
  right(piXInset) back(length - PRINTER_SLOP - piYInset) zrot(180) up(piWidth + PRINTER_SLOP) yrot(-90) {
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
      {
      forward(wallWidth * 3)
        xflip() cuboid(size=sdCardSize, p1=[0, 0, 0]);

        // Additional mask creates a 1mm inlay on the outer box.
        inlayExtraWidth = 2;
        inlayDepth = 1;
        sdCardAdditionalMaskSize = [sdCardSize[0] + 2 * inlayExtraWidth, wallWidth, sdCardSize[2] + 2 * inlayExtraWidth];
        color("purple", alpha=0.3)
          forward(wallWidth + (wallWidth - inlayDepth))
          left(sdCardAdditionalMaskSize[0] - inlayExtraWidth)
          down(inlayExtraWidth)
          cuboid(size=sdCardAdditionalMaskSize, p1=[0, 0, 0]);
      }
  }

  // PowerBoost and plug
  union() {
    size = powerBoost1000CSize();
    right(width - size[2] + 1)
      up(powerBoostFloatHeight)
      back(length - PRINTER_SLOP + wallWidth - 1)
      yrot(90)
      zrot(180)
    {
      if (showRealBoards) {
        color("blue")  powerBoost1000C();
      }
      color("blue", alpha=alpha) powerBoost1000CMask();
      down(powerBoostBackerSize[2]) {
        slop(size=powerBoostBackerSize)

          powerBoostBacker();

        if (powerBoostAdditionalMask) {
          additionalMaskSize = [height + fadeCandyExtraHeight, wallWidth, powerBoostBackerSize[2] + powerBoost1000CSize(switch = false)[2] - 1];
          // Taller/wider cutout at the back for an even inlay
          color("purple", alpha=0.3) slop(size=additionalMaskSize) cuboid(
            size=additionalMaskSize,
            p1=[0, 0, 0]
          );
        }
      }
    }


    back(length + wallWidth)
      left(size[2] - pcbHeight - 1.5)
      up(powerBoostFloatHeight + size[0] / 2)
      right(width) {

      yrot(90)
        zscale(1.1)
        usb_male_micro_b_connector();
      // Need a bit of extra space around the actual port, the module
      // above doesn't quite cover it in practice.
      color("purple", alpha=0.3) cuboid(size=[3, wallWidth * 2, 8]);
    }
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

  // Fadecandy
  if (fadeCandy) {
    color("lightblue") union() {
      left(fadeCandyRightSpacing + fadeCandySize[0])
        back(length - fadeCandySize[1])
        up(fadeCandyFloatHeight)
        cuboid(size=fadeCandySize, p1=[0, 0, 0]);
    }
  }
}

// Hacky helper so we can iteratively output nut holders.
module positionNutHolder(i, fadeCandy) {
  realHeight = height + (fadeCandy ? fadeCandyExtraHeight : 0);
  if (i == 1) {
    up(realHeight - lidInsetDepth)
      right(width)
      back(rotaryEncoderPlatformLength)
      xflip()
      zflip()
      children();
  } else if (i == 2) {
    up(realHeight - lidInsetDepth)
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
  color("black") cuboid(size=powerBoostBackerSize, p1=[0, 0, 0]);
}

module piBox(fadeCandy=false) {
  up(wallWidth) right(wallWidth) back(wallWidth) {
    circuit(fadeCandy=fadeCandy);
    realHeight = height + (fadeCandy ? fadeCandyExtraHeight : 0);

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
          platformInset = size[2] + wallWidth + powerBoostBackerSize[2];

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
                         wallWidth + powerBoostBackerSize[2],
                         backAngleInternalLength,
                         backAngleStartHeight + backAngleHeight
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

      circuit(fadeCandy=fadeCandy);
    }

    // Outer box
    difference() {
      color(alpha=0.3) left(fadeCandy ? fadeCandyExtraWidth : 0) outerBox(
        wallWidth=wallWidth,
        size=[width + (fadeCandy ? fadeCandyExtraWidth : 0), length, realHeight],
        fillet=fillet
      );
      circuit(fadeCandy=fadeCandy, powerBoostAdditionalMask=true);
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
    right(2 * width + 10) yrot(180) down(realHeight)
      difference() {
      union() {
        left(fadeCandy ? fadeCandyExtraWidth : 0) outerBoxLid(
          wallWidth=wallWidth,
          size=[width + (fadeCandy ? fadeCandyExtraWidth : 0), length, realHeight],
          fillet=fillet,
          insetWidth=lidInsetWidth,
          insetDepth=lidInsetDepth
        );

        for (i = [1, 2]) {
          positionNutHolder(i=i, fadeCandy=fadeCandy) {
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
          up(realHeight)
          zflip()
          back(length - 35)
          cuboid(size=[pcbHeight + holderWallWidth * 2, 10, realHeight - piWidth + 3], p1=[-holderWallWidth - pcbHeight / 2, 0, 0]);

        // Hold PowerBoost in place vertically
        right(width)
          up(realHeight)
          zflip()
          back(length)
          yflip()
          xflip()
          cuboid(size=[powerBoost1000CSize()[2] + wallWidth, 3, realHeight - powerBoost1000CSize()[0] - powerBoostFloatHeight + 2], p1=[0, 0, 0]);

      }
      circuit(fadeCandy=fadeCandy);
    }
  }

  // Little parts.
  right(width * 2 + 22 + (fadeCandy ? fadeCandyExtraWidth : 0)) {
    up(postWidth / 2) yrot(90) xrot(-90) rotaryEncoderPost();
    back(25) powerBoostBacker();
  }
}

piBox();