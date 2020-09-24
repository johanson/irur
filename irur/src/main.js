import Vue from 'vue';
import VueToast from 'vue-toast-notification';
import App from './Irur.vue';
import SvgSprite from './components/SvgSprite.vue';
import Undo from './components/Undo.vue';
import Editor from './components/Editor.vue';
import Tabs from './components/Tabs.vue';
import Remote from './components/Remote.vue';
import Prompt from './components/Prompt.vue';
import './assets/app.scss';

Vue.config.productionTip = false;

Vue.component('SvgSprite', SvgSprite);
Vue.component('Undo', Undo);
Vue.component('Editor', Editor);
Vue.component('Tabs', Tabs);
Vue.component('Remote', Remote);
Vue.component('Prompt', Prompt);

Vue.use(VueToast, { position: 'bottom' });

new Vue({
  render: (h) => h(App),
}).$mount('#app');
