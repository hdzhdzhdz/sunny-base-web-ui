import { defineComponent, h, ref, shallowRef, nextTick } from 'vue';
import SunnyExportModalLight from './SunnyExportModalLight.vue';
import type { ExportModalLightOpenParams } from './types'

export function useExportModalLight(defaultOptions: Record<string, any> = {}) {
  const componentRef = shallowRef<InstanceType<typeof SunnyExportModalLight> | null>(null);
  const currentOptions = ref<any>(defaultOptions);

  const ExportModalLightComponent = defineComponent({
    name: 'useSunnyExportModalLightWrapper',
    setup(props, { attrs, slots }) {
      return () => h(SunnyExportModalLight, {
        ref: componentRef,
        ...currentOptions.value,
        ...props,
        ...attrs,
      }, slots);
    },
  });

  const exportModalLightApi = {
    open: (params: ExportModalLightOpenParams) => {
      currentOptions.value = { ...currentOptions.value, ...params };
      nextTick(() => {
        componentRef.value?.open();
      });
    },
    close: () => {
      componentRef.value?.close();
    }
  };

  return [ExportModalLightComponent, exportModalLightApi] as const;
}
