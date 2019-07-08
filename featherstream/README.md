Sketch for a WiFi-enabled Feather to interface with a featherstreamer
server.

Inspiration: https://learn.adafruit.com/lightship-led-animation-over-wifi/software

### Circuit

TODO

### Setup

Create `secrets.h` to provide baseline device configuration.

``` c++
#define SECRET_SERVER_PORT 44668

// Define this to provide a default value. Otherwise the device will
// always start in pairing mode until connection info is provided.
// #define SECRET_PAIRED_SSID "featherstreamer-foo"
#define SECRET_PAIRED_PASSPHRASE "gallowsbird"
#define SECRET_PAIRED_SERVER_IP IPAddress(192, 168, 8, 1)

#define SECRET_PAIRING_SSID "_featherstreamer-pairing"
#define SECRET_PAIRING_PASSPHRASE "gallowsbird"
#define SECRET_PAIRING_SERVER_IP IPAddress(192, 168, 8, 1)

#define SECRET_MASTER_SSID "_featherstreamer-master"
#define SECRET_MASTER_PASSPHRASE "gallowsbird"
#define SECRET_MASTER_SERVER_IP IPAddress(192, 168, 9, 1)
```

In general these credentials will need to match the configuration on
the featherstreamer(s) you're interfacing with. This means your
featherstreamers should all have the same master/pairing credentials,
and the same password but unique SSIDs for their "default" AP.

### Behavior

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
