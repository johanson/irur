<template>
  <div class="editor-overlay" @click="closeModal($event)">
    <form
      action="#"
      id="form1"
      autocomplete="off"
      @submit="validate()"
      @keydown.esc="closeModal($event, (force = true))"
      :class="{ disabled: knobSaveData.isPlaceholder }"
    >
      <div class="close" @click="closeModal($event)">
        <svg><use xlink:href="#close"></use></svg>
      </div>

      <label for="knob_name">Name <span>Name for the knob</span></label>
      <input
        type="text"
        id="knob_name"
        ref="editorNameField"
        v-model="knobSaveData.name"
        required
      />

      <label for="knob_mqtt"
        >MQTT response
        <span>Tap listen and press a remote button towards IR receiver</span>
      </label>
      <div id="mqtt">
        <input
          type="text"
          id="knob_mqtt"
          v-model="knobSaveData.mqtt"
          required
        />
        <button type="button" @click.prevent="recordIR()">Listen</button>
      </div>

      <label for="knob_mqtt_topic"
        >MQTT topic
        <span>Add new topics from HA configuration</span>
      </label>
      <div id="knob_mqtt_topic">
        <p v-for="(item, index) in settings.mqttTopics" :key="index">
          <input
            type="radio"
            required
            :ref="`mqtt-checkbox-${index}`"
            :id="`mqtt-label-${index}`"
            :value="item"
            v-model="knobSaveData.mqttTopics"
          />
          <label :for="`mqtt-label-${index}`">{{ item }}</label>
        </p>
      </div>

      <label for="knob_id"
        >Unique id
        <span class="mono">
          $ curl {{ settings.hostname }}{{ settings.api.send
          }}{{ knobSaveData.id }}/
        </span>
      </label>
      <input
        type="text"
        id="knob_id"
        v-model="knobSaveData.id"
        required
        readonly
      />

      <label for="knob_icon"
        >Icon
        <span>If no icon is selected, the name is being used</span>
      </label>
      <input
        type="text"
        id="knob_icon"
        ref="icon"
        v-model="knobSaveData.icon"
      />
      <div id="glyphs">
        <div
          class="glyph"
          v-for="item in filteredIcons"
          v-html="renderIcon(item)"
          :key="item"
          :title="item"
          @click="
            knobSaveData.icon = item;
            $refs.icon.focus();
          "
        />
      </div>

      <label for="knob_color"
        >Color
        <span
          >Color for the icon. Leave blank for default that depends on the
          parent theme.</span
        >
      </label>
      <input type="text" id="knob_color" v-model="knobSaveData.color" />
      <slider-picker v-model="colors"></slider-picker>

      <div class="placeholder">
        <input
          type="checkbox"
          id="knob-type"
          ref="knobType"
          v-model="knobSaveData.isPlaceholder"
        />
        <label for="knob-type">Use as an empty placeholder</label>
      </div>

      <button form="form1" @click.prevent="validate()">Save</button>
    </form>
  </div>
</template>

<script>
import { Slider } from 'vue-color';
import Helpers from '../mixins/helpers';

export default {
  mixins: [Helpers],
  components: {
    'slider-picker': Slider,
  },
  props: {
    db: { type: Object, required: true },
    layout: { type: Object, required: true },
    settings: { type: Object, required: true },
  },

  watch: {
    colors(value) {
      this.knobSaveData.color = value.hex;
    },
  },

  data() {
    return {
      knobSaveData: {
        isPlaceholder: '',
        id: '',
        name: '',
        mqtt: '',
        mqttTopics: '',
        icon: '',
        color: this.cssVar('--accent'),
      },
      colors: { hex: this.cssVar('--accent') },
      icons: [],
    };
  },

  computed: {
    filteredIcons() {
      return this.layout.icons.filter(
        x => x.toLowerCase().indexOf(this.knobSaveData.icon.toLowerCase()) > -1
      );
    },
  },

  methods: {
    save() {
      this.$emit('edit', this.knobSaveData);
      this.$emit('switch-mode', { mode: 'normal' });
    },

    add() {
      this.$emit('switch-mode', { mode: 'add' });
      this.colors = { hex: this.cssVar('--accent') };
      this.knobSaveData = {
        isPlaceholder: false,
        id: this.genUID(),
        name: '',
        mqtt: '',
        icon: '',
        color: this.cssVar('--accent'),
        mqttTopics: this.settings.mqttTopics,
      };
      // Check the radio button for the first MQTT topic by default
      this.knobSaveData.mqttTopics = this.settings.mqttTopics[0];
      this.$nextTick().then(() => {
        this.$refs.editorNameField.focus();
      });
    },

    edit(id) {
      this.$emit('switch-mode', { mode: 'edit' });
      const activeTabKnobs = this.db[this.layout.activeTab].knobs;
      const index = activeTabKnobs.findIndex(item => item.id === id);
      this.knobSaveData = JSON.parse(JSON.stringify(activeTabKnobs[index]));
      if (this.knobSaveData.color === undefined) {
        this.knobSaveData.color = this.cssVar('--accent');
      }
      this.colors = { hex: this.knobSaveData.color };
      this.$nextTick().then(() => {
        this.$refs.editorNameField.focus();
      });
    },

    recordIR() {
      const self = this;
      this.$emit('loading', true);
      const mqttTimeout = 5;
      const controller = new AbortController();

      const mqttListeningTimeout = setTimeout(() => {
        controller.abort();
      }, mqttTimeout * 1000);

      function flip() {
        self.$emit('loading', false);
        clearTimeout(mqttListeningTimeout);
      }

      fetch(`${this.settings.api.prefix}${this.settings.api.receive}`, {
        signal: controller.signal,
      })
        .then(resp => {
          if (!resp.ok) {
            throw new Error(`API HTTP status ${resp.status}`);
          }
          return resp.json();
        })
        .then(json => {
          flip();
          self.knobSaveData.mqtt = json.mqtt;
          this.$toast.info('Ir code received');
        })
        .catch(err => {
          flip();
          if (err.name === 'AbortError') {
            this.$toast.info(
              `Stopped listening after ${mqttTimeout} seconds of no incoming messages`
            );
          } else {
            this.$toast.error(String(err));
          }
        });
    },

    validate() {
      const dat = this.knobSaveData;
      const required = [dat.name, dat.mqtt, dat.id, dat.mqttTopics];
      if (
        !dat.isPlaceholder &&
        required.some(x => x === '' || x === undefined)
      ) {
        this.$toast.error('Name, id, mqtt and topic required');
      } else {
        this.save();
        this.mode = 'normal';
      }
    },

    renderIcon(icon) {
      return `<svg class="icon" style="fill: ${this.knobSaveData.color}">
                <use xlink:href="#${icon}"></use>
              </svg>`;
    },

    closeModal(e, force = false) {
      const targetClassList = ['editor-overlay', 'close'];
      const inTargetClassList = targetClassList.some(c =>
        e.target.classList.contains(c)
      );
      if (inTargetClassList || force) {
        this.$emit('switch-mode', { mode: 'normal' });
      }
    },
  },
};
</script>

<style lang="scss">
.editor-overlay {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.15);
  top: 0;
  left: 0;
  min-height: 100vh;
  width: 100%;
  display: none;
  z-index: 100;
  justify-content: center;
  align-items: flex-start;

  .add &,
  .edit & {
    display: flex;
  }

  input[type='text'] {
    height: 40px;
    line-height: 38px;
    padding: 0 8px;
    width: 100%;
  }

  input,
  textarea {
    margin-bottom: 10px;
    border: solid #979797;
    border-width: 1px 0;
    background: #222;
    color: var(--accent);
    background-color: var(--background-shade);

    &:focus {
      border-color: #1976d2;
    }
  }

  button {
    min-width: 100px;
    font-weight: bold;
  }

  label {
    display: block;
    text-align: left;
    font-size: 15px;
    padding-left: 8px;
    padding-right: 3px;
    line-height: 1.4em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
    color: var(--accent);

    span {
      display: block;
      font-size: 12px;
      font-weight: normal;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  #form1 {
    margin: 25px;
    padding-top: 15px;
    padding-bottom: 10px;
    max-width: 700px;
    width: 90vw;
    text-align: right;
    position: relative;
    background: var(--background);

    .vc-slider {
      width: 100%;
      padding: 0 15px;
      margin-bottom: 20px;
    }
  }

  & .disabled {
    input[type='text'],
    #knob_mqtt_topic,
    #glyphs,
    .vc-slider,
    #mqtt button {
      opacity: 0.1;
      pointer-events: none;
    }
  }

  #glyphs {
    margin-bottom: 10px;
    border: solid #979797;
    border-width: 1px 0;
    padding: 5px;
    height: 225px;
    overflow: hidden;
    overflow-y: auto;
    text-align: center;
  }

  #mqtt {
    width: 100%;
    display: flex;
    align-items: self-start;

    input {
      border-right: none;
    }
  }

  #knob_mqtt_topic {
    border-top: 1px solid #979797;
    border-bottom: 1px solid #979797;
    border-left: none;
    border-right: none;
    line-height: 1em;
    padding-top: 10px;

    p {
      text-align: left;
      margin: 0;
      line-height: 1;
      padding-left: 10px;
    }

    label {
      display: inline-block;
      padding: 0 10px;
      line-height: 1em;
      font-weight: normal;
    }
  }

  .placeholder {
    display: block;
    text-align: left;
    border-top: 1px solid #979797;
    border-bottom: 1px solid #979797;
    border-left: none;
    border-right: none;
    line-height: 1em;
    padding-top: 10px;
    padding-left: 10px;
    margin-bottom: 10px;
    label {
      font-weight: normal;
      font-size: 1em;
      display: inline;
      padding-right: 5px;
    }
  }

  .glyph {
    width: 48px;
    height: 48px;
    display: inline-block;
    margin: 12px;
    text-align: center;
    vertical-align: top;
    cursor: pointer;

    svg.icon {
      width: 100%;
      height: 100%;
      fill: var(--accent);
    }
  }
}
</style>
