/**
 * 表单 Schema 处理工具
 * Form Schema processing utilities
 * @description 提供声明式字典选项自动加载功能
 * @description Provides declarative dictionary options auto-loading functionality
 */

import { computed, onMounted, type Ref, type ComputedRef } from 'vue';
import { useSelectOptions } from '../form/use-select-options';
import type { FormSchema, SelectOptionsDeclaration, SelectOption } from '@sunny-base-web/ui';

/**
 * Schema 选项加载器返回值
 * Schema options loader return value
 */
export interface SchemaOptionsLoaderReturn {
  /**
   * 增强后的 Schema（自动注入 options）
   * Enhanced Schema (with auto-injected options)
   */
  enhancedSchema: ComputedRef<FormSchema[]>;

  /**
   * 选项映射表
   * Options map
   */
  optionsMap: Ref<Record<string, SelectOption[]>>;

  /**
   * 加载状态
   * Loading state
   */
  loading: Ref<boolean>;

  /**
   * 手动加载
   * Manual load
   */
  load: () => Promise<void>;
}

/**
 * 处理声明式 Schema 的选项加载
 * Process declarative Schema options loading
 *
 * @param schema - 表单 Schema
 * @param immediate - 是否立即加载
 * @returns 增强后的 Schema 和加载方法
 *
 * @example
 * ```typescript
 * // 在 config.ts 中声明式配置
 * export const searchFormSchema: FormSchema[] = [
 *   {
 *     fieldName: 'nZt',
 *     component: 'Select',
 *     selectOptions: {
 *       dictCode: 'SFQY',
 *       fieldMapping: { label: 'cName', value: 'cXuhao' }
 *     }
 *   }
 * ]
 *
 * // 在组件中使用
 * const { enhancedSchema, optionsMap } = useSchemaOptionsLoader(searchFormSchema);
 *
 * // 传递给 useList
 * useList({
 *   searchFormSchema: enhancedSchema.value,
 *   ...
 * })
 * ```
 */
export function useSchemaOptionsLoader(
  schema: FormSchema[] | Ref<FormSchema[]>,
  immediate: boolean = true
): SchemaOptionsLoaderReturn {
  /**
   * 收集所有需要加载的字典声明
   * Collect all dictionary declarations to load
   */
  const collectDeclarations = computed(() => {
    const schemaValue = typeof schema === 'object' && 'value' in schema ? schema.value : schema;
    const declarations: Array<SelectOptionsDeclaration & { fieldName: string }> = [];

    schemaValue.forEach((field) => {
      if (field.selectOptions?.dictCode) {
        declarations.push({
          fieldName: field.fieldName || '',
          ...field.selectOptions,
        });
      }
    });

    return declarations;
  });

  /**
   * 提取字典编码列表（去重）
   * Extract dictionary code list (deduplicated)
   */
  const dictCodes = computed(() => {
    const codes = new Set<string | number>();
    collectDeclarations.value.forEach((decl) => {
      codes.add(decl.dictCode);
    });
    return Array.from(codes);
  });

  /**
   * 使用 useSelectOptions 批量加载
   * Use useSelectOptions for batch loading
   */
  const { optionsMap, loading, load } = useSelectOptions({
    numbList: dictCodes.value,
    fieldMapping: collectDeclarations.value[0]?.fieldMapping, // 使用第一个字段的映射作为默认
    immediate: false,
  });

  /**
   * 增强 Schema：自动注入 options
   * Enhance Schema: auto-inject options
   */
  const enhancedSchema = computed(() => {
    const schemaValue = typeof schema === 'object' && 'value' in schema ? schema.value : schema;

    return schemaValue.map((field) => {
      if (field.selectOptions?.dictCode) {
        // 转换 componentProps 为函数形式，注入 options
        const originalProps = field.componentProps;
        const dictCode = String(field.selectOptions.dictCode);

        return {
          ...field,
          componentProps: (props: any) => {
            // 获取原始 props
            const baseProps = typeof originalProps === 'function'
              ? originalProps(props)
              : originalProps;

            // 注入动态加载的 options
            return {
              ...baseProps,
              options: optionsMap.value[dictCode] || [],
            };
          },
        };
      }
      return field;
    });
  });

  /**
   * 自动加载（immediate 为 true 时）
   * Auto-load (when immediate is true)
   */
  if (immediate && dictCodes.value.length > 0) {
    onMounted(async () => {
      await load();
    });
  }

  return {
    enhancedSchema,
    optionsMap,
    loading,
    load,
  };
}

/**
 * 路由守卫预加载工具
 * Route guard pre-loading utility
 *
 * @description 用于在路由级别预加载字典选项
 * @description Used for pre-loading dictionary options at route level
 *
 * @param dictCodes - 字典编码列表
 * @param fieldMapping - 字段映射配置
 * @returns 加载函数
 *
 * @example
 * ```typescript
 * // router/guard.ts
 * import { preLoadSelectOptions } from '@sunny-base-web/effects';
 *
 * router.beforeEach(async (to, from, next) => {
 *   if (to.meta.selectOptions) {
 *     await preLoadSelectOptions(to.meta.selectOptions as string[]);
 *   }
 *   next();
 * });
 *
 * // router/index.ts
 * {
 *   path: '/setting/demo/test',
 *   meta: {
 *     selectOptions: ['SFQY', 'LANG']
 *   }
 * }
 * ```
 */
export async function preLoadSelectOptions(
  dictCodes: (string | number)[],
  fieldMapping?: { label?: string; value?: string }
): Promise<void> {
  if (!dictCodes || dictCodes.length === 0) {
    return;
  }

  const { load } = useSelectOptions({
    numbList: dictCodes,
    fieldMapping,
    immediate: false,
  });

  await load();
}

/**
 * 收集 Schema 中的字典声明（工具函数）
 * Collect dictionary declarations from Schema (utility function)
 *
 * @param schema - 表单 Schema
 * @returns 字典编码列表
 *
 * @example
 * ```typescript
 * const dictCodes = collectSchemaDictCodes(searchFormSchema);
 * console.log(dictCodes); // ['SFQY', 'LANG']
 * ```
 */
export function collectSchemaDictCodes(schema: FormSchema[]): (string | number)[] {
  const codes = new Set<string | number>();

  schema.forEach((field) => {
    if (field.selectOptions?.dictCode) {
      codes.add(field.selectOptions.dictCode);
    }
  });

  return Array.from(codes);
}
