<template>
  <div class="editor-overlay" @click="closeModal($event)">
    <form
      action="#"
      id="form1"
      autocomplete="off"
      @submit="validate()"
      @keydown.esc="closeModal(true)"
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
        <p v-for="(item, index) in settings.topic_send" :key="index">
          <input
            type="radio"
            required
            :ref="`mqtt-checkbox-${index}`"
            :id="`mqtt-label-${index}`"
            :value="item"
            v-model="knobSaveData.topic_send"
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

      <label for="color-picker"
        >Color
        <span
          >Colorpicker for the icon. Leave blank for default that depends on the
          parent theme.</span
        >
      </label>
      <div class="color-picker clearfix">
        <input type="color" value="#000000" v-model="colorPicker" />
        <input
          id="color-picker"
          type="text"
          class="color-picker-value"
          maxlength="7"
          v-model="knobSaveData.color"
          @keyup="syncColorPicker()"
        />
      </div>

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
import Helpers from '@/mixins/helpers';
import _ from 'lodash';

export default {
  mixins: [Helpers],
  components: {},
  props: {
    db: { type: Object, required: true },
    layout: { type: Object, required: true },
    settings: { type: Object, required: true },
  },

  data() {
    return {
      knobSaveData: {
        isPlaceholder: '',
        id: '',
        name: '',
        mqtt: '',
        topic_send: '',
        icon: '',
        color: '',
      },
      icons: [],
      colorPicker: '#ffffff',
    };
  },

  computed: {
    filteredIcons() {
      return this.layout.icons.filter(
        (x) =>
          x.toLowerCase().indexOf(this.knobSaveData.icon.toLowerCase()) > -1
      );
    },
  },

  watch: {
    colorPicker: _.throttle(function (hex) {
      this.knobSaveData.color = hex;
    }, 400),
  },

  methods: {
    save() {
      this.$emit('edit', this.knobSaveData);
    },

    add() {
      this.$emit('switch-mode', { mode: 'add' });
      this.colorPicker = '';
      this.knobSaveData = {
        isPlaceholder: false,
        id: this.$_genUID(),
        name: '',
        mqtt: '',
        icon: '',
        color: '',
        topic_send: this.settings.topic_send[0],
      };
      this.$nextTick().then(() => {
        this.$refs.editorNameField.focus();
      });
    },

    edit(id) {
      this.$emit('switch-mode', { mode: 'edit' });
      const activeTabKnobs = this.db[this.layout.activeTab].knobs;
      const index = activeTabKnobs.findIndex((item) => item.id === id);
      this.knobSaveData = JSON.parse(JSON.stringify(activeTabKnobs[index]));
      this.colorPicker = this.knobSaveData.color;
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
        .then((resp) => {
          if (!resp.ok) {
            throw new Error(`API HTTP status ${resp.status}`);
          }
          return resp.json();
        })
        .then((json) => {
          flip();
          self.knobSaveData.mqtt = json.irCode;
          this.$toast.info('Ir code received');
        })
        .catch((err) => {
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
      const required = [dat.name, dat.mqtt, dat.id, dat.topic_send];
      this.knobSaveData.color = this.convertHex(dat.color);
      if (
        !dat.isPlaceholder &&
        required.some((x) => x === '' || x === undefined)
      ) {
        this.$toast.error('Name, id, mqtt and topic required');
      } else {
        this.save();
      }
    },

    renderIcon(icon) {
      return `<svg class="icon" style="fill: ${this.knobSaveData.color}">
                <use xlink:href="#${icon}"></use>
              </svg>`;
    },

    syncColorPicker() {
      const hex = this.knobSaveData.color;
      if (hex.startsWith('#') && hex.length === 7) {
        this.colorPicker = hex;
      }
    },

    convertHex(hex) {
      if (hex.startsWith('#') && hex.length === 4) {
        hex = hex
          .substring(1)
          .split('')
          .map(function (h) {
            return h + h;
          })
          .join('');
        return `#${hex}`;
      }
      return hex;
    },

    closeModal(e) {
      let inTargetClassList = false;
      const targetClassList = ['editor-overlay', 'close'];

      if (typeof e === 'boolean') {
        // Force close
        inTargetClassList = true;
      } else {
        inTargetClassList = targetClassList.some((c) =>
          e.target.classList.contains(c)
        );
      }

      if (inTargetClassList) {
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

  .color-picker {
    white-space: nowrap;
    overflow: hidden;
    background-color: var(--background-shade);
    margin-bottom: 10px;
    input[type='color'] {
      border: none;
      border-bottom: 1px solid #979797;
      border-top: 1px solid #979797;
      height: 40px;
      width: 38px;
      padding-left: 2px;
      margin-bottom: 0;
      float: left;
      max-width: 100px;
    }
    .color-picker-value {
      width: calc(100% - 38px);
      margin-bottom: 0;
    }
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
    input[type='color'] #knob_mqtt_topic,
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
