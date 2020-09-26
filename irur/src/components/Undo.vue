<template>
  <a href="#" @keydown.ctrl.90="undo" @click="back()" v-if="isActive">
    <span>Undo</span>
    <svg><use xlink:href="#fast-forward"></use></svg>
  </a>
</template>

<script>
const undoButtonTimeout = 5000;

export default {
  props: {
    db: { type: Object, required: true },
  },

  data() {
    return {
      dbHistory: null,
      isActive: false,
    };
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
    back() {
      this.$emit('back', this.dbHistory);
      this.isActive = false;
    },

    record() {
      // get rid of references
      this.dbHistory = JSON.parse(JSON.stringify(this.db));
      this.timer();
      this.isActive = true;
    },

    timer() {
      setTimeout(() => {
        this.isActive = false;
      }, undoButtonTimeout);
    },

    keyDown(KeyboardEvent) {
      if (KeyboardEvent.key === 'Enter') {
        this.back();
        this.isActive = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
a {
  user-select: none;
  z-index: 1053;
  position: fixed;
  text-transform: uppercase;
  bottom: 10px;
  right: 10px;
  line-height: 20px;
  padding: 10px;
  border: 1px solid var(--accent);
  border-radius: 2px;
  background-color: var(--background-shade);
  opacity: 0.5;
  color: var(--accent);
  transition: opacity 0.5s ease-in-out;
  animation-name: fadeBorder;
  animation-duration: 2500ms;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;

  &:hover {
    opacity: 1;
    transition: opacity 0.5s ease-in-out;
  }
  @keyframes fadeBorder {
    0% {
      border: 1px solid #1976d2;
    }

    100% {
      border: 1px solid var(--accent);
    }
  }
  svg {
    height: 15px;
    width: 15px;
    margin-top: 2px;
    float: left;
    fill: var(--accent);
  }

  span {
    line-height: 20px;
    height: 20px;
    float: left;
    padding-right: 5px;
  }
}
</style>
