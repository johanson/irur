export default {
  methods: {
    genUID() {
      return Math.random().toString(36).slice(-8);
    },
  },
};
