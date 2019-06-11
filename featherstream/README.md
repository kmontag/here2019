Inspiration: https://learn.adafruit.com/lightship-led-animation-over-wifi/software

Uses `platformio` for build and upload:

``` shell
$ platformio run # builds everything
$ IP_SUFFIX=60  platformio run -t upload # builds and uploads
$ platformio run -t clean
```

See [`platformio.ini`](platformio.ini) for necessary/available
environment variables.

Before building, install submodules:

``` shell
$ git submodule update --init --recursive
```

The OPC server is modified from
https://github.com/adafruit/Adafruit_Lightship. To merge the latest
changes:

``` shell
git subtree pull --prefix=ext/Adafruit_Lightship https://github.com/adafruit/Adafruit_Lightship.git master
```
