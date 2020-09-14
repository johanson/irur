<template>
  <a href="#"
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
    db: { type: Object, required: true },
  },

  data() {
    return {
      db_history: {},
    };
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
      this.timer();
      this.$emit('show');
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
  border: 1px solid var(--accent);
  border-radius: 2px;
  background-color: var(--background-shade);
  opacity: 0.5;
  color: var(--accent);
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
