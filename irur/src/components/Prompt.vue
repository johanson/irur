<template>
  <div class="overlay" v-if="isActive">
    <div class="prompt">
      <div class="close" @click="cancel()">
        <svg><use xlink:href="#close"></use></svg>
      </div>
      <div class="message">
        {{ data.message }}
      </div>
      <div class="clearfix">
        <button type="button" class="confirm" @click.prevent="confirm()">
          Yes
        </button>
        <button type="button" class="secondary" @click.prevent="cancel()">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    params: { type: Object, required: true },
  },

  computed: {
    data() {
      return this.params;
    },
    isActive() {
      return this.data.callback && this.data.message !== null;
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
    confirm() {
      this.$emit('callback', true);
    },

    cancel() {
      this.$emit('callback', false);
    },

    keyDown(KeyboardEvent) {
      if (KeyboardEvent.key === 'Enter') {
        this.confirm();
      }
      if (KeyboardEvent.key === 'Escape') {
        this.cancel();
      }
    },
  },
};
</script>

<style scoped lang="scss">
.overlay {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.25);
  top: 0;
  left: 0;
  min-height: 100vh;
  width: 100%;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}
.prompt {
  position: fixed;
  z-index: 101;
  top: 100px;
  background: var(--background);
  color: var(--accent);
  width: 250px;
  padding: 15px;
  .message {
    margin-top: 25px;
    margin-bottom: 20px;
  }
  button {
    &.confirm {
      opacity: 1;
      margin-right: 10px;
    }
  }
}
</style>
