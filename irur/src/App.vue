<template>
  <div id="app" tabindex="0"
            :class="mode"
            @keydown.esc="mode = 'normal'; loader = false;">

    <svg-sprite v-on:loaded="glyphs = $event; loader = false;" />

    <undo :isVisible="showUndo"
                  :db="data"
            v-on:undo="data = $event; save(); showUndo = false;"
          v-on:timer="showUndo = false;"
                  ref="undo"/>

    <vue-context ref="tabMenu">
      <template slot-scope="child">
        <li><a href="#" data-id="add"
                 @click.prevent="tabContextMenu($event, child.data)">Add</a>
        </li>
        <li><a href="#" data-id="rename"
                 @click.prevent="tabContextMenu($event, child.data)">Rename</a>
        </li>
        <li><a href="#" data-id="remove" :class="child.data"
                 @click.prevent="tabContextMenu($event, child.data)">Remove</a>
        </li>
      </template>
    </vue-context>

    <vue-context ref="knobMenu">
      <template slot-scope="child">
        <li><a href="#" data-id="add"
                @click.prevent="knobContextMenu($event, child.data)">Add</a>
        </li>
        <li><a href="#" data-id="edit"
                @click.prevent="knobContextMenu($event, child.data)">Edit</a>
        </li>
        <li><a href="#" data-id="sort"
                @click.prevent="knobContextMenu($event, child.data)">Sort</a>
        </li>
        <li><a href="#" data-id="remove"
                @click.prevent="knobContextMenu($event, child.data)">Remove</a>
        </li>
      </template>
    </vue-context>

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

    <tabs />
    <editor />
    <remote />

    <div id="tabs">
      <div class="tab" v-for="(item, key) in data"
          @contextmenu.prevent="$refs.tabMenu.open($event, key)"
          :class="{ active: activeTab === key }"
        :data-id="key"
            :key="key"
      v-on:click="activeTab = key">
        <input type="text"
               v-if="mode === 'tab-rename' && activeTab === key"
       v-model.trim="item.name"
                :id="'menu-item-' + key"
   v-on:keyup.enter="saveTab();"
              @blur="(item.name === '') ? item.name = 'New' : item.name = item.name;
              saveTab();">
        <span v-else>
          {{item.name}}
        </span>
      </div>
    </div>

    <draggable id="remote"
          v-model="filteredData"
        :disabled="(this.mode == 'sort') ? false : true"
        draggable=".item"
          @change="save">

          <div class="item-add" slot="footer" draggable="false"
          v-on:click="mode = 'add';">
            <div class="glyph">
              <svg class="icon">
                <use xlink:href="#add"></use>
              </svg>
            </div>
          </div>

      <div class="item"
      @contextmenu.prevent="$refs.knobMenu.open($event, el.id)"
                      :key="el.id"
                    :title="el.name"
                v-on:click="sendIR(el.id);"
                     v-for="el in filteredData">

        <div class="glyph"
        v-if="el.icon">
          <svg class="icon" :style="'fill:' + el.color">
            <use :xlink:href="'#' + el.icon"></use>
          </svg>
        </div>

        <div :class="['no-icon len-' + el.name.length]"  :style="'color:' + el.color" v-else>
          {{ el.name }}
        </div>

      </div>

    </draggable>

  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { Slider } from 'vue-color';
import { VueContext } from 'vue-context';
import SvgSprite from './components/SvgSprite.vue';
import UndoButton from './components/UndoButton.vue';
import Tabs from './components/Tabs.vue';
import Remote from './components/Remote.vue';
import Editor from './components/Editor.vue';
import './assets/app.scss';

export default {
  name: 'App',
  components: {
    draggable,
    VueContext,
    'slider-picker': Slider,
    'svg-sprite': SvgSprite,
    undo: UndoButton,
    tabs: Tabs,
    remote: Remote,
    editor: Editor
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
    filteredData: {
      get() {
        return this.data[this.activeTab].knobs;
      },
      set(val) {
        this.data[this.activeTab].knobs = val;
      },
    },
  },

  watch: {
    mode(e) {
      if (e === 'editor') {
        setTimeout(() => this.$refs.name.focus(), 500);
        this.colors = { hex: this.saveData.color };
      } else if (e === 'add') {
        this.colors = { hex: this.cssVar('--text') };
        this.saveData = {
          name: '',
          mqtt: '',
          id: this.generateUID(),
          icon: '',
          color: this.cssVar('--text'),
          topic_send: this.saveData.topic_send,
        };
        setTimeout(() => this.$refs.name.focus(), 500);
      }
    },
    colors(value) {
      this.saveData.color = value.hex;
    },
  },
  filters: {
    defaultValue(value) {
      return (value === '') ? 'New' : value;
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
          this.loadDefaultDB();
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

    loadDefaultDB() {
      this.data = {
        default: {
          name: 'Default',
          knobs: [
            {
              id: 'wn0gbd99',
              name: 'Samsung Volume Up',
              mqtt: '{"Protocol":"SAMSUNG","Bits":32,"Data":"0xE0E0E01F"}',
              icon: 'up-arrow',
              topic_send: '',
            },
            {
              id: 'wt9u3yzj',
              name: 'Samsung Volume Down',
              mqtt: '{"Protocol":"SAMSUNG","Bits":32,"Data":"0xE0E0D02F"}',
              icon: 'down-arrow',
              topic_send: '',
            },
          ],
        },
      };
    },

    toggleManager() {
      if (this.manager.active) {
        this.mode = 'normal';
        this.manager.text = 'Manager';
      } else {
        this.manager.text = 'Normal';
        this.mode = 'normal';
      }
      this.manager.active = !this.manager.active;
    },

    knobContextMenu(e, id) {
      const type = e.target.dataset.id;
      if (type === 'add') {
        this.mode = 'add';
      }
      if (type === 'edit') {
        this.saveData = this.filteredData[this.findObjIndex(id)];
        this.mode = 'editor';
      }
      if (type === 'sort') {
        if (this.mode === 'sort') {
          this.mode = 'normal';
        } else {
          this.mode = 'sort';
        }
      }
      if (type === 'remove') {
        this.$refs.undo.record();
        this.showUndo = true;
        this.filteredData = this.filteredData.filter((x) => x.id !== id);
        this.save();
      }
    },
    changeMqttTopic(topic) {
      this.saveData.topic_send = topic;
    },
    tabContextMenu(e, id) {
      const type = e.target.dataset.id;
      if (type === 'rename') {
        this.activeTab = id;
        this.mode = 'tab-rename';
        setTimeout(() => document.querySelector(`#menu-item-${id}`).focus(), 200);
      }

      if (type === 'add') {
        const uid = this.generateUID();

        this.data = {
          ...this.data,
          ...{
            [uid]: {
              name: 'New',
              knobs: [],
            },
          },
        };

        this.activeTab = uid;
        this.mode = 'tab-rename';
        setTimeout(() => document.querySelector(`#menu-item-${uid}`).focus(), 200);
        this.save();
      }

      if (type === 'remove' && id !== 'default') {
        if (id === this.activeTab) {
          // Go back to default tab if deleting the active tab
          this.activeTab = 'default';
        }
        this.$refs.undo.record();
        this.showUndo = true;
        this.$delete(this.data, id);
        this.save();
      }
    },

    saveTab() {
      this.mode = 'normal';
      this.save();
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

    // Finds the correct index of an object
    // in array we want to modify
    findObjIndex(id) {
      const idToCompareWith = (id) || this.saveData.id;
      let index;
      for (let i = 0; i < this.filteredData.length; i += 1) {
        if (this.filteredData[i].id === idToCompareWith) {
          index = i;
        }
      }
      return index;
    },

    generateUID() {
      return Math.random().toString(36).slice(-8);
    },

    cssVar(prop) {
      return getComputedStyle(document.documentElement).getPropertyValue(prop);
    },

    getHostname() {
      if (process.env.NODE_ENV !== 'production') {
        return `http://localhost:${process.env.VUE_APP_SERVER_PORT}/`;
      }
      return '';
    },
  },
};

</script>
