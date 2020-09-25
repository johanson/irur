import Undo from '@/components/Undo.vue';
import { shallowMount } from '@vue/test-utils';

describe('Undo', () => {
  it('should render correct contents', async () => {
    const wrapper = shallowMount(Undo, {
      propsData: {
        db: {},
      },
    });
    wrapper.setData({
      isActive: true,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('span').text()).toBe('Undo');
  });
});
