include <BOSL/constants.scad>

/**
 * Scale an object of the given size to expand each dimension by the
 * slop amount, while preserving the position of the "real"
 * corners. Useful for creating masks from exact copies of chips, etc.
 */
module slop(size, slop=PRINTER_SLOP) {
  translate([-slop, -slop, -slop])
    scale([(size[0] + 2 * slop) / size[0], (size[1] + 2 * slop) / size[1], (size[2] + 2 * slop) / size[2]])
    children();
}