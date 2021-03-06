This directory contains config and software for a Pi Zero W to:
- run a `featherstreamer` server (and web UI) for `featherstream`
  devices to connect to
- host a local WiFi access point, and connect to (or host) a "master"
  access point when in slave (or master) mode

### Usage overview

This device has an on/off switch, a USB port, an SD card slot, and a
rotary encoder.

The USB port is used to charge the battery (and can power the device
at the same time).

The SD card slot holds the card that runs the Pi.

The on/off switch is an on/off switch.

The rotary encoder is the main controller for the device. Any
contiguous turn in one direcion is processed as a single clockwise or
counter-clockwise "step" - the notches in the encoder don't really
matter. Turn it to cycle through videos. Press it (without turning it)
to toggle connected LEDs on or off.

To change modes, press and hold then encoder for more than 1s, then release it and quickly press it one or more times to select the mode:

- 1 click for isolated mode
- 2 clicks for slave mode
- 3 clicks for master mode
- 4 clicks for pairing mode

Once the device is booted up, you should be able to see a WiFi network
called `featherstreamer-[something]`. That's your device's personal
access point. By default, the password for this network (and all
others) is `feath3rstr`. The device normally lives at
http://192.168.8.1, or http://192.168.9.1 when in master mode.

### Runtime configuration

Connect to the pi's access point and go to http://192.168.8.1 (or
http://192.168.9.1 if the device is in `master` mode) to see a
configuration UI. 

Once a feather is connected, you'll be able to set the channel that
should be streamed to it, the brightness, and the persistent color of
its offline animation.

You can also see some debug info about the device, and simulate
interactions with the rotary encoder.

### Assembly

- First, run the software setup instructions below and make sure your
  unmodified Pi Zero W (https://www.adafruit.com/product/3400) is
  working. During setup, you can power it from the USB port farthest
  from the SD card.
- Get a rotary encoder (https://www.adafruit.com/product/377) and
  solder a short wire between one of the push-switch pins (i.e. either
  pin on the side with two pins) and the middle (common) pin on the
  other side. This allows us to share the ground connection for the
  rotary encoder and the push button.
- Solder a chunk of headers "upside down" (i.e. with the plastic nub
  on the bottom of the chip) to the last 4 pins (i.e. on the side
  furthest from the SD card) of the outer row of the Pi. These pins,
  in order moving away from the SD card, are Ground, GPIO 16, GPIO 20,
  and GPIO 21. Solder ~5cm wires to all of the pins, and slide shrink
  wrap down to secure the connections.
- Solder the wires from the headers to these pins on the rotary encoder:
  - Ground (innermost pin with headers) to Common (middle pin on the encoder side)
  - GPIO16 to rotary pin B (right pin on the encoder side)
  - GPIO20 to rotary pin A (left pin on the encoder side)
  - GPIO21 to the remaining push switch pin
  Make sure to secure the connections with shrink wrap.
- Solder a SPDT slide switch (https://www.adafruit.com/product/805) to
  the Vs, EN, and GND pins of a PowerBoost 1000 charger
  (https://www.adafruit.com/product/2465).
- Solder a 2-pin chunk of headers to the G and 5V pins on the
  PowerBoost. Orient the headers upside-down as with the Pi.
- Solder another 2-pin chunk of headers (again upside-down) to the 2nd
  and 3rd pins on the outer row of the Pi. These are 5V and G,
  respectively.
- Solder ~3cm wires to connect the +5V and G pins of the PowerBoost to
  the Pi.
- Solder a ~1kOhm resistor in series with one leg of an LED, as
  described in the featherstream assembly instructions.
- Cover the resistor legs with shrink wrap. Solder the positive end to
  the Pi's GPIO11 (12th pin on the inner row as you move away from the
  SD card) and G (easiest option is the 13th pin on the inner row as
  you move away from the SD card). Bend the LED legs so it lays across
  the Pi and reaches near the USB ports.
- Connect a 2000mAh LiPo battery
  (https://www.adafruit.com/product/2011) to the PowerBoost.  Do this
  **before** plugging into the PowerBoost's USB port, otherwise you
  may damage the board.
- Plug USB power into the PowerBoost (make sure you're not also
  plugged into the Pi's onboard USB power port). You should see an
  orange light to indicate the battery is charging. If the switch is
  in the ON position, you'll also see a blue light to indicate that
  power is being provided at the 5V pin.
- Test your circuit. With the PowerBoost plugged in and/or the battery
  charged, flip the switch on. You should see:
  - the green onboard LED light up immediately
  - after a few minutes, the installed LED blinking once every ~3s to
    indicate that the server has started and is running in isolated
    mode
    
  To test that the rotary encoder is properly connected, turn it two
  clicks (not rotary notches - see above) while pressing it to place
  the device in slave mode. The LED should then start blinking twice
  every 3s, instead of once.

- Print `../things/pi_box.scad` and put everything inside. The easiest
  order to place things is probaby:
  - PowerBoost placed against the wall opposite the `HERE` text, with
    its switch seated in the small hole and its USB port accessible
    through the back wall. If you want, you can use an M2.5 screw/nut
    to hold the chip in place - seat the nut behind the little post
    with a hole in it near the back of the chip, and run the screw
    through the nearby hole in the chip and into the nut. This isn't
    strictly necessary, but will make it easier to maintain the right
    position while putting the lid on the box.
    
    Note you should leave the battery attached to the PowerBoost - the
    wires should run under the board and behind it, so you can drop
    the battery into the other side of the box once everything else is
    in place.
  - Pi placed in its seat in the middle of the box. The SD card needs
    to be removed before you put the Pi in. It should sit so that the
    USB ports are flush with the top of the box.
  - Rotary encoder placed through the hole opposite the PowerBoost USB
    port, with the square base rotated so that it sits neatly on the
    nearby shelf (i.e. so the soldered pins are on the sides of the
    box, not the top and bottom). **Make sure you put the washer on
    before pushing the encoder through the hole.**
    
    This part can be tricky, be careful not to break any connections -
    if everything is well-soldered and supported with shrink wrap, it
    should be pretty stable. Once the encoder is propertly seated,
    there shouldn't be much strain on any of the soldered connections.
  - Battery placed in the remaining space near the wall with the
    `HERE` text.
- Secure the rotary encoder with the nut that came with it, and attach
  the plastic cap.
- Put the SD card back in the Pi through the box wall and test the
  circuit again to make sure everything's still intact after
  insertion.
- Place M3 nuts (https://www.amazon.com/dp/B07JD4ZLFT) in the two
  holders on the box lid.
- Place the lid and secure it with M3 screws
  (https://www.amazon.com/dp/B01LZYC586).
    
### Media setup

Push videos to the device using `make deploy-media` while connected to
the device's access point.

Config for your lights should get added to `frameplayer.conf.js` in
this directory. Each `featherstream` device receives pixel data for
one channel (you can configure this in the Pi's web UI). For each of
your `featherstream` devices, add a channel with a descriptive name to
`frameplayer.conf.js`, set a height and width to scale video files
before sampling pixels, and then provide a list of pixels (as x/y
coordinates) to sample. Data from these pixels will get sent (in this
order) to your LED strip(s).

Commit any changes to `frameplayer.conf.js`, so that when you're
receiving data from someone else in master mode, you'll get correctly
positioned pixel data on your setup.

### Setup from a distributed image

If you won't be doing any development, you can just burn the image to
an SD card and boot the pi - everything is already installed.

Then put the device into pairing mode (four clockwise clicks while
pressing the rotary encoder), put one or more feathers into pairing
mode (flip the switch repeatedly at boot), and wait for the light on
the feathers to start blinking quickly.

Optionally, in the `boot` volume that mounts when you insert the SD
card into your laptop:

- edit the `reset` file with a custom SSID for your device.
- create a file called `wpa_supplicant.conf` (see the example in this
  directory) containing your home WiFi credentials, to make the device
  connect to your network when it's in `master` or `pairing` mode.

These optional steps can be performed at any time.

### From-scratch Pi setup

- Download the latest Raspbian lite:
  <https://www.raspberrypi.org/downloads/raspbian/>.

- Install onto SD card with Etcher or similar:
  <https://www.raspberrypi.org/documentation/installation/installing-images/README.md>.

- Mount the `boot` partition (i.e. just reinsert the drive) and
  perform preliminary setup:
  
``` shell
$ make boot
```

- Put the SD card into the Pi and boot.

- If you want, test SSH (default password is `raspberry`):

``` shell
$ ssh -o StrictHostKeyChecking=no -o GlobalKnownHostsFile=/dev/null -o UserKnownHostsFile=/dev/null pi@raspberrypi.local
```

- Perform initial hostname/credentials setup. This will also generate
  an SSH key pair in [`ansible/local`](ansible/local) if necessary,
  which will be shared for all future devices. Ansible must be
  installed.

``` shell
$ make bootstrap
```

- Perform all additional provisioning to set up the node. Add the
  outputted hostname from the previous step to
  `ansible/inventory/hosts.local` (create the file if it doesn't
  exist), comment out any hosts you don't want to set up, and run:
  
``` shell
$ make setup
```

- If you want to create an image for distribution, run (using your
  hostname from above):

``` shell
$ PI=featherstreamer-foo.local make prepare
```

  This will remove all sensitive info (i.e. WiFi credentials) from the
  Pi, and place a blank file at `/boot/reset` to trigger a new
  hostname/AP name being set on the next boot.
  
  Before proceeding, SSH into the pi and run `sudo fdisk -u -l`,
  taking note of the end sector of the final `mmcblk0p3` partition.
  
  You can now shut down the Pi and remove its SD card, and use it to
  make an image which will generate a unique AP name every time it's
  installed. To generate the image, use:
  
  ```bash
  dd if=/dev/{ SD card device name } of=/path/to/img/file.img count={ end sector from above + 1 }
  ```
  
  See
  https://serverfault.com/questions/446529/create-image-of-a-usb-drive-without-unallocated-partition
  for more info.

### SSH

It's generally easiest to interact with the Pi over SSH. Probably the
cleanest way to do this is to connect to the pi's hosted access point,
and then log in using `ssh pi@192.168.8.1` (or `ssh pi@192.168.9.1` if
the device is in master mode). The default password is `feath4str`.

If you place a `wpa_supplicant.conf` file in the boot partition (see
the example file in this directory), you can also interact with the Pi
over your home network. The Pi will connect to your home network in
`pairing`, `master`, and `default` network modes. The first two always
correspond to the `pairing` and `master` application modes. If you're
using the development config (which is the case if you set things up
from scratch using ansible), the `isolated` application mode will also
correspond to the `default` mode. (Note the production config uses the
`slave` networking mode while in the `isolated` application mode, to
make it faster to switch over to the `slave` application mode when
requested).

If the Pi is connected to your local network, you can probably find it
at `ssh pi@[access point name].local` (since the access point name is
the same as the pi's hostname).

### Development

If you're able to connect to the Pi via SSH, you can use `make deploy`
and `make deploy-media` to push code changes and media changes,
respectively. You can also still run the ansible playbook using `make
setup`.

Note that the Pi is normally running with its main volumes in
read-only mode, to prevent damage when it's turned off without being
properly shut down. To switch between read-write and read0only mode
during development, use `sudo rw` and `sudo ro`.

### Network overview

Each pi generally runs as both an access point and a WiFi client
simultaneously. This is accomplished via a virtual device (`ap0`)
which is created in addition to the system's default wireless device
(`wlan0`).

In general the pi can be in one of four modes, each of which uses a
different network config: default, pairing, slave, and master.

#### Default

The `ap0` device hosts a network whose SSID is the pi's hostname. Any
paired feathers connect to this network, and the pi streams pixel data
to them. 

The `wlan0` device connects with the standard
`wpa_supplicant.conf`.

#### Pairing mode

The `ap0` device hosts a network called
`featherstreamer-pairing`. When in their own pairing mode, feathers
connect to this network, and use it to retrieve information about the
pi via an HTTP endpoint.

The `wlan0` device connects with the standard
`wpa_supplicant.conf`.

Note that results are unpredictable if multiple nearby pis enter
pairing mode simultaneously; however, the pairing process should
happen relatively rarely.

#### Slave mode

Same as default mode, except the `wlan0` device tries to connect to
the "master" AP `featherstreamer-master`. When a connection is
established, this means another nearby pi has entered master mode; the
slave pi can then forward pixel data from this master to any connected
feathers.

Note that the actual streaming application runs in this mode even when
running in "isolated" mode (i.e. not forwarding data from the master),
so it doesn't have to switch network configs when switching to true
slave mode.

#### Master mode

The `ap0` device hosts the `featherstreamer-master` AP, and broadcasts
pixel data to any connected slaves. Before transitioning to this mode,
the pi notifies any connected feathers that they should disconnect and
start looking for it at the master SSID instead. (The feathers also
try to do this automatically at boot if they're unable to find their
standard AP).

The `wlan0` device connects with the standard
`wpa_supplicant.conf`.

If multiple nearby devices enter master mode, the network will be
segregated depending on which master a slave connects to. A sane state
can be restored by placing all but one of the masters back in a
different mode.


Note that we're somewhat limited in the combinations of network
interfaces which can be created on the pi's single wireless
chip. Check `iw list` for more details about the available options. In
particular, a more natural networking setup for this project might be
to have each pi host an access point (for connected feathers) as well
as join a mesh network with any nearby pi devices for coordinating
lighting masters. This would eliminate the need for live swapping of
network interfaces when a pi wants to present itself as the lighting
master, and make it easier to resolve conflicts when more than one pi
tries to take this position. Unfortunately, a mesh setup (based on
`batman-adv`) requires the use of an ad-hoc network interface, which
cannot be used in tandem with an access point, and which the feathers
apparently aren't able to connect to directly. See, for example,
https://forum.arduino.cc/index.php?topic=431283.msg3073869#msg3073869. Issue
filed at https://github.com/arduino-libraries/WiFi101/issues/273.