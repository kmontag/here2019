include <BOSL/shapes.scad>
use <outer_box.scad>

$fn=30;

wallWidth = 2;
length = 60;
width = 30;
height = 20;

fillet = 1;


color(alpha=0.6) outerBox(
  wallWidth=wallWidth,
  length=length,
  width=width,
  height=height,
  fillet=fillet
);