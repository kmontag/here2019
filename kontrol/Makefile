default: .make.featherstreamer-web featherstreamer/dist/index.js

# Specify these to modify ansible commands.
ANSIBLE_FLAGS:=

BOOT_VOLUME_PATH:=/Volumes/boot

# Default value when
PI ?= 192.168.8.1

# Set up the boot volume of a plain raspbian image. Tested with
# raspbian stretch lite.
.PHONY:	boot
boot: wpa_supplicant.conf
	cp wpa_supplicant.conf $(BOOT_VOLUME_PATH)/wpa_supplicant.conf
	touch $(BOOT_VOLUME_PATH)/ssh

# Set up SSH over USB and disable HDMI, see
# https://www.thepolyglotdeveloper.com/2016/06/connect-raspberry-pi-zero-usb-cable-ssh/
# and
# https://raspberrypi.stackexchange.com/questions/79728/keep-hdmi-off-on-boot. We
# `sed` twice for idempotency.
	(cat $(BOOT_VOLUME_PATH)/config.txt | grep -q "dtoverlay=dwc2") || (echo "dtoverlay=dwc2" >> $(BOOT_VOLUME_PATH)/config.txt)
	(cat $(BOOT_VOLUME_PATH)/config.txt | grep -q "hdmi_blanking=2") || (echo "hdmi_blanking=2" >> $(BOOT_VOLUME_PATH)/config.txt)
	sed -i".tmp" 's/modules-load=dwc2,g_ether //' $(BOOT_VOLUME_PATH)/cmdline.txt
	sed -i".tmp" 's/rootfstype/modules-load=dwc2,g_ether rootfstype/' $(BOOT_VOLUME_PATH)/cmdline.txt

# Disable initial file system resize on boot, so we can create a
# shareable partition. See
# https://raspberrypi.stackexchange.com/questions/47773/disable-auto-file-system-expansion-in-new-jessie-image-2016-05-10. For reference, the original init file is /usr/lib/raspi-config/init_resize.sh.
	sed -i".tmp" 's/init=.*$$//' $(BOOT_VOLUME_PATH)/cmdline.txt
	rm $(BOOT_VOLUME_PATH)/cmdline.txt.tmp

wpa_supplicant.conf:
	$(error Please create wpa_supplicant.conf in this directory. See wpa_supplicant.sample.conf for an example.)

ansible/inventory/hosts.local:
	$(error Please create ansible/inventory/hosts.local, with one host \(e.g. featherstream-foo.local\) on each line.)

# Perform initial setup on a pi with a fresh Raspbian install.
.PHONY: bootstrap
bootstrap: ansible/local/id_rsa.pub ansible/local/id_rsa
	cd ansible && ansible-playbook -l bootstrap $(ANSIBLE_FLAGS) site.yml
	- ssh -t -o StrictHostKeyChecking=no -i ansible/local/id_rsa pi@raspberrypi.local 'sudo reboot'
	@echo "\nRebooting, device will be accessible as $$(cat ansible/local/last-hostname).local...\n"

ansible/local/id_rsa.pub ansible/local/id_rsa:
	ssh-keygen -t rsa -N "" -f ansible/local/id_rsa

# JS module builds.
frameplayer/dist/index.js: frameplayer/package*.json frameplayer/tsconfig.json frameplayer/tslint.json $(shell find frameplayer/src/ -type f)
	cd frameplayer && npm run build
featherstreamer-shared/dist/index.js: featherstreamer-shared/package*.json featherstreamer-shared/tsconfig.json featherstreamer-shared/tslint.json $(shell find featherstreamer-shared/src/ -type f)
	cd featherstreamer-shared && npm run build
featherstreamer/dist/index.js: featherstreamer/package*.json featherstreamer/tsconfig.json featherstreamer/tslint.json $(shell find featherstreamer/src -type f) featherstreamer-shared/dist/index.js frameplayer/dist/index.js
	cd featherstreamer && npm run build
.make.featherstreamer-web: $(shell find	featherstreamer-web/src -type f) featherstreamer-shared/dist/index.js
	cd featherstreamer-web && npm run build
	touch .make.featherstreamer-web
frameplayer-conf/dist/index.js: frameplayer-conf/package*.json frameplayer-conf/ts*.json $(shell find frameplayer-conf/src/ -type f)
	cd frameplayer-conf && npm run build

media/frameplayer.json: frameplayer-conf/dist/index.js
	cd frameplayer-conf && node dist/index.js > ../media/frameplayer.json

.PHONY: setup
setup: ansible/local/id_rsa.pub ansible/local/id_rsa ansible/inventory/hosts.local featherstreamer/dist/index.js .make.featherstreamer-web
	cd ansible && ansible-playbook -l ungrouped $(ANSIBLE_FLAGS) site.yml

# Build any new media from the media-src/ directory to media-build/,
# and remove any files in the build directory which weren't built from
# something in media-src/ for the current frameplayer config.
.PHONY: media
media: featherstreamer/dist/index.js media/frameplayer.json
	cd featherstreamer && npm run cli -- compile

# Sync the JS modules to a pi, and restart the relevant services. This
# happens during provisioning as well, but it's included here as a
# quick command during development.
.PHONY: deploy
deploy: featherstreamer/dist/index.js .make.featherstreamer-web
# Enter read-write mode.
	ssh pi@$(PI) "sudo rw"

	rsync -avz --delete --exclude='node_modules' --exclude='state.json' featherstreamer/ pi@$(PI):/usr/local/src/featherstreamer/
	rsync -avz --delete --exclude='node_modules' featherstreamer-shared/ pi@$(PI):/usr/local/src/featherstreamer-shared/
	rsync -avz --delete --exclude='node_modules' featherstreamer-web/ pi@$(PI):/usr/local/src/featherstreamer-web/
	rsync -avz --delete --exclude='node_modules' frameplayer/ pi@$(PI):/usr/local/src/frameplayer/

	ssh pi@$(PI) "sudo systemctl restart featherstreamer"
	ssh pi@$(PI) "sudo systemctl restart featherstreamer-watcher"
	ssh pi@$(PI) "sudo systemctl restart featherstreamer-web"

# Go back to read-only mode.
	ssh pi@$(PI) "sudo ro"

.PHONY: deploy-media-config
deploy-media-config: media/frameplayer.json
	scp media/frameplayer.json pi@$(PI):/var/featherstreamer/media/frameplayer.json


.PHONY: deploy-media
deploy-media:
	rsync -avz --delete media/build/ pi@$(PI):/var/featherstreamer/media/build/
	rsync -avz media/cache/ pi@$(PI):/var/featherstreamer/media/cache/

# Do these last to avoid triggering recompiles before the build cache
# is synced.
	$(MAKE) deploy-media-config
	rsync -avz --delete media/src/ pi@$(PI):/var/featherstreamer/media/src/

.PHONY: pull-state
pull-state:
	scp pi@$(PI):/var/featherstreamer/state.json device-state.json

.PHONY: push-state
push-state:
	scp device-state.json pi@$(PI):/var/featherstreamer/state.json

# Prepare a featherstreamer for "external" deployment - remove all
# local WiFi info, switch to production featherstreamer config, and
# set it up so that on next boot, it'll generate a new hostname and AP
# configs. After this runs, we can create an image from the SD card to
# distribute.
#
# If you want to control the new hostname, just set the contents of
# /boot/reset to the desired name.
.PHONY: prepare
prepare:
ifndef PI
	$(error Specify the host via the PI variable)
endif
	ssh pi@$(PI) "sudo /usr/local/bin/featherstreamer-prepare"
