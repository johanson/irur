<template>
  <div id="app" tabindex="0"
            v-bind:class="mode"
            @keydown.esc="mode = 'normal'">

    <div id="loader" v-show="loader" />
    <div id="svg-sprite" />

    <div id="add-overlay"
                v-on:click="closeModal"
    @keydown.ctrl.shift.83="submitForm">

      <form action="#" id="form1" autocomplete="off">
        <div id="close" v-on:click="closeModal" />

        <label for="knob_name">Name <span>Name for your knob</span></label>
        <input type="text" id="knob_name" ref="name" required
            v-model="saveData.name">

        <label for="knob_mqtt">Mqtt response
          <span>If no icon is selected, the name will be used</span>
        </label>
        <div id="mqtt">
          <input type="text" id="knob_mqtt" required
              v-model="saveData.mqtt">
          <button :disabled="listeningMqtt"
         v-on:click.prevent="receiveIR">Listen</button>
        </div>

        <label for="knob_id">Unique id
          <span>
            <a v-bind:href="api.prefix + api.send + '/' +saveData.id" target="_blank">
              {{api.prefix}}{{api.send}}/{{saveData.id}}
            </a>
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
          v-bind:key="item"
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

        <p><strong>Control+Shift+S</strong> to save,
            <strong>Esc</strong> to close</p>
      </form>

    </div>

    <draggable id="remote"
          v-model="list"
        :disabled="(this.mode == 'sort') ? false : true"
          @change="save">

      <div class="item"
           v-for="el in list"
            :key="el.id"
          :title="el.name"
      v-on:click="knobAction(el.id)">

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

    <div id="menu">
      [<a href="#" v-on:click.prevent="toggleManager" class="manager">{{manager.text}}</a>]
      <div class="container" v-show="manager.active">
        [<a href="#" v-on:click.prevent="mode = 'add'" class="add">Add</a> |
         <a href="#" v-on:click.prevent="mode = 'edit'" class="edit">Edit</a> |
         <a href="#" v-on:click.prevent="mode = 'sort'" class="sort">Sort</a> |
         <a href="#" v-on:click.prevent="mode = 'remove'" class="remove">Remove</a>]
       </div>
    </div>

  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { Slider } from 'vue-color';
import './assets/app.scss';
import 'vue-toast-notification/dist/theme-default.css';

export default {
  name: 'App',
  components: {
    draggable,
    'slider-picker': Slider,
  },
  data() {
    return {
      mode: 'normal',
      loader: false,
      manager: {
        active: false,
        text: 'Manager',
      },
      list: [],
      glyphs: [],
      colors: { hex: this.cssVar('--text') },
      saveData: {
        id: '',
        name: '',
        mqtt: '',
        icon: '',
        color: this.cssVar('--text'),
      },
      listeningMqtt: false,
      hostname: this.getHostname(),
      api: {
        prefix: `${this.getHostname()}/api`,
        receive: '/ir/receive',
        send: '/ir/send',
        save: '/db/save',
        load: '/db/load',
        settings: '/settings',
      },
      settings: {},
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
        setTimeout(() => this.$refs.name.focus(), 500);
      } else if (e === 'add') {
        this.saveData = {
          name: '', mqtt: '', id: this.generateUID(), icon: '',
        };
        setTimeout(() => this.$refs.name.focus(), 500);
      }
    },
    colors(value) {
      this.saveData.color = value.hex;
    },
  },

  mounted() {
    this.load();
    this.loadSVG();
  },
  methods: {
    load() {
      fetch(`${this.api.prefix}${this.api.load}`)
        .then((resp) => {
          if (!resp.ok) {
            throw new Error(`API HTTP status ${resp.status}`);
          }
          return resp.json();
        }).then((json) => {
          this.list = json;
        }).catch((err) => {
          this.$toast.error(String(err));
        });
      fetch(`${this.api.prefix}${this.api.settings}`)
        .then((resp) => resp.json()).then((json) => {
          this.settings = json;
          const root = document.getElementsByTagName('html')[0];
          if (this.settings.dark_theme) root.setAttribute('data-theme', 'dark');
        });
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
    loadSVG() {
      const self = this;
      fetch(`${this.hostname}/icons/sprite.svg?`)
        .then((resp) => {
          if (!resp.ok) {
            throw new Error(`API HTTP status ${resp.status}`);
          }
          return resp.text();
        })
        .then((data) => {
          const svg = document.getElementById('svg-sprite');
          svg.innerHTML = data;
          document.body.insertBefore(svg, document.body.childNodes[0]);
          const parser = (new DOMParser()).parseFromString(data, 'text/xml');
          const symbols = parser.getElementsByTagName('symbol');
          if (!symbols.length) {
            throw new Error('Cannot generate svg icons');
          }
          for (let i = 0; i < symbols.length; i += 1) {
            self.glyphs.push(symbols[i].getAttribute('id'));
          }
        }).catch((err) => {
          this.$toast.error(String(err));
        });
    },

    save() {
      if (this.mode === 'editor') {
        this.list[this.findObjIndex()] = ({
          id: this.saveData.id,
          name: this.saveData.name,
          mqtt: this.saveData.mqtt,
          icon: this.saveData.icon,
          color: this.saveData.color,
        });
      } else if (this.mode === 'add') {
        this.list.push(this.saveData);
      }

      fetch(`${this.api.prefix}${this.api.save}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(this.list),
      }).then((resp) => {
        if (!resp.ok) throw new Error(`API HTTP status ${resp.status}`);
      }).then(() => {
        this.$toast.success('Saved');
      }).catch((err) => {
        this.$toast.error(String(err));
      });
    },

    knobAction(id) {
      switch (this.mode) {
        case 'edit':
          this.saveData = this.list[this.findObjIndex(id)];
          this.mode = 'editor';
          break;
        case 'remove':
          this.list = this.list.filter((x) => x.id !== id);
          this.save();
          this.mode = 'normal';
          break;
        default:
          this.sendIR(id);
      }
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
      this.listeningMqtt = true;
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
          console.log(json.mqtt);
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
      const required = [this.saveData.name, this.saveData.mqtt, this.saveData.id];
      if (required.some((x) => x.trim() === '')) {
        this.$toast.error('Name, id and mqtt required');
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
      }
    },

    // Finds the correct index of an object
    // in array we want to modify
    findObjIndex(id) {
      const idToCompareWith = (id) || this.saveData.id;
      let index;
      for (let i = 0; i < this.list.length; i += 1) {
        if (this.list[i].id === idToCompareWith) {
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
      // Use hardcoded :6789 when in production mode
      // running 'npm run serve',
      if (process.env.NODE_ENV === 'production') {
        // Ingress needs :8099
        return `//${window.location.hostname}:8099`;
      }
      return '//localhost:8099';
    },
  },
};

</script>
