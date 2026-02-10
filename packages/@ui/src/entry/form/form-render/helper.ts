import type {
  ZodObject,
  ZodDefault,
  ZodNumber,
  ZodString,
  ZodTypeAny,
} from 'zod';

import { isObject, isString } from '@sunny-base-web/utils';

/**
 * 获取最底层的 Zod 类型
 * Get the lowest level Zod type.
 * 这将解包可选类型(optionals)、细化类型(refinements)等
 * This will unpack optionals, refinements, etc.
 *
 * @param schema Zod 模式
 */
export function getBaseRules<
  ChildType extends ZodObject<any> | ZodTypeAny = ZodTypeAny,
>(schema: ChildType | any): ChildType | null {


  if (!schema || isString(schema)) return null;
  
  // 如果是 ZodOptional 或 ZodNullable，递归获取内部类型
  if ('innerType' in schema._def)
    return getBaseRules(schema._def.innerType as ChildType);

  // 如果是 ZodEffects，递归获取 schema
  if ('schema' in schema._def)
    return getBaseRules(schema._def.schema as ChildType);

  return schema as ChildType;
}

/**
 * 在 Zod 堆栈中搜索 "ZodDefault" 并返回其默认值
 * Search for a "ZodDefault" in the Zod stack and return its value.
 *
 * @param schema Zod 模式
 */
export function getDefaultValueInZodStack(schema: ZodTypeAny): any {
  if (!schema || isString(schema)) {
    return;
  }
  const typedSchema = schema as unknown as ZodDefault<ZodNumber | ZodString>;

  // 如果直接是 ZodDefault，执行 defaultValue 函数
  if ((typedSchema._def as any).typeName === 'ZodDefault') {
    const defaultVal = (typedSchema._def as any).defaultValue();
    return defaultVal;
  }

  // 递归查找 innerType

  if ('innerType' in typedSchema._def) {
    return getDefaultValueInZodStack(
      typedSchema._def.innerType as unknown as ZodTypeAny,
    );
  }
  // 递归查找 schema (ZodEffects)
  if ('schema' in typedSchema._def) {
    return getDefaultValueInZodStack(
      (typedSchema._def as any).schema as ZodTypeAny,
    );
  }

  return undefined;
}

/**
 * 判断对象是否像事件对象 (Event)
 * Determine if the object is like an Event object
 * 
 * @param obj 待检查的对象
 */
export function isEventObjectLike(obj: any) {
  if (!obj || !isObject(obj)) {
    return false;
  }
  // 检查是否有 target 属性和 stopPropagation 方法
  return Reflect.has(obj, 'target') && Reflect.has(obj, 'stopPropagation');
}


/**
 * 数组覆盖合并
 * Merge with array override
 * 
 * @param target 目标对象
 * @param source 源对象
 */
export function mergeWithArrayOverride(target: any, source: any) {
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
