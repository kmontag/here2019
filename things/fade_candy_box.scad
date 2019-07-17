include <BOSL/constants.scad>
use <BOSL/shapes.scad>
use <BOSL/transforms.scad>
use <math.scad>
use <nut_holder.scad>
use <outer_box.scad>

$fn=30;

wallWidth = 2;
fillet = 2;

pcbHeight = 1.6;

cableDiameter = 4 + 2 * PRINTER_SLOP;
cableGapWidth = cableDiameter + 0.5;
cableExtraInset = 3;
separatorWallHeight = 6 * cableDiameter;
numOutputs = 8;

nutVertexDistance = 6.5 + PRINTER_SLOP;
nutEdgeDistance = 5.65 + PRINTER_SLOP;
nutDepth = 3;
screwDiameter = 3 + PRINTER_SLOP;
nutHolderWallWidth = 1;


fadeCandySideSpacing = 20;

fadeCandySize = [20 + 2 * PRINTER_SLOP, 38 + 2 * PRINTER_SLOP, pcbHeight + 2 * PRINTER_SLOP];
usbPortSize = [7.3, 9.85, 4];

textInlay = 1;

lidInsetWidth = 1;
lidInsetDepth = 1;

size = [
  fadeCandySize[2] + usbPortSize[2] + 2 * (fadeCandySideSpacing + cableExtraInset + wallWidth + cableGapWidth),
  fadeCandySize[1] + 2 * PRINTER_SLOP,
  separatorWallHeight + 1,
];


module circuit() {
  // Fadecandy
  color("blue") right((size[0] + usbPortSize[2]) / 2 + fadeCandySize[2]) yrot(-90) right(PRINTER_SLOP) union() {
    // PCB
    slop(size=fadeCandySize)
      cuboid(size=fadeCandySize, p1=[0, 0, 0]);

    // USB port with overhang for an insert
    usbOverhang = 5;
    right(7)
      up(pcbHeight)
      forward(usbOverhang)
      slop(size=usbPortSize)
      cuboid(size=usbPortSize + [0, usbOverhang, 0], p1=[0, 0, 0]);
  }

  // Data cables and markers
  color("gray") union() {
    for (side = [0: 1]) {
      for (col = [0 : 1]) {
        for (row = [0 : 1]) {
          up(separatorWallHeight * (row / 2 + 1 / 4))
            back(cableGapWidth * (1.5 + col * 2) + col * wallWidth)
            right(PRINTER_SLOP + side * (size[0] + wallWidth))
            xcyl(d=cableDiameter, l=wallWidth * 2, align=V_ALLNEG);

          left(wallWidth - textInlay)
            up(cableDiameter * (1 + 3 * row))
            back(cableDiameter * (3 + 3 * col - side * 0.6) - 1)
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

      nutHolderPositions = [[size[0] / 4, PRINTER_SLOP], [size[0] * 3 / 4, size[1] - PRINTER_SLOP - nutHolderWallWidth * 2 - nutDepth]];
      for (i = [0: 1]) {
        up(size[2]) {
          down(lidInsetDepth)
            right(nutHolderPositions[i][0])
            back(nutHolderPositions[i][1])
            zrot(90) zflip() {

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
      right(size[0] / 2) {
        platformWidth = 2 * wallWidth + pcbHeight;
        cuboid(size=[platformWidth, 2, 2], p1=[0, 0, 0]);
        cuboid(size=[platformWidth, 3, 4], p1=[0, fadeCandySize[1] - 15, 0]);
      }


      // Strain relief channels for cables.
      for (side = [0 : 1]) {
        right(side * size[0]) mirror([side, 0, 0]) union() {
          for (i = [0 : 1]) {
            back(i * (2 * cableGapWidth + wallWidth) - wallWidth) {
              back(3 * cableGapWidth)
                cuboid(size=[cableGapWidth + wallWidth + cableExtraInset, wallWidth, separatorWallHeight],
                       p1=[0, 0, 0]);
              back(cableGapWidth) right(cableGapWidth)
                cuboid(size=[wallWidth, cableGapWidth, separatorWallHeight], p1=[0, 0, 0]);
            }
          }
          // Extra wall at the front
          back(cableGapWidth - 2 * wallWidth)
            cuboid(size=[cableGapWidth + wallWidth, wallWidth, separatorWallHeight],
                   p1=[0, 0, 0]);
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
  right(2 * size[0] + 10)
    yrot(180)
    down(size[2])
    lid();
}