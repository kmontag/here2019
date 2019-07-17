include <BOSL/constants.scad>
use <BOSL/shapes.scad>
use <BOSL/transforms.scad>
use <math.scad>

boardSize=[65, 30, 1.6];

/**
 * Detailed render.
 */
module piZeroW(slop = 0) {
  back(boardSize[1]) xrot(90) import("RaspberryPiZeroW.STL");
}

/**
 * Mask made from basic shapes. Incomplete, but contains all the
 * features we're using for this project.
 */
module piZeroWMask(slop = PRINTER_SLOP, dataUSBOverhang = 0, powerUSBOverhang = 0) {
  // Main board.
  slop(slop=slop, size=boardSize) cuboid(size=boardSize, p1=[0, 0, 0]);

  // Camera port
  cameraSize = [4.1, 17, 1.1];
  cameraPosition = [boardSize[0] - cameraSize[0] + 1, (boardSize[1] - cameraSize[1]) / 2, boardSize[2]];

  translate(cameraPosition)
    slop(slop=slop, size=cameraSize)
    cuboid(size=cameraSize, p1=[0, 0, 0]);

  // SD card and reader
  sdReaderSize = [12.5, 11.5, 1.35];
  sdReaderPosition = [0, 16.9 - sdReaderSize[1] / 2, boardSize[2]];

  translate(sdReaderPosition)
    slop(slop=slop, size=sdReaderSize)
    cuboid(size=sdReaderSize, p1=[0, 0, 0]);

  // USB ports
  for (i = [0, 1]) {
    extraUSBSlop = 0.2; // To make sure plugs can actually access these.
    portOverhang = 1;
    extraOverhang = (i == 0) ? dataUSBOverhang : powerUSBOverhang;
    usbPortSize=[7.5 + 2 * extraUSBSlop, 4.5 + portOverhang + extraOverhang + 2 * extraUSBSlop, 2.6 + extraUSBSlop];
    forward(extraOverhang + portOverhang + extraUSBSlop)
      right(37.8 - extraUSBSlop)
      right(i * 12.5)
      up(boardSize[2])
      slop(slop=slop, size=usbPortSize)
      cuboid(size=usbPortSize, p1=[0, 0, 0]);
  }

  // HDMI port
  hdmiPortSize = [11.25, 7.75, 3.25];
  hdmiOverhang = 0.5;
  right(7)
    up(boardSize[2])
    forward(hdmiOverhang)
    slop(slop=slop, size=hdmiPortSize) cuboid(size=hdmiPortSize, p1=[0, 0, 0]);

}

color("green") piZeroW();
color(alpha=0.4) piZeroWMask(dataUSBOverhang=5, powerUSBOverhang=4);
