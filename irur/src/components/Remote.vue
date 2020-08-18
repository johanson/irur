<template>
  <div id="remote">
    <vue-context ref="menu">
      <template slot-scope="child">
        <li><a href="#" data-id="add" @click.prevent="menu($event, child.data)">Add</a></li>
        <li><a href="#" data-id="edit" @click.prevent="menu($event, child.data)">Edit</a></li>
        <li><a href="#" data-id="sort" @click.prevent="menu($event, child.data)">Sort</a></li>
        <li><a href="#" data-id="remove" @click.prevent="menu($event, child.data)">Remove</a></li>
      </template>
    </vue-context>

    <draggable id="remote" v-model="filteredData"
        draggable=".item" @change="$emit('save-order');"
        :disabled="(this.mode == 'sort') ? false : true">

      <div class="item-add" slot="footer" draggable="false"
        v-on:click="$emit('change-mode', 'add');">

        <div class="glyph">
          <svg class="icon">
            <use xlink:href="#add"></use>
          </svg>
        </div>
      </div>

      <div class="item" @contextmenu.prevent="$refs.menu.open($event, el.id)"
            :key="el.id"
          :title="el.name"
      v-on:click="sendIR(el.id);"
          v-for="el in filteredData">

      <div v-if="el.icon" class="glyph">
        <svg class="icon" :style="(`fill: ${el.color};`)">
          <use :xlink:href="(`#${el.icon}`)"></use>
        </svg>
      </div>

      <div v-else :class="(`no-icon len-${el.name.length}`)"
                  :style="(`style: ${el.color};`)">
        {{ el.name }}
      </div>

    </div>
  </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { VueContext } from 'vue-context';

export default {
  components: {
    draggable,
    VueContext,
  },

  props: {
    db: { type: Object, required: true },
    activeTab: { type: String, required: true },
    mode: { type: String, required: true },
  },

  data() {
    return {
      data: {
        default: {
          name: 'Default',
          knobs: [],
        },
      },
    };
  },

  computed: {
    filteredData: {
      get() {
        return this.data[this.activeTab].knobs;
      },
      set(val) {
        this.data[this.activeTab].knobs = val;
      },
    },
  },

  mounted() {
  },

  watch: {
    db() {
      this.data = this.db;
    },
  },

  methods: {
    menu(e, id) {
      const type = e.target.dataset.id;
      if (type === 'add') {
        this.$emit('change-mode', 'add');
      }
      if (type === 'edit') {
        // this.saveData = this.filteredData[this.findObjIndex(id)];
        console.log(id);
        this.$emit('change-mode', 'editor');
      }
      if (type === 'sort') {
        this.$emit('change-mode', 'sort');
      }
      if (type === 'remove') {
        // this.$refs.undo.record();
        // this.showUndo = true;
        // this.filteredData = this.filteredData.filter((x) => x.id !== id);
        // this.save();
      }
    },
    save() {
      console.log('save!');
    },
  },
};
</script>

<style scoped lang="scss">

</style>
