#!/usr/bin/dumb-init bashio
set -e

bashio::log.info "Getting MQTT broker credentials"

export MQTT_HOST=$(bashio::services "mqtt" "host")
export MQTT_PORT=$(bashio::services "mqtt" "port")
export MQTT_USER=$(bashio::services "mqtt" "username")
export MQTT_PASSWORD=$(bashio::services "mqtt" "password")

bashio::log.info "Starting application"

exec node server.js