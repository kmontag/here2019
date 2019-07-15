default: .make.featherstreamer-web featherstreamer/dist/index.js

# Specify these to modify ansible commands.
ANSIBLE_FLAGS:=

BOOT_VOLUME_PATH:=/Volumes/boot

# Default value when
PI:=192.168.8.1

# Set up the boot volume of a plain raspbian image. Tested with
# raspbian stretch lite.
.PHONY:	boot
boot: wpa_supplicant.conf
	cp wpa_supplicant.conf $(BOOT_VOLUME_PATH)/wpa_supplicant.conf
	touch $(BOOT_VOLUME_PATH)/ssh

# Set up SSH over USB, see
# https://www.thepolyglotdeveloper.com/2016/06/connect-raspberry-pi-zero-usb-cable-ssh/. We
# `sed` twice for idempotency.
	(cat $(BOOT_VOLUME_PATH)/config.txt | grep -q "dtoverlay=dwc2") || (echo "dtoverlay=dwc2" >> $(BOOT_VOLUME_PATH)/config.txt)
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
frameplayer/dist/index.js: frameplayer/tsconfig.json frameplayer/tslint.json $(shell find frameplayer/src/ -type f)
	cd frameplayer && npm run build
featherstreamer-shared/dist/index.js: featherstreamer-shared/tsconfig.json featherstreamer-shared/tslint.json $(shell find featherstreamer-shared/src/ -type f)
	cd featherstreamer-shared && npm run build
featherstreamer/dist/index.js: featherstreamer/package*.json featherstreamer/tsconfig.json featherstreamer/tslint.json $(shell find featherstreamer/src -type f) featherstreamer-shared/dist/index.js frameplayer/dist/index.js
	cd featherstreamer && npm run build
.make.featherstreamer-web: $(shell find	featherstreamer-web -type f) featherstreamer-shared/dist/index.js
	cd featherstreamer-web && npm run build
	touch .make.featherstreamer-web

.PHONY: setup
setup: ansible/local/id_rsa.pub ansible/local/id_rsa ansible/inventory/hosts.local featherstreamer/dist/index.js .make.featherstreamer-web
	cd ansible && ansible-playbook -l ungrouped $(ANSIBLE_FLAGS) site.yml

# Build any new media from the media-src/ directory to media-build/,
# and remove any files in the build directory which weren't built from
# something in media-src/ for the current frameplayer config.
.PHONY: media
media:
	@[ -d media-src/ ] || ( echo 'Create the media-src/ directory and place video files to build inside.' ; exit 1 )
	$(eval CONF_MD5 = $(shell md5 -q frameplayer.conf.js))
	mkdir -p media-build/$(CONF_MD5)

# Remove anything built from a different config.
	find media-build/ ! -name '$(CONF_MD5)' -type d -depth 1 -exec rm -r {} +

# Create a clean directory to place built files.
	mv media-build/$(CONF_MD5) media-build/$(CONF_MD5).orig
	mkdir -p media-build/$(CONF_MD5)

# Iterate through sources and use a pre-existing build, or build them
# for the first time if necessary.
	$(foreach file, $(wildcard media-src/*), $(eval DEST = $(subst media-src/,,$(file)).$(shell md5 -q $(file)).fpl) ([ -f media-build/$(CONF_MD5).orig/$(DEST) ] && mv media-build/$(CONF_MD5).orig/$(DEST) media-build/$(CONF_MD5)/$(DEST)) || featherstreamer/node_modules/.bin/frameplayer prepare -c frameplayer.conf.js -o media-build/$(CONF_MD5)/$(DEST) $(file); )

# Clean up old files.
	rm -r media-build/$(CONF_MD5).orig

# Sync the JS modules to a pi, and restart the relevant services. This
# happens during provisioning as well, but it's included here as a
# quick command during development.
.PHONY: deploy
deploy: featherstreamer/dist/index.js .make.featherstreamer-web
# Enter read-write mode.
	ssh pi@$(PI) "sudo rw"

	rsync -avz --exclude='node_modules' --exclude='state.json' featherstreamer/ pi@$(PI):/usr/local/src/featherstreamer/
	rsync -avz --exclude='node_modules' featherstreamer-shared/ pi@$(PI):/usr/local/src/featherstreamer-shared/
	rsync -avz --exclude='node_modules' featherstreamer-web/ pi@$(PI):/usr/local/src/featherstreamer-web/
	rsync -avz --exclude='node_modules' frameplayer/ pi@$(PI):/usr/local/src/frameplayer/

	ssh pi@$(PI) "sudo systemctl restart featherstreamer"
	ssh pi@$(PI) "sudo systemctl restart featherstreamer-web"

# Go back to read-only mode.
	ssh pi@$(PI) "sudo ro"

.PHONY: deploy-media
deploy-media:
	rsync -avz media-build/ pi@$(PI):/var/featherstreamer/media/
	ssh pi@$(PI) "sudo systemctl restart featherstreamer"

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
