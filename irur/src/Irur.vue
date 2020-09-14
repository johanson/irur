<template>
  <div id="app" tabindex="0" ref="app" :class="layout.mode">

    <svg-sprite @loaded="layout.icons = $event; layout.showLoader = false" />

    <undo ref="undo" :db="db" v-show="layout.showUndo"
          @undo="db = $event; sync()" @show="layout.showUndo = true"
          @timer="layout.showUndo = false" @click.native="layout.showUndo = false"/>

    <div id="loader" v-show="layout.showLoader">
      <div class="icon" />
    </div>

    <editor :db="db" :layout="layout" :options="options"
            @switch-mode="switchMode($event)" @edit="editKnob($event)"
            @loading="layout.showLoader = $event" />

    <tabs :db="db" :layout="layout"
          @switch-tab="layout.activeTab = $event" @switch-mode="switchMode($event)"
          @save="saveTab($event)" @remove="removeTab($event)"/>

    <remote :db="db" :layout="layout" :options="options" @sort="sync('sort')"
            @remove="removeKnob()" @switch-mode="switchMode($event)" />

  </div>
</template>

<script>
import SvgSprite from './components/SvgSprite.vue';
import Undo from './components/Undo.vue';
import Editor from './components/Editor.vue';
import Tabs from './components/Tabs.vue';
import Remote from './components/Remote.vue';
import Helpers from './mixins/helpers';
import './assets/app.scss';

export default {
  name: 'App',
  mixins: [Helpers],
  components: {
    SvgSprite,
    Undo,
    Editor,
    Tabs,
    Remote,
  },

  data() {
    return {
      layout: {
        mode: 'normal',
        showLoader: true,
        showUndo: false,
        activeTab: 'default',
        activeEdit: {},
        icons: [],
      },
      options: {
        api: {
          prefix: `${this.getHostname()}api/`,
          receive: 'ir/receive/',
          send: 'ir/send/',
          save: 'db/save/',
          load: 'db/load/',
          settings: 'settings/',
        },
        settings: {
          topic_send: '',
        },
      },
      db: {
        default: {
          name: 'Default',
          knobs: [],
        },
      },
    };
  },

  mounted() {
    this.loadTheme();
    this.loadDatabase();
    this.loadSettings();
  },

  methods: {
    loadTheme() {
      const getHomeAssistantCSSvar = (prop) => {
        const top = window.top.document.documentElement;
        return getComputedStyle(top).getPropertyValue(`--${prop}`);
      };

      const getCSSvar = (arr) => {
        let match = '';
        for (let i = 0; i < arr.length; i += 1) {
          if (getHomeAssistantCSSvar(arr[i]) !== '') {
            match = getHomeAssistantCSSvar(arr[i]);
            break;
          }
        }
        return match;
      };

      // Because HA is renaming it's css variables with breaking changes, getCssVar() loops
      // throught the array and returns the first match
      const root = document.documentElement;
      root.style.setProperty('--accent', getCSSvar(['primary-text-color', 'text-color']));
      root.style.setProperty('--background', getCSSvar(['primary-background-color', 'background-color']));
      root.style.setProperty('--background-shade', getCSSvar(['card-background-color']));
    },

    loadDatabase() {
      const api = this.options.api.prefix;
      fetch(`${api}${this.options.api.load}`).then((resp) => {
        if (!resp.ok) {
          throw new Error(`API HTTP status ${resp.status}`);
        }
        return resp.json();
      }).then((json) => {
        if (json.status === 'error') {
          this.db = this.scaffoldDB();
          this.sync();
        } else {
          this.db = json;
        }
      }).catch((err) => {
        this.$toast.error(String(err));
      });
    },

    loadSettings() {
      const api = this.options.api.prefix;
      fetch(`${api}${this.options.api.settings}`).then((resp) => {
        if (!resp.ok) {
          throw new Error(`API HTTP status ${resp.status}`);
        }
        return resp.json();
      }).then((json) => {
        this.options.settings = json;
      }).catch((err) => {
        this.$toast.error(String(err));
      });
    },

    switchMode(o) {
      const { mode, id, index } = o;
      this.layout.mode = mode;
      this.layout.activeEdit = { id, index };
      if (this.layout.mode === 'normal') this.loader = false;
    },

    sync(mode = 'normal') {
      const api = this.options.api.prefix;
      fetch(`${api}${this.options.api.save}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(this.db),
      }).then((resp) => {
        this.layout.mode = mode;
        if (!resp.ok) throw new Error(`API HTTP status ${resp.status}`);
      }).catch((err) => {
        this.$toast.error(String(err));
      });
    },

    editKnob(data) {
      if (this.layout.mode === 'edit') {
        this.db[this.layout.activeTab].knobs[this.layout.activeEdit.index] = data;
      } else if (this.layout.mode === 'add') {
        this.db[this.layout.activeTab].knobs.push(data);
      }
      this.sync();
    },

    removeKnob() {
      this.$refs.undo.record();
      const { index } = this.layout.activeEdit;
      this.$delete(this.db[this.layout.activeTab].knobs, index);
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
      this.$refs.undo.record();
      this.$delete(this.db, id);
      this.sync();
    },
  },
};

</script>
