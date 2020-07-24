/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-absolute-path */
/* eslint-disable global-require */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mqtt = require('mqtt');

const PORT = 8099;
const app = express();
app.use(bodyParser.json(), cors(), express.static('dist'));

function options() {
  const { env } = process;
  const flag = process.argv.slice(2)[0];
  const data = require('/data/options.json');
  if (flag === '--dev') {
    console.log('Using dev MQTT configuration');
    return {
      mqttMatch: false,
      mqtt: {
        host: '192.168.0.100',
        port: 1883,
        protocol: 'mqtt',
        username: 'mosqi',
        password: 'mosqi',
      },
      topic_listen: 'irur/tele/RESULT',
      topic_send: 'irur/cmnd/IRsend',
      dark_theme: true,
    };
  }
  console.log('Getting MQTT configuration from HA');
  return {
    mqttMatch: false,
    mqtt: {
      host: env.MQTT_HOST,
      port: env.MQTT_PORT,
      protocol: 'mqtt',
      username: env.MQTT_USER,
      password: env.MQTT_PASSWORD,
    },
    topic_listen: data.topic_listen,
    topic_send: data.topic_send,
    dark_theme: true,
  };
}
// const { execSync } = require('child_process');

// execSync('bashio::log.info "test"');

const conf = { ...options(), ...{ mqttMatch: false } };
const client = mqtt.connect(conf.mqtt);
const db = path.join('/data/db.json');

app.get('/', (req, res) => {
  res.header('Authorization', `Bearer: ${process.env.SUPERVISOR_TOKEN}`);
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get('/api/db/load/', (req, res) => {
  res.header('Content-Type', 'application/json');
  if (fs.existsSync(db)) {
    res.sendFile(db);
  } else {
    const message = `${db} does not exist, creating new database`;
    res.json({ status: 'error', message });
    console.error(message);
  }
});

app.get('/api/settings', (req, res) => {
  res.json(conf);
});

app.post('/api/db/save/', (req, res) => {
  let output;
  try {
    output = { status: 'success' };
    fs.writeFileSync(db, JSON.stringify(req.body, null, 1));
  } catch (err) {
    output = { status: 'error', message: err.message };
    console.error(err.message);
  }
  res.send(output);
});

app.get('/api/ir/receive', (req, res) => {
  conf.mqttMatch = false;
  let counter = 0;
  (function wait() {
    if (conf.mqttMatch.length) {
      res.json({ mqtt: conf.mqttMatch });
    } else {
      counter = 0.5 + counter;
      if (counter === 5) {
        counter = 0;
      } else {
        setTimeout(wait, 500);
      }
    }
  }());
});

app.get('/api/ir/send/:id', (req, res) => {
  let status;
  const { id } = req.params;
  const json = JSON.parse(fs.readFileSync(db, 'utf8'));
  for (const key of Object.keys(json)) {
    if (json[key].id === id) {
      const message = json[key].mqtt;
      if (message) {
        status = { status: 'success' };
        client.publish(conf.topic_send, message);
      }
      break;
    }
  }
  status = status || { status: 'error' };
  res.json(status);
});

client.on('message', (topic, msg) => {
  const resp = JSON.parse(msg.toString()).IrReceived;
  console.log(`Received ${JSON.stringify(resp)}`);
  conf.mqttMatch = JSON.stringify({
    Protocol: resp.Protocol,
    Bits: resp.Bits,
    Data: resp.Data,
  }).toString();
});

client.on('connect', () => {
  client.subscribe(conf.topic_listen);
  console.info('Connected to MQTT server');
});

client.on('error', () => {
  console.error('Cannot connect to MQTT server, check your server settings and credentials');
});

client.on('offline', () => {
  console.error('MQTT server is offline');
});

app.listen(PORT, () => {
  console.info(`Listening on port ${PORT}`);
});
