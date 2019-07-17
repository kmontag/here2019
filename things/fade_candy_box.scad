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

fadeCandySideSpacing = 20;

fadeCandySize = [20 + 2 * PRINTER_SLOP, 38 + 2 * PRINTER_SLOP, pcbHeight + 2 * PRINTER_SLOP];
usbPortSize = [7.3, 9.85, 4];

textInlay = 1;

lidInset = 1;
lidDepth = 1;

size = [
  fadeCandySize[2] + usbPortSize[2] + 2 * (fadeCandySideSpacing + cableExtraInset + wallWidth + cableGapWidth),
  fadeCandySize[1] + 2 * PRINTER_SLOP,
  separatorWallHeight + lidDepth + 1,
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
          up(cableDiameter * 0.5)
          xrot(90)
          yrot(-90)
          linear_extrude(height = textInlay + wallWidth)
          text(str(numOutputs - 2 * (col + 1) + (1 - row)), size=cableDiameter, font="Liberation Sans");
        }
      }
    }
  }

}

circuit();

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
}

// Outer box
difference() {
  color(alpha=0.3)
    outerBox(
      wallWidth=wallWidth,
      size=size,
      fillet=fillet
    );

  circuit();
}