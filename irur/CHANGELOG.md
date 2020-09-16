# Changelog

## 0.6.0

- Add the ability to add empty placeholders

## 0.5.1

- Fix notifications presentation

## 0.5.0

- Get theme from Home Assistant instead of relying on hard coded light/dark
- Remove dark_theme from the configuration
- Improved drag-and-drop sorting 

## 0.4.1

- Fixed minor issues when starting with an empty database

## 0.4.0

- Add undo function for deleting knobs or tabs (control + Z)
- Fix renaming a tab after creating one
- Fix colour picker when editing items
- Fix tab overflow
- Fix rest api hostname
- Fix context menu on mobile
- Break the Vue app into modules

## 0.4.0

- Add ability to add tabs
- Managing the knobs and tabs is now done by using the context menu
- The topic_send is now a list since you can have multiple devices sending IR signals

## 0.3.0

- Get MQTT broker credentials automatically
- Add `dumb-init` as init system