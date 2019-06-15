#!/bin/bash

mode=$1

[[ ! -z "$mode" ]] || { echo "One argument (the mode name) is required" ; exit 1; }
([[ -f "{{ custom_interfaces_directory }}/{{ wlan_device_name }}.${mode}" ]] &&
     [[ -f "{{ custom_hostapd_directory }}/hostapd.${mode}.conf" ]]) ||
    { echo "Unrecognized mode: ${mode}" ; exit 1; }

# Aggregate these results so we only restart interfaces once.
restart_wlan=false
restart_ap=false

# Swap in necessary config files, and perform restarts etc. in cases where something has changed.
hostapd_src="{{ custom_hostapd_directory }}/hostapd.${mode}.conf"
hostapd_dest="/etc/hostapd/hostapd.conf"

if ! diff "${hostapd_src}" "${hostapd_dest}" > /dev/null ; then
    cp "${hostapd_src}" "${hostapd_dest}"
    restart_wlan=true
    restart_ap=true
fi

wlan0_src="{{ custom_interfaces_directory }}/{{ wlan_device_name }}.$mode"
wlan0_dest="/etc/network/interfaces.d/{{ wlan_device_name }}"

if ! diff "${wlan0_src}" "${wlan0_dest}" > /dev/null ; then
    cp "${wlan0_src}" "${wlan0_dest}"
    restart_wlan=true
fi

if [[ "${restart_wlan}" == true ]]; then
    ifdown {{ wlan_device_name }}
fi

if [[ "${restart_ap}" == true ]]; then
    # killall -s SIGHUP /usr/sbin/hostapd
    ifdown {{ ap_device_name }}
    ifup {{ ap_device_name }}
fi

if [[ "${restart_wlan}" == true ]]; then
    ifup {{ wlan_device_name }}
fi
