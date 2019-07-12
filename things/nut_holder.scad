include <BOSL/constants.scad>
include <BOSL/shapes.scad>
include <BOSL/transforms.scad>

/**
 * lol
 *
 * Attach this in line with the rim of a lid. Place a nut inside; it
 * will be held in place so you can screw into it through the holes in
 * the surrounding walls. If you put a hole in the wall of the
 * containing box, you'll be able to hold the lid in place.
 */
module nutHolder(
  // "Diameter" between two opposite vertices and edges.
  nutVertexDistance,
  nutEdgeDistance,

  nutDepth,

  screwDiameter,

  // Left and right both have a screw hole.
  wallWidthLeft,
  wallWidthFront,
  wallWidthRight,
  wallWidthTop,

  alphaTop=0.5,
) {
  wallHeight = nutEdgeDistance;
  totalWidth = wallWidthLeft + nutDepth + wallWidthRight;
  epsilon = 1;

  // Move forward so the point where the nut hits the back wall is
  // preserved if we mirror along the x-axis.
  difference() {
    yflip() forward(nutVertexDistance) union() {
      // Left
      cuboid(size=[wallWidthLeft, nutVertexDistance, wallHeight], p1=[0, 0, 0]);

      // Front
      cuboid(size=[totalWidth, wallWidthFront, wallHeight], p1=[0, nutVertexDistance, 0]);

      // Right
      cuboid(size=[wallWidthRight, nutVertexDistance, wallHeight], p1=[wallWidthLeft + nutDepth, 0, 0]);

      // Top
      color(alpha=alphaTop)
        cuboid(
          size=[wallWidthLeft + nutDepth + wallWidthRight, wallWidthFront + nutVertexDistance, wallWidthTop],
          p1=[0, 0, wallHeight]
        );
    }

    nutHolderMask(
      nutVertexDistance=nutVertexDistance,
      nutEdgeDistance=nutEdgeDistance,
      screwDiameter=screwDiameter,
      l=(totalWidth * 2) + epsilon
    );
  }

}

/**
 * Place this at the same location as a `nutHolder` to get a cylinder
 * aligned with the object's screw hole. You can then remove this
 * cylinder from e.g. a containing box.
 */
module nutHolderMask(
  nutVertexDistance,
  nutEdgeDistance,
  screwDiameter,
  l=1
) {
  up(nutEdgeDistance / 2) back(nutVertexDistance / 2)
    xcyl(d=screwDiameter, l);
}

nutHolder(
  nutVertexDistance=6,
  nutEdgeDistance=5,
  nutDepth=3,

  screwDiameter=2.5,

  wallWidthLeft=2,
  wallWidthFront=2,
  wallWidthRight=4,
  wallWidthTop=2
);
