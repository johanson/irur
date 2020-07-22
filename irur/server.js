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
  if (process.argv.slice(2)[0] === '--dev') {
    console.log('Using dev mqtt conf');
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
  console.log('Getting mqtt conf from Home Assistant');
  return require('/data/options.json');
}
const conf = { ...options(), ...{ mqttMatch: false } };
const client = mqtt.connect(conf.mqtt);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get('/api/db/load/', (req, res) => {
  const db = path.join(__dirname, 'db.json');
  res.header('Content-Type', 'application/json');
  if (fs.existsSync(db)) {
    res.sendFile(db);
  } else {
    const message = `${db} does not exist`;
    res.json({ status: 'error', message });
    console.error(message);
  }
});

app.get('/api/settings', (req, res) => {
  res.json(conf);
});

app.post('/api/db/save/', (req, res) => {
  fs.writeFileSync('db.json', JSON.stringify(req.body, null, 1));
  res.send();
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
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'));
  for (const key of Object.keys(db)) {
    if (db[key].id === id) {
      const message = db[key].mqtt;
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
  console.log('Connected to MQTT server');
});

client.on('error', () => {
  console.error('Cannot connect to MQTT server, check your server settings and credentials');
});

client.on('offline', () => {
  console.error('MQTT server is offline');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
