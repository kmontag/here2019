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

pcbHeight = 1.4;

piWidth = 30;
piLength = 65;

// From the left wall, clear the battery with some leeway for pins.
piXInset = 9;

 // From the back wall, to make the SD card jut out a bit less.
piYInset = 0.5;

batterySize = [5, 62, 34];

powerBoostFloatHeight = 7;
powerBoostGhostSize=[powerBoost1000CSize()[0], powerBoost1000CSize()[1], 3 + pcbHeight];
powerBoostWallInlayDepth = 1;
powerBoostBackAngleHeight = 4.5;


rotaryEncoderFloatHeight = (height - rotaryEncoderBoxSize()[2]) / 2;
rotaryEncoderInset = 2;
rotaryEncoderPlatformLength = 6;

nutVertexDistance = 6.5 + PRINTER_SLOP;
nutEdgeDistance = 5.65 + PRINTER_SLOP;
nutDepth = 3;
screwDiameter = 3 + PRINTER_SLOP;
nutHolderWallWidth = 1;

// Post to lock the rotary encoder.
postFloatHeight = 3;
postSize = [screwDiameter * 2, 2, rotaryEncoderFloatHeight - postFloatHeight + screwDiameter * 2 + 3];


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

module circuit(fadeCandy) {
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
      back(length - PRINTER_SLOP + wallWidth - powerBoostWallInlayDepth)
      yrot(90)
      zrot(180)
    {
      if (showRealBoards) {
        color("blue")  powerBoost1000C();
      }
      color("blue", alpha=alpha) {
        powerBoost1000CMask();
        // Leave a small amount of wiggle room at the front
        color("purple", alpha=0.3) down(PRINTER_SLOP) powerBoost1000CMask();
      }

      // We can get this much "extra" length-wise movement by flipping
      // the switch.
      switchTravel = 1.5;

      // Create a mask for the region through which the chip needs to
      // move to get it into position while the switch is attached.
      color("purple", alpha=0.3) back(switchTravel) {
        down(powerBoostGhostSize[2] - pcbHeight)
          slop(size=powerBoostGhostSize)
            cuboid(size=powerBoostGhostSize, p1=[0, 0, 0]);

        // PowerBoost mask without the actual switch, to avoid
        // creating a bigger outer hole than necessary.
        difference() {
          powerBoost1000CMask();
          up(powerBoost1000CSize(true)[2] + PRINTER_SLOP)
            cuboid(size=powerBoost1000CSize(), p1=[0, 0, 0]);
        }
      }

      // Through-screw with a bit of extra diameter (the real thing is
      // 2.5mm), since our positioning isn't exact and it doesn't
      // really matter if this hole is a bit too big. It just needs to
      // hold the board in the x-direction.
      color("gray")
        back(size[1] - 2.25) right(size[0] - 5)
        zcyl(d=3, l=12);

      color("gray")
        back(size[1]) right(size[0])
        up(screwDiameter / 2 - pcbHeight / 2)
        left(size[0] - powerBoostBackAngleHeight - wallWidth - nutVertexDistance / 2)
        ycyl(d=screwDiameter, l=12, align=ALIGN_POS);
    }



    back(length + wallWidth + PRINTER_SLOP)
      left(size[2] - pcbHeight - 2.5)
      up(powerBoostFloatHeight + size[0] / 2)
      right(width) {

      yrot(90)
        zscale(1.1)
        usb_male_micro_b_connector();
      // Need a bit of extra space around the actual port, the module
      // above doesn't quite cover it in practice.
      color("purple", alpha=0.3) back(wallWidth) right(0.25) cuboid(size=[3, wallWidth * 5, 8]);
    }
  }


  // Rotary encoder
  union() {
    size = rotaryEncoderBoxSize();
    color("gray")
      right(width - size[0] - rotaryEncoderInset) {
      up(rotaryEncoderFloatHeight + PRINTER_SLOP)
        back(PRINTER_SLOP)
        rotaryEncoder();

      /* back(rotaryEncoderPlatformLength - wallWidth) */
      /*   right(size[0] / 2 + 2) */
      /*   up(PRINTER_SLOP + postFloatHeight) */
      /*   // z-dimension isn't correct but doesn't really matter */
      /*   // here. Leave a lot of extra space, this doesn't need to be */
      /*   // completely snug. */
      /*   slop(size=[postSize[0], postSize[1], rotaryEncoderFloatHeight], slop=0.5) */
      /*   rotaryEncoderPost(); */

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
      right(width - PRINTER_SLOP)
      back(16)
      xflip()
      zflip()
      children();
  } else if (i == 2) {
    up(realHeight - lidInsetDepth)
      right(piXInset + pcbHeight + nutVertexDistance + nutHolderWallWidth * 2)
      back(length - nutDepth - 2 * nutHolderWallWidth - PRINTER_SLOP)
      zflip()
      zrot(90)
      children();
  }
}


// Gets inserted behind the rotary encoder after placing it. Attach a
// spacer to push the encoder into position.
module rotaryEncoderPost() {
  color("gray") {
    difference() {
      cuboid(size=postSize,
             p1=[-postSize[0] / 2, -postSize[1], 0]);
      up(postSize[2] - screwDiameter * 1.5)
        ycyl(d=screwDiameter, l=postSize[1] * 3);
    }
  }
}

module piBox(fadeCandy=false) {
  up(wallWidth) right(wallWidth) back(wallWidth) {
    //circuit(fadeCandy=fadeCandy);
    realHeight = height + (fadeCandy ? fadeCandyExtraHeight : 0);

    difference() {
      union() {

        // Pi and battery platforms
        union() {
          piPlatformInset = 15;
          piHeaderInset = 7;
          cuboid(size=[piPlatformInset, length - piLength + piHeaderInset, 10], p1=[0, 0, 0]);
          back(length - piHeaderInset) cuboid(size=[piPlatformInset, piHeaderInset, 14], p1=[0, 0, 0]);
        }

        // PowerBoost platform
        union() {
          size = powerBoost1000CSize();
          backAngleStartHeight = powerBoostFloatHeight + 2;
          backAngleSupportLength = 5;
          backAngleInternalLength = 3;
          platformInset = size[2] - powerBoostWallInlayDepth - pcbHeight + powerBoostGhostSize[2];

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
                       backAngleStartHeight + powerBoostBackAngleHeight,
                     ], p1=[0, 0, 0]);
              back(backAngleSupportLength)
                cuboid(size=[
                         wallWidth + powerBoostGhostSize[2],
                         backAngleInternalLength,
                         backAngleStartHeight,
                       ], p1=[0, 0, 0]);

              back(backAngleSupportLength)
                up(backAngleStartHeight + powerBoostBackAngleHeight)
                right(platformInset)
                zrot(90)
                zflip()
                right_triangle([backAngleInternalLength, platformInset, powerBoostBackAngleHeight]);

              // Tower for screwing the board in
              towerExtraDistance = 1;
              towerWidth = 1.5;
              towerLength = 7;
              right(platformInset - size[2] + pcbHeight + powerBoostWallInlayDepth + towerExtraDistance)
                back(backAngleSupportLength) {


                cuboid(size=[
                         towerWidth,
                         towerLength,
                         powerBoostFloatHeight + size[0]
                       ], p1=[0, 0, 0]
                );

                cuboid(size=[
                         size[2] - pcbHeight - towerExtraDistance,
                         towerLength,
                         powerBoostFloatHeight + size[0] - 9,
                       ], p1=[0, 0, 0]
                );
              }

              // Tower for pushing the board agains the USB wall
              //right(platformInset - size[2] - screwDiameter / 2 - wallWidth / 2)
                cuboid(size=[
                       platformInset,
                       towerWidth,
                       powerBoostFloatHeight + 15
                     ], p1=[0, backAngleSupportLength - nutDepth - 0.5 - towerWidth, 0]);
            }

            // Front support
            frontSupportLength = 2;
            back(size[1] - frontSupportLength) {
              cuboid(size=[
                       size[2] + powerBoostGhostSize[2] - pcbHeight,
                       frontSupportLength,
                       powerBoostFloatHeight + 6,
                     ], p1=[platformInset - size[2] - pcbHeight, 0, 0]);
              cuboid(size=[
                       wallWidth + pcbHeight,
                       frontSupportLength,
                       powerBoostFloatHeight + 12,
                     ], p1=[platformInset - size[2] - pcbHeight, 0, 0]);
            }

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
      circuit(fadeCandy=fadeCandy);
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
          cuboid(size=[pcbHeight + holderWallWidth * 2, 10, realHeight - piWidth - 0.5], p1=[-holderWallWidth - pcbHeight / 2, 0, 0]);

        // Hold PowerBoost in place vertically
        right(width - PRINTER_SLOP)
          up(realHeight)
          zflip()
          back(length - PRINTER_SLOP)
          yflip()
          xflip()
          cuboid(size=[powerBoost1000CSize()[2] + wallWidth, 3, realHeight - powerBoost1000CSize()[0] - powerBoostFloatHeight - 0.5], p1=[0, 0, 0]);

      }
      circuit(fadeCandy=fadeCandy);
    }
  }

  /* // Little parts. */
  /* right(width * 2 + 22 + (fadeCandy ? fadeCandyExtraWidth : 0)) { */
  /*   xrot(-90) rotaryEncoderPost(); */
  /* } */
}

piBox();