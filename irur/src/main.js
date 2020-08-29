import Vue from 'vue';
import VueToast from 'vue-toast-notification';
import App from './Irur.vue';

Vue.config.productionTip = false;

Vue.use(VueToast, {
  duration: 4000,
  type: 'default',
  position: 'bottom',
});

new Vue({
  render: (h) => h(App),
}).$mount('#app');
