import Vue from 'vue';
import App from '@/Irur.vue';
import VueToast from 'vue-toast-notification';

Vue.use(VueToast, { position: 'bottom' });
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
