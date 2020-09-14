# Changelog

## 0.5.2

- Get theme from Home Assistant instead of relying on hard coded light/dark
- Remove dark_theme from the configuration

## 0.5.2

- Improved drag-and-drop sorting 

## 0.5.1
- Fixed minor issues when starting with an empty database

## 0.5.0

- Break the Vue app into modules
- Fix renaming a tab after creating one

## 0.4.7

- Fix colour picker when editing items

## 0.4.6

- Appearance changes

## 0.4.5

- Added undo function for deleting knobs or tabs (control + Z)

## 0.4.5

- Fix tab overflow

## 0.4.3

- Fix rest api hostname

## 0.4.2

- Fix context menu on mobile

## 0.4.0

- Add ability to add tabs
- Managing the knobs and tabs is now done by using the context menu
- The topic_send is now a list since you can have multiple devices sending IR signals

## 0.3.0

- Get MQTT broker credentials automatically
- Use `dumb-init` as init system