default: bootstrap

BOOT_VOLUME_PATH:=/Volumes/boot

# Set up the boot volume of a plain raspbian image. Tested with
# raspbian stretch lite.
.PHONY:	boot
boot: wpa_supplicant.conf
	cp wpa_supplicant.conf $(BOOT_VOLUME_PATH)/wpa_supplicant.conf
	touch $(BOOT_VOLUME_PATH)/ssh
# Disable initial file system resize on boot, so we can create a
# shareable partition. See
# https://raspberrypi.stackexchange.com/questions/47773/disable-auto-file-system-expansion-in-new-jessie-image-2016-05-10.
	sed -i".bak" 's/init=.*$$//' $(BOOT_VOLUME_PATH)/cmdline.txt

wpa_supplicant.conf:
	$(error Please create wpa_supplicant.conf in this directory. See wpa_supplicant.sample.conf for an example.)

ansible/inventory/hosts.local:
	$(error Please create ansible/inventory/hosts.local, with one host \(e.g. featherstream-foo.local\) on each line.)

# Perform initial setup on a pi with a fresh Raspbian install.
.PHONY: bootstrap
bootstrap: ansible/local/id_rsa.pub ansible/local/id_rsa
	cd ansible && ansible-playbook -l bootstrap site.yml
	- ssh -t -o StrictHostKeyChecking=no -i ansible/local/id_rsa pi@raspberrypi.local 'sudo reboot'
	@echo "\nRebooting, device will be accessible as $$(cat ansible/local/last-hostname).local...\n"

ansible/local/id_rsa.pub ansible/local/id_rsa:
	ssh-keygen -t rsa -N "" -f ansible/local/id_rsa

.PHONY: setup
setup: ansible/local/id_rsa.pub ansible/local/id_rsa ansible/inventory/hosts.local
	cd ansible && ansible-playbook -l ungrouped site.yml