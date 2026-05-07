import { isRef, toRaw, type ComponentPublicInstance } from 'vue';
import type { FormState, GenericObject, ResetFormOpts, ValidationOptions } from 'vee-validate';
import { cloneDeep, isFunction, isObject, is, transformToObjectArray, transformToString } from '@sunny-base-web/utils';
import { set as lodashSet } from 'lodash-es';
import { Store } from './store';
import type { FormActions, FormSchema, SunnyFormProps } from './types';


// ==========================================
// 辅助函数 (Helper Functions)
// ==========================================

/**
 * 格式化日期
 * Format Date
 */
function formatDate(date: any, format = 'YYYY-MM-DD'): string {
  if (!date) return date;
  if (isFunction(date.format)) {
    return date.format(format);
  }
  if (date instanceof Date) {
    // 简单的日期格式化，实际项目中建议使用 dayjs
    // Simple date formatting, recommend using dayjs in real projects
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hour)
      .replace('mm', minute)
      .replace('ss', second);
  }
  return String(date);
}

function isDate(val: unknown): val is Date {
  return is(val, 'Date');
}

function isDayjsObject(val: any): boolean {
  return isObject(val) && '$d' in val && '$y' in val && '$M' in val;
}

/**
 * 数组覆盖合并
 * Merge with array override
 */
function mergeWithArrayOverride(target: any, source: any) {
  if (!isObject(target) || !isObject(source)) return source;
  if (Array.isArray(source)) return source;
  
  const result = { ...target };
  Object.keys(source).forEach(key => {
    const targetValue = result[key];
    const sourceValue = source[key];
    
    if (isObject(targetValue) && isObject(sourceValue)) {
      result[key] = mergeWithArrayOverride(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  });
  return result;
}

/**
 * 状态处理器
 * State Handler
 * 用于等待某个条件成立 (如表单挂载完成)
 */
class StateHandler {
  private condition = false;
  private resolveFn: (() => void) | null = null;
  private promise: Promise<void> | null = null;

  setConditionTrue() {
    this.condition = true;
    if (this.resolveFn) {
      this.resolveFn();
      this.resolveFn = null;
    }
  }

  reset() {
    this.condition = false;
    this.promise = null;
    this.resolveFn = null;
  }

  async waitForCondition() {
    if (this.condition) return;
    if (!this.promise) {
      this.promise = new Promise((resolve) => {
        this.resolveFn = resolve;
      });
    }
    await this.promise;
  }
}

/**
 * 绑定类方法到实例
 * Bind Methods
 * 确保解构方法时 `this` 指向正确
 */
function bindMethods(instance: any) {
  const proto = Object.getPrototypeOf(instance);
  const propertyNames = Object.getOwnPropertyNames(proto);
  for (const name of propertyNames) {
    const value = instance[name];
    if (name !== 'constructor' && typeof value === 'function') {
      instance[name] = value.bind(instance);
    }
  }
}

/**
 * 获取默认状态
 * Get Default State
 */
function getDefaultState(): SunnyFormProps {
  return {
    actionWrapperClass: '',
    collapsed: false,
    collapsedRows: 1,
    collapseTriggerResize: false,
    commonConfig: {},
    handleReset: undefined,
    handleSubmit: undefined,
    handleValuesChange: undefined,
    handleCollapsedChange: undefined,
    layout: 'horizontal',
    resetButtonOptions: {},
    schema: [],
    scrollToFirstError: false,
    showCollapseButton: false,
    showDefaultActions: true,
    submitButtonOptions: {},
    submitOnChange: false,
    submitOnEnter: false,
    wrapperClass: 'grid-cols-1',
    values: {},
  };
}

// ==========================================
// FormApi 类定义 (FormApi Class Definition)
// ==========================================

export class FormApi {
  // vee-validate 表单上下文
  public form: FormActions | undefined;
  
  // 是否已挂载
  isMounted = false;

  // 当前状态 (快捷访问)
  public state: null | SunnyFormProps = null;
  
  // 状态同步处理器
  stateHandler: StateHandler;

  // TanStack Store 实例
  public store: Store<SunnyFormProps>;

  /**
   * 组件实例映射
   * Component Ref Map
   * 用于存储每个字段对应的组件实例，以便直接操作组件 (如 focus, scroll)
   */
  private componentRefMap: Map<string, unknown> = new Map();

  // 最后一次点击提交时的表单值
  private latestSubmissionValues: null | Record<string, any> = null;

  // 上一次的状态 (用于 Diff)
  private prevState: null | SunnyFormProps = null;

  constructor(options: SunnyFormProps = {}) {
    const { ...storeState } = options;

    const defaultState = getDefaultState();

    this.store = new Store<SunnyFormProps>(
      {
        ...defaultState,
        ...storeState,
      },
      {
        onUpdate: () => {
          this.prevState = this.state;
          this.state = this.store.getState();
          this.updateState();
        },
      },
    );

    this.state = this.store.getState();
    this.stateHandler = new StateHandler();
    bindMethods(this);
  }

  /**
   * 获取字段组件实例
   * Get field component instance
   * 
   * @param fieldName 字段名
   * @returns 组件实例
   */
  getFieldComponentRef<T = ComponentPublicInstance>(
    fieldName: string,
  ): T | undefined {
    let target = this.componentRefMap.has(fieldName)
      ? (this.componentRefMap.get(fieldName) as ComponentPublicInstance)
      : undefined;
      
    // 处理异步组件或特殊封装的情况 (Handle AsyncComponent or Wrappers)
    if (
      target &&
      target.$ &&
      target.$.type &&
      (target.$.type as any).name === 'AsyncComponentWrapper' &&
      target.$.subTree &&
      target.$.subTree.ref
    ) {
      const ref = target.$.subTree.ref;
      if (Array.isArray(ref)) {
        if (
          ref.length > 0 &&
          ref[0] &&
          isRef((ref[0] as any).r)
        ) {
          target = (ref[0] as any).r.value as ComponentPublicInstance;
        }
      } else if (isRef((ref as any).r)) {
        target = (ref as any).r.value as ComponentPublicInstance;
      }
    }
    return target as T;
  }

  /**
   * 获取当前聚焦的字段
   * Get currently focused field
   * 
   * @returns 字段名或 undefined
   */
  getFocusedField() {
    for (const fieldName of this.componentRefMap.keys()) {
      const ref = this.getFieldComponentRef(fieldName);
      if (ref) {
        let el: HTMLElement | null = null;
        if (ref instanceof HTMLElement) {
          el = ref;
        } else if ((ref as any).$el instanceof HTMLElement) {
          el = (ref as any).$el;
        }
        if (!el) {
          continue;
        }
        if (
          el === document.activeElement ||
          el.contains(document.activeElement)
        ) {
          return fieldName;
        }
      }
    }
    return undefined;
  }

  /**
   * 获取最后一次提交的值
   * Get latest submission values
   */
  getLatestSubmissionValues() {
    return this.latestSubmissionValues || {};
  }

  /**
   * 获取当前状态
   * Get current state
   */
  getState() {
    return this.state;
  }

  /**
   * 获取表单值 (经过处理)
   * Get form values (Processed)
   */
  async getValues<T = Record<string, any>>() {
    const form = await this.getForm();
    return (form.values ? this.handleRangeTimeValue(form.values) : {}) as T;
  }

  /**
   * 检查字段是否有效
   * Check if field is valid
   */
  async isFieldValid(fieldName: string) {
    const form = await this.getForm();
    return form.isFieldValid(fieldName);
  }

  /**
   * 合并多个 FormApi (链式调用)
   * Merge multiple FormApis (Chaining)
   */
  merge(formApi: FormApi) {
    const chain = [this, formApi];
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const proxy = new Proxy(formApi, {
      get(target: any, prop: any) {
        if (prop === 'merge') {
          return (nextFormApi: FormApi) => {
            chain.push(nextFormApi);
            return proxy;
          };
        }
        if (prop === 'submitAllForm') {
          return async (needMerge: boolean = true) => {
            try {
              const results = await Promise.all(
                chain.map(async (api) => {
                  const validateResult = await api.validate();
                  if (!validateResult.valid) {
                    return;
                  }
                  const rawValues = toRaw((await api.getValues()) || {});
                  return rawValues;
                }),
              );
              
              if (results.some(r => !r)) {
                  return; // Validation failed
              }
              
              if (needMerge) {
                const mergedResults = Object.assign({}, ...results);
                return mergedResults;
              }
              return results;
            } catch (error) {
              console.error('Validation error:', error);
            }
          };
        }
        return target[prop];
      },
    });

    return proxy;
  }

  /**
   * 挂载表单
   * Mount form
   * 
   * @param formActions vee-validate 上下文
   * @param componentRefMap 组件引用映射
   */
  mount(formActions: FormActions, componentRefMap?: Map<string, unknown>) {
    if (!this.isMounted) {
      this.form = formActions;
      this.stateHandler.setConditionTrue();
      
      // 记录初始提交值
      this.setLatestSubmissionValues({
        ...toRaw(this.handleRangeTimeValue(this.form.values)),
      });
      
      if (componentRefMap) {
        this.componentRefMap = componentRefMap;
      }
      this.isMounted = true;
    }
  }

  /**
   * 根据字段名移除 Schema
   * Remove schema by fields
   */
  async removeSchemaByFields(fields: string[]) {
    const fieldSet = new Set(fields);
    const schema = this.state?.schema ?? [];

    const filterSchema = schema.filter((item) => item.fieldName && !fieldSet.has(item.fieldName));

    this.setState({
      schema: filterSchema,
    });
  }

  /**
   * 重置表单
   * Reset form
   */
  async resetForm(
    state?: Partial<FormState<GenericObject>> | undefined,
    opts?: Partial<ResetFormOpts>,
  ) {
    const form = await this.getForm();

    // 为所有 schema 字段构造空值，确保收起（未挂载）的字段也能被正确重置
    const schema = this.state?.schema || [];
    const emptyValues: Record<string, any> = {};
    schema.forEach(item => {
      if (item.fieldName) {
        emptyValues[item.fieldName] = undefined;
      }
    });

    return form.resetForm({
      ...state,
      values: { ...emptyValues, ...(state?.values || {}) },
    }, opts);
  }

  /**
   * 重置验证状态
   * Reset validation
   */
  async resetValidate() {
    const form = await this.getForm();
    const fields = Object.keys(form.errors.value);
    fields.forEach((field) => {
      form.setFieldError(field, undefined);
    });
  }

  /**
   * 滚动到第一个错误字段
   * Scroll to first error field
   */
  scrollToFirstError(errors: Record<string, any> | string) {
    const firstErrorFieldName =
      typeof errors === 'string' ? errors : Object.keys(errors)[0];

    if (!firstErrorFieldName) {
      return;
    }

    let el = document.querySelector(
      `[name="${firstErrorFieldName}"]`,
    ) as HTMLElement;

    // 如果通过 name 属性找不到，尝试通过组件引用查找
    if (!el) {
      const componentRef = this.getFieldComponentRef(firstErrorFieldName);
      if (componentRef && (componentRef as any).$el instanceof HTMLElement) {
        el = (componentRef as any).$el;
      } else if (componentRef instanceof HTMLElement) {
          el = componentRef;
      }
    }

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }

  /**
   * 设置单个字段值
   * Set field value
   *
   * @param field 字段名，支持嵌套路径 (如 'user.name', 'items[0].id')
   * @param value 字段值
   * @param shouldValidate 是否触发验证
   */
  async setFieldValue(field: string, value: any, shouldValidate?: boolean) {
    const form = await this.getForm();

    // 检查是否为嵌套路径 (包含 . 或 [)
    if (field.includes('.') || field.includes('[')) {
      // 使用 lodash 的 set 处理嵌套路径
      const currentValues = { ...form.values };
      const newValues = lodashSet(currentValues, field, value);
      form.setValues(newValues, shouldValidate);
    } else {
      // 简单路径直接设置
      form.setValues({ [field]: value }, shouldValidate);
    }
  }

  /**
   * 设置最后一次提交的值
   * Set latest submission values
   */
  setLatestSubmissionValues(values: null | Record<string, any>) {
    this.latestSubmissionValues = { ...toRaw(values) };
  }

  /**
   * 更新状态
   * Update state
   */
  setState(
    stateOrFn:
      | ((prev: SunnyFormProps) => Partial<SunnyFormProps>)
      | Partial<SunnyFormProps>,
  ) {
    if (isFunction(stateOrFn)) {
      this.store.setState((prev) => {
        return mergeWithArrayOverride(prev, stateOrFn(prev));
      });
    } else {
      this.store.setState((prev) => mergeWithArrayOverride(prev, stateOrFn));
    }
  }

  /**
   * 设置表单值
   * Set form values
   *
   * @param fields 值对象，支持嵌套路径 (如 { 'user.name': 'John', 'items[0].id': 1 })
   * @param filterFields 是否过滤不在 schema 中的字段 (默认 true)
   * @param shouldValidate 是否触发验证 (默认 false)
   */
  async setValues(
    fields: Record<string, any>,
    filterFields: boolean = true,
    shouldValidate: boolean = false,
  ) {
    const form = await this.getForm();
    const currentValues = form.values || {};

    // 处理值字符串转对象数组（反向转换 objectToValueFields）
    // Transform value string to object array (reverse transformation for objectToValueFields)
    const processedFields = { ...fields };
    this.handleValueToObjectFields(processedFields);

    // 检查是否有嵌套路径的 key
    const hasNestedPath = Object.keys(processedFields).some(
      key => key.includes('.') || key.includes('[')
    );

    if (hasNestedPath) {
      // 处理嵌套路径
      let newValues = { ...currentValues };
      for (const [key, value] of Object.entries(processedFields)) {
        newValues = lodashSet(newValues, key, value);
      }

      if (filterFields) {
        // 过滤：只保留当前 form.values 中存在的字段
        newValues = this.filterNestedValues(newValues, currentValues);
      }

      form.setValues(newValues, shouldValidate);
      return;
    }

    // 简单路径处理
    if (!filterFields) {
      form.setValues(processedFields, shouldValidate);
      return;
    }

    // 智能合并与过滤 (Smart merge and filter)
    const filteredFields = this.filterAndMergeValues(processedFields, currentValues);
    form.setValues(filteredFields, shouldValidate);
  }

  /**
   * 过滤嵌套路径的值
   * Filter nested path values
   * 只保留目标对象中存在的路径
   */
  private filterNestedValues(source: any, target: any): any {
    if (!isObject(source) || !isObject(target)) return source;
    if (Array.isArray(source)) return source;

    const result: Record<string, any> = {};

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        // 只有 target 中存在的 key 才会被保留
        if (key in target) {
          const sourceVal = source[key];
          const targetVal = target[key];

          if (
            isObject(sourceVal) &&
            !Array.isArray(sourceVal) &&
            !isDate(sourceVal) &&
            !isDayjsObject(sourceVal) &&
            isObject(targetVal) &&
            !Array.isArray(targetVal) &&
            !isDate(targetVal) &&
            !isDayjsObject(targetVal)
          ) {
            // 递归过滤
            result[key] = this.filterNestedValues(sourceVal, targetVal);
          } else {
            // 直接覆盖
            result[key] = sourceVal;
          }
        }
      }
    }
    return result;
  }

  /**
   * 过滤并合并值
   * Filter and merge values
   */
  private filterAndMergeValues(source: any, target: any): any {
    if (!isObject(source) || !isObject(target)) return source;
    if (Array.isArray(source)) return source;

    const result: Record<string, any> = {};

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (key in target) {
          const sourceVal = source[key];
          const targetVal = target[key];

          if (
            isObject(sourceVal) &&
            !Array.isArray(sourceVal) &&
            !isDate(sourceVal) &&
            !isDayjsObject(sourceVal) &&
            isObject(targetVal) &&
            !Array.isArray(targetVal) &&
            !isDate(targetVal) &&
            !isDayjsObject(targetVal)
          ) {
            result[key] = this.filterAndMergeValues(sourceVal, targetVal);
          } else {
            result[key] = sourceVal;
          }
        }
      }
    }
    return result;
  }

  /**
   * 重置并设置表单值 (Alias for setValues to be compatible with legacy code)
   */
  async resetValues(fields: Record<string, any>) {
    return this.setValues(fields);
  }

  /**
   * 提交表单
   * Submit form
   */
  async submitForm(e?: Event) {
    e?.preventDefault();
    e?.stopPropagation();
    const form = await this.getForm();
    
    const { valid, errors } = await form.validate();
    const rawValues = toRaw(await this.getValues());

    if (valid) {
      await this.state?.handleSubmit?.(rawValues);
    } else {
      if (this.state?.scrollToFirstError) {
        this.scrollToFirstError(errors);
      }
    }

    return { valid, values: rawValues, errors };
  }

  /**
   * 卸载表单
   * Unmount form
   */
  unmount() {
    this.form?.resetForm?.();
    this.latestSubmissionValues = null;
    this.isMounted = false;
    this.stateHandler.reset();
  }

  /**
   * 更新 Schema
   * Update schema
   */
  updateSchema(schema: Partial<FormSchema>[]) {
    const updated: Partial<FormSchema>[] = [...schema];
    const hasField = updated.every(
      (item) => Reflect.has(item, 'fieldName') && item.fieldName,
    );

    if (!hasField) {
      console.error(
        'All items in the schema array must have a valid `fieldName` property to be updated',
      );
      return;
    }
    const currentSchema = cloneDeep(this.state?.schema ?? []);

    const updatedMap: Record<string, any> = {};

    updated.forEach((item) => {
      if (item.fieldName) {
        updatedMap[item.fieldName] = item;
      }
    });

    currentSchema.forEach((schema, index) => {
      if (!schema.fieldName) return;
      const updatedData = updatedMap[schema.fieldName];
      if (updatedData) {
        // 使用 mergeWithArrayOverride 合并 schema 更新
        currentSchema[index] = mergeWithArrayOverride(
            schema,
            updatedData
        ) as FormSchema;
      }
    });
    this.setState({ schema: currentSchema });
  }

  /**
   * 验证表单
   * Validate form
   */
  async validate(opts?: Partial<ValidationOptions>) {
    const form = await this.getForm();

    const validateResult = await form.validate(opts);

    if (Object.keys(validateResult?.errors ?? {}).length > 0) {
      console.error('validate error', validateResult?.errors);

      if (this.state?.scrollToFirstError) {
        this.scrollToFirstError(validateResult.errors);
      }
    }
    return validateResult;
  }

  /**
   * 验证并提交表单
   * Validate and submit form
   */
  async validateAndSubmitForm() {
    const form = await this.getForm();
    const { valid, errors } = await form.validate();
    if (!valid) {
      if (this.state?.scrollToFirstError) {
        this.scrollToFirstError(errors);
      }
      return;
    }
    return await this.submitForm();
  }

  /**
   * 验证单个字段
   * Validate single field
   */
  async validateField(fieldName: string, opts?: Partial<ValidationOptions>) {
    const form = await this.getForm();
    const validateResult = await form.validateField(fieldName, opts);

    if (Object.keys(validateResult?.errors ?? {}).length > 0) {
      console.error('validate error', validateResult?.errors);

      if (this.state?.scrollToFirstError) {
        this.scrollToFirstError(fieldName);
      }
    }
    return validateResult;
  }

  // ==========================================
  // 私有方法 (Private Methods)
  // ==========================================

  /**
   * 获取表单实例 (内部使用，自动等待挂载)
   * Get form instance (Internal, waits for mount)
   */
  private async getForm() {
    if (!this.isMounted) {
      // 等待 form 挂载
      await this.stateHandler.waitForCondition();
    }
    if (!this.form?.meta) {
      throw new Error('<SunnyUseForm /> is not mounted');
    }
    return this.form;
  }

  /**
   * 处理多字段 (Array to String)
   * Handle multi-fields
   */
  private handleMultiFields = (originValues: Record<string, any>) => {
    const arrayToStringFields = this.state?.arrayToStringFields;
    if (!arrayToStringFields || !Array.isArray(arrayToStringFields)) {
      return;
    }

    const processFields = (fields: string[], separator: string = ',') => {
      this.processFields(fields, separator, originValues, (value, sep) => {
        if (Array.isArray(value)) {
          return value.join(sep);
        } else if (typeof value === 'string') {
          // 处理空字符串
          if (value === '') {
            return [];
          }
          // 处理复杂分隔符
          const escapedSeparator = sep.replaceAll(
            /[.*+?^${}()|[\]\\]/g,
            String.raw`\$&`,
          );
          return value.split(new RegExp(escapedSeparator));
        } else {
          return value;
        }
      });
    };

    // 1. 简单数组格式: ['field1', 'field2']
    if (arrayToStringFields.every((item) => typeof item === 'string')) {
      const lastItem = arrayToStringFields[arrayToStringFields.length - 1] as string || '';
      const fields = lastItem.length === 1 
        ? (arrayToStringFields.slice(0, -1) as string[])
        : (arrayToStringFields as string[]);
      const separator = lastItem.length === 1 ? lastItem : ',';
      
      processFields(fields, separator);
      return;
    }

    // 2. 嵌套数组格式: [['field1'], ';']
    arrayToStringFields.forEach((fieldConfig) => {
      if (Array.isArray(fieldConfig)) {
        const [fields, separator = ','] = fieldConfig;
        if (!Array.isArray(fields)) {
          console.warn(
            `Invalid field configuration: fields should be an array of strings, got ${typeof fields}`,
          );
          return;
        }
        processFields(fields, separator);
      }
    });
  };

  /**
   * 处理对象数组转值字符串
   * Handle object array to value string
   */
  private handleObjectToValueFields = (originValues: Record<string, any>) => {
    const objectToValueFields = this.state?.objectToValueFields;
    if (!objectToValueFields || !Array.isArray(objectToValueFields)) {
      return;
    }

    objectToValueFields.forEach((field) => {
      const value = originValues[field];
      if (!Array.isArray(value) || value.length === 0) {
        return;
      }

      // Find schema item
      const schemaItem = this.state?.schema?.find(
        (item) => item.fieldName === field,
      );
      if (!schemaItem) return;

      // Resolve componentProps
      let componentProps = schemaItem.componentProps;
      if (typeof componentProps === 'function') {
        try {
          // Attempt to resolve props with current values
          // Note: This might be partial if called during form init, but sufficient for static configs
          componentProps = componentProps(originValues, this.form);
        } catch (e) {
          console.warn(
            `[SunnyForm] Failed to resolve componentProps for field ${field}`,
            e,
          );
          return;
        }
      }

      // Get value key from fieldNames
      // Try modalProps.fieldNames (common in search-modal) or fieldNames (common in select/tree)
      const fieldNames =
        componentProps?.modalProps?.fieldNames || componentProps?.fieldNames;
      const valueKey = fieldNames?.value;

      if (!valueKey) {
        return;
      }

      const labelKey = fieldNames?.label || 'label';
      const result = transformToString(value, { valueKey, labelKey });

      originValues[field] = result.value;

      // 回写 displayField
      const displayField = componentProps?.displayField;
      if (displayField) {
        originValues[displayField] = result.displayValue;
      }
    });
  };

  /**
   * 处理值字符串转对象数组（反向转换）
   * Handle value string to object array (reverse transformation)
   * 将 "1,2,3" 转换为 [{ [valueKey]: '1' }, { [valueKey]: '2' }, { [valueKey]: '3' }]
   */
  private handleValueToObjectFields = (originValues: Record<string, any>) => {
    const objectToValueFields = this.state?.objectToValueFields;
    if (!objectToValueFields || !Array.isArray(objectToValueFields)) {
      return;
    }

    objectToValueFields.forEach((field) => {
      const value = originValues[field];

      // 只处理字符串类型的值
      if (typeof value !== 'string' || value === '') {
        return;
      }

      // 如果已经是数组，跳过
      if (Array.isArray(value)) {
        return;
      }

      // Find schema item
      const schemaItem = this.state?.schema?.find(
        (item) => item.fieldName === field,
      );
      if (!schemaItem) return;

      // Resolve componentProps
      let componentProps = schemaItem.componentProps;
      if (typeof componentProps === 'function') {
        try {
          componentProps = componentProps(originValues, this.form);
        } catch (e) {
          console.warn(
            `[SunnyForm] Failed to resolve componentProps for field ${field}`,
            e,
          );
          return;
        }
      }

      // Get fieldNames from componentProps
      // Try modalProps.fieldNames (common in search-modal) or fieldNames (common in select/tree)
      const fieldNames =
        componentProps?.modalProps?.fieldNames || componentProps?.fieldNames;
      const valueKey = fieldNames?.value || 'value';
      const labelKey = fieldNames?.label || 'label';

      if (!fieldNames?.value) {
        return;
      }

      // 从 displayField 读取 label 字符串，无则回退为 value
      const displayField = componentProps?.displayField;
      const displayValue = displayField && originValues[displayField]
        ? String(originValues[displayField])
        : undefined;

      originValues[field] = transformToObjectArray(value, { valueKey, labelKey }, displayValue);
    });
  };

  /**
   * 处理时间范围值 (Range Time Value)
   * Handle range time value
   */
  private handleRangeTimeValue = (originValues: Record<string, any>) => {
    const values = { ...originValues };
    const fieldMappingTime = this.state?.fieldMappingTime;

    this.handleMultiFields(values);
    this.handleObjectToValueFields(values);
    if (!fieldMappingTime || !Array.isArray(fieldMappingTime)) {
      return values;
    }

    fieldMappingTime.forEach(
      ([field, [startTimeKey, endTimeKey], format = 'YYYY-MM-DD']) => {
        if (startTimeKey && endTimeKey && values[field] === null) {
          Reflect.deleteProperty(values, startTimeKey);
          Reflect.deleteProperty(values, endTimeKey);
        }

        if (!values[field]) {
          Reflect.deleteProperty(values, field);
          return;
        }

        const [startTime, endTime] = values[field];
        if (format === null) {
          values[startTimeKey] = startTime;
          values[endTimeKey] = endTime;
        } else if (isFunction(format)) {
          values[startTimeKey] = format(startTime, field);
          values[endTimeKey] = format(endTime, field);
        } else {
          const [startTimeFormat, endTimeFormat] = Array.isArray(format)
            ? format
            : [format, format];
          values[startTimeKey] = startTime
            ? formatDate(startTime, startTimeFormat)
            : undefined;
          values[endTimeKey] = endTime
            ? formatDate(endTime, endTimeFormat)
            : undefined;
        }
        Reflect.deleteProperty(values, field);
      },
    );
    return values;
  };

  /**
   * 字段处理通用逻辑
   * Process fields helper
   */
  private processFields = (
    fields: string[],
    separator: string,
    originValues: Record<string, any>,
    transformFn: (value: any, separator: string) => any,
  ) => {
    fields.forEach((field) => {
      const value = originValues[field];
      if (value === undefined || value === null) {
        return;
      }
      originValues[field] = transformFn(value, separator);
    });
  };

  /**
   * 更新状态 (Diff 处理)
   * Update State (Diff logic)
   */
  private updateState() {
    const currentSchema = this.state?.schema ?? [];
    const prevSchema = this.prevState?.schema ?? [];
    // 进行了删除 schema 操作
    if (currentSchema.length < prevSchema.length) {
      const currentFields = new Set(
        currentSchema.map((item) => item.fieldName),
      );
      const deletedSchema = prevSchema.filter(
        (item) => !currentFields.has(item.fieldName),
      );
      for (const schema of deletedSchema) {
        if (schema.fieldName) {
          this.form?.setFieldValue?.(schema.fieldName, undefined);
        }
      }
    }
  }

  // 类型定义占位，实际在 useSunnyForm 中注入实现
  // Type definition placeholder, actual implementation injected in useSunnyForm
  useStore?: <T = SunnyFormProps>(selector?: (state: SunnyFormProps) => T) => any;
}
