import { defineComponent, h, isReactive, watch } from 'vue';
import { useStore } from '@tanstack/vue-store';
import type { SunnyFormProps } from './types';
import { FormApi } from './form-api';
import SunnyUseForm from './SunnyUseForm.vue';

export function useSunnyForm(options: SunnyFormProps = {}) {
  const api = new FormApi(options);

  // 扩展 API：注入 useStore 方法 / Extended API: Inject useStore method
  // 1. FormApi 类本身是纯 JS 逻辑，不包含 Vue 的响应式能力 (useStore)
  //    FormApi class is pure JS logic, doesn't contain Vue reactive capabilities
  // 2. 在这里，我们将 Vue 的 useStore 能力“挂载”到 api 实例上
  //    Here we "mount" Vue's useStore capability onto the api instance
  // 3. 最终返回的 api 对象就已经拥有了 useStore 方法
  //    The finally returned api object will possess the useStore method
  //
  // 使用场景示例 / Usage Example:
  // const [Register, api] = useSunnyForm();
  // 
  // 在组件中订阅状态变化 (响应式) / Subscribe to state changes in component (Reactive)
  // const isCollapsed = api.useStore((state) => state.collapsed);
  api.useStore = (selector: any) => {
    return useStore(api.store.store, selector);
  };
  
  // 响应式数据同步逻辑 / Reactive data synchronization logic
  // 这里的目的是：当外部传入的 options (如 schema) 发生变化时，自动同步到 FormApi 的内部 Store 中
  // The purpose here is: automatically sync to FormApi's internal Store when external options (like schema) change
  if (isReactive(options)) {
    watch(
      () => options.schema,
      () => {
        if (options.schema) {
          api.setState({ schema: options.schema });
        }
      },
      { 
        // 性能优化 / Performance Optimization:
        // 关闭 deep: true 以避免大表单时的性能损耗。
        // Disable deep: true to avoid performance cost on large forms.
        //
        // 变更检测 / Change Detection:
        // 如果需要更新 schema，请使用不可变数据模式（替换整个数组）或调用 api.updateSchema()。
        // If you need to update schema, use immutable pattern (replace array) or call api.updateSchema().
        immediate: true 
      }
    );
  }

  // 定义表单组件 / Define Form Component
  // 这是一个包装组件，用于将 FormApi 与 UI 组件(SunnyUseForm)连接起来
  // This is a wrapper component used to connect FormApi with the UI component (SunnyUseForm)
  const Form = defineComponent({
    name: 'useSunnyFormWrapper',
    setup(props, { attrs, slots }) {
      // 将组件的 props 和 attrs 同步到 store 中 / Sync component props and attrs to store
      // This allows users to pass props directly when using <Form /> to override config
      api.setState({ ...props, ...attrs });

      // 渲染函数 / Render function
      return () => h(SunnyUseForm, {
        // 1. ...props & ...attrs: 注入组件接收到的属性
        //    Inject props and attrs received by the component
        ...props,
        ...attrs,
        
        // 2. formApi: 注入 API 实例，供子组件调用
        //    Inject API instance for child components to call
        formApi: api,
      }, slots);
    }
  });

  return [Form, api] as const;
}
