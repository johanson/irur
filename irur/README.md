# IRUR

![IRUR logo](https://github.com/johanson/ha-addons/blob/master/irur/logo.png?raw=true) 

Infrared Universal Remote webUI for Tasmota ESP8266 based devices over MQTT.  
Provides a simple web UI to record and manage buttons.

---

## Installation

First, flash your ESP8266 board with Tasmota (tasmota-ir.bin) firmwire. All the builds support common IR protocols but use tasmota-ir.bin for all available protocols provided by library IRremoteESP8266). Install IR emitter and receiver.

![Example Tasmota config](https://github.com/johanson/ha-addons/blob/master/irur/screenshots/tasmota.png?raw=true)

### Home Assistant

Install the addon, make sure you to configure correct topic(s) for receiving and sending messages corresponding to your Tasmota configuration. You can use [MQTT Explorer](https://github.com/thomasnordquist/MQTT-Explorer) if you have problems figuring it out. HA provides MQTT broker's credentials automatically. Supports ingress and an option to show in sidebar. Come with ~150 icons.

### Configuration

```
topic_listen: irur/tele/RESULT
topic_send:
- irur/cmnd/IRsend
dark_theme: false
```

`topic_listen` (str)  
MQTT topic for receiving IR codes

`topic_send` (list)  
MQTT topic for sending IR codes.

`dark_theme` (bool)  
Whether you prefer a dark theme for default light.

### Screenshots

![Irur dark UI screenshot](https://github.com/johanson/ha-addons/blob/master/irur/screenshots/screenshot-ui-1-dark.png?raw=true)

![Irur dark UI screenshot](https://github.com/johanson/ha-addons/blob/master/irur/screenshots/screenshot-ui-settings-1-dark.png?raw=true)

![Irur dark UI screenshot](https://github.com/johanson/ha-addons/blob/master/irur/screenshots/screenshot-ui-1-light.png?raw=true)

![Irur dark UI screenshot](https://github.com/johanson/ha-addons/blob/master/irur/screenshots/screenshot-ui-settings-1-light.png?raw=true)

## Development

Clone the repo, install npm dependencies. Install fabric3 (pip3 install fabric3). `fab -list` in the project dir for all the availible tasks.
Or if you prefer npm scripts: `npm run build` to build with webpack (or `npm run serve` for development), `node server.js --dev` to start the server.

### Dependencies

* Node.js
* Express
* Vue-cli (dev)
* Npm (dev)
* Fabric3 (dev)
* Rsync (dev)

# Credits

Icons made by [Roundicons](https://www.flaticon.com/authors/roundicons "Roundicons"), [Freepik](https://www.flaticon.com/authors/freepik "Freepik"), [Pixel perfect](https://www.flaticon.com/authors/pixel-perfect "Pixel perfect"), [hirschwolf](https://www.flaticon.com/authors/hirschwolf "hirschwolf"), [Kiranshastry](https://www.flaticon.com/authors/kiranshastry "Kiranshastry"), [Good Ware](https://www.flaticon.com/authors/good-ware "Good Ware"), [Becris](https://www.flaticon.com/authors/becris "Becris"), [srip](https://www.flaticon.com/authors/srip "srip"), [dmitri13](https://www.flaticon.com/authors/dmitri13 "dmitri13"), [surang](https://www.flaticon.com/authors/surang "surang"), [Nikita Golubev](https://www.flaticon.com/authors/nikita-golubev "Nikita Golubev"), [Linector](https://www.flaticon.com/authors/linector "Linector"), [Icongeek26](https://www.flaticon.com/authors/icongeek26 "Icongeek26"), [Smashicons](https://www.flaticon.com/authors/smashicons "Smashicons"), [photo3idea_studio](https://www.flaticon.com/authors/photo3idea-studio "photo3idea_studio"), [bqlqn](https://www.flaticon.com/authors/bqlqn "bqlqn") from [www.flaticon.com](https://www.flaticon.com/ "Flaticon")