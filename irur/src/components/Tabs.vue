<template>
  <div id="tabs">
    <vue-context ref="menu">
      <template slot-scope="child">
        <li><a data-name="add" @click.prevent="menu($event, child.data)">Add</a></li>
        <li><a data-name="rename" @click.prevent="menu($event, child.data)">Rename</a></li>
        <li><a data-name="remove" @click.prevent="menu($event, child.data)"
               v-if="child.data !== 'default'" >Remove</a></li>
      </template>
    </vue-context>

    <div class="tab" v-for="(item, key) in db" @contextmenu.prevent="$refs.menu.open($event, key)"
         :key="key" :data-id="key" @click="switchTab(key)"
         :class="{ active: layout.activeTab === key }" >
      <input type="text" v-if="layout.mode === 'tab-rename' && layout.activeTab === key"
             v-model="tabSaveData.name" :ref="(`tab-${key}`)" @blur="saveTab()"
             @focus="tabSaveData.name = item.name" @keyup.enter="$event.target.blur()">
      <span v-else>
        {{item.name}}
      </span>
    </div>
  </div>
</template>

<script>
import VueContext from 'vue-context';
import Helpers from '../mixins/helpers';

export default {
  mixins: [Helpers],
  components: {
    VueContext,
  },
  props: {
    db: { type: Object, required: true },
    layout: { type: Object, required: true },
  },

  data() {
    return {
      tabSaveData: {
        id: '',
        name: '',
      },
    };
  },

  methods: {
    switchTab(id) {
      this.$emit('switch-tab', id);
    },

    saveTab() {
      this.$emit('save', { data: this.tabSaveData });
      this.$emit('switch-mode', { mode: 'normal' });
    },

    addTab() {
      const uid = this.genUID();
      this.tabSaveData = {
        name: 'New',
        id: uid,
      };
      this.$emit('save', { data: this.tabSaveData, mode: 'tab-rename' });
      this.renameTab(uid);
    },

    renameTab(id) {
      this.tabSaveData.id = id;
      this.$emit('switch-tab', id);
      this.$emit('switch-mode', { mode: 'tab-rename' });
      this.$nextTick().then(() => {
        this.$refs[`tab-${id}`][0].focus();
      });
    },

    removeTab(id) {
      if (id === this.layout.activeTab) {
        // Go back to default tab if deleting the active tab
        this.$emit('switch-tab', 'default');
      }
      this.$emit('remove', id);
    },

    menu(e, id) {
      switch (e.target.dataset.name) {
        case 'add':
          this.addTab();
          break;
        case 'rename':
          this.renameTab(id);
          break;
        case 'remove':
          this.removeTab(id);
          break;
      }
    },
  },
};
</script>

<style lang="scss">
#tabs {
  border-bottom: 1px solid var(--accent);
  user-select: none;
  padding-left: 10px;
  white-space: nowrap;
  .tab {
    display: inline-block;
    position: relative;
    bottom: -4px;
    padding: 0px 10px;
    line-height: 44px;
    height: 44px;
    cursor: pointer;
    opacity: 0.5;
    min-width: 50px;
    overflow: hidden;

    span {
      max-width: 125px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
    }

    &.active {
      border-width: 1px;
      border-style: solid;
      border-color: var(--accent);
      border-bottom-color: var(--background);
      cursor: default;
      opacity: 1;
    }

    input {
      background-color: var(--background);
      color: var(--accent);
      font-size: 16px;
      border: 0px;
      height: 42px;
      display: block;
      width: 125px;
    }
  }
}
</style>
