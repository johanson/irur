#!/usr/bin/env bashio

# bashio::log.info
# bashio::log.notice
# bashio::log.warning
# bashio::log.error
# bashio::log.fatal

case $1 in bashio::log*)
  eval $1 $2
esac