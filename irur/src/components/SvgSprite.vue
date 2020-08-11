<template>
  <div id="svg-sprite" />
</template>

<script>
export default {
  data() {
    return {
      glyphs: [],
    };
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      fetch('icons/sprite.svg')
        .then((resp) => {
          if (!resp.ok) {
            throw new Error(`API HTTP status ${resp.status}`);
          }
          return resp.text();
        })
        .then((data) => {
          this.parse(data);
        }).catch((err) => {
          this.$toast.error(String(err));
        });
    },
    parse(data) {
      const svg = document.getElementById('svg-sprite');
      const parser = (new DOMParser()).parseFromString(data, 'text/xml');
      const symbols = parser.getElementsByTagName('symbol');
      svg.innerHTML = data;
      if (!symbols.length) {
        throw new Error('Cannot generate svg icons');
      }
      for (let i = 0; i < symbols.length; i += 1) {
        this.glyphs.push(symbols[i].getAttribute('id'));
      }
      this.$emit('loaded', this.glyphs);
    },
  },
};
</script>

<style>
  #svg-sprite {
    display: none;
  }
</style>
