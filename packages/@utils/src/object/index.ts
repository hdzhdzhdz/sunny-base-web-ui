import { isObject } from '../is';

/**
 * 获取对象指定路径的值。如果解析出的值为 undefined，则返回默认值。
 * 
 * @param obj 要查询的对象。
 * @param path 要获取的属性路径。
 * @param defaultValue 解析值为 undefined 时返回的默认值。
 */
function get(obj: any, path: string, defaultValue?: any) {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
  }
  return result === undefined ? defaultValue : result;
}

/**
 * 设置对象指定路径的值。如果路径的一部分不存在，则自动创建。
 * 
 * @param obj 要修改的对象。
 * @param path 要设置的属性路径。
 * @param value 要设置的值。
 */
function set(obj: any, path: string, value: any) {
  if (!isObject(obj)) return obj;
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return obj;
}

/**
 * 深度合并两个对象。
 * 
 * @param target 目标对象。
 * @param source 源对象。
 */
function deepMerge(target: any, source: any) {
  if (!isObject(target) || !isObject(source)) return source;
  
  Object.keys(source).forEach(key => {
    const targetValue = target[key];
    const sourceValue = source[key];
    
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = deepMerge(targetValue, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });
  return target;
}

/**
 * 深度克隆对象。
 * 
 * @param obj 要克隆的对象。
 */
function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cloneDeep(item)) as any;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  // Basic object clone
  const clone = {} as any;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = cloneDeep((obj as any)[key]);
    }
  }
  return clone;
}

/**
 * 深度比较两个值是否相等
 * 
 * @param a 值A
 * @param b 值B
 */
function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || !isEqual(a[key], b[key])) {
      return false;
    }
  }
  return true;
}

export {
  cloneDeep,
  deepMerge,
  get,
  isEqual,
  set,
};
