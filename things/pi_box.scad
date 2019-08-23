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
width = 33;
height = 37;

fillet = 2;

pcbHeight = 1.4;

piHeight = 1.6 + 3.25;
piWidth = 30;
piLength = 65;

// From the left wall, clear the battery with some leeway for pins.
piXInset = 7.5;

// From the back wall, to make the SD card jut out a bit less.
piYInset = 0.5;

batterySize = [7, 60, 36];

powerBoostFloatHeight = 7;
powerBoostGhostSize=[powerBoost1000CSize()[0], powerBoost1000CSize()[1], 3 + pcbHeight];
powerBoostWallInlayDepth = 1;
powerBoostBackAngleHeight = 4.5;


rotaryEncoderFloatHeight = (height - rotaryEncoderBoxSize()[2]) / 2;
rotaryEncoderInset = 2;
rotaryEncoderPlatformLength = 4;

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

textInlay = 0.75;

pinholeDiameter = 2;

// Might be useful for debugging, this makes renders much slower though.
showRealBoards = false;

module circuit(withMovement=false, pinholes=true) {
  alpha = showRealBoards ? 0.1 : 1;

  // Battery
  batteryPosition = [PRINTER_SLOP + lidInsetWidth, length - batterySize[1] - 2 * PRINTER_SLOP - lidInsetWidth, PRINTER_SLOP];
  color("red") translate(batteryPosition) slop(size=batterySize) cuboid(size=batterySize, p1=[0, 0, 0]);

  // Pi
  right(piXInset + piHeight)
    back(piYInset + PRINTER_SLOP)
    //back(length - PRINTER_SLOP - piYInset)
    // - 2 ensures the USB port (which hangs 1mm over the pi) is accessible
    up(height - PRINTER_SLOP + wallWidth - 2)
    yrot(-90) {
    zrot(90) {
      if (showRealBoards) {
        color("green") piZeroW();
      }
      color("green", alpha=alpha) piZeroWMask(dataUSBOverhang=wallWidth * 3);
    }

    if (pinholes) {
      color("yellow", alpha=0.2) {
        back(piLength - wallWidth * 1.5) up(pcbHeight + pinholeDiameter / 2) left(wallWidth) xcyl(l=height, d=pinholeDiameter, align=V_ALLPOS);
        back(piLength - 25) down(pcbHeight + pinholeDiameter / 2 + wallWidth) left(wallWidth) xcyl(l=height, d=pinholeDiameter, align=V_ALLPOS);
      }

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
      inlayExtraWidth = [2, 3];
      inlayDepth = 1;
      sdCardAdditionalMaskSize = [sdCardSize[0] + 2 * inlayExtraWidth[0], wallWidth, sdCardSize[2] + 2 * inlayExtraWidth[1]];
      color("purple", alpha=0.3)
        forward(wallWidth + (wallWidth - inlayDepth))
        left(sdCardAdditionalMaskSize[0] - inlayExtraWidth[0])
        down(inlayExtraWidth[1])
        cuboid(size=sdCardAdditionalMaskSize, p1=[0, 0, 0]);
    }
  }

  // PowerBoost and plug. The weird initial transformation is because
  // this was initially written with a different box layout.
  up(powerBoostFloatHeight - (height - powerBoostFloatHeight - powerBoost1000CSize()[0]))
    up(height) back(length) xrot(180) {
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

      // Pinholes for lights
      if (pinholes) {
        color("yellow", alpha=0.2) {
          back(8) up(pcbHeight - 1 + pinholeDiameter / 2) right(size[0] - height) xcyl(l=(2 * height), d=pinholeDiameter, align=V_ALLPOS);
          back(size[1] - 9) up(pcbHeight - 1 + pinholeDiameter / 2) right(size[0] - height) xcyl(l=(2 * height), d=pinholeDiameter, align=V_ALLPOS);
        }
      }

      // We can get this much "extra" length-wise movement by flipping
      // the switch.
      switchTravel = 1.5;

      if (withMovement) {
        // Create a mask for the region through which the chip needs to
        // move to get it into position while the switch is attached.
        color("purple", alpha=0.3) back(switchTravel) {
          down(powerBoostGhostSize[2] - pcbHeight)
            slop(size=powerBoostGhostSize)
            cuboid(size=powerBoostGhostSize, p1=[0, 0, 0]);

          powerBoost1000CMask();
        }
      }

      // Through-screw with a bit of extra diameter (the real thing is
      // 2.5mm), since our positioning isn't exact and it doesn't
      // really matter if this hole is a bit too big. It just needs to
      // hold the board in the x-direction.
      color("gray")
        back(size[1] - 2.25) right(5)
        zcyl(d=3, l=12);

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


  // Rotary encoder. The weird initial transformation is because this
  // was initially written with a different box layout.
  up(2 * PRINTER_SLOP + rotaryEncoderFloatHeight - (height - rotaryEncoderBoxSize()[2] - rotaryEncoderFloatHeight))
    up(height) back(length) xrot(180) {
    size = rotaryEncoderBoxSize();
    color("gray")
      right(width - size[0] - rotaryEncoderInset) {
      up(rotaryEncoderFloatHeight + PRINTER_SLOP)
        back(PRINTER_SLOP)
        rotaryEncoder();
    }
  }

  // Here
  color("green")
    left(wallWidth - textInlay)
    back(length / 2)
    up(wallWidth)
    xrot(90) yrot(-90)
    linear_extrude(height=textInlay + wallWidth)
    text("HERE", font="Helvetica", size=16, halign="center");
}

// Hacky helper so we can iteratively output nut holders.
module positionNutHolder(i) {
  if (i == 1) {
    up(height - lidInsetDepth)
      right(width - PRINTER_SLOP)
      back(length - 16)
      xflip()
      zflip()
      children();
  } else if (i == 2) {
    up(height - lidInsetDepth)
      right(piXInset + pcbHeight + 3.25 + nutVertexDistance + nutHolderWallWidth * 2)
      back(PRINTER_SLOP)
      zflip()
      zrot(90)
      children();
  }
}

module lid() {
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
        positionNutHolder(i=i) {
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
      right(piXInset + piHeight - pcbHeight / 2)
        up(height)
        zflip() {
        back(25)
          cuboid(size=[pcbHeight + holderWallWidth * 2, 10, height - piWidth - 0.5], p1=[-holderWallWidth - pcbHeight / 2, 0, 0]);
      }

      // Hold PowerBoost in place vertically
      union() {
        right(width - PRINTER_SLOP)
          up(height)
          zflip()
          back(PRINTER_SLOP)
          yflip()
          xflip() {
          yflip() cuboid(size=[powerBoost1000CSize()[2] + wallWidth, 3, height - powerBoost1000CSize()[0] - powerBoostFloatHeight + wallWidth],
                 p1=[0, 0, 0]);

          cornerInset = 1.5;
          forward(powerBoost1000CSize()[1])
            right(powerBoost1000CSize()[2] - pcbHeight / 2)
            cuboid(size=[wallWidth * 2, wallWidth * 2, height - powerBoost1000CSize()[0] - powerBoostFloatHeight + cornerInset],
                   p1=[-wallWidth, -wallWidth, 0]);

        }
      }
    }
    circuit();
  }
}

module piBox() {
  up(wallWidth) right(wallWidth) back(wallWidth) {
    //circuit();

    difference() {
      union() {

        // Pi and battery platforms
        union() {
          piPlatformInset = 15;
          piHeaderInset = 4.5;
          cuboid(size=[piPlatformInset, length - piLength + piHeaderInset, 18], p1=[0, 0, 0]);
          back(length - piHeaderInset) cuboid(size=[piPlatformInset, piHeaderInset, 14], p1=[0, 0, 0]);
        }

        // PowerBoost platform
        back(length) yflip() {
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
              towerLength = 6;
              pinInset = 2.5;
              right(platformInset - size[2] + pcbHeight + powerBoostWallInlayDepth + towerExtraDistance)
                back(backAngleSupportLength) {
                cuboid(size=[
                         towerWidth,
                         towerLength,
                         powerBoostFloatHeight + size[0] - pinInset
                       ], p1=[0, 0, 0]
                );

                /* for (i = [0, 1]) { */
                /*   forward(towerWidth * (1 - i)) */
                /*     back((towerLength) * i) */
                /*     cuboid([size[2] - pcbHeight - towerExtraDistance, */
                /*             towerWidth, */
                /*             powerBoostFloatHeight + size[0] - pinInset], p1=[0, 0, 0]); */
                /* } */

                cuboid(size=[
                         size[2] - pcbHeight - towerExtraDistance,
                         towerLength,
                         powerBoostFloatHeight + size[0] - 9,
                       ], p1=[0, 0, 0]
                );
              }
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
        back(length) yflip() {
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

      circuit(withMovement=true);
    }

    // Outer box
    difference() {
      color(alpha=0.3) outerBox(
        wallWidth=wallWidth,
        size=[width, length, height],
        fillet=fillet
      );
      circuit(withMovement=true, pinholes=false);
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
      lid();
  }
}

piBox();