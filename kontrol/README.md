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
  outputted hostname to `ansible/inventory/hosts.local` (create the
  file if it doesn't exist), comment out any hosts you don't want to
  set up, and run:
  
``` shell
$ make setup
```

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