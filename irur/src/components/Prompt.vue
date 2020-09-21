<template>
  <div class="overlay" v-if="isActive" tabindex=-1 ref="window"
       @keydown.esc="cancel()" @keydown.enter="yes()">
    <div id="prompt">
      <div class="close" @click="cancel()">
        <svg>
          <use xlink:href="#close"></use>
        </svg>
      </div>

      <div class="message">
        {{ propData.message }}
      </div>
      <div class="clearfix">
        <button type="button" class="yes" @click.prevent="yes()">Yes</button>
        <button type="button" class="cancel" @click.prevent="cancel()">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: { type: Object, required: true },
  },

  computed: {
    propData() {
      return this.data;
    },
    isActive() {
      return (this.propData.callback && this.propData.message !== null);
    },
  },

  watch: {
    isActive() {
      if (this.isActive) {
        // Wait until the DOM update cycle
        this.$nextTick().then(() => {
          this.$refs.window.focus();
        });
      }
    },
  },

  methods: {
    yes() {
      this.$emit('callback', true);
    },

    cancel() {
      this.$emit('callback', false);
    },
  },
};
</script>

<style lang="scss">
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
#prompt {
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
    padding: 0 15px;
    &.yes {
      opacity: 1;
      margin-right: 10px;
    }
    &.cancel {
      opacity: 0.5;
    }
    &.cancel:hover {
      opacity: 1;
    }
  }
}
</style>
