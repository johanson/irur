<template>
  <div id="app" tabindex="0" ref="app" :class="`mode-${layout.mode}`">
    <div id="loader" v-if="layout.showLoader" />

    <div id="overlay" />

    <svg-sprite
      @loaded="(layout.icons = $event), (layout.loading.svg = true)"
    />

    <prompt
      :params="prompt"
      @switch-mode="switchMode($event)"
      @callback="promptCallback($event)"
    />

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

    <settings
      :db="db"
      @switch-mode="switchMode($event)"
      @save="prompt = $event"
    />
  </div>
</template>

<script>
import Helpers from './mixins/helpers';
import SvgSprite from '@/components/SvgSprite.vue';
import Undo from '@/components/Undo.vue';
import Editor from '@/components/Editor.vue';
import Tabs from '@/components/Tabs.vue';
import Remote from '@/components/Remote.vue';
import Prompt from '@/components/Prompt.vue';
import Settings from '@/components/Settings.vue';
import '@/assets/app.scss';

export default {
  name: 'App',
  components: { SvgSprite, Undo, Editor, Tabs, Remote, Prompt, Settings },
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
          prefix: `${this.$_getHostname()}api/`,
          receive: 'ir/receive/',
          send: 'ir/send/',
          save: 'db/save/',
          load: 'db/load/',
          settings: 'settings/',
        },
        hostname: '',
        topic_send: [],
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
      const fetchDatabase = fetch(`${api}${this.settings.api.load}`);
      fetchDatabase
        .then(resp => {
          if (!resp.ok) {
            throw new Error(`API HTTP status ${resp.status}`);
          }
          return resp.json();
        })
        .then(json => {
          if (json.status === 'error') {
            this.db = this.$_scaffoldDB();
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
      const fetchSettings = fetch(`${api}${this.settings.api.settings}`);
      fetchSettings
        .then(resp => {
          if (!resp.ok) {
            throw new Error(`API HTTP status ${resp.status}`);
          }
          return resp.json();
        })
        .then(json => {
          this.settings.hostname = json.hostname;
          this.settings.topic_send = json.topic_send;
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
      const syncUpdates = fetch(`${api}${this.settings.api.save}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(this.db),
      });

      syncUpdates
        .then(resp => {
          this.layout.mode = mode;
          if (!resp.ok) throw new Error(`API HTTP status ${resp.status}`);
        })
        .catch(err => {
          this.$toast.error(String(err));
        });
    },

    editKnob(data) {
      const knobs = this.db[this.layout.activeTab].knobs;
      const i = knobs.findIndex(item => item.id === data.id);
      if (i == -1) {
        // No match found, create a new knob
        knobs.push(data);
      } else {
        knobs[i] = data;
      }

      this.sync('normal');
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

    saveDBManualEdit(e) {
      const data = JSON.parse(e);
      try {
        if ({}.hasOwnProperty.call(data, 'default')) {
          this.db = data;
          this.sync();
        } else {
          throw new Error(`Invalid json or missing 'default' property`);
        }
        this.$toast.success(`Changes saved successfully`);
      } catch (err) {
        this.$toast.error(`Cannot save the changes: ${err.message}`);
      }
    },

    resetDB() {
      this.db = this.$_scaffoldDB();
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
