## Assembly

### Feather

These get connected directly to DotStar strips.

- Compile and print `<things/feather_box.scad>`
- Solder wires to the ground and + pins of a 5.5mm x 2.1mm DC female
  jack, e.g. https://www.amazon.com/dp/B07C4TG74T/.
- Solder wires to both pins of a rocker switch,
  e.g. https://www.amazon.com/dp/B0725Z6FR7/, and snap it into the
  hole on the long side of the box.
- Run the male side of a 4-wire cable set
  (https://www.adafruit.com/product/744) into the smaller circular
  hole on the box. Once soldered, you won't be able to remove this
  cable, so make sure to place the over-screw on the cable before
  running it through.
- Splice together the red wire from the 4-wire cable and the + wire
  from the DC jack, and run a single wire out from the splice
  (i.e. form a "Y").
- Splice together the black wire from the 4-wire cable, the ground
  wire from the DC jack, and one of the wires from the rocker switch,
  and run a single wire out from the splice.
- Break off a chunk of 6 header pins from the headers that came with
  your feather, and solder:
  - The yellow wire from the 4-wire cable to the first pin
  - The white wire from the 4-wire cable to the third pin
  - To the sixth pin:
    - The spliced +/red wire, AND
    - the + terminal of a 1000uf 6.3v capacitor
      (https://www.amazon.com/dp/B01DYJEHZ2/?coliid=I2PEL8XAB07K15&colid=DYOU0HYUIA97&psc=1&ref_=lv_ov_lig_dp_it)
      Be sure to cover the capacitor leg with heat shrink wrap before
      soldering.
- Break off a chunk of 5 header pins, and solder:
  - The remaining wire from the rocker switch to the first pin
  - The positive terminal of a simple LED
    (e.g. https://www.amazon.com/DiCUNO-450pcs-Colors-Emitting-Assorted/dp/B073QMYKDM/ref=sr_1_3?keywords=leds&qid=1563156561&s=gateway&sr=8-3)
    to the third pin. Cover the leg with shrink wrap before soldering.
  - To the fifth pin (again make sure to cover legs with shrink wrap):
    - The spliced ground wire, AND
    - the - terminal of the LED
    - the - terminal of the capacitor
- Solder the 6-pin header to the feather, starting at pin 11 (with the
  yellow wire) and ending at BAT (with the spliced + wire)
- Solder the 5-pin header to the feather, starting at pin A3 (with the
  wire from the rocker switch), and ending at G (with the spliced
  ground wire)
- Put the DC jack through the remaining hole in the box, and use the
  nut to fasten it into place. Rotate the jack so that the soldered
  wires are at the highest point, otherwise the feather won't fit.
- Stuff the feather into the box and onto the feather-shaped platform
- Place M3 nuts
  (https://www.amazon.com/dp/B07JD4ZLFT/?coliid=I32FX8801KYD7L&colid=DYOU0HYUIA97&psc=1&ref_=lv_ov_lig_dp_it)
  into the holders in the box lid, and attach the lid using M3 screws
  (https://www.amazon.com/dp/B01LZYC586/?coliid=I1LF69BW49LFAE&colid=DYOU0HYUIA97&psc=1&ref_=lv_ov_lig_dp_it).