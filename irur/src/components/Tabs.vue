<template>
  <div id="tabs">
    <vue-context ref="menu">
      <template slot-scope="child">
        <li><a href="#" data-name="add" @click.prevent="menu($event, child.data)">Add</a></li>
        <li><a href="#" data-name="rename" @click.prevent="menu($event, child.data)">Rename</a></li>
        <li><a href="#" data-name="remove" @click.prevent="menu($event, child.data)"
               v-if="child.data !== 'default'" >Remove</a></li>
      </template>
    </vue-context>

    <div class="tab" v-for="(i, key) in data"
      @contextmenu.prevent="$refs.menu.open($event, key)"
                    @click="switchTab(key)"
                  :data-id="key"
                      :key="key"
                    :class="{ active: activeTab === key }">
      <input type="text" v-if="mode === 'tab-rename' && activeTab === key"
                 @keyup.enter="$event.target.blur();"
                      v-model="tabRename.name"
                         :ref="(`input-${key}`)"
                       @focus="tabRename.name = i.name"
                        @blur="save-tab()">
      <span v-else>
        {{i.name}}
      </span>
    </div>
  </div>
</template>

<script>
import { VueContext } from 'vue-context';
import Helpers from '../mixins/helpers';

export default {
  mixins: [Helpers],
  components: {
    VueContext,
  },
  props: {
    activeTab: { type: String, required: true },
    data: { type: Object, required: true },
    mode: { type: String, required: true },
  },
  data() {
    return {
      tabRename: {
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
      this.$emit('save-tab', this.tabRename);
      this.$emit('switch-mode', 'normal');
    },

    menu(e, id) {
      switch (e.target.dataset.name) {
        case 'add': {
          const uid = this.genUID();
          this.tabRename = {
            name: 'New',
            id: uid,
          };
          this.$emit('save-tab', this.tabRename);
          this.$emit('switch-tab', uid);
          this.$emit('switch-mode', 'tab-rename');
          setTimeout(() => this.$refs[`input-${uid}`][0].focus(), 50);
          break;
        }
        case 'rename':
          this.$emit('switch-tab', id);
          this.$emit('switch-mode', 'tab-rename');
          this.tabRename.id = id;
          setTimeout(() => this.$refs[`input-${id}`][0].focus(), 50);
          break;
        case 'remove':
          if (id === this.activeTab) {
            // Go back to default tab if deleting the active tab
            this.$emit('switch-tab', 'default');
          }
          this.$emit('remove-tab', id);
      }
    },
  },
};
</script>

<style scoped lang="scss">

#tabs {
  border-bottom: 1px solid var(--text);
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
      border-color: var(--text);
      border-bottom-color: var(--background);
      cursor: default;
      opacity: 1;
    }

    input {
      background-color: var(--background);
      color: var(--text);
      font-size: 16px;
      border: 0px;
      height: 42px;
      display: block;
      width: 125px;
    }
  }
}
</style>
