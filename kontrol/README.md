From-scratch Pi setup
=====================

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

