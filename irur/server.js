/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-absolute-path */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mqtt = require('mqtt');
const { execSync } = require('child_process');

const { env } = process;
require('dotenv').config();

const flags = process.argv.slice(2)[0];
const logger = path.join('scripts/logger.sh');

const app = express();
app.use(bodyParser.json(), cors(), express.static('dist'));

// Just a logging wrapper around bashio
// log.info(); error(); warn();
const log = {
  info(msg) {
    if (flags === '--dev') {
      console.log(msg);
    } else {
      try { execSync(`${logger} bashio::log.info "${msg}"`); } catch (e) {
        console.log(e);
      }
    }
  },
  error(msg) {
    if (flags === '--dev') {
      console.error(msg);
    } else {
      try { execSync(`${logger} bashio::log.error "${msg}"`); } catch (e) {
        console.log(e);
      }
    }
  },
  warn(msg) {
    if (flags === '--dev') {
      console.warn(msg);
    } else {
      try { execSync(`${logger} bashio::log.warning "${msg}"`); } catch (e) {
        console.log(e);
      }
    }
  },
};

const init = () => {
  const testDatabase = path.join(__dirname, 'test_db.json');
  const homeAssistantDatabase = path.join('/data/db.json');

  let db; let topicListen; let topicSend; let darkTheme;
  if (flags === '--dev') {
    topicListen = env.MQTT_TOPIC_LISTEN;
    topicSend = env.MQTT_TOPIC_SEND.split(', ');
    darkTheme = env.DARK_THEME;
    db = testDatabase;
  } else {
    db = homeAssistantDatabase;
    const homeAssistantOptions = require('/data/options.json');
    topicListen = homeAssistantOptions.topic_listen;
    topicSend = homeAssistantOptions.topic_send;
    darkTheme = homeAssistantOptions.dark_theme;
  }

  // Create empty file if it doesn't exist
  if (!fs.existsSync(db)) fs.openSync(db, 'a');

  const options = {
    mqttMatch: false,
    mqtt: {
      host: env.MQTT_HOST,
      port: env.MQTT_PORT,
      protocol: 'mqtt',
      username: env.MQTT_USER,
      password: env.MQTT_PASSWORD,
    },
    hostname: `${env.HOSTNAME}:${env.SERVER_PORT}/`,
    topic_listen: topicListen,
    topic_send: topicSend,
    dark_theme: darkTheme,
  };
  return { db, options };
};

const { db, options } = init();
log.info(`Database: ${db} \nConfiguration: ${JSON.stringify(options, null, 2)}`);
const conf = { ...options, ...{ mqttMatch: false } };

const client = mqtt.connect(conf.mqtt);

app.get('/', (req, res) => {
  res.header('Authorization', `Bearer: ${process.env.SUPERVISOR_TOKEN}`);
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get('/api/db/load/', (req, res) => {
  res.header('Content-Type', 'application/json');

  if (fs.existsSync(db)
  && fs.readFileSync(db, 'utf8') !== '') {
    res.sendFile(db);
  } else {
    const message = `${db} does not exist, creating new database`;
    res.json({ status: 'error', message });
    log.error(message);
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
    log.error(err.message);
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
  for (const tab of Object.keys(json)) {
    for (const key of Object.keys(json[tab].knobs)) {
      if (json[tab].knobs[key].id === id) {
        const message = json[tab].knobs[key].mqtt;
        const topic = json[tab].knobs[key].topic_send;
        if (message && topic) {
          status = { status: 'success' };
          client.publish(topic, message);
          log.info(`Sent ${message} to ${topic}`);
        }
        break;
      }
    }
  }
  status = status || { status: 'error' };
  res.json(status);
});

client.on('message', (topic, msg) => {
  const resp = JSON.parse(msg.toString()).IrReceived;
  log.info(`Received ${JSON.stringify(resp)}`);
  conf.mqttMatch = JSON.stringify({
    Protocol: resp.Protocol,
    Bits: resp.Bits,
    Data: resp.Data,
  }).toString();
});

client.on('connect', () => {
  client.subscribe(conf.topic_listen);
  log.info('Connected to MQTT server');
});

client.on('error', () => {
  log.error('Cannot connect to MQTT server, check your server settings and credentials');
});

client.on('offline', () => {
  log.error('MQTT server is offline');
});

app.listen(env.SERVER_PORT, () => {
  log.info(`Listening on port ${env.SERVER_PORT}`);
});
