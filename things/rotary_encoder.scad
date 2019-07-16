include <BOSL/constants.scad>
use <BOSL/shapes.scad>
use <BOSL/transforms.scad>
use <math.scad>

boxSize = [13.2, 6.5, 12.5];
pinsMaskSize = [1.5, 6, 12.5];

module rotaryEncoder(slop = PRINTER_SLOP) {
  slop(size=boxSize, slop=slop) cuboid(size=boxSize, p1=[0, 0, 0]);
  for (i = [-1, 1]) {
    back(boxSize[1]) left(pinsMaskSize[0] / 2) right((i + 1) * boxSize[0] / 2)
      slop(size=pinsMaskSize, slop=slop) cuboid(size=pinsMaskSize, p1=[0, 0, 0]);
    
  }

  knobDiameter = 7;
  knobHeight = 15;
  right(boxSize[0] / 2) up(boxSize[2] / 2)
    yflip()
    slop(size=[knobDiameter, knobHeight, knobDiameter])
    ycyl(d=knobDiameter, align=ALIGN_POS, h=knobHeight);
}

function rotaryEncoderBoxSize() = boxSize;

rotaryEncoder();