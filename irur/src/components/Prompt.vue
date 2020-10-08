<template>
  <div class="container" v-if="isActive">
    <div id="prompt">
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
        this.$emit('switch-mode', { mode: 'prompt' });
        window.addEventListener('keydown', this.keyDown);
      } else {
        window.removeEventListener('keydown', this.keyDown);
      }
    },
  },

  methods: {
    confirm() {
      this.closeModal();
      this.$emit('callback', true);
    },

    cancel() {
      this.closeModal();
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

    closeModal() {
      this.$emit('switch-mode', { mode: 'normal' });
    },
  },
};
</script>

<style lang="scss">
#prompt {
  position: absolute;
  z-index: 101;
  top: 100px;
  background: var(--background);
  color: var(--accent);
  width: 270px;

  padding: 15px;
  top: 40px;

  @at-root.container {
    display: flex;
    justify-content: center;
  }

  .message {
    margin-top: 25px;
    margin-bottom: 20px;
  }

  button {
    margin-right: 10px;
    max-width: 125px;
  }
}
</style>
