use <BOSL/shapes.scad>
use <BOSL/transforms.scad>

minHeight = 0.75;
extraHeight = 1.5 - minHeight;

width = 6;
length = 5;


cuboid([length, width, minHeight], p1=[0, 0, 0]);
up(minHeight) right_triangle([length, width, extraHeight]);