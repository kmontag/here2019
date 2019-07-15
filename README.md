## Usage

See `featherstream/README.md` and `kontrol/README.md` for usage
overviews of the two main devices.

## Assembly

In addition to the build instructions in `featherstream/README.md` and
`kontrol/README.md`:
  
### DotStar strip

- Compile and print `things/dot_star_endcap.scad`.
- Cut the strip (https://www.adafruit.com/product/2237) to
  the desired number of LEDs along the midpoint of the metal contacts.
- Input side:
  - Run the female end of a 4-wire cable set
    (https://www.adafruit.com/product/744) through the large endcap
    fitting, with the free wire ends coming out of the larger end.
  - Run the wires through the 4 holes in the smaller endcap
    fitting. Check your strip to see the positions of the DI/CI
    contacts, and order the wires such that:
    - Red goes to VOC (+5V)
    - White goes to CI
    - Yellow goes to DI
    - Black goes to GND
  - Solder the wires to the contacts
  - Test the connection by connecting to an assembled feather
  - Put some hot glue or superglue onto the soldered connections for
    extra security.
  - Slide the smaller endcap over the strip, and place an M3 nut
    (https://www.amazon.com/dp/B07JD4ZLFT/) into the receptacle.
  - Put some hot glue or superglue on the outside of the endcap where
    the wires enter.
  - Wrap a bunch of electric tape around the 4-wire cable, between the
    large endcap and the strip. The goal is to reduce strain on the
    soldered connections once the endcap is fastened, so position it
    such that it forces a little bit of slack in the wires when the
    large endcap slides all the way up.
  - Slide the large endcap over the small one, and screw an M3 screw
    (https://www.amazon.com/dp/B01LZYC586/) through the hole, into the
    nut, and down far enough that it presses agains the strip pretty
    hard. The goal is to hold the endcap in place without placing
    strain on the soldered connections.
- Output side:
  - If chaining strips together, this is the same as the input side
    except:
    - Use the male side of the 4-wire cable instead of the female.
    - Make sure you place the over-screw onto the 4-wire cable before
      soldering.
    - Make sure you're soldering to the CO/DO side of the contacts (not CI/DI).
  - If not chaning strips together, you can just seal this off with
    the smaller endcap piece or some shrink wrap / tape.
    
## Development - running a local `featherstreamer` server

`featherstreamer` is what the Pis run to serve pixels to feathers. There are two components:

### `featherstreamer`

This is the main data server. Before running it:

- Place any video files you want to stream in
  `kontrol/media-src/`. These can be anything readable by `ffmpeg`.
- Run `make media` to compile the files into raw pixel data that can
  be streamed without processing overhead. The built files live in
  `kontrol/media-build/`.
- Run `make` in `kontrol/`.

To run the program, in `kontrol/featherstreamer`:

``` bash
npm start
```

You can also use `npm run start-dev` during development, to pick up
changes to source files automatically.

To get a Feather to see your local `featherstreamer` server, you'll
need to make compile-time changes. In your `secrets.h`, place the
following:

``` c++
#define SECRET_PAIRED_SSID "Your home SSID"
#define SECRET_PAIRED_PASSPHRASE "Your WiFi password"
#define SECRET_SERVER_IP IPAddress(192, 168, 0, 1) // Or whatever your computer's local IP address is
```

And then compile and upload to your Feather.

### `featherstreamer-web`

This is the web interface that's normally accessible at
http://192.168.8.1 on a Feather's hosted network. It shows details
about connected devices, and allows you to simulate interactions with
the hardware.

Before starting, run `make` in `kontrol/`. Then start the server with
`npm start` in `kontrol/featherstreamer-web`. The page should open
automatically in your browser; if not, it's accessible at
http://localhost:3000.

Note the UI won't be functional unless the `featherstreamer` server is
also running locally.

## Development dependencies

- PlatformIO for building the feather software: `brew install platformio`
- OpenSCAD for building 3D-printable objects: `brew cask install openscad`
- Ansible for configuring a Pi: `brew install ansible`
- Node/NPM for running the `featherstreamer` server (the thing the Pi
  uses to stream video) locally

    