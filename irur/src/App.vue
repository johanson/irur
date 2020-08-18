<template>
  <div id="app" tabindex="0" ref="app" :class="mode"
            @keydown.esc="mode = 'normal'; loader = false;">

    <svg-sprite v-on:loaded="glyphs = $event; loader = false;" />

    <undo :is-visible="showUndo"
                :db="data"
         v-on:undo="data = $event; showUndo = false; save();"
        v-on:timer="showUndo = false;"
               ref="undo"/>

    <div id="loader" v-show="loader">
      <div class="icon" />
    </div>

    <div id="add-overlay" v-on:click="closeModal"
              @keydown.ctrl.shift.83="submitForm">

      <form action="#" id="form1" autocomplete="off">
        <div id="close" v-on:click="closeModal" />

        <label for="knob_name">Name <span>Name for your knob</span></label>
        <input type="text" id="knob_name" ref="name" required
            v-model="saveData.name">

        <label for="knob_mqtt">MQTT response
          <span>If no icon is selected, the name will be used</span>
        </label>
        <div id="mqtt">
          <input type="text" id="knob_mqtt" required
              v-model="saveData.mqtt">
          <button :disabled="listeningMqtt"
         v-on:click.prevent="receiveIR">Listen</button>
        </div>

        <label for="knob_mqtt_topic">MQTT topic
          <span>Add new topics from HA configuration</span>
        </label>
        <div id="knob_mqtt_topic">
          <p v-for="(item, index) in settings.topic_send" :key="index" >
            <input type="radio" required
               :checked="settings.topic_send.length === 1"
                    :id="'mqttTopic-' + index"
                 :value="item"
                 v-model="saveData.topic_send">
            <label :for="'mqttTopic-' + index">{{ item }}</label>
          </p>
        </div>

        <label for="knob_id">Unique id
          <span class="mono">
            curl {{settings.hostname}}{{api.send}}/{{saveData.id}}
          </span>
        </label>
        <input type="text" id="knob_id" required readonly
            v-model="saveData.id">

        <label for="knob_icon">Icon
          <span>If no icon is selected, the name is being used</span>
        </label>
        <input type="text" id="knob_icon"
            v-model="saveData.icon">

        <div id="glyphs">
          <div class="glyph"
               v-for="item in filteredGlyphs"
          :key="item"
          :data-name="item"
             :title="item"
          v-on:click="saveData.icon = item;"
              v-html="glyph(item)" />
        </div>

        <label for="knob_color">Color
          <span>
            Color for the icon. Leave blank for default that depends on the parent theme.
          </span>
        </label>
        <input type="text" id="knob_color"
            v-model="saveData.color">
        <slider-picker v-model="colors"></slider-picker>

        <button form="form1" v-on:click.prevent="submitForm">Save</button>

        <p class="keybinds">
          <strong>Control+Shift+S</strong> to save,
          <strong>Esc</strong> to close
        </p>
      </form>

    </div>

    <tabs :active-tab="activeTab"
      v-on:switch-tab="activeTab = $event;"
        v-on:save-tab="saveTab($event)"
      v-on:remove-tab="removeTab($event)"
     v-on:change-mode="mode = $event;"
                :mode="mode"
                :data="data" />

    <editor />

    <remote :db="data" :mode="mode" :active-tab="activeTab"
          v-on:change-mode="mode = $event;" v-on:save-order="save()" />

  </div>
</template>

<script>
import { Slider } from 'vue-color';
import SvgSprite from './components/SvgSprite.vue';
import Undo from './components/Undo.vue';
import Tabs from './components/Tabs.vue';
import Remote from './components/Remote.vue';
import Editor from './components/Editor.vue';
import Helpers from './mixins/helpers';
import './assets/app.scss';

export default {
  name: 'App',
  mixins: [Helpers],
  components: {
    'slider-picker': Slider,
    SvgSprite,
    Undo,
    Tabs,
    Remote,
    Editor,
  },
  data() {
    return {
      mode: 'normal',
      loader: true,
      glyphs: [],
      manager: {
        active: false,
        text: 'Manager',
      },
      activeTab: 'default',
      data: {
        default: {
          name: 'Default',
          knobs: [],
        },
      },
      saveData: {
        id: '',
        name: '',
        mqtt: '',
        topic_send: '',
        icon: '',
        color: this.cssVar('--text'),
      },
      showUndo: false,
      colors: { hex: this.cssVar('--text') },
      listeningMqtt: false,
      settings: { topic_send: '' },
      api: {
        prefix: `${this.getHostname()}api/`,
        receive: 'ir/receive',
        send: 'ir/send',
        save: 'db/save',
        load: 'db/load',
        settings: 'settings',
      },
    };
  },

  computed: {
    filteredGlyphs() {
      // saveData.icon is the term
      return this.glyphs.filter((x) => x.toLowerCase()
        .indexOf(this.saveData.icon.toLowerCase()) > -1);
    },
  },

  watch: {
    mode(e) {
      if (e === 'editor') {
        setTimeout(() => this.$refs.name.focus(), 50);
        this.colors = { hex: this.saveData.color };
      } else if (e === 'add') {
        this.colors = { hex: this.cssVar('--text') };
        this.saveData = {
          name: '',
          mqtt: '',
          id: this.genUID(),
          icon: '',
          color: this.cssVar('--text'),
          topic_send: this.saveData.topic_send,
        };
        setTimeout(() => this.$refs.name.focus(), 50);
      }
    },

    colors(value) {
      this.saveData.color = value.hex;
    },

  },

  mounted() {
    this.load();
  },

  methods: {
    load() {
      fetch(`${this.api.prefix}${this.api.load}`).then((resp) => {
        if (!resp.ok) {
          throw new Error(`API HTTP status ${resp.status}`);
        }
        return resp.json();
      }).then((json) => {
        if (json.status === 'error') {
          this.data = this.scaffoldDB();
        } else {
          this.data = json;
        }
      }).catch((err) => {
        this.$toast.error(String(err));
      });

      fetch(`${this.api.prefix}${this.api.settings}`).then((resp) => {
        if (!resp.ok) {
          throw new Error(`API HTTP status ${resp.status}`);
        }
        return resp.json();
      }).then((json) => {
        this.settings = json;
        [this.saveData.topic_send] = json.topic_send;
        // Set a root attribute based on HA settings
        if (json.dark_theme) {
          const root = document.getElementsByTagName('html')[0];
          root.setAttribute('data-theme', 'dark');
        }
      }).catch((err) => {
        this.$toast.error(String(err));
      });
    },

    save() {
      if (this.mode === 'editor') {
        this.filteredData[this.findObjIndex()] = ({
          id: this.saveData.id,
          name: this.saveData.name,
          mqtt: this.saveData.mqtt,
          topic_send: this.saveData.topic_send,
          icon: this.saveData.icon,
          color: this.saveData.color,
        });
      } else if (this.mode === 'add') {
        this.filteredData.push(this.saveData);
      }

      fetch(`${this.api.prefix}${this.api.save}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(this.data),
      }).then((resp) => {
        if (!resp.ok) throw new Error(`API HTTP status ${resp.status}`);
      }).catch((err) => {
        this.$toast.error(String(err));
      });
    },

    sendIR(id) {
      fetch(`${this.api.prefix}${this.api.send}/${id}`)
        .then((resp) => {
          if (!resp.ok) throw new Error(`API HTTP status ${resp.status}`);
        }).then(() => {
          this.loader = false;
        }).catch((err) => {
          this.$toast.error(String(err));
          this.loader = false;
        });
    },

    receiveIR() {
      const self = this;
      this.loader = true;
      const mqttTimeout = 5;
      const controller = new AbortController();

      const mqttListeningTimeout = setTimeout(() => {
        controller.abort();
      }, (mqttTimeout * 1000));

      function flip() {
        self.listeningMqtt = false;
        self.loader = false;
        clearTimeout(mqttListeningTimeout);
      }

      fetch(`${this.api.prefix}${this.api.receive}`, { signal: controller.signal })
        .then((resp) => {
          if (!resp.ok) {
            throw new Error(`API HTTP status ${resp.status}`);
          }
          return resp.json();
        }).then((json) => {
          flip();
          self.saveData.mqtt = json.mqtt;
          this.$toast.info('Ir code received');
        }).catch((err) => {
          flip();
          if (err.name === 'AbortError') {
            this.$toast.info(`Stopped listening after ${mqttTimeout} seconds of no incoming messages`);
          } else {
            this.$toast.error(String(err));
          }
        });
    },

    submitForm() {
      const dat = this.saveData;
      const required = [dat.name, dat.mqtt, dat.id, dat.topic_send];
      if (required.some((x) => x === '' || x === undefined)) {
        this.$toast.error('Name, id, mqtt and topic required');
      } else {
        this.save();
        // Leave the state in edit mode when making changes,
        // not adding new knobs
        if (this.mode === 'editor') {
          this.mode = 'edit';
        } else {
          this.mode = 'normal';
        }
      }
    },

    glyph(icon) {
      return `<svg class="icon" style="fill: ${this.saveData.color}">
                <use xlink:href="#${icon}"></use>
              </svg>`;
    },

    closeModal(e) {
      if (['add-overlay', 'close'].includes(e.target.id)) {
        this.mode = 'normal';
        this.loader = false;
      }
    },

    cssVar(prop) {
      return getComputedStyle(document.documentElement).getPropertyValue(prop);
    },

    saveTab(tab) {
      if (tab.id && tab.name) {
        let exists;
        for (const prop in this.data) {
          if (prop === tab.id) {
            this.data[prop].name = tab.name;
            this.save();
            exists = true;
            break;
          }
        }
        // No match, create a new tab group
        if (!exists) {
          this.data = {
            ...this.data,
            ...{
              [tab.id]: {
                name: tab.name,
                knobs: [],
              },
            },
          };
          this.save();
        }
      }
    },

    removeTab(id) {
      this.$refs.undo.record();
      this.showUndo = true;
      this.$delete(this.data, id);
      this.save();
    },
  },
};

</script>
