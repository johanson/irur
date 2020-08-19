<template>
  <div id="app" tabindex="0" ref="app" :class="mode"
            @keydown.esc="mode = 'normal'; loader = false;">

    <svg-sprite @loaded="icons = $event; loader = false;" />

    <undo :is-visible="showUndo"
                  :db="data"
                @undo="data = $event; showUndo = false; save();"
               @timer="showUndo = false;"
                  ref="undo"/>

    <div id="loader" v-show="loader">
      <div class="icon" />
    </div>

    <editor :settings="settings" :api="api" :icon-list="icons" :mode="mode"
                  :if="mode === 'add' || mode === 'editor'" @switch-mode="mode = $event;" />

    <tabs :active-tab="activeTab"
          @switch-tab="activeTab = $event;"
            @save-tab="saveTab($event)"
          @remove-tab="removeTab($event)"
         @switch-mode="mode = $event;"
                :mode="mode"
                :data="data" />

    <remote :db="data" :mode="mode" :active-tab="activeTab"
          @switch-mode="mode = $event; loader = false;" @save-order="save()" />

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
      mode: 'normal',
      loader: true,
      activeTab: 'default',
      data: {
        default: {
          name: 'Default',
          knobs: [],
        },
      },
      icons: [],
      showUndo: false,
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
        // Set a root attribute based on HA settings
        // Beaware of type conversions!
        console.log(json.dark_theme);
        if (json.dark_theme.toLowerCase() === 'true') {
          const root = document.getElementsByTagName('html')[0];
          root.setAttribute('data-theme', 'dark');
        }
      }).catch((err) => {
        this.$toast.error(String(err));
      });
    },

    // saveKnob, saveTab, saveOrder?

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
