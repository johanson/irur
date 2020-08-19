<template>
  <div id="add-overlay" @click="closeModal" @keydown.ctrl.shift.83="submitForm">

    <form action="#" id="form1" autocomplete="off">
      <div id="close" @click="closeModal" />

      <label for="knob_name">Name <span>Name for your knob</span></label>
      <input type="text" id="knob_name" ref="editorNameField" required v-model="saveData.name">

      <label for="knob_mqtt">MQTT response
        <span>If no icon is selected, the name will be used</span>
      </label>
      <div id="mqtt">
        <input type="text" id="knob_mqtt" required
            v-model="saveData.mqtt">
        <button :disabled="listeningMqtt"
        @click.prevent="receiveIR">Listen</button>
      </div>

      <label for="knob_mqtt_topic">MQTT topic
        <span>Add new topics from HA configuration</span>
      </label>
      <div id="knob_mqtt_topic">
        <p v-for="(item, index) in settings.topic_send" :key="index">
          <input type="radio" required
                 :ref="(`mqtt-checkbox-${index}`)"
                  :id="(`mqtt-label-${index}`)"
               :value="item"
              v-model="saveData.topic_send">
          <label :for="(`mqtt-label-${index}`)">{{ item }}</label>
        </p>
      </div>

      <label for="knob_id">Unique id
        <span class="mono">$ curl {{settings.hostname}}{{api.send}}/{{saveData.id}}</span>
      </label>
      <input type="text" id="knob_id" required readonly v-model="saveData.id">

      <label for="knob_icon">Icon
        <span>If no icon is selected, the name is being used</span>
      </label>
      <input type="text" id="knob_icon" v-model="saveData.icon">

      <div id="glyphs">
        <div class="glyph"
              v-for="item in filteredIcons"
               :key="item"
         :data-name="item"
             :title="item"
         @click="saveData.icon = item;"
             v-html="renderGlyph(item)" />
      </div>

      <label for="knob_color">Color
        <span>Color for the icon. Leave blank for default that depends on the parent theme.</span>
      </label>
      <input type="text" id="knob_color" v-model="saveData.color">
      <slider-picker v-model="colors"></slider-picker>

      <button form="form1" @click.prevent="submitForm">Save</button>

      <p class="keybinds">
        <strong>Control+Shift+S</strong> to save,
        <strong>Esc</strong> to close
      </p>
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
    iconList: { type: Array, required: true },
    settings: { type: Object, required: true },
    api: { type: Object, required: true },
    mode: { type: String, required: true },
  },

  data() {
    return {
      saveData: {
        id: '',
        name: '',
        mqtt: '',
        topic_send: '',
        icon: '',
        color: this.cssVar('--text'),
      },
      colors: { hex: this.cssVar('--text') },
      listeningMqtt: false,
      icons: [],
    };
  },

  watch: {
    iconList() {
      this.icons = this.iconList;
    },

    mode(e) {
      switch (e) {
        case 'add':
          this.colors = { hex: this.cssVar('--text') };
          this.saveData = {
            name: '',
            mqtt: '',
            id: this.genUID(),
            icon: '',
            color: this.cssVar('--text'),
            topic_send: this.saveData.topic_send,
          };
          // Check the radio button for the first MQTT topic if there's only one
          if (this.settings.topic_send.length === 1) {
            [this.saveData.topic_send] = this.settings.topic_send;
          }
          setTimeout(() => this.$refs.editorNameField.focus(), 50);
          break;
        case 'editor':
          // Check the radio button for the first MQTT topic if there's only one
          if (this.settings.topic_send.length === 1) {
            [this.saveData.topic_send] = this.settings.topic_send;
          }
          this.colors = { hex: this.saveData.color };
          setTimeout(() => this.$refs.editorNameField.focus(), 50);
          break;
      }
    },
  },
  computed: {
    filteredIcons() {
      return this.icons.filter((x) => x.toLowerCase()
        .indexOf(this.saveData.icon.toLowerCase()) > -1);
    },
  },
  mounted() {

  },
  methods: {
    receiveIr() {
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

    renderGlyph(icon) {
      return `<svg class="icon" style="fill: ${this.cssVar('--text')}">
                <use xlink:href="#${icon}"></use>
              </svg>`;
    },

    closeModal(e) {
      if (['add-overlay', 'close'].includes(e.target.id)) {
        this.$emit('switch-mode', 'normal');
      }
    },
  },
};
</script>

<style lang="scss">
#add-overlay {
  position: absolute;
  background-color: var(--background-overlay);
  top: 0;
  left: 0;
  min-height: 100vh;
  width: 100%;
  display: none;
  z-index: 100;
  justify-content: center;
  align-items: flex-start;

  .add &,
  .editor & {
    display: flex;
  }

  button {
    display: inline-block;
    color: #f8f8f8;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.3s ease 0s;
    background-color: #1976d2;
    padding: 1px 6px;
    line-height: 40px;
    height: 40px;
    overflow: hidden;
    border: none;
    font-size: 16px;
    font-family: Arial, Helvetica, sans-serif;
    text-shadow: 0px 0px 1px #000;
  }

  button:hover,
  button:active {
    background: #1565c0;
  }

  button:disabled,
  button.disabled {
    cursor: not-allowed;
    opacity: 0.75;
  }

  input[type="text"] {
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
    color: var(--text);
    background-color: var(--input-background);

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
    color: var(--text);

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

  #close {
    font-size: 20px;
    line-height: 35px;
    height: 35px;
    width: 35px;
    text-indent: 2px;
    font-weight: bold;
    z-index: 101;
    position: absolute;
    top: 0px;
    right: 0px;
    color: #fff;
    background-color: #ff7c7c;
    text-align: center;
    cursor: pointer;

    &:before {
      content: '❌';
    }
  }

  .keybinds {
    text-align: left;
    margin: 0;
    padding: 10px 0px 0px 10px;
    display: none;

    @media screen and (min-width: 768px) {
      display: block;
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
      fill: var(--text);
    }
  }
}
</style>
