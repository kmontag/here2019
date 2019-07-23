Sketch for a WiFi-enabled Feather to interface with a featherstreamer
server.

Inspiration: https://learn.adafruit.com/lightship-led-animation-over-wifi/software

### Usage overview

This device has a USB port, a rocker switch, a cable to connect to a
DotStar LED strip, and a power input.

The USB port is mainly just used to flash the chip, though you can
also use it to power the device and a small number of lights. Don't
push too much power through this, you'll fry the device and possibly
your USB port.

The power input should receive around 3.7-5V DC (don't exceed 5V,
you'll fry the circuit). The easiest way to achieve this is to plug 3
rechargeable AA batteries into the power input. This will power the
chip, and up to about 100 attached LEDs depending on brightness.

The device runs whenever power is connected, so if you want a power
on/off switch, it's best to get a battery pack that has one built in.

When the rocker switch is OFF, the device runs in "offline mode,"
meaning it just shows a simple predefined animation. The animation
color can be configured (persistently) from a `featherstreamer` web
UI, once you pair with a Pi device.

When the rocker switch is ON, the device attempts to connect to a
Pi. There are two possibilities here:

- If the device has not yet been paired, it immediately enters pairing
  mode, meaning it searches for a network called (by default)
  `_featherstreamer-pairing`. This network is hosted by a Pi when it's
  in its own pairing mode. If this network is found, the
  `featherstream` connects and retrieves/persists info that will let
  it connect to this Pi in the future. You'll know the connection is
  successful if the LED starts blinking rapidly - at this point you
  should reboot the device.
  
  Note that if the device is already paired, you can also enter
  pairing mode by flipping the rocker switch rapidly while booting the
  device. This allows you to re-pair with a different Pi.
  
- If the device has been paired, it searches for its Pi, either on the
  master network or on the Pi's "personal" access point. If found, it
  starts pulling pixel data from the Pi.
  
You can usually flip the rocker switch on and off at runtime to change
modes. There's one exception: if you enter pairing mode (e.g. if you
boot the device with the switch on when it isn't paired), you'll have
to reboot with the switch off in order to get back to offline mode.

### Assembly

- Connect to a Feather M0 WiFi w/ PCB antenna
  (https://www.adafruit.com/product/3010) via USB, and upload the
  `featherstream` program (`make upload` from this directory).
- Compile and print `../things/feather_box.scad`.
- Solder wires to the ground and + pins of a 5.5mm x 2.1mm DC female
  jack, e.g. https://www.amazon.com/dp/B07C4TG74T/.
- Run the male side of a 4-wire cable set
  (https://www.adafruit.com/product/744) into the smaller circular
  hole on the box. Once soldered, you won't be able to remove this
  cable, so make sure to place the over-screw on the cable before
  running it through. If you want, use a big wire stripper or knife to
  strip a bit of the black coating off the back; this will give you
  more room to work with the wires.
- Solder wires to both pins of a rocker switch,
  e.g. https://www.amazon.com/dp/B0725Z6FR7/, and snap it into the
  hole on the long side of the box. Orient it such that the open
  position is closer the end of the box with circular cutouts. (You
  may want to snap it in and out while connecting parts of the
  circuit - just make sure the wires are running through this hole
  from the outside before you solder anything.)
- Splice together the red wire from the 4-wire cable and the + wire
  from the DC jack, and run a single wire out from the splice
  (i.e. form a "Y").
- Splice together the black wire from the 4-wire cable, the ground
  wire from the DC jack, and one of the wires from the rocker switch,
  and run a single wire out from the splice.
- Bend either leg of a simple LED
  (e.g. https://www.amazon.com/dp/B073QMYKDM/) and one side of a
  ~1kOhm resistor (e.g. https://www.amazon.com/dp/B0185FIJ9A/) into
  hooks. Hook them together, and solder them in place to "extend" the
  LED leg with the resistor. You might want to trim them a bit so you
  end up with two legs of approximately the same length coming from
  the LED.
- Break off a chunk of 6 header pins from the headers that came with
  your feather, and solder it between the BAT pin and pin 11. Then
  solder:
  - The yellow wire from the 4-wire cable to pin 11 (this will
    connect with DI on the strip)
  - The white wire from the 4-wire cable to pin 13 (this will
    connect with CI on the strip)
  - To the BAT pin:
    - The spliced +/red wire, AND
    - the + terminal of a 1000uf 6.3v capacitor
      (https://www.amazon.com/dp/B01DYJEHZ2/)
      Be sure to cover the capacitor leg with heat shrink wrap before
      soldering.
- Break off a chunk of 5 header pins, and solder it between A3 and
  G. Then solder:
  - The remaining wire from the rocker switch to A3.
  - The positive terminal of the LED/resistor combo
    to A1. Cover the leg with shrink wrap before soldering.
  - To the fifth pin (again make sure to cover legs with shrink wrap):
    - The spliced ground wire
    - the ground terminal of the LED/resistor combo
    - the gorund terminal of the capacitor
- Put the DC jack through the remaining hole in the box, and use the
  nut to fasten it into place from the outside. Rotate the jack so
  that the soldered wires are at the highest point, otherwise the
  feather won't fit.
- Stuff the feather into the box and onto the feather-shaped platform.
- Place M3 nuts (https://www.amazon.com/dp/B07JD4ZLFT/) into the
  holders in the box lid, and attach the lid using M3 screws
  (https://www.amazon.com/dp/B01LZYC586/).

### Setup

Create `include/secrets.local.h`, and optionally override values from
`include/secrets.h` to provide custom configuration. For example, if
you're running a `featherstreamer` server locally and your machine has
IP `192.168.0.10`:

``` c++
// include/secrets.local.h

#define SECRET_PAIRED_SSID "my-ssid"
#define SECRET_PAIRED_PASSPHRASE "my-passphrase"
#define SECRET_PAIRED_SERVER_IP IPAddress(192, 168, 0, 10)
```

By default, `include/secrets.h` provides credentials that match the
default `featherstreamer` config. In general, to interface with a
network of `featherstreamer`s, all `featherstreamer` devices need to
have the same master/pairing credentials, and the same password but
unique SSIDs for their "default" AP.

### Detailed behavior

There are three operating modes.

#### Pairing mode

The device looks for a network and a featherstreamer host based on the
provided `SECRET_PAIRING_*` secrets. If it finds one, it retrieves the
SSID and saves it to flash storage for future use, overwriting any
existing config. The change will take effect when the device is rebooted.

If the device has never been paired before (and if
`SECRET_PAIRED_SSID` was not provided), the device will enter this
mode as soon as the switch is closed (i.e. as soon as you attempt to
enter OPC mode).

If the device is already paired, flip the switch rapidly while booting
to enter it.

Once the device enters this mode, it won't leave until it's rebooted.

LED indicators:

1s on / 1s off -> looking for pairing network

continuous rapid blinks -> cnnected to network and successfully pulled
an SSID from a featherstreamer; device can be rebooted

short blinks with 1s pause in between -> connected to network but
couldn't retrieve an SSID, likely a problem with the featherstreamer

#### OPC mode

This is the mode when the device is paired (i.e. has a stored SSID)
and its switch is closed.

The device continually tries to connect to either the master network,
or to the SSID stored during pairing. In the former case, the device
keeps reconnecting unless it finds a featherstreamer server whose
`/ssid` endpoint matches its paired value. In other words, it
continually tries to connect to its paired featherstreamer, allowing
for the possibility that the paired featherstreamer may currently be
in master mode.

Once connected, the device hits the featherstreamer's device-based OPC
endpoint and continually displays incoming data, using the MAC address
of the onboard WiFi chip to generate a consistent identifier between
boots/flashes. (The pixel channel for a given device ID can be
configured from the featherstreamer web UI.) Sysex messages (OPC
command 255) are also supported. The first two bytes of these commands
should be an unsigned number with the high byte first, representing
the system ID; currently only one system ID is supported:

- SID 6: Set the primary color of the offline animation, and save this
  value to flash storage. The message data should be 5 bytes - 2 for
  the system ID, followed by 1 each for the R, G, and B values
  respectively.

#### Offline mode

This is the mode when the device is paired and its switch is open.

In offline mode, a generic animation is shown, optionally using a
color set by OPC sysex command as described above.

### Building and uploading

See the `Makefile`.
