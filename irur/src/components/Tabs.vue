<template>
  <div>
    <vue-context ref="tabMenu">
      <template slot-scope="child">
        <li><a href="#" data-id="add"
                  @click.prevent="tabContextMenu($event, child.data)">Add</a>
        </li>
        <li><a href="#" data-id="rename"
                  @click.prevent="tabContextMenu($event, child.data)">Rename</a>
        </li>
        <li><a href="#" data-id="remove" :class="child.data"
                  @click.prevent="tabContextMenu($event, child.data)">Remove</a>
        </li>
      </template>
    </vue-context>

    <div id="tabs">
      <div class="tab" v-for="(item, key) in data"
        @contextmenu.prevent="$refs.tabMenu.open($event, key)"
                      :class="{ active: activeTab === key }"
                    :data-id="key"
                        :key="key"
                  v-on:click="activeTab = key">
        <input type="text" v-model.trim="item.name"
                      v-if="mode === 'tab-rename' && activeTab === key"
                :id="'menu-item-' + key"
    v-on:keyup.enter="saveTab"
              @blur="(item.name === '') ? item.name = 'New' : item.name = item.name;
              saveTab();">
        <span v-else>
          {{item.name}}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { VueContext } from 'vue-context';

export default {
  components: {
    VueContext,
  },
  props: {
    db: {
      type: Object,
      required: true,
    },
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      is_visible: this.isVisible,
      db_history: {},
    };
  },
  watch: {
    isVisible() {
      this.is_visible = this.isVisible;
      this.timer();
    },
  },
  mounted() {},
  methods: {},
};
</script>

<style scoped lang="scss">

</style>
