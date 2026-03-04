import DefaultTheme from 'vitepress/theme'
import { ElementPlusContainer } from '@vitepress-demo-preview/component'
import PreviewWrapper from './PreviewWrapper.vue'
import '@vitepress-demo-preview/component/dist/style.css'
import '@arco-design/web-vue/dist/arco.css'
import ArcoVue from '@arco-design/web-vue'
import VxeUIBase, { VxeUI } from 'vxe-pc-ui'
import 'vxe-pc-ui/es/style.css'
import VxeUIPluginRenderArco from '@vxe-ui/plugin-render-arco'
import '@vxe-ui/plugin-render-arco/dist/style.css'
import { SunnyIcon, SunnySearchInputTag, SunnyBatchSelect, SunnySelect } from '@sunny-base-web/ui'
import { setupI18n } from '@sunny-base-web/locales'
import { setupBusinessForm, type BusinessSearchAdapter, type BusinessSearchConfig, type BusinessSearchResult } from '@sunny-base-web/effects'
import mediumZoom from 'medium-zoom'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import axios from 'axios'

import './style.css'
import './acro.css'

/**
 * Docs 专用的 BusinessSearch 适配器
 * 不依赖 Pinia，直接使用 axios
 */
const docsBusinessSearchAdapter: BusinessSearchAdapter = {
  loadConfig: async (cNum: string): Promise<BusinessSearchConfig> => {
    const res = await axios.post('/core/assDialog/openInit', { cNum });
    const data = res.data?.result || res.data;

    // 转换表单配置
    const formSchema = (data.conditions || []).map((item: any) => ({
      label: item.label,
      fieldName: item.prop,
      component: mapComponentType(item.type),
      componentProps: {
        placeholder: item.meta?.placeholder || `请输入${item.label}`,
        ...item.meta,
      },
    }));

    // 转换表格列配置
    const tableColumns = (data.tableCols || []).map((item: any) => ({
      title: item.label,
      field: item.prop,
      width: item.width,
    }));

    return {
      title: data.cTitle,
      width: data.cWidth ? (isNaN(Number(data.cWidth)) ? data.cWidth : `${data.cWidth}px`) : undefined,
      contentHeight: data.cHeight ? (isNaN(Number(data.cHeight)) ? data.cHeight : Number(data.cHeight)) : 300,
      multiple: data.cSelectionMode !== 'single',
      formSchema,
      tableColumns,
    };
  },

  search: async (params: any): Promise<BusinessSearchResult> => {
    // SearchModal 传递的是 pageNo/pageSize，需要排除这些分页参数
    const { cNum, page, pageNo, pageSize, ...conditions } = params;
    const payload = {
      pageNo: pageNo || page,
      pageSize,
      sqlNum: cNum,
      conditions,
    };

    const res = await axios.post('/core/assDialog/selectForPageCommon', payload);
    const result = res.data?.result || res.data;

    return {
      records: result?.records || result?.list || [],
      total: result?.total || result?.totalSize || 0,
    };
  },
};

function mapComponentType(type: string): string {
  const map: Record<string, string> = {
    input: 'Input',
    select: 'Select',
    date: 'DatePicker',
    datetime: 'TimePicker',
  };
  return map[type] || 'Input';
}

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()
    const initZoom = () => {
      // mediumZoom('[data-zoomable]', { background: 'var(--vp-c-bg)' });
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' })
    }
    onMounted(() => {
      initZoom()
    })
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    )
  },
  enhanceApp(ctx) {
    const { app } = ctx;
    app.component('demo-preview', PreviewWrapper)
    app.component('ElementPlus', PreviewWrapper)
    app.component('SunnyIcon', SunnyIcon)
    app.component('SunnySearchInputTag', SunnySearchInputTag)
    app.component('SunnyBatchSelect', SunnyBatchSelect)
    app.component('SunnySelect', SunnySelect)
    app.use(ArcoVue)
    app.use(VxeUIBase)
    VxeUI.use(VxeUIPluginRenderArco)
    setupI18n(app)

    // 使用 docs 专用适配器初始化
    setupBusinessForm({
      config: {
        businessSearchAdapter: docsBusinessSearchAdapter,
      },
    })
  }
}
