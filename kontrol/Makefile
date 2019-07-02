default: bootstrap

# Specify these to modify ansible commands.
ANSIBLE_FLAGS:=

BOOT_VOLUME_PATH:=/Volumes/boot

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
# https://raspberrypi.stackexchange.com/questions/47773/disable-auto-file-system-expansion-in-new-jessie-image-2016-05-10.
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
featherstreamer-shared/dist/index.js: featherstreamer-shared/tsconfig.json featherstreamer-shared/tslint.json $(shell find featherstreamer-shared/src/ -type f)
	cd featherstreamer-shared && npm run build
featherstreamer/dist/index.js: featherstreamer/package*.json featherstreamer/tsconfig.json featherstreamer/tslint.json $(shell find featherstreamer/src -type f) featherstreamer-shared/dist/index.js
	cd featherstreamer && npm run build
.make.featherstreamer-web: $(shell find	featherstreamer-web -type f) featherstreamer-shared/dist/index.js
	cd featherstreamer-web && npm run build
	touch .make.featherstreamer-web

.PHONY: setup
setup: ansible/local/id_rsa.pub ansible/local/id_rsa ansible/inventory/hosts.local featherstreamer/dist/index.js .make.featherstreamer-web
	cd ansible && ansible-playbook -l ungrouped $(ANSIBLE_FLAGS) site.yml

# Sync the JS modules to a pi, and restart the relevant services. This
# happens during provisioning as well, but it's included here as a
# quick command during development.
.PHONY: deploy
deploy: featherstreamer/dist/index.js .make.featherstreamer-web
ifndef PI
	$(error Specify the host via the PI variable)
endif
	rsync -avz --exclude='node_modules' featherstreamer/ pi@$(PI):/usr/local/src/featherstreamer/
	rsync -avz --exclude='node_modules' featherstreamer-shared/ pi@$(PI):/usr/local/src/featherstreamer-shared/
	rsync -avz --exclude='node_modules' featherstreamer-web/ pi@$(PI):/usr/local/src/featherstreamer-web/
	ssh pi@$(PI) "sudo systemctl restart featherstreamer"
	ssh pi@$(PI) "sudo systemctl restart featherstreamer-web"