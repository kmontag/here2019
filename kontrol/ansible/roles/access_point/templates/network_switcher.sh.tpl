#!/bin/bash

# Check whether the filesystem is currently read-only
is_readonly=false
(touch ~/.feathernet-tmp && rm ~/.feathernet-tmp) || is_readonly=true

# Temporarily enter read-write mode
if [ "$is_readonly" = true ] ; then
    echo "entering read-write mode..."
    /usr/local/bin/rw
fi

mode=$1

[[ ! -z "$mode" ]] || { echo "One argument (the mode name) is required" ; exit 1; }
([[ -f "{{ custom_interfaces_directory }}/{{ wlan_device_name }}.${mode}" ]] &&
     [[ -f "{{ custom_hostapd_directory }}/hostapd.${mode}.conf" ]]) ||
    { echo "Unrecognized mode: ${mode}" ; exit 1; }

# Aggregate these results so we only restart interfaces once.
restart_wlan=false
restart_ap=false
restart_dnsmasq=false

dnsmasq_src="{{ custom_dnsmasq_directory }}/dnsmasq.${mode}.conf"
dnsmasq_dest="/etc/dnsmasq.conf"
if ! diff "${dnsmasq_src}" "${dnsmasq_dest}" > /dev/null ; then
    cp "${dnsmasq_src}" "${dnsmasq_dest}"
    restart_dnsmasq=true
fi

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

ap0_src="{{ custom_interfaces_directory }}/{{ ap_device_name }}.$mode"
ap0_dest="/etc/network/interfaces.d/{{ ap_device_name }}"

if ! diff "${ap0_src}" "${ap0_dest}" > /dev/null ; then
    cp "${ap0_src}" "${ap0_dest}"
    restart_ap=true
fi


if [[ "${restart_dnsmasq}" == true ]]; then
    echo "restarting dnsmasq..."
    systemctl restart dnsmasq
fi

if [[ "${restart_wlan}" == true ]]; then
    echo "stopping {{ wlan_device_name }}..."
    ifdown {{ wlan_device_name }}
fi

if [[ "${restart_ap}" == true ]]; then
    echo "restarting {{ ap_device_name }}..."

    # Release current IP address, otherwise we get conflicts with
    # other master networks after we've gone into master mode
    # ourselves.
    ip addr flush dev {{ ap_device_name }}

    # killall -s SIGHUP /usr/sbin/hostapd
    ifdown {{ ap_device_name }}
    ifup {{ ap_device_name }}
fi

if [[ "${restart_wlan}" == true ]]; then
    echo "starting {{ wlan_device_name }}..."
    ifup {{ wlan_device_name }}
fi

# Go back to read-only mode if appropriate
if [ "$is_readonly" = true ] ; then
    echo "returning to read-only mode..."
    /usr/local/bin/ro
fi