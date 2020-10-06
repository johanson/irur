<template>
  <div>
    <vue-context ref="menu">
      <template slot-scope="c">
        <li>
          <a href="#" data-id="add" @click.prevent="menu($event, c.data)"
            >Add</a
          >
        </li>
        <li>
          <a href="#" data-id="edit" @click.prevent="menu($event, c.data)"
            >Edit</a
          >
        </li>
        <li>
          <a href="#" data-id="sort" @click.prevent="menu($event, c.data)"
            >Sort</a
          >
        </li>
        <li>
          <a href="#" data-id="remove" @click.prevent="menu($event, c.data)"
            >Remove</a
          >
        </li>
      </template>
    </vue-context>

    <draggable
      id="remote"
      v-model="filteredDB"
      draggable=".knob"
      @change="$emit('sort')"
      :disabled="this.layout.mode == 'sort' ? false : true"
    >
      <div
        class="knob add-item"
        slot="footer"
        draggable="false"
        @click="addKnob()"
      >
        <div class="glyph">
          <svg><use xlink:href="#add"></use></svg>
        </div>
      </div>

      <div
        v-for="(el, index) in filteredDB"
        :key="el.id"
        :title="!el.isPlaceholder ? el.name : false"
        @click="sendIr(el.id, el.isPlaceholder)"
        @contextmenu.prevent="
          $refs.menu.open($event, {
            id: el.id,
            name: el.name || 'placeholder',
            index,
          })
        "
        class="knob"
        :data-placeholder="el.isPlaceholder || false"
      >
        <div v-if="el.icon" class="glyph">
          <svg :style="`fill: ${el.color};`">
            <use :xlink:href="`#${el.icon}`"></use>
          </svg>
        </div>

        <div
          v-else
          :class="`no-icon len-${el.name.length}`"
          :style="`color: ${el.color};`"
        >
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
    settings: { type: Object, required: true },
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
      switch (mode) {
        case 'add':
          this.addKnob();
          break;
        case 'edit':
          this.editKnob(knob.id);
          break;
        case 'sort':
          this.$emit('switch-mode', { mode: 'sort' });
          break;
        case 'remove':
          this.$emit('remove', {
            message: `Are you sure you want to delete knob named “${knob.name}”?`,
            callback: 'removeKnob',
            data: knob.id,
          });
          break;
      }
    },

    addKnob() {
      this.$emit('editor', { mode: 'add', id: null });
    },

    editKnob(id) {
      this.$emit('editor', { mode: 'edit', id });
    },

    sendIr(id, confirm) {
      if (!confirm || confirm === undefined) {
        const api = this.settings.api.prefix;
        fetch(`${api}${this.settings.api.send}${id}/`)
          .then(resp => {
            if (!resp.ok) throw new Error(`API HTTP status ${resp.status}`);
          })
          .then(() => {
            this.loader = false;
          })
          .catch(err => {
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

    svg {
      width: 100%;
      height: 100%;
      pointer-events: none;
      fill: var(--accent);
    }
  }

  .knob {
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
      content: '';
      padding-top: 100%;
    }

    &:hover,
    &:focus {
      background-color: rgba(0, 0, 0, 0.02);
      transition: background-color 0.5s;
    }
    &[data-placeholder='true'] {
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

  .add-item {
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

  .mode-sort & .knob {
    cursor: move !important;
  }
}
</style>
