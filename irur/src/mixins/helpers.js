export default {
  methods: {
    genUID() {
      // $_
      return Math.random()
        .toString(36)
        .slice(-8);
    },

    getHostname() {
      let hostname = '';
      if (process.env.NODE_ENV === 'development') {
        hostname = `http://localhost:${process.env.VUE_APP_SERVER_PORT}/`;
      }
      return hostname;
    },

    cssVar(prop) {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(prop)
        .trimStart();
    },

    scaffoldDB() {
      return {
        default: {
          name: 'Default',
          knobs: [
            {
              id: 'wn0gbd99',
              name: 'Samsung Volume Up',
              mqtt: '{"Protocol":"SAMSUNG","Bits":32,"Data":"0xE0E0E01F"}',
              icon: 'up-arrow',
              topic_send: 'irur/cmnd/IRsend',
              isPlaceholder: false,
            },
            {
              id: 'wt9u3yzj',
              name: 'Samsung Volume Down',
              mqtt: '{"Protocol":"SAMSUNG","Bits":32,"Data":"0xE0E0D02F"}',
              icon: 'down-arrow',
              topic_send: 'irur/cmnd/IRsend',
              isPlaceholder: false,
            },
          ],
        },
      };
    },
  },
};
