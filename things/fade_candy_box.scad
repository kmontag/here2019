include <BOSL/constants.scad>
use <BOSL/shapes.scad>
use <BOSL/transforms.scad>
use <math.scad>
use <nut_holder.scad>
use <outer_box.scad>

$fn=30;

wallWidth = 2;
fillet = 2;

pcbHeight = 1.2;

cableDiameter = 4.5 + 2 * PRINTER_SLOP;
cableGapLeeway = 1;
cableGapWidth = cableDiameter + cableGapLeeway;
cableGapPinch = 0.2;
cableExtraInset = 7;
separatorWallHeight = 4 * cableDiameter;
numOutputs = 8;

nutVertexDistance = 6.5 + PRINTER_SLOP;
nutEdgeDistance = 5.65 + PRINTER_SLOP;
nutDepth = 3;
screwDiameter = 3 + PRINTER_SLOP;
nutHolderWallWidth = 1;

fadeCandySideSpacing = 12;

fadeCandySize = [20 + 2 * PRINTER_SLOP, 38 + 2 * PRINTER_SLOP, pcbHeight + 2 * PRINTER_SLOP];
usbPortSize = [7.3, 9.85, 4];
usbPortStartX = 7;

textInlay = 1;

lidInsetWidth = 1;
lidInsetDepth = 1;

size = [
  fadeCandySize[2] + usbPortSize[2] + 2 * (fadeCandySideSpacing + cableExtraInset + wallWidth + cableGapWidth),
  fadeCandySize[1] + 2 * PRINTER_SLOP,
  fadeCandySize[0] + 3 * PRINTER_SLOP + lidInsetDepth,
];


module circuit() {
  // Fadecandy
  right((size[0] + usbPortSize[2]) / 2 + fadeCandySize[2]) yrot(-90) right(PRINTER_SLOP) union() {
    // PCB
    slop(size=fadeCandySize)
      color("blue") cuboid(size=fadeCandySize, p1=[0, 0, 0]);

    // USB port with overhang for an insert
    usbOverhang = 5;
    right(usbPortStartX)
      up(pcbHeight) {
      forward(usbOverhang)
      slop(size=usbPortSize)
      color("gold") cuboid(size=usbPortSize + [0, usbOverhang, 0], p1=[0, 0, 0]);

      // Space for clips on the sdies
      for (i = [0, 1]) {
        clipDim = 2;
        right(i * usbPortSize[0])
          color("white") cuboid([clipDim, usbPortSize[1] + PRINTER_SLOP, clipDim], p1=[(i - 1) * clipDim, PRINTER_SLOP, 0]);

      }
    }

    // Surface components (where relevant).
    color("green", alpha=0.5)
      up(pcbHeight)
      back(2 - PRINTER_SLOP)
      cuboid(size=[usbPortStartX, 12, 2], p1=[0, 0, 0]);
  }

  // Data cables and markers
  color("gray") union() {
    for (side = [0: 1]) {
      for (col = [0 : 1]) {
        for (row = [0 : 1]) {
          up(separatorWallHeight * (row / 2 + 1 / 4) + cableDiameter / 2)
            back(cableGapWidth * (1 + col * 2) + col * wallWidth)
            right(PRINTER_SLOP + side * (size[0] + wallWidth))
            xcyl(d=cableDiameter, l=wallWidth * 2, align=V_ALLNEG);

          left(wallWidth - textInlay)
            up(cableDiameter * (1 + 2 * row))
            back(cableDiameter * (2.5 + 3 * col - side * 0.6) - 1)
            right((size[0] + wallWidth) * side)
            xrot(90)
            yrot(-90)
            mirror([0, 0, side])
            mirror([side, 0, 0])
            linear_extrude(height = textInlay + wallWidth)
            text(str(side == 0 ?
                     3 - (2 * row + col) :
                     8 - (1 - col) - row * 2 - 1),
                 valign="center", halign="left", size=cableDiameter, font="Liberation Sans");
        }
      }
    }
  }

  // Here
  color("green")
    right(size[0] / 2)
    up(wallWidth)
    back(size[1] - textInlay + wallWidth)
    zrot(180)
    xrot(90)
    linear_extrude(height=textInlay + wallWidth)
    text("HERE", font="Helvetica", size=16, halign="center", valign="bottom");

}

module lid(mask=false) {
  difference() {
    union() {
      outerBoxLid(
        wallWidth=wallWidth,
        size=size,
        fillet=fillet,
        insetWidth=lidInsetWidth,
        insetDepth=lidInsetDepth
      );

      nutHolderPositions = [[PRINTER_SLOP, size[1] - PRINTER_SLOP - wallWidth], [size[0] - PRINTER_SLOP - 2 * nutHolderWallWidth - nutDepth, size[1] - PRINTER_SLOP - wallWidth]];
      for (i = [0: 1]) {
        up(size[2]) {
          down(lidInsetDepth)
            right(nutHolderPositions[i][0])
            back(nutHolderPositions[i][1])
            yscale(-1)
            zflip() {

            if (mask) {
              nutHolderMask(
                nutVertexDistance=nutVertexDistance,
                nutEdgeDistance=nutEdgeDistance,
                screwDiameter=screwDiameter,
                l=(size[1] / 2)
              );
            } else {
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
        }
      }

      // Hold the FadeCandy in place vertically
      extraSpace = 0.3 + PRINTER_SLOP;
      right(size[0] / 2 - wallWidth / 2)
        back(size[1] / 2)
        up(fadeCandySize[0] + extraSpace)
        cuboid([4 * wallWidth, wallWidth, size[2] - fadeCandySize[0] - extraSpace], p1=[0, 0, 0]);
    }
    color(alpha=0.1) circuit();
  }
}

right(wallWidth) back(wallWidth) up(wallWidth) {

  //circuit();

  // Internals
  difference() {
    union() {
      // Walls holding the FadeCandy in place. These are positioned to
      // avoid bumping into components on the chip surface.
      right(size[0] / 2 - wallWidth) {
        platformWidth = 4 * wallWidth;
        left(pcbHeight + usbPortSize[2])
          cuboid(size=[platformWidth + pcbHeight + usbPortSize[2], usbPortSize[1] * 0.75, usbPortStartX + usbPortSize[0] * 0.75], p1=[0, 0, 0]);
        cuboid(size=[platformWidth, 3, 8], p1=[0, fadeCandySize[1] - 15, 0]);
      }


      // Strain relief channels for cables.
      for (side = [0 : 1]) {
        right(side * size[0]) mirror([side, 0, 0]) union() {
          for (i = [0 : 1]) {
            back(i * (2 * cableGapWidth + wallWidth) - wallWidth) {
              back(3 * cableGapWidth - wallWidth * 2)
                cuboid(size=[cableGapWidth + wallWidth + cableExtraInset, wallWidth, separatorWallHeight],
                       p1=[0, 0, 0]);
              back(wallWidth - PRINTER_SLOP) right(cableGapWidth)
                cuboid(size=[wallWidth, cableGapWidth + cableGapLeeway + PRINTER_SLOP + cableGapPinch, separatorWallHeight], p1=[0, 0, 0]);
            }
          }
        }
      }


    }
    circuit();

    // Make sure we're not running into the lid.
    lid(mask=true);
  }

  // Outer box
  difference() {
    color(alpha=0.1)
      outerBox(
        wallWidth=wallWidth,
        size=size,
        fillet=fillet
      );

    circuit();
    lid(mask=true);
  }

  // Lid
  back(size[1] + 10)
    right(size[0])
    yrot(180)
    down(size[2])
    lid();
}