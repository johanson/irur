import Irur from '@/Irur.vue';
import Helpers from './mixins/helpers';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import VueToast from 'vue-toast-notification';
global.localVue = createLocalVue();
global.localVue.use(VueToast);

describe('Irur.vue', () => {
  const localVue = global.localVue;
  const wrapper = shallowMount(Irur, {
    localVue,
    mixins: [Helpers],
    data() {
      return {};
    },
  });
});
