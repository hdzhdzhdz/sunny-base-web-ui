import { computed, inject, provide, unref, useSlots, type ComputedRef, type InjectionKey } from 'vue';
import { useForm } from 'vee-validate';
import type { SunnyFormProps } from './types';
export { provideComponentRefMap, injectComponentRefMap } from './form-render/context';

// ==========================================
// 依赖注入键 (Injection Keys)
// ==========================================

/**
 * Form Props 注入键
 * 用于在组件树中传递表单的配置属性 (Schema, Layout 等)
 */
const FormPropsKey: InjectionKey<ComputedRef<SunnyFormProps>> = Symbol('FormPropsKey');

// ==========================================
// Provider / Injector (提供者/注入者)
// ==========================================

/**
 * 提供表单属性 (Provide Form Props)
 * 在表单根组件 (SunnyForm / SunnyUseForm) 中调用，向下层组件提供配置
 * @param props 表单配置属性的计算属性
 */
export function provideFormProps(props: ComputedRef<SunnyFormProps>) {
  provide(FormPropsKey, props);
}

/**
 * 注入表单属性 (Inject Form Props)
 * 在子组件 (如 FormRender, FormField) 中调用，获取表单配置
 * @throws Error 如果没有找到 FormPropsKey (说明没有在 SunnyForm/SunnyUseForm 内部使用)
 */
export function injectFormProps() {
  const props = inject(FormPropsKey);
  if (!props) {
    throw new Error('Form context not found (表单上下文未找到，请确保在 SunnyForm 或 SunnyUseForm 内部使用)');
  }
  return props;
}

// ==========================================
// 核心逻辑 (Core Logic)
// ==========================================

/**
 * 表单初始化 Hook (Initialize Form)
 * 负责 vee-validate 的初始化、默认值计算和插槽处理
 * 
 * @param props 表单属性
 * @returns 
 * - form: vee-validate 的表单上下文
 * - delegatedSlots: 需要透传给 FormRender 的插槽名称列表
 */
export function useFormInitial(props: ComputedRef<SunnyFormProps> | SunnyFormProps) {
  const slots = useSlots();
  
  // 1. 计算初始值 (Calculate initial values from schema)
  // 遍历 Schema，提取所有字段的 defaultValue
  const initialValues = computed(() => {
    const p = unref(props);
    const values: Record<string, any> = {};
    (p.schema || []).forEach(item => {
      if (item.fieldName && item.defaultValue !== undefined) {
        values[item.fieldName] = item.defaultValue;
      }
    });

    // 合并传入的初始值 (Merge provided initial values)
    if (p.values) {
      Object.assign(values, p.values);
    }
    return values;
  });

  // 2. 初始化 vee-validate 表单 (Initialize vee-validate form)
  // 使用计算出的 initialValues 创建表单上下文
  const form = useForm({
    initialValues: initialValues.value,
  });

  // 3. 处理插槽透传 (Delegate slots)
  // 过滤掉 'default' 插槽，收集其他所有插槽名称
  // 这些插槽将被传递给 FormRender，最终传递给具体的 FormField
  const delegatedSlots = computed(() => {
    const resultSlots: string[] = [];
    // 使用 Object.keys 获取所有 slot 名称
    // Vue 3 的 slots 对象是响应式的，Object.keys 应该能获取到当前的 slot 名称
    const slotKeys = Object.keys(slots);
    for (const key of slotKeys) {
      if (key !== 'default' && typeof slots[key] === 'function') {
        resultSlots.push(key);
      }
    }
    return resultSlots;
  });

  return {
    form,
    delegatedSlots
  };
}
