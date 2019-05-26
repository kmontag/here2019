Pi setup
========

- Download the latest Raspbian lite:
  <https://www.raspberrypi.org/downloads/raspbian/>.

- Install onto SD card with Etcher or similar:
  <https://www.raspberrypi.org/documentation/installation/installing-images/README.md>.

- Place a blank file called `ssh` on the `boot` partition of the SD
  card.

- Place `wpa_supplicant.conf` on the `boot` partition. Sample file:
  [`wpa_supplicant.sample.conf`](wpa_supplicant.sample.conf).

- Put the SD card into the Pi and boot.

- Test SSH (default password is `raspberry`):

``` shell
ssh -o "StrictHostKeyChecking=no" pi@raspberrypi.local
```

- Perform initial hostname/credentials setup with ansible:

``` shell
ansible-playbook -i hosts -l bootstrap site.yml
```

