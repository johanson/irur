const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mqtt = require('mqtt');
const { execSync } = require('child_process');

const { env } = process;
const flags = process.argv.slice(2)[0];

const app = express();
app.use(bodyParser.json(), cors(), express.static('dist'));

// Just a logging wrapper around bashio
const log = {
  bashioPath: path.join('scripts/logger.sh'),

  bashio(msg = '', level = 'info') {
    try {
      if (fs.existsSync(this.bashioPath)) {
        execSync(`${this.bashioPath} bashio::log.${level} "${msg}"`);
      } else {
        throw Error(`Bashio doesn't exist [${this.bashioPath}]`);
      }
    } catch (err) {
      console.log(err.message);
    }
  },

  info(msg) {
    if (flags === '--dev') {
      console.log(msg);
    } else {
      this.bashio(msg, 'info');
    }
  },

  error(msg) {
    if (flags === '--dev') {
      console.error(msg);
    } else {
      this.bashio(msg, 'error');
    }
  },

  warn(msg) {
    if (flags === '--dev') {
      console.warn(msg);
    } else {
      this.bashio(msg, 'warn');
    }
  },
};

const init = () => {
  let db, topicListen, topicSend, hostname;

  if (flags === '--dev') {
    require('dotenv').config();
    topicListen = env.MQTT_TOPIC_LISTEN;
    topicSend = env.MQTT_TOPIC_SEND.split(',');
    db = path.join(__dirname, 'dev_db.json');
    hostname = `http://localhost:${env.SERVER_PORT}/`;
  } else {
    db = path.join('/data/db.json');
    const homeAssistantOptions = JSON.parse(
      fs.readFileSync('/data/options.json', 'utf8')
    );
    topicListen = homeAssistantOptions.topic_listen;
    topicSend = homeAssistantOptions.topic_send;
    env.SERVER_PORT = 8099;
    hostname = env.HOSTNAME;
  }

  // Create empty db if it doesn't exist
  if (!fs.existsSync(db)) fs.openSync(db, 'a');

  const conf = {
    mqtt: {
      host: env.MQTT_HOST,
      port: env.MQTT_PORT,
      protocol: 'mqtt',
      username: env.MQTT_USER,
      password: env.MQTT_PASSWORD,
    },
    hostname: hostname,
    topic_listen: topicListen,
    topic_send: topicSend,
    mqttMatch: false,
  };
  return { db, conf };
};

const { db, conf } = init();
log.info(`Database: ${db} \nConfiguration: ${JSON.stringify(conf, null, 2)}`);
const client = mqtt.connect(conf.mqtt);

// Redirect non trailing slash to trailing slash
app.use((req, res, next) => {
  if (!req.url.endsWith('/')) {
    res.redirect(301, `${req.url}/`);
  }
  next();
});

app.get('/', (req, res) => {
  res.header('Authorization', `Bearer: ${process.env.SUPERVISOR_TOKEN}`);
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get('/api/db/load/', (req, res) => {
  res.header('Content-Type', 'application/json');
  if (fs.existsSync(db) && fs.readFileSync(db, 'utf8') !== '') {
    res.sendFile(db);
  } else {
    const message = `${db} does not exist, creating new database`;
    res.json({ status: 'error', message });
    log.error(message);
  }
});

app.get('/api/settings/', (req, res) => {
  const response = {
    hostname: conf.hostname,
    topic_send: conf.topic_send,
  };
  res.json(response);
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

app.get('/api/ir/receive/', (req, res) => {
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
  })();
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
  status = status || { status: 'error', message: 'IR Code not in database' };
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
  log.error(
    'Cannot connect to MQTT server, check your server settings and credentials'
  );
});

client.on('offline', () => {
  log.error('MQTT server is offline');
});

app.listen(env.SERVER_PORT, () => {
  log.info(`Listening on port ${env.SERVER_PORT}`);
});
