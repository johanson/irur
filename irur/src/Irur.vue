<template>
  <div id="app" tabindex="0" ref="app" :class="layout.mode">
    <div id="loader" v-if="layout.showLoader" />
    <svg-sprite
      @loaded="(layout.icons = $event), (layout.loading.svg = true)"
    />

    <prompt :params="prompt" @callback="promptCallback($event)" />

    <undo ref="undo" :db="db" @back="(db = $event), sync()" />

    <tabs
      ref="tabs"
      :db="db"
      :layout="layout"
      @switch-tab="layout.activeTab = $event"
      @switch-mode="switchMode($event)"
      @save="saveTab($event)"
      @remove="prompt = $event"
    />

    <remote
      ref="remote"
      :db="db"
      :layout="layout"
      :settings="settings"
      @switch-mode="switchMode($event)"
      @sort="sync('sort')"
      @remove="prompt = $event"
      @editor="showEditor($event)"
    />

    <editor
      ref="editor"
      :db="db"
      :layout="layout"
      :settings="settings"
      @switch-mode="switchMode($event)"
      @edit="editKnob($event)"
      @loading="layout.showLoader = $event"
    />
  </div>
</template>

<script>
import Helpers from './mixins/helpers';

export default {
  name: 'App',
  mixins: [Helpers],
  data() {
    return {
      layout: {
        mode: 'normal',
        showLoader: true,
        loading: {
          db: true,
          settings: true,
          svg: true,
        },
        showUndo: false,
        activeTab: 'default',
        icons: [],
      },
      settings: {
        api: {
          prefix: `${this.getHostname()}api/`,
          receive: 'ir/receive/',
          send: 'ir/send/',
          save: 'db/save/',
          load: 'db/load/',
          settings: 'settings/',
        },
        hostname: '',
        mqttTopics: [],
      },
      db: {
        default: {
          name: 'Default',
          knobs: [],
        },
      },
      prompt: {
        message: null,
        data: null,
        callback: null,
      },
    };
  },

  watch: {
    layout: {
      handler(val) {
        if (val.mode === 'normal') {
          window.addEventListener('keydown', this.keyDown);
        } else {
          window.removeEventListener('keydown', this.keyDown);
        }
        // Check if all initial loading flags are set and disable loading icon
        if (val.showLoader) {
          if (Object.keys(val.loading).every(k => val.loading[k])) {
            this.layout.showLoader = false;
          }
        }
      },
      deep: true,
    },
  },

  mounted() {
    this.loadTheme();
    this.loadDatabase();
    this.loadSettings();
  },

  methods: {
    loadTheme() {
      const getHomeAssistantCSSvar = prop => {
        const top = window.top.document.documentElement;
        return getComputedStyle(top).getPropertyValue(`--${prop}`);
      };

      const getCSSvar = arr => {
        let match = '';
        for (let i = 0; i < arr.length; i += 1) {
          if (getHomeAssistantCSSvar(arr[i]) !== '') {
            match = getHomeAssistantCSSvar(arr[i]);
            break;
          }
        }
        return match;
      };

      // Because HA is renaming it's css variables with breaking changes,
      // getCssVar() loops throught the array and returns the first match.
      const root = document.documentElement;
      root.style.setProperty(
        '--accent',
        getCSSvar(['primary-text-color', 'text-color'])
      );
      root.style.setProperty(
        '--background',
        getCSSvar(['primary-background-color', 'background-color'])
      );
      root.style.setProperty(
        '--background-shade',
        getCSSvar(['card-background-color'])
      );
    },

    loadDatabase() {
      const api = this.settings.api.prefix;
      fetch(`${api}${this.settings.api.load}`)
        .then(resp => {
          if (!resp.ok) {
            throw new Error(`API HTTP status ${resp.status}`);
          }
          return resp.json();
        })
        .then(json => {
          if (json.status === 'error') {
            this.db = this.scaffoldDB();
            this.sync();
          } else {
            this.db = json;
            this.layout.loading.db = false;
          }
        })
        .catch(err => {
          this.$toast.error(String(err));
        });
    },

    loadSettings() {
      const api = this.settings.api.prefix;
      fetch(`${api}${this.settings.api.settings}`)
        .then(resp => {
          if (!resp.ok) {
            throw new Error(`API HTTP status ${resp.status}`);
          }
          return resp.json();
        })
        .then(json => {
          this.settings.hostname = json.hostname;
          this.settings.mqttTopics = json.mqttTopics;
          this.layout.loading.settings = false;
        })
        .catch(err => {
          this.$toast.error(String(err));
        });
    },

    showEditor(o) {
      const { mode, id } = o;
      switch (mode) {
        case 'add':
          this.$refs.editor.add();
          break;
        case 'edit':
          this.$refs.editor.edit(id);
          break;
      }
    },

    switchMode(o) {
      this.layout.mode = o.mode;
      if (this.layout.mode === 'normal') this.loader = false;
    },

    sync(mode = 'normal') {
      const api = this.settings.api.prefix;
      fetch(`${api}${this.settings.api.save}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(this.db),
      })
        .then(resp => {
          this.layout.mode = mode;
          if (!resp.ok) throw new Error(`API HTTP status ${resp.status}`);
        })
        .catch(err => {
          this.$toast.error(String(err));
        });
    },

    editKnob(data) {
      const activeTabKnobs = this.db[this.layout.activeTab].knobs;
      if (this.layout.mode === 'edit') {
        const index = activeTabKnobs.findIndex(item => item.id === data.id);
        this.db[this.layout.activeTab].knobs[index] = data;
      } else if (this.layout.mode === 'add') {
        activeTabKnobs.push(data);
      }
      this.sync();
    },

    removeKnob(knobId) {
      const activeTabKnobs = this.db[this.layout.activeTab].knobs;
      const index = activeTabKnobs.findIndex(item => item.id === knobId);
      this.$refs.undo.record();
      this.$delete(activeTabKnobs, index);
      this.sync();
    },

    saveTab(o) {
      const { id, name } = o.data;
      if ({}.hasOwnProperty.call(this.db, id)) {
        this.db[id].name = name;
      } else {
        this.db = {
          // No match, create a new tab
          ...this.db,
          ...{
            [id]: {
              name,
              knobs: [],
            },
          },
        };
      }
      this.sync(o.mode);
    },

    removeTab(id) {
      if (id === this.layout.activeTab) {
        // Go back to default tab when deleting the active tab
        this.layout.activeTab = 'default';
      }
      this.$refs.undo.record();
      this.$delete(this.db, id);
      this.sync();
    },

    promptCallback(answer) {
      const { callback, data } = this.prompt;
      if (answer && callback) this[callback](data);
      Object.keys(this.prompt).forEach(key => {
        this.prompt[key] = undefined;
      });
    },

    keyDown(KeyboardEvent) {
      if (KeyboardEvent.key === 'N') {
        // Shift + n, new knob
        this.$refs.remote.addKnob();
      }
      if (KeyboardEvent.key === 'T') {
        // Shift + t, new tab
        this.$refs.tabs.addTab();
      }
    },
  },
};
</script>

<style lang="scss">
#loader {
  position: fixed;
  top: 8px;
  right: 8px;
  z-index: 101;
  background: rgba(0 0 0 / 0.8);
  width: 100vw;
  height: 100vh;
  margin: -10px -10px 0 0;

  &:after {
    content: '';
    top: 200px;
    right: calc(50% - 30px);
    position: absolute;
    width: 60px;
    height: 60px;
    background: url(~@/assets/loading.svg) no-repeat;
    background-size: 60px 60px;
    will-change: scroll-position;
    animation-name: spin;
    animation-duration: 1800ms;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    backface-visibility: hidden;
    transform: transale3d(0, 0, 0);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
      opacity: 0.4;
    }

    75% {
      opacity: 0.8;
    }

    100% {
      transform: rotate(360deg);
      opacity: 0.4;
    }
  }
}
</style>
