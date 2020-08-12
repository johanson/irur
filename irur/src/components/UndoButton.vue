<template>
  <a href="#" v-show="is_visible"
    @keydown.ctrl.90="undo"
      @click.prevent="undo"
                ref="undoButton">
    <span>Undo</span>
    <svg>
      <use xlink:href="#fast-forward"></use>
    </svg>
  </a>
</template>

<script>
export default {
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
  mounted() {
    this.$refs.undoButton.focus();
  },
  methods: {
    undo() {
      this.$emit('undo', this.db_history);
    },
    record() {
      // get rid of references
      this.db_history = JSON.parse(JSON.stringify(this.db));
    },
    timer() {
      setTimeout(() => {
        this.$emit('timer');
      }, 5000);
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
  border: 1px solid var(--text);
  border-radius: 2px;
  background-color: var(--background-overlay);
  opacity: 0.5;
  color: var(--text);
  transition: opacity 0.5s ease-in-out;

  &.visible {
    display: block;
  }

  &:hover {
    opacity: 1;
    transition: opacity 0.5s ease-in-out;
  }

  svg {
    height: 15px;
    width: 15px;
    margin-top: 2px;
    float: left;
    fill: var(--text);
  }

  span {
    line-height: 20px;
    height: 20px;
    float: left;
    padding-right: 5px;
  }
}

</style>
