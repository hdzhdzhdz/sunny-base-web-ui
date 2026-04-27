/**
 * 自动选中默认值工具
 * Auto-select defaults utility
 * @description 权限选项加载完成后，自动设置第一个选项为默认值（仅空值字段）
 */

/**
 * 应用自动选中默认值到表单（仅空值字段）
 * Apply auto-select defaults to form (only empty fields)
 *
 * @param defaults - 自动选中默认值映射 { fieldName: firstOptionValue }
 * @param formApi - 表单 API 实例
 */
export async function applyAutoSelectDefaults(
  defaults: Record<string, any>,
  formApi: {
    setFieldValue: (field: string, value: any) => Promise<void>;
    getValues: () => Promise<Record<string, any>>;
  },
) {
  const keys = Object.keys(defaults);
  if (keys.length === 0) return;

  const currentValues = await formApi.getValues();

  for (const fieldName of keys) {
    const currentValue = currentValues[fieldName];
    if (currentValue === undefined || currentValue === null || currentValue === '') {
      await formApi.setFieldValue(fieldName, defaults[fieldName]);
    }
  }
}
