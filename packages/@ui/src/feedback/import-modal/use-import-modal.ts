import { defineComponent, h, ref, shallowRef, nextTick } from 'vue';
import SunnyImportModal from './SunnyImportModal.vue';
import type { ImportModalOptions } from './types'

export function useImportModal(defaultOptions: Partial<ImportModalOptions> = {}) {
  const componentRef = shallowRef<InstanceType<typeof SunnyImportModal> | null>(null);
  const currentOptions = ref<any>(defaultOptions);

  const ImportModal = defineComponent({
    name: 'useSunnyImportModalWrapper',
    setup(props, { attrs, slots }) {
      return () => h(SunnyImportModal, {
        ref: componentRef,
        ...currentOptions.value,
        ...props,
        ...attrs
      }, slots);
    }
  });

  const importModalApi = {
    open: (options: any) => {
      currentOptions.value = { ...currentOptions.value, ...options };
      nextTick(() => {
        componentRef.value?.open();
      });
    },
    close: () => {
      componentRef.value?.close();
    }
  };

  return [ImportModal, importModalApi] as const;
}
