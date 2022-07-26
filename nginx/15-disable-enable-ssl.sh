#!/bin/bash

set -e
cd /etc/nginx/templates

if [[ -z "$ENABLE_HTTPS" ]]; then
    [[ -f default.ssl.conf.template ]] && mv default.ssl.conf.template default.ssl.conf.template.disabled
    echo "Disabled default.ssl.conf.template"
    cd /etc/nginx/conf.d
    [[ -f redirector.conf ]] && mv redirector.conf redirector.conf.disabled
    echo "Disabled redirector.conf"
    [[ -f certbot.conf ]] && mv certbot.conf certbot.conf.disabled
    echo "Disabled certbot.conf"
else
    [[ -f default.ssl.conf.template.disabled ]] && mv default.ssl.conf.template.disabled default.ssl.conf.template
    echo "Enabled default.ssl.conf.template"
    cd /etc/nginx/conf.d
    [[ -f redirector.conf.disabled ]] && mv redirector.conf.disabled redirector.conf
    echo "Enabled redirector.conf"
    [[ -f certbot.conf.disabled ]] && mv certbot.conf.disabled certbot.conf
    echo "Enabled certbot.conf"
fi
