import { computed, inject, provide, type Slots } from 'vue';
import type { FormRenderProps } from '../types';

/**
 * 表单渲染属性注入 Key
 * Injection Key for form render properties
 */
const FormRenderPropsKey = Symbol('FormRenderProps');

/**
 * 组件引用 Map 注入 Key
 * Injection Key for component ref map
 */
const ComponentRefMapKey = Symbol('ComponentRefMap');

/**
 * 字段 Slots 注入 Key
 * Injection Key for field slots
 */
const FieldSlotsKey = Symbol('FieldSlots');

/**
 * 提供表单渲染属性
 * Provide form render properties
 *
 * @param props 表单渲染属性
 */
export const provideFormRenderProps = (props: FormRenderProps) => {
  provide(FormRenderPropsKey, props);
};

/**
 * 注入表单渲染属性
 * Inject form render properties
 *
 * @returns 表单渲染属性
 */
export const injectRenderFormProps = () => {
  const props = inject<FormRenderProps>(FormRenderPropsKey);
  if (!props) {
    throw new Error(
      'injectRenderFormProps must be used within provideFormRenderProps',
    );
  }
  return props;
};

/**
 * 提供组件引用 Map
 * Provide component ref map
 *
 * @param map 组件引用 Map
 */
export const provideComponentRefMap = (map: Map<string, any>) => {
  provide(ComponentRefMapKey, map);
};

/**
 * 注入组件引用 Map
 * Inject component ref map
 *
 * @returns 组件引用 Map
 */
export const injectComponentRefMap = () => {
  return inject<Map<string, any>>(ComponentRefMapKey);
};

/**
 * 提供字段 Slots
 * Provide field slots
 *
 * @param slots Slots 对象
 */
export const provideFieldSlots = (slots: Slots) => {
  provide(FieldSlotsKey, slots);
};

/**
 * 注入字段 Slots
 * Inject field slots
 *
 * @returns Slots 对象
 */
export const injectFieldSlots = (): Slots | undefined => {
  return inject<Slots>(FieldSlotsKey);
};

/**
 * 使用表单上下文
 * Use form context
 * 
 * 提供便捷的上下文访问，如判断布局方向等
 */
export const useFormContext = () => {
  const formRenderProps = injectRenderFormProps();

  // 判断是否垂直布局
  const isVertical = computed(
    () => formRenderProps.layout === 'vertical',
  );

  return {
    props: formRenderProps,
    isVertical,
    // 转发配置中的映射，方便子组件使用
    // Forward mappings from config for child components
    componentBindEventMap: computed(() => formRenderProps.config?.modelPropNameMap),
    // 这里如果需要 componentMap，通常从 config.ts 或 props 传递，
    // 但在原参考代码中是通过 import 的。为了解耦，这里可以不返回，
    // 或者在 Form.vue 中处理。
    // In reference code, componentMap is imported. We can stick to that.
  };
};
