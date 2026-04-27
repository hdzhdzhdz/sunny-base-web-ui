/**
 * 表单 Schema 权限选项处理工具
 * Form Schema permission options processing utilities
 * @description 提供声明式权限选项自动加载功能
 * @description Provides declarative permission options auto-loading functionality
 */

import { computed, onMounted, isRef, type Ref, type ComputedRef } from 'vue';
import { usePermissionOptions } from '../form/use-permission-options';
import type { FormSchema, PermissionOptionsDeclaration, SelectOption } from '@sunny-base-web/ui';

/**
 * Schema 选项加载器返回值
 * Schema options loader return value
 */
export interface SchemaPermissionLoaderReturn {
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

  /**
   * 自动选中默认值映射（fieldName -> firstOptionValue）
   * Auto-select defaults map (fieldName -> firstOptionValue)
   */
  autoSelectDefaults: ComputedRef<Record<string, any>>;
}

/**
 * Schema 权限选项加载器配置
 */
export interface SchemaPermissionLoaderOptions {
  /**
   * 是否在 onMounted 时自动加载
   * @default true
   */
  immediate?: boolean;

  /**
   * 权限选项加载完成后的回调，用于自动选中默认值
   * Callback after permission options are loaded, for auto-selecting defaults
   * @param defaults - 字段默认值映射 { fieldName: firstOptionValue }
   */
  onAutoSelect?: (defaults: Record<string, any>) => Promise<void>;
}

/**
 * 处理声明式 Schema 的权限选项加载
 * Process declarative Schema permission options loading
 *
 * @param schema - 表单 Schema
 * @param options - 配置选项
 * @returns 增强后的 Schema 和加载方法
 *
 * @example
 * ```typescript
 * // 在 config.ts 中声明式配置
 * export const searchFormSchema: FormSchema[] = [
 *   {
 *     fieldName: 'factory',
 *     component: 'Select',
 *     permissionOptions: {
 *       code: 'FACTORY',
 *       autoSelectFirst: true
 *     }
 *   }
 * ]
 *
 * // 在组件中使用
 * const { enhancedSchema } = useSchemaPermissionLoader(searchFormSchema, {
 *   onAutoSelect: (defaults) => applyAutoSelectDefaults(defaults, formApi)
 * });
 * ```
 */
export function useSchemaPermissionLoader(
  schema: FormSchema[] | Ref<FormSchema[]>,
  options: SchemaPermissionLoaderOptions = {},
): SchemaPermissionLoaderReturn {
  const { immediate = true, onAutoSelect } = options;
  /**
   * 收集所有需要加载的权限声明
   * Collect all permission declarations to load
   */
  const collectDeclarations = computed(() => {
    const schemaValue = isRef(schema) ? schema.value : schema;
    const declarations: Array<PermissionOptionsDeclaration & { fieldName: string }> =
      [];

    schemaValue.forEach((field) => {
      if (field.permissionOptions?.code) {
        declarations.push({
          fieldName: field.fieldName || '',
          ...field.permissionOptions,
        });
      }
    });

    console.log('[useSchemaPermissionLoader] collectDeclarations:', declarations);
    return declarations;
  });

  /**
   * 提取权限编码列表（去重）
   * Extract permission code list (deduplicated)
   */
  const codes = computed(() => {
    const codeSet = new Set<string | number>();
    collectDeclarations.value.forEach((decl) => {
      codeSet.add(decl.code);
    });
    return Array.from(codeSet);
  });

  /**
   * 使用 usePermissionOptions 批量加载
   * Use usePermissionOptions for batch loading
   */
  const { optionsMap, loading, load } = usePermissionOptions({
    numbList: codes.value,
    fieldMapping: collectDeclarations.value[0]?.fieldMapping, // 使用第一个字段的映射作为默认
    immediate: false,
  });

  /**
   * 增强 Schema：自动注入 options
   * Enhance Schema: auto-inject options
   */
  const enhancedSchema = computed(() => {
    const schemaValue = isRef(schema) ? schema.value : schema;

    console.log('[useSchemaPermissionLoader] schemaValue:', schemaValue);
    console.log('[useSchemaPermissionLoader] optionsMap.value:', optionsMap.value);

    return schemaValue.map((field) => {
      if (field.permissionOptions?.code) {
        // 转换 componentProps 为函数形式，注入 options
        const originalProps = field.componentProps;
        const permissionCode = String(field.permissionOptions.code);

        return {
          ...field,
          componentProps: (props: any) => {
            // 获取原始 props
            const baseProps =
              typeof originalProps === 'function' ? originalProps(props) : originalProps;

            // 注入动态加载的 options
            return {
              ...baseProps,
              options: optionsMap.value[permissionCode] || [],
            };
          },
        };
      }
      return field;
    });
  });

  /**
   * 自动选中默认值映射
   * Auto-select defaults map
   */
  const autoSelectDefaults: ComputedRef<Record<string, any>> = computed(() => {
    const defaults: Record<string, any> = {};

    collectDeclarations.value.forEach((decl) => {
      if (decl.autoSelectFirst) {
        const permissionCode = String(decl.code);
        const options = optionsMap.value[permissionCode];
        if (options && options.length > 0) {
          defaults[decl.fieldName] = options[0].value;
        }
      }
    });

    return defaults;
  });

  /**
   * 自动加载（immediate 为 true 时）
   * Auto-load (when immediate is true)
   */
  console.log('[useSchemaPermissionLoader] immediate:', immediate, 'codes.value.length:', codes.value.length);

  if (immediate && codes.value.length > 0) {
    onMounted(async () => {
      console.log('[useSchemaPermissionLoader] onMounted triggered, calling load()');
      await load();
      // load 完成后，如果有 autoSelectFirst 配置，触发回调
      const defaults = autoSelectDefaults.value;
      if (Object.keys(defaults).length > 0 && onAutoSelect) {
        await onAutoSelect(defaults);
      }
    });
  }

  return {
    enhancedSchema,
    optionsMap,
    loading,
    load,
    autoSelectDefaults,
  };
}

/**
 * 收集 Schema 中的权限编码（工具函数）
 * Collect permission codes from Schema (utility function)
 *
 * @param schema - 表单 Schema
 * @returns 权限编码列表
 *
 * @example
 * ```typescript
 * const codes = collectSchemaPermissionCodes(searchFormSchema);
 * console.log(codes); // ['FACTORY', 'COMPANY']
 * ```
 */
export function collectSchemaPermissionCodes(
  schema: FormSchema[]
): (string | number)[] {
  const codeSet = new Set<string | number>();

  schema.forEach((field) => {
    if (field.permissionOptions?.code) {
      codeSet.add(field.permissionOptions.code);
    }
  });

  return Array.from(codeSet);
}
