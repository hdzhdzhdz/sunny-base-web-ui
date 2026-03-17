import { defineComponent, h, ref, shallowRef, nextTick } from 'vue';
import SunnyExportModal from './SunnyExportModal.vue';
import type { ExportModalOptions, ExportExecuteRequest } from './types'

export function useExportModal(defaultOptions: Partial<ExportModalOptions> = {}) {
  const componentRef = shallowRef<InstanceType<typeof SunnyExportModal> | null>(null);
  const currentOptions = ref<any>(defaultOptions);

  const ExportModal = defineComponent({
    name: 'useSunnyExportModalWrapper',
    setup(props, { attrs, slots }) {
      return () => h(SunnyExportModal, {
        ref: componentRef,
        ...currentOptions.value,
        ...props,
        ...attrs
      }, slots);
    }
  });

  const exportModalApi = {
    open: (options: Partial<ExportExecuteRequest>) => {
      currentOptions.value = { ...currentOptions.value, ...options };
      nextTick(() => {
        componentRef.value?.open();
      });
    },
    close: () => {
      componentRef.value?.close();
    }
  };

  return [ExportModal, exportModalApi] as const;
}
