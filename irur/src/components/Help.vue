<template>
  <div id="help">
    <div class="icon" @click.prevent="show()">
      <svg><use xlink:href="#gear-2"></use></svg>
    </div>
    <div class="overlay" v-if="isActive" @click="closeModal($event)">
      <div class="window">
        <div class="close">
          <svg><use xlink:href="#close"></use></svg>
        </div>
        <textarea ref="data" v-model="data" />
        <button class="secondary" @click="copyToClipboard()">Copy</button>
        <button @click="dataExport()">Export</button>
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
      data: {},
    };
  },

  props: {
    db: { type: Object, required: true },
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
      this.data = JSON.stringify(this.db, null, 2);
    },

    save() {
      // Database updated
      this.$emit('save', {
        message: 'Are you sure you want to save the changes?',
        callback: 'saveDBManualEdit',
        data: this.data,
      });
      this.closeModal(true);
    },

    dataExport() {
      try {
        const contents = JSON.stringify(this.db, null, 2);
        const blob = new Blob([contents], { type: 'octet/stream' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        document.body.appendChild(link);
        link.style = 'display: none;';
        link.href = url;
        link.download = 'irur_backup.txt';
        link.click();
        window.URL.revokeObjectURL(url);
        this.$toast.success(`Export successful, check your downloads folder`);
      } catch (err) {
        this.$toast.success(`Cannot export file: ${err.message}`);
      }
    },

    copyToClipboard() {
      this.$refs.data.focus();
      this.$refs.data.select();
      document.execCommand('copy');
    },

    closeModal(e) {
      let inTargetClassList = false;
      const targetClassList = ['close'];

      if (typeof e === 'boolean') {
        // Force close
        inTargetClassList = true;
      } else {
        inTargetClassList = targetClassList.some((c) =>
          e.target.classList.contains(c)
        );
      }

      if (inTargetClassList) {
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

<style lang="scss">
#help {
  .overlay {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.25);
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    z-index: 99;
  }

  .icon {
    cursor: pointer;
    bottom: 5px;
    right: 5px;
    z-index: 10;
    width: 25px;
    height: 25px;
    display: none;
    position: fixed;
    opacity: 0.5;
    .normal & {
      display: block;
    }
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
    width: 90vw;
    max-width: 700px;
    min-width: 320px;
    margin: 0px auto;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 40px;
    button {
      margin: 5px;
    }
    button + button {
      margin-left: 0;
    }
  }

  textarea {
    display: block;
    width: calc(100% - 20px);
    max-height: 600px;
    height: calc(100vh - 140px);
    min-height: 100px;
    color: var(--accent);
    background: var(--background-shade);
    font-size: 12px;
    margin: 10px;
    margin-top: 35px;
    font-family: monospace;
    border: none;
    &:focus {
      border-color: rgba(25, 118, 210, 0.7);
      border-bottom-width: 1px;
      border-bottom-style: solid;
    }
  }
}
</style>
