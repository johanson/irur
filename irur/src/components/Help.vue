<template>
  <div>
    <div class="icon" @click.prevent="show()">
      <svg><use xlink:href="#gear-2"></use></svg>
    </div>
    <div class="overlay" v-if="isActive" @click="closeModal($event)">
      <div class="window">
        <div class="close">
          <svg><use xlink:href="#close"></use></svg>
        </div>
        <textarea ref="data" v-model="data" />
        <button class="select-all" @click="selectAll()">Select all</button>
        <button @click="save()">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isActive: false,
    };
  },

  props: {
    db: { type: Object, required: true },
  },

  computed: {
    data: {
      set() {
        this.data = this.db;
      },
      get() {
        return JSON.stringify(this.db, null, 2);
      },
    },
  },

  watch: {
    isActive() {
      if (this.isActive) {
        window.addEventListener('keydown', this.keyDown);
      } else {
        window.removeEventListener('keydown', this.keyDown);
      }
    },
  },

  methods: {
    show() {
      this.isActive = true;
    },

    save() {
      this.$toast.info('Database updated');
    },

    selectAll() {
      this.$refs.data.focus();
      this.$refs.data.select();
    },

    closeModal(e, force = false) {
      const targetClassList = ['overlay', 'close'];
      const inTargetClassList = targetClassList.some(c =>
        e.target.classList.contains(c)
      );
      if (inTargetClassList || force) {
        this.isActive = false;
      }
    },

    keyDown(KeyboardEvent) {
      if (KeyboardEvent.key === 'Escape') {
        this.isActive = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.overlay {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.25);
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: 100;
}

.icon {
  cursor: pointer;
  top: 9px;
  right: 9px;
  z-index: 10;
  width: 30px;
  height: 30px;
  right: 0;
  bottom: 0;
  display: block;
  position: absolute;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
  svg {
    pointer-events: none;
    width: 100%;
    height: 100%;
    pointer-events: none;
    fill: var(--accent);
  }
}
.window {
  text-align: right;
  display: block;
  z-index: 1001;
  background-color: var(--background);
  color: #fff;
  width: 80vw;
  max-width: 700px;
  min-width: 320px;
  margin: 0px auto;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 40px;
  button {
    padding: 0 15px;
    margin: 5px;
  }
  button + button {
    margin-left: 0;
  }
  button.select-all {
    opacity: 0.75;
    &:hover {
      opacity: 1;
    }
  }
}

textarea {
  display: block;
  width: 100%;
  max-height: 600px;
  height: 70vh;
  min-height: 200px;
  color: var(--accent);
  background: var(--background-shade);
  font-size: 14px;
  margin-top: 35px;
  font-family: monospace;
  border: none;
  &:focus {
    border-color: #1976d2;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-top-width: 1px;
    border-top-style: solid;
  }
}
</style>
