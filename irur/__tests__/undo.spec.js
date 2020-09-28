import Undo from '@/components/Undo.vue';
import { shallowMount } from '@vue/test-utils';

describe('Undo.vue', () => {
  const wrapper = shallowMount(Undo, {
    data() {
      return {
        isActive: true,
      };
    },
    propsData: {
      db: { value: 'unit-test' },
    },
  });

  const data = wrapper.vm;
  const button = wrapper.find('a');

  it('Undo button and its text should be visible since we change the state of isActive at the beginning which makes it write itself to DOM', async () => {
    // Important to wait for the next DOM update cycle because we change the isActive state
    await wrapper.vm.$nextTick();
    expect(button.text()).toBe('Undo');
    expect(data.dbHistory).toBe(null);
  });

  it('Should record the state to dbHistory and equal to our mock data', async () => {
    wrapper.vm.record();
    expect(data.dbHistory).toEqual({ value: 'unit-test' });
  });

  it('Click of the button which should make the button hide itself', async () => {
    await button.trigger('click');
    expect(data.isActive).toBe(false);
  });
});
