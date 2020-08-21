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

    <remote :db="db" :layout="layout" :options="options" @sort="sync()"
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
          receive: 'ir/receive',
          send: 'ir/send',
          save: 'db/save',
          load: 'db/load',
          settings: 'settings',
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
    this.loadDatabase();
    this.loadSettings();
  },

  methods: {
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
        // Set a root attribute based on HA settings
        // Beaware of type conversions!
        if (json.dark_theme.toLowerCase() === 'true') {
          const root = document.getElementsByTagName('html')[0];
          root.setAttribute('data-theme', 'dark');
        }
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

    sync() {
      const api = this.options.api.prefix;
      fetch(`${api}${this.options.api.save}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(this.db),
      }).then((resp) => {
        this.layout.mode = 'normal';
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
      this.layout.mode = 'normal';
      this.sync();
    },

    saveTab(tab) {
      if (tab.id && tab.name) {
        let exists;
        for (const prop in this.db) {
          if (prop === tab.id) {
            this.db[prop].name = tab.name;
            exists = true;
            break;
          }
        }
        // No match, create a new tab group
        if (!exists) {
          this.db = {
            ...this.db,
            ...{
              [tab.id]: {
                name: tab.name,
                knobs: [],
              },
            },
          };
        }
      }
      this.sync();
    },

    removeTab(id) {
      this.$refs.undo.record();
      this.$delete(this.db, id);
      this.layout.mode = 'normal';
      this.sync();
    },
  },
};

</script>
