# IRUR: IR remote control add-on for Home Assistant

![Supports aarch64 Architecture][aarch64-shield] ![Supports amd64 Architecture][amd64-shield] ![Supports armhf Architecture][armhf-shield] ![Supports armv7 Architecture][armv7-shield] ![Supports i386 Architecture][i386-shield]

Infrared Universal Remote webUI for Tasmota ESP8266 based devices over MQTT.
Provides a simple web UI to record and manage buttons for your virtual IR remote. Supports ingress and an option to show in sidebar. Comes with around 150 icons, but you can also use text or emojis.

## ![IRUR logo][logo]

## Installation

Flash your ESP8266 board with Tasmota (tasmota-ir.bin) firmware. All the builds support common IR protocols but use tasmota-ir.bin for all available protocols provided by IRremoteESP8266 library). Install your IR emitter and receiver and configure the right pins from Tasmota configuration (`irrecv` and `irsend` respectively).

![Example Tasmota config][tasmoconf]

### Home Assistant

- Supervisor ⇒ Add-on store ⇒ Click on the right-top menu ⇒ Add Repositories ⇒ https://github.com/johanson/irur ⇒ Add

- The repository should appear underneath the official and community add-ons.

- Install the add-on, make sure you to configure correct topic(s) for receiving and sending messages corresponding to your Tasmota configuration. You can use [MQTT Explorer][mqttexplorer] if you have problems figuring it out. HA provides MQTT broker's credentials automatically.

### Configuration

```
topic_listen: irur/tele/RESULT
topic_send:
- irur/cmnd/IRsend
```

```
topic_listen (str)
```

MQTT topic for receiving IR codes

```
topic_send   (list)
```

MQTT topic for sending IR codes.

### Screenshots

![Irur screenshots][irur-screensots-comp-1]

![Irur screenshots][irur-screensots-comp-2]

Changelog is [here][changelog].

## Keyboard Shortcuts

`Shift+n` new knob  
`Shift+t` new tab  
`Esc` cancel/close  
`Enter` save

## Development

Clone the repo, install npm dependencies. Install fabric3 (pip3 install fabric3) , do `fab -list` from terminal in the project dir for all the available tasks.

```
$ fab -l
Available commands:

api      Start a node server for the backend api
build    Compile and minify for production
         :param bump_version: Bump addon version number before
                              building, defaults to `True`
         :type  bump_version: bool, optional
         Arguments: bump_version=False
deploy:  Compile and upload the project to the HA server for Docker
         :param bump_version: Bump addon version number before
                              pushing to remote server, defaults to `True`
         :type  bump_version: bool, optional
         :param sync:         Synchronize working directy to remote server
         :type  sync:         bool, optional
         :param reload:       Reload and update addon over SSH
         :type  reload:       bool, optional

         Arguments: bump_version=True, sync=True, reload=True
lint     Lint and fix files
serve    Compile with hot-reload for development
```

If you prefer npm scripts: `npm run build` to build with webpack (or `npm run serve` for development), `node server.js --dev` to start the server.

### Dependencies

- Node.js
- Express

For developing: Vue cli, npm

# Credits

Icons made by Roundicons, Freepik, Pixel perfect, hirschwolf, Kiranshastry, Good Ware, Becris, srip, dmitri13, surang, Nikita Golubev, Linector, Icongeek26, Smashicons, photo3idea_studio, bqlqn from [www.flaticon.com](https://www.flaticon.com/ 'Flaticon')

---

This project is licensed under the terms of the [MIT license][mit].

[aarch64-shield]: https://img.shields.io/badge/aarch64-yes-green.svg
[amd64-shield]: https://img.shields.io/badge/amd64-yes-green.svg
[armhf-shield]: https://img.shields.io/badge/armhf-yes-green.svg
[armv7-shield]: https://img.shields.io/badge/armv7-yes-green.svg
[i386-shield]: https://img.shields.io/badge/i386-yes-green.svg
[logo]: https://github.com/johanson/irur/blob/master/irur/logo.png?raw=true
[tasmoconf]: https://github.com/johanson/irur/blob/master/irur/screenshots/tasmota.png?raw=true
[mqttexplorer]: https://github.com/thomasnordquist/MQTT-Explorer
[irur-screensots-comp-1]: https://github.com/johanson/irur/blob/master/irur/screenshots/irur-screensots-comp-1.png?raw=true
[irur-screensots-comp-2]: https://github.com/johanson/irur/blob/master/irur/screenshots/irur-screensots-comp-2.png?raw=true
[mit]: https://github.com/johanson/irur/blob/master/irur/LICENSE
[changelog]: https://github.com/johanson/irur/blob/master/irur/CHANGELOG.md
