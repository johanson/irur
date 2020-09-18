<template>
  <div>
    <vue-context ref="menu">
      <template slot-scope="child">
        <li><a href="#" data-id="add" @click.prevent="menu($event, child.data)">Add</a></li>
        <li><a href="#" data-id="edit" @click.prevent="menu($event, child.data)">Edit</a></li>
        <li><a href="#" data-id="sort" @click.prevent="menu($event, child.data)">Sort</a></li>
        <li><a href="#" data-id="remove" @click.prevent="menu($event, child.data)">Remove</a></li>
      </template>
    </vue-context>

  <draggable id="remote" v-model="filteredDB" draggable=".item" @change="$emit('sort')"
             :disabled="(this.layout.mode == 'sort') ? false : true">

      <div class="add" slot="footer" draggable="false"
          @click="$emit('switch-mode', { mode: 'add' })">
        <div class="glyph">
          <svg class="icon">
            <use xlink:href="#add"></use>
          </svg>
        </div>
      </div>

      <div v-for="(el, index) in filteredDB" :key="el.id"
           :title="!el.isPlaceholder ? el.name : false" @click="sendIr(el.id, el.isPlaceholder);"
           @contextmenu.prevent="$refs.menu.open($event, {id: el.id, index})"
           class="item" :data-placeholder="el.isPlaceholder || false">

        <div v-if="el.icon" class="glyph">
          <svg class="icon" :style="(`fill: ${el.color};`)">
            <use :xlink:href="(`#${el.icon}`)"></use>
          </svg>
        </div>

        <div v-else :class="(`no-icon len-${el.name.length}`)" :style="(`style: ${el.color};`)">
          {{ el.name }}
        </div>
      </div>
  </draggable>

  </div>
</template>

<script>
import draggable from 'vuedraggable';
import VueContext from 'vue-context';

export default {
  components: {
    draggable,
    VueContext,
  },
  props: {
    db: { type: Object, required: true },
    layout: { type: Object, required: true },
    options: { type: Object, required: true },
  },

  watch: {
    db() {
      this.data = this.db;
    },
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
    filteredDB: {
      get() {
        return this.data[this.layout.activeTab].knobs;
      },
      set(val) {
        this.data[this.layout.activeTab].knobs = val;
      },
    },
  },

  methods: {
    menu(e, knob) {
      const mode = e.target.dataset.id;
      this.$emit('switch-mode', { mode, id: knob.id, index: knob.index });
      if (mode === 'remove') {
        const { name, isPlaceholder } = this.data[this.layout.activeTab].knobs[knob.index];
        let removeName = name;
        if (isPlaceholder) removeName = 'placeholder';
        this.$emit('remove', removeName);
      }
    },

    sendIr(id, confirm) {
      if (!confirm || confirm === undefined) {
        const api = this.options.api.prefix;
        fetch(`${api}${this.options.api.send}${id}/`)
          .then((resp) => {
            if (!resp.ok) throw new Error(`API HTTP status ${resp.status}`);
          }).then(() => {
            this.loader = false;
          }).catch((err) => {
            this.$toast.error(String(err));
            this.loader = false;
          });
      }
    },
  },
};
</script>

<style lang="scss">
#remote {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin: auto;
  overflow-y: auto;
  min-height: 70px;
  user-select: none;

  .sortable-chosen {
    opacity: 0.2;
    background: rgba(0, 0, 0, 0.5);
  }

  .glyph {
    display: block;
    position: absolute;
    text-align: center;
    cursor: pointer;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    right: 0;
    bottom: 0;
    padding: 20px;
    pointer-events: none;

    svg.icon {
      width: 100%;
      height: 100%;
      pointer-events: none;
      fill: var(--accent);
    }
  }

  .item, .add {
    display: flex;
    padding: 16px;
    max-width: 25%;
    flex-basis: 100%;
    text-align: center;
    flex-direction: column;
    cursor: pointer;
    overflow: hidden;
    position: relative;

    &::before {
      content: "";
      padding-top: 100%;
    }

    &:hover,
    &:focus {
      background-color: rgba(0, 0, 0, 0.02);
      transition: background-color 0.5s;
    }
    &[data-placeholder="true"] {
      &:hover {
        background-color: initial;
        cursor: default;
      }
      * {
        display: none;
      }
    }
    .no-icon {
      font-size: 7vw;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      right: 0;
      bottom: 0;
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    @media screen and (min-width: 1200px) {
      .no-icon {
        font-size: 80px;
      }
    }
  }

  .add {
    &:hover {
      background: none;
    }

    .glyph svg {
      fill: var(--accent);
      width: 50%;
      height: 50%;
      transform: translateX(0%) translateY(50%);
      opacity: 0.1;
      pointer-events: initial;
      transition: opacity 0.5s ease-in-out;

      &:hover {
        opacity: 0.8;
        transition: opacity 0.5s ease-in-out;
      }

      use {
        pointer-events: none;
      }
    }
  }

  .sort & .item {
    cursor: move!important;
  }

}
</style>
