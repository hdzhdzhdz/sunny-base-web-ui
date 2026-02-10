import { defineComponent, h, ref } from 'vue';

import { VxeGridApi } from './api';
import VxeGrid from './use-query-grid.vue';

export function useSunnyQueryGrid(options: any) {
  const gridRef = ref();
  const api = new VxeGridApi(gridRef);

  const Grid = defineComponent(
    (props, { attrs, slots }) => {
      const { gridEvents, gridOptions } = options;

      const listeners = Object.entries(gridEvents || {}).reduce((acc: Record<string, any>, [key, val]) => {
        const eventName = `on${key.charAt(0).toUpperCase() + key.slice(1)}`;
        acc[eventName] = val;
        return acc;
      }, {});

      return () => h(VxeGrid, { ref: gridRef, ...props, ...attrs, ...gridOptions, ...listeners }, slots);
    }
  );

  return [Grid, api] as const;
}