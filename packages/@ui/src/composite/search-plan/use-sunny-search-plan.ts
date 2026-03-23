import { ref, computed, type SetupContext } from 'vue';
// @ts-ignore
import { Message } from '@arco-design/web-vue';
import type { SunnySearchPlanProps, SunnySearchPlanEmits, SearchPlanItem } from './types';
import type { SearchPlanApi } from './api';
import { defaultSearchPlanApi } from './api';

export interface UseSunnySearchPlanReturn {
  visible: ReturnType<typeof ref<boolean>>;
  inputValue: ReturnType<typeof ref<string>>;
  showNameError: ReturnType<typeof ref<boolean>>;
  handleAdd: () => Promise<void>;
  handleUpdate: () => Promise<void>;
  handleDelete: (plan: SearchPlanItem) => Promise<void>;
  handleSelect: (plan: SearchPlanItem) => Promise<void>;
  handleReset: () => Promise<void>;
  handleSearch: () => Promise<void>;
  handleClose: () => void;
  handleOpen: () => void;
  loadSearchPlans: (resourceId: string) => Promise<SearchPlanItem[]>;
  loadDefaultSearchPlan: () => Promise<Record<string, any>>;
}

import type { FormApi } from '../../entry/form';

export function useSunnySearchPlan(
  props: SunnySearchPlanProps,
  emit: SetupContext<(keyof SunnySearchPlanEmits)[]>['emit'],
  localModel?: ReturnType<typeof ref<Record<string, any>>>,
  formApi?: FormApi,
  api: SearchPlanApi = defaultSearchPlanApi
): UseSunnySearchPlanReturn {
  const visible = ref(false);
  const inputValue = ref('');
  const showNameError = ref(false);

  /**
   * 新增查询方案
   */
  const handleAdd = async () => {
    // 检查查询方案名称是否必填
    if (props.searchPlanList.length > 0 && !inputValue.value.trim()) {
      showNameError.value = true;
      return;
    }
    showNameError.value = false;
    // 使用formApi获取最新的表单值
    let formValues = localModel?.value || props.model;
    if (formApi) {
      try {
        const values = await formApi.getValues();
        if (values) {
          formValues = values;
        }
      } catch (error) {

      }
    }
    
    // 处理表单值，将对象数组转换为简单数组，并将数组中的值转为字符串
    const processedFormValues: Record<string, any> = { ...formValues };
    
    // 处理所有数组类型的值
    Object.keys(processedFormValues).forEach(key => {
      const value = processedFormValues[key];
      if (Array.isArray(value)) {
        // 检查是否为业务搜索字段
        const isBusinessSearch = props.formConfig?.some(field => 
          field.fieldName === key && field.component && 
          (field.component.name === 'SunnyBusinessSearch' || field.component === 'SunnyBusinessSearch')
        );
        
        if (isBusinessSearch) {
          // 对于业务搜索字段，保存完整的对象数组为JSON字符串
          processedFormValues[key] = JSON.stringify(value);
        } else {
          // 对于其他数组类型的值，确保数组中的元素都是字符串
          processedFormValues[key] = value.map(item => {
            // 如果是对象，提取value字段
            let itemValue = item;
            if (typeof item === 'object' && item !== null) {
              // 尝试从不同的属性中获取值
              itemValue = item.value !== undefined ? item.value : 
                         item.ID !== undefined ? item.ID : 
                         item.id !== undefined ? item.id : item;
            }
            // 将值转换为字符串
            return typeof itemValue === 'string' ? itemValue : String(itemValue);
          });
        }
      }
    });
    
    // 检查是否有查询条件
    const hasSearchConditions = Object.values(processedFormValues).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '' && value !== undefined && value !== null;
    });
    
    if (!hasSearchConditions) {
      Message.error('请输入查询条件');
      return;
    }
    
    try {
      // 构建查询方案名称
      let planName = inputValue.value.trim();
      if (props.searchPlanList.length === 0) {
        planName = '默认方案';
      }
      
      const response = await api.insert({
        assSearchplan: {
          cSearchplanname: planName,
          ...(props.nResourceid && { nResourceid: props.nResourceid })
        },
        colMap: processedFormValues
      });
      
      // 显示成功提示
      if (response.message) {
        Message.success(response.message);
      }
      
      // 刷新查询方案列表
      if (props.resourceId) {
        const plans = await loadSearchPlans(props.resourceId);
        emit('update:searchPlanList', plans);
        
        // 找到新增的查询方案并自动选中
        const newPlan = plans.find(plan => plan.CSEARCHPLANNAME === planName);
        if (newPlan) {
          await handleSelect(newPlan);
        }
      }
      
      emit('add', planName, { ...processedFormValues });
      inputValue.value = '';
    } catch (error) {

      emit('error', error);
    }
  };

  /**
   * 覆盖查询方案
   */
  const handleUpdate = async () => {
    if (!props.currentSearchPlan) {
      showNameError.value = true;
      return;
    }
    showNameError.value = false;
    // 使用formApi获取最新的表单值
    let formValues = localModel?.value || props.model;
    if (formApi) {
      try {
        const values = await formApi.getValues();
        if (values) {
          formValues = values;
        }
      } catch (error) {

      }
    }
    
    // 处理表单值，将对象数组转换为简单数组，并将数组中的值转为字符串
    const processedFormValues: Record<string, any> = { ...formValues };
    
    // 处理所有数组类型的值
    Object.keys(processedFormValues).forEach(key => {
      const value = processedFormValues[key];
      if (Array.isArray(value)) {
        // 检查是否为业务搜索字段
        const isBusinessSearch = props.formConfig?.some(field => 
          field.fieldName === key && field.component && 
          (field.component.name === 'SunnyBusinessSearch' || field.component === 'SunnyBusinessSearch')
        );
        
        if (isBusinessSearch) {
          // 对于业务搜索字段，保存完整的对象数组为JSON字符串
          processedFormValues[key] = JSON.stringify(value);
        } else {
          // 对于其他数组类型的值，确保数组中的元素都是字符串
          processedFormValues[key] = value.map(item => {
            // 如果是对象，提取value字段
            let itemValue = item;
            if (typeof item === 'object' && item !== null) {
              // 尝试从不同的属性中获取值
              itemValue = item.value !== undefined ? item.value : 
                         item.ID !== undefined ? item.ID : 
                         item.id !== undefined ? item.id : item;
            }
            // 将值转换为字符串
            return typeof itemValue === 'string' ? itemValue : String(itemValue);
          });
        }
      }
    });
    
    // 检查是否有查询条件
    const hasSearchConditions = Object.values(processedFormValues).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '' && value !== undefined && value !== null;
    });
    
    if (!hasSearchConditions) {
      Message.error('请输入查询条件');
      return;
    }
    
    try {
      const response = await api.update({
        assSearchplan: {
          id: props.currentSearchPlan.ID,
          ...(props.nResourceid && { nResourceid: props.nResourceid }),
          ...(inputValue.value.trim() && { cSearchplanname: inputValue.value.trim() })
        },
        colMap: processedFormValues
      });
      
      // 显示成功提示
      if (response.message) {
        Message.success(response.message);
      }
      
      // 刷新查询方案列表
      if (props.resourceId) {
        const plans = await loadSearchPlans(props.resourceId);
        emit('update:searchPlanList', plans);
        
        // 找到更新的查询方案并自动选中
        const updatedPlan = plans.find(plan => plan.ID === props.currentSearchPlan?.ID);
        if (updatedPlan) {
          await handleSelect(updatedPlan);
        }
      }
      
      emit('update', props.currentSearchPlan?.ID, inputValue.value.trim() || props.currentSearchPlan?.CSEARCHPLANNAME, { ...processedFormValues });
      inputValue.value = '';
    } catch (error) {

      emit('error', error);
    }
  };

  /**
   * 删除查询方案
   */
  const handleDelete = async (plan: SearchPlanItem) => {
    try {
      const response = await api.del({ id: plan.ID });
      // 如果删除的是当前选中的查询方案，触发删除事件后，覆盖按钮会自动禁用
      // 因为父组件会更新 currentSearchPlan 为 undefined
      emit('delete', plan.ID);
      
      // 清除选中项
      if (props.currentSearchPlan && props.currentSearchPlan.ID === plan.ID) {
        emit('update:currentSearchPlan', undefined);
      }
      
      // 显示删除成功提示
      if (response.message) {
        Message.success(response.message);
      }
      // 刷新查询方案列表
      if (props.resourceId) {
        const plans = await loadSearchPlans(props.resourceId);
        emit('update:searchPlanList', plans);
      }
    } catch (error) {

      emit('error', error);
    }
  };

  /**
   * 选择查询方案
   */
  const handleSelect = async (plan: SearchPlanItem) => {
    // 先发射update:currentSearchPlan事件，更新父组件的currentSearchPlan，确保高亮显示
    emit('update:currentSearchPlan', plan);
    
    try {
      // 调用findSearchPlanColsByPlanId接口，传参格式为{"nResourceid": 103, "nPlanId": 1188}
      const params = {
        ...(props.nResourceid && { nResourceid: props.nResourceid }),
        nPlanId: plan.ID
      };
      const response = await api.findSearchPlanColsByPlanId(params);
      
      // 获取返回结果中的表单值
      let formValues = response.result || {};
      
      // 处理表单值，去除数组值中的空格，并将数组元素转换为字符串
      Object.keys(formValues).forEach(key => {
        let value = formValues[key];
        try {
          // 检查是否为业务搜索字段
          const isBusinessSearch = props.formConfig?.some(field => 
            field.fieldName === key && field.component && 
            (field.component.name === 'SunnyBusinessSearch' || field.component === 'SunnyBusinessSearch')
          );
          
          // 如果是业务搜索字段，特殊处理
          if (isBusinessSearch) {
            // 如果是字符串，尝试解析为JSON
            if (typeof value === 'string') {
              try {
                value = JSON.parse(value);

              } catch {
                // 如果解析失败，保持原值
              }
            }
            // 如果是数组，检查是否是字符串数组（可能是服务器错误解析的JSON）
            if (Array.isArray(value)) {
              // 检查是否所有元素都是字符串，并且看起来像是JSON的一部分
              const isStringArray = value.every(item => typeof item === 'string');
              if (isStringArray && value.length > 0) {
                // 尝试将字符串数组合并为完整的JSON字符串并解析
                try {
                  const combinedString = value.join('');
                  
                  // 尝试识别多个JSON对象
                  const objects: any[] = [];
                  let currentObject = '';
                  let braceCount = 0;
                  
                  for (let i = 0; i < combinedString.length; i++) {
                    const char = combinedString[i];
                    currentObject += char;
                    
                    if (char === '{') {
                      braceCount++;
                    } else if (char === '}') {
                      braceCount--;
                      if (braceCount === 0) {
                        // 找到一个完整的JSON对象
                        try {
                          objects.push(JSON.parse(currentObject));
                        } catch {
                          // 解析失败，忽略该对象
                        }
                        currentObject = '';
                      }
                    }
                  }
                  
                  if (objects.length > 0) {
                    value = objects;
                  } else {
                    // 尝试解析为单个对象
                    value = JSON.parse(combinedString);
                  }
                } catch {
                  // 如果解析失败，尝试手动构建多个对象
                  try {
                    const combinedString = value.join('');
                    const objects: any[] = [];
                    
                    // 分割字符串为多个对象
                    const objectStrings = combinedString.split('}{').map((str, index) => {
                      if (index === 0) return str + '}';
                      if (index === combinedString.split('}{').length - 1) return '{' + str;
                      return '{' + str + '}';
                    });
                    
                    // 处理每个对象字符串
                    objectStrings.forEach(objStr => {
                      if (objStr.trim()) {
                        // 提取键值对
                        const keyValuePairs = objStr.match(/"([^"]+)"\s*:\s*("[^"]*"|\d+)/g) || [];
                        const obj: any = {};
                        keyValuePairs.forEach(pair => {
                          const [key, val] = pair.split(/\s*:\s*/);
                          const cleanKey = key.replace(/"/g, '');
                          let cleanValue = val;
                          if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
                            cleanValue = cleanValue.substring(1, cleanValue.length - 1);
                          } else if (!isNaN(Number(cleanValue))) {
                            cleanValue = Number(cleanValue);
                          }
                          obj[cleanKey] = cleanValue;
                        });
                        if (Object.keys(obj).length > 0) {
                          objects.push(obj);
                        }
                      }
                    });
                    
                    if (objects.length > 0) {
                      value = objects;
                    }
                  } catch {
                    // 如果所有方法都失败，保持原值
                  }
                }
              }
            }
          } else {
            // 非业务搜索字段的处理
            // 如果是JSON字符串，尝试解析
            if (typeof value === 'string' && (value.startsWith('[') || value.includes(','))) {
              // 尝试JSON解析
              try {
                value = JSON.parse(value);
              } catch {
                // 如果JSON解析失败，尝试按逗号分割
                if (value.includes(',')) {
                  value = value.split(',').map((v: string) => v.trim());
                }
              }
            }
            // 如果是数组，去除每个元素的空格，并转换为字符串
            if (Array.isArray(value)) {
              value = value.map(item => {
                // 先去除空格，再转换为字符串
                const trimmedItem = typeof item === 'string' ? item.trim() : item;
                return String(trimmedItem);
              });
            }
          }
          formValues[key] = value;
        } catch (error) {

        }
      });
      
      // 处理业务搜索字段，将字符串数组或JSON字符串转换为对象数组
      props.formConfig?.forEach(field => {
        const fieldName = field.fieldName;
        let fieldValue = formValues[fieldName];
        
        // 检查是否为业务搜索字段
        if (fieldValue !== undefined && fieldValue !== null) {
          // 检查是否为BusinessSearch组件
          if (field.component && (field.component.name === 'SunnyBusinessSearch' || field.component === 'SunnyBusinessSearch')) {
            // 如果是字符串，尝试解析为JSON
            if (typeof fieldValue === 'string') {
              try {
                fieldValue = JSON.parse(fieldValue);
              } catch {
                // 如果解析失败，保持原值
              }
            }
            // 如果是数组，检查是否是字符串数组（可能是服务器错误解析的JSON）
            if (Array.isArray(fieldValue)) {
              // 检查是否所有元素都是字符串，并且看起来像是JSON的一部分
              const isStringArray = fieldValue.every(item => typeof item === 'string');
              if (isStringArray && fieldValue.length > 0) {
                // 尝试将字符串数组合并为完整的JSON字符串并解析
                try {
                  const combinedString = fieldValue.join('');
                  fieldValue = JSON.parse(combinedString);
                } catch {
                  // 如果解析失败，继续处理
                }
              }
              // 确保值是对象数组
              if (Array.isArray(fieldValue)) {
                // 如果是数组，确保每个元素都是对象
                formValues[fieldName] = fieldValue.map(value => {
                  // 如果已经是对象，直接返回
                  if (typeof value === 'object' && value !== null) {
                    return value;
                  }
                  // 否则创建对象，包含value属性
                  return { value: value };
                });
              } else if (typeof fieldValue === 'object' && fieldValue !== null) {
                // 如果是单个对象，包装为数组
                formValues[fieldName] = [fieldValue];
              } else {
                // 其他情况，保持原值
                formValues[fieldName] = fieldValue;
              }

            }
          }
        }
      });
      
      // 更新本地模型
      if (localModel) {
        localModel.value = { ...formValues };
      }
      
      // 使用 formApi 更新表单值
      if (formApi) {
        try {
          await formApi.setValues(formValues);
        } catch (error) {

        }
      }
      
      emit('select', plan);
    } catch (error) {

      emit('error', error);
    }
  };

  /**
   * 加载查询方案列表
   */
  const loadSearchPlans = async (resourceId: string): Promise<SearchPlanItem[]> => {
    try {
      const params = {
        ...(props.nResourceid && { nResourceid: props.nResourceid })
      };
      const response = await api.findAllByResourceid(params);
      // 严格通过result.searchplanList获取
      const searchplanList = response.result?.searchplanList || [];
      return searchplanList;
    } catch (error) {

      emit('error', error);
      return [];
    }
  };

  /**
   * 加载默认查询方案
   */
  const loadDefaultSearchPlan = async () => {
    try {
      const params = {
        ...(props.nResourceid && { nResourceid: props.nResourceid })
      };
      const response = await api.findDefSearchPlan(params);
      const result = response.result || [];
      if (result.length > 0) {
        // 构建表单值对象
        const formValues: Record<string, any> = {};
        result.forEach(item => {
          if (item.C_COLNAME && item.C_COLVALUE !== undefined) {
            formValues[item.C_COLNAME] = item.C_COLVALUE;
          }
        });
        
        // 处理表单值，去除数组值中的空格，并将数组元素转换为字符串
        Object.keys(formValues).forEach(key => {
          let value = formValues[key];
          try {
            // 检查是否为业务搜索字段
            const isBusinessSearch = props.formConfig?.some(field => 
              field.fieldName === key && field.component && 
              (field.component.name === 'SunnyBusinessSearch' || field.component === 'SunnyBusinessSearch')
            );
            
            // 如果是业务搜索字段，特殊处理
            if (isBusinessSearch) {
              // 如果是字符串，尝试解析为JSON
              if (typeof value === 'string') {
                try {
                  value = JSON.parse(value);
                } catch (error) {

                  // 如果解析失败，保持原值
                }
              }
              // 如果是数组，检查是否是字符串数组（可能是服务器错误解析的JSON）
              if (Array.isArray(value)) {
                // 检查是否所有元素都是字符串，并且看起来像是JSON的一部分
                const isStringArray = value.every(item => typeof item === 'string');
                if (isStringArray && value.length > 0) {
                  // 尝试将字符串数组合并为完整的JSON字符串并解析
                  try {
                    const combinedString = value.join('');
                    value = JSON.parse(combinedString);
                  } catch (error) {

                    // 如果解析失败，保持原值
                  }
                }
              }
            } else {
              // 非业务搜索字段的处理
              // 如果是JSON字符串，尝试解析
              if (typeof value === 'string' && (value.startsWith('[') || value.includes(','))) {
                // 尝试JSON解析
                try {
                  value = JSON.parse(value);
                } catch {
                  // 如果JSON解析失败，尝试按逗号分割
                  if (value.includes(',')) {
                    value = value.split(',').map((v: string) => v.trim());
                  }
                }
              }
              // 如果是数组，去除每个元素的空格，并转换为字符串
              if (Array.isArray(value)) {
                value = value.map(item => {
                  // 先去除空格，再转换为字符串
                  const trimmedItem = typeof item === 'string' ? item.trim() : item;
                  return String(trimmedItem);
                });
              }
            }
            formValues[key] = value;
          } catch (error) {
  
          }
        });
        
        // 处理业务搜索字段，将字符串数组或JSON字符串转换为对象数组
        props.formConfig?.forEach(field => {
          const fieldName = field.fieldName;
          let fieldValue = formValues[fieldName];
          
          // 检查是否为业务搜索字段
          if (fieldValue !== undefined && fieldValue !== null) {
            // 检查是否为BusinessSearch组件
            if (field.component && (field.component.name === 'SunnyBusinessSearch' || field.component === 'SunnyBusinessSearch')) {

              
              // 如果是字符串，尝试解析为JSON
              if (typeof fieldValue === 'string') {
                try {
                  fieldValue = JSON.parse(fieldValue);

                } catch (error) {

                  // 如果解析失败，保持原值
                }
              }
              // 如果是数组，检查是否是字符串数组（可能是服务器错误解析的JSON）
              if (Array.isArray(fieldValue)) {

                // 检查是否所有元素都是字符串，并且看起来像是JSON的一部分
                const isStringArray = fieldValue.every(item => typeof item === 'string');
                if (isStringArray && fieldValue.length > 0) {

                  // 尝试将字符串数组合并为完整的JSON字符串并解析
                  try {
                    const combinedString = fieldValue.join('');

                    
                    // 尝试识别多个JSON对象
                    const objects: any[] = [];
                    let currentObject = '';
                    let braceCount = 0;
                    
                    for (let i = 0; i < combinedString.length; i++) {
                      const char = combinedString[i];
                      currentObject += char;
                      
                      if (char === '{') {
                        braceCount++;
                      } else if (char === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                          // 找到一个完整的JSON对象
                          try {
                            objects.push(JSON.parse(currentObject));
                          } catch {
                            // 解析失败，忽略该对象
                          }
                          currentObject = '';
                        }
                      }
                    }
                    
                    if (objects.length > 0) {
                      fieldValue = objects;
                    } else {
                      // 尝试解析为单个对象
                      fieldValue = JSON.parse(combinedString);
                    }
                  } catch {
                    // 如果解析失败，尝试手动构建多个对象
                    try {
                      const combinedString = fieldValue.join('');
                      const objects: any[] = [];
                      
                      // 分割字符串为多个对象
                      const objectStrings = combinedString.split('}{').map((str, index) => {
                        if (index === 0) return str + '}';
                        if (index === combinedString.split('}{').length - 1) return '{' + str;
                        return '{' + str + '}';
                      });
                      
                      // 处理每个对象字符串
                      objectStrings.forEach(objStr => {
                        if (objStr.trim()) {
                          // 提取键值对
                          const keyValuePairs = objStr.match(/"([^"]+)"\s*:\s*("[^"]*"|\d+)/g) || [];
                          const obj: any = {};
                          keyValuePairs.forEach(pair => {
                            const [key, val] = pair.split(/\s*:\s*/);
                            const cleanKey = key.replace(/"/g, '');
                            let cleanValue = val;
                            if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
                              cleanValue = cleanValue.substring(1, cleanValue.length - 1);
                            } else if (!isNaN(Number(cleanValue))) {
                              cleanValue = Number(cleanValue);
                            }
                            obj[cleanKey] = cleanValue;
                          });
                          if (Object.keys(obj).length > 0) {
                            objects.push(obj);
                          }
                        }
                      });
                      
                      if (objects.length > 0) {
                        fieldValue = objects;
                      }
                    } catch {
                      // 如果所有方法都失败，保持原值
                    }
                  }
                }
                // 确保值是对象数组
                if (Array.isArray(fieldValue)) {
                  // 如果是数组，确保每个元素都是对象
                  formValues[fieldName] = fieldValue.map(value => {
                    // 如果已经是对象，直接返回
                    if (typeof value === 'object' && value !== null) {
                      return value;
                    }
                    // 否则创建对象，包含value属性
                    return { value: value };
                  });
                } else if (typeof fieldValue === 'object' && fieldValue !== null) {
                  // 如果是单个对象，包装为数组
                  formValues[fieldName] = [fieldValue];
                } else {
                  // 其他情况，保持原值
                  formValues[fieldName] = fieldValue;
                }
  
              }
            }
          }
        });
        
        // 更新本地模型
        if (localModel) {
          localModel.value = { ...formValues };
        }
        
        // 使用 formApi 更新表单值
        if (formApi) {
          try {
            await formApi.setValues(formValues);
          } catch (error) {

          }
        }
        
        // 发射默认查询方案加载完成事件
        emit('default-plan-loaded', formValues);
        return formValues;
      }
      // 没有默认查询方案时，发射空对象
      emit('default-plan-loaded', {});
      return {};
    } catch (error) {

      emit('error', error);
      // 发生错误时，也发射事件
      emit('default-plan-loaded', {});
      return {};
    }
  };

  /**
   * 重置表单
   */
  const handleReset = async () => {
    if (formApi) {
      try {
        // 使用formApi重置表单值
        await formApi.resetForm();
      } catch (error) {

      }
    }
    if (localModel) {
      // 清空本地表单模型的值，保持对象结构
      const emptyModel = { ...localModel.value };
      Object.keys(emptyModel).forEach(key => {
        emptyModel[key] = '';
      });
      // 创建新对象确保响应式更新
      localModel.value = emptyModel;
    }
  };

  /**
   * 执行搜索
   */
  const handleSearch = async () => {
    // 使用formApi获取最新的表单值
    let formValues = localModel?.value || props.model;
    if (formApi) {
      try {
        const values = await formApi.getValues();
        if (values) {
          formValues = values;
        }
      } catch (error) {

      }
    }
    // 转换为普通对象，避免Proxy包装
    emit('search', { ...formValues });
    visible.value = false;
  };

  /**
   * 关闭弹窗
   */
  const handleClose = () => {
    visible.value = false;
    inputValue.value = '';
    showNameError.value = false;
  };

  /**
   * 打开弹窗
   */
  const handleOpen = async () => {
    visible.value = true;
    inputValue.value = '';
    showNameError.value = false;
    // 打开弹窗时清空表单值 - 创建新对象确保响应式更新
    if (localModel) {
      const emptyModel = { ...localModel.value };
      Object.keys(emptyModel).forEach(key => {
        emptyModel[key] = '';
      });
      localModel.value = emptyModel;
    }
    // 使用 formApi 重置表单值，确保弹窗中的表单数据被正确清空
    if (formApi) {
      try {
        await formApi.resetForm();
      } catch (error) {

      }
    }
    
    // 打开弹窗时加载查询方案列表
    if (props.resourceId) {
      try {
        const plans = await loadSearchPlans(props.resourceId);
        emit('update:searchPlanList', plans);
        
        // 如果查询方案列表长度大于0，自动选中第一个查询方案
        if (plans.length > 0) {
          // 直接发射update:currentSearchPlan事件，更新父组件的currentSearchPlan
          emit('update:currentSearchPlan', plans[0]);
          
          // 然后调用findSearchPlanColsByPlanId接口获取表单值
          const params = {
            ...(props.nResourceid && { nResourceid: props.nResourceid }),
            nPlanId: plans[0].ID
          };
          const response = await api.findSearchPlanColsByPlanId(params);
          
          // 获取返回结果中的表单值
          let formValues = response.result || {};
          
          // 处理表单值，去除数组值中的空格，并将数组元素转换为字符串
          Object.keys(formValues).forEach(key => {
            let value = formValues[key];
            try {
              // 检查是否为业务搜索字段
              const isBusinessSearch = props.formConfig?.some(field => 
                field.fieldName === key && field.component && 
                (field.component.name === 'SunnyBusinessSearch' || field.component === 'SunnyBusinessSearch')
              );
              
              // 如果是业务搜索字段，特殊处理
              if (isBusinessSearch) {
                // 如果是字符串，尝试解析为JSON
                if (typeof value === 'string') {
                  try {
                    value = JSON.parse(value);
                  } catch (error) {
  
                    // 如果解析失败，保持原值
                  }
                }
                // 如果是数组，检查是否是字符串数组（可能是服务器错误解析的JSON）
                if (Array.isArray(value)) {
                  // 检查是否所有元素都是字符串，并且看起来像是JSON的一部分
                  const isStringArray = value.every(item => typeof item === 'string');
                  if (isStringArray && value.length > 0) {
                    // 尝试将字符串数组合并为完整的JSON字符串并解析
                    try {
                      const combinedString = value.join('');
                      value = JSON.parse(combinedString);
                    } catch (error) {
  
                      // 如果解析失败，保持原值
                    }
                  }
                }
              } else {
                // 非业务搜索字段的处理
                // 如果是JSON字符串，尝试解析
                if (typeof value === 'string' && (value.startsWith('[') || value.includes(','))) {
                  // 尝试JSON解析
                  try {
                    value = JSON.parse(value);
                  } catch {
                    // 如果JSON解析失败，尝试按逗号分割
                    if (value.includes(',')) {
                      value = value.split(',').map((v: string) => v.trim());
                    }
                  }
                }
                // 如果是数组，去除每个元素的空格，并转换为字符串
                if (Array.isArray(value)) {
                  value = value.map(item => {
                    // 先去除空格，再转换为字符串
                    const trimmedItem = typeof item === 'string' ? item.trim() : item;
                    return String(trimmedItem);
                  });
                }
              }
              formValues[key] = value;
            } catch (error) {
    
            }
          });
          
          // 处理业务搜索字段，将字符串数组或JSON字符串转换为对象数组
          props.formConfig?.forEach(field => {
            const fieldName = field.fieldName;
            let fieldValue = formValues[fieldName];
            
            // 检查是否为业务搜索字段
            if (fieldValue !== undefined && fieldValue !== null) {
              // 检查是否为BusinessSearch组件
              if (field.component && (field.component.name === 'SunnyBusinessSearch' || field.component === 'SunnyBusinessSearch')) {

                
                // 如果是字符串，尝试解析为JSON
                if (typeof fieldValue === 'string') {
                  try {
                    fieldValue = JSON.parse(fieldValue);
  
                  } catch (error) {
  
                    // 如果解析失败，保持原值
                  }
                }
                // 如果是数组，检查是否是字符串数组（可能是服务器错误解析的JSON）
                if (Array.isArray(fieldValue)) {

                  // 检查是否所有元素都是字符串，并且看起来像是JSON的一部分
                  const isStringArray = fieldValue.every(item => typeof item === 'string');
                  if (isStringArray && fieldValue.length > 0) {

                    // 尝试将字符串数组合并为完整的JSON字符串并解析
                    try {
                      const combinedString = fieldValue.join('');

                      
                      // 尝试识别多个JSON对象
                      const objects: any[] = [];
                      let currentObject = '';
                      let braceCount = 0;
                      
                      for (let i = 0; i < combinedString.length; i++) {
                        const char = combinedString[i];
                        currentObject += char;
                        
                        if (char === '{') {
                          braceCount++;
                        } else if (char === '}') {
                          braceCount--;
                          if (braceCount === 0) {
                            // 找到一个完整的JSON对象
                            try {
                            objects.push(JSON.parse(currentObject));
                          } catch {
                            // 解析失败，忽略该对象
                          }
                            currentObject = '';
                          }
                        }
                      }
                      
                      if (objects.length > 0) {
                        fieldValue = objects;
                      } else {
                        // 尝试解析为单个对象
                        fieldValue = JSON.parse(combinedString);
                      }
                    } catch {
                      // 如果解析失败，尝试手动构建多个对象
                      try {
                        const combinedString = fieldValue.join('');
                        const objects: any[] = [];
                        
                        // 分割字符串为多个对象
                        const objectStrings = combinedString.split('}{').map((str, index) => {
                          if (index === 0) return str + '}';
                          if (index === combinedString.split('}{').length - 1) return '{' + str;
                          return '{' + str + '}';
                        });
                        
                        // 处理每个对象字符串
                        objectStrings.forEach(objStr => {
                          if (objStr.trim()) {
                            // 提取键值对
                            const keyValuePairs = objStr.match(/"([^"]+)"\s*:\s*("[^"]*"|\d+)/g) || [];
                            const obj: any = {};
                            keyValuePairs.forEach(pair => {
                              const [key, val] = pair.split(/\s*:\s*/);
                              const cleanKey = key.replace(/"/g, '');
                              let cleanValue = val;
                              if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
                                cleanValue = cleanValue.substring(1, cleanValue.length - 1);
                              } else if (!isNaN(Number(cleanValue))) {
                                cleanValue = Number(cleanValue);
                              }
                              obj[cleanKey] = cleanValue;
                            });
                            if (Object.keys(obj).length > 0) {
                              objects.push(obj);
                            }
                          }
                        });
                        
                        if (objects.length > 0) {
                          fieldValue = objects;
                        }
                      } catch {
                        // 如果所有方法都失败，保持原值
                      }
                    }
                  }
                  // 确保值是对象数组
                  if (Array.isArray(fieldValue)) {
                    // 如果是数组，确保每个元素都是对象
                    formValues[fieldName] = fieldValue.map(value => {
                      // 如果已经是对象，直接返回
                      if (typeof value === 'object' && value !== null) {
                        return value;
                      }
                      // 否则创建对象，包含value属性
                      return { value: value };
                    });
                  } else if (typeof fieldValue === 'object' && fieldValue !== null) {
                    // 如果是单个对象，包装为数组
                    formValues[fieldName] = [fieldValue];
                  } else {
                    // 其他情况，保持原值
                    formValues[fieldName] = fieldValue;
                  }

                }
              }
            }
          });
          
          // 更新本地模型
          if (localModel) {
            localModel.value = { ...formValues };
          }
          
          // 使用 formApi 更新表单值
          if (formApi) {
            try {
              await formApi.setValues(formValues);
            } catch (error) {

            }
          }
          
          emit('select', plans[0]);
        }
      } catch (error) {

      }
    }
  };

  return {
    visible,
    inputValue,
    showNameError,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleSelect,
    handleReset,
    handleSearch,
    handleClose,
    handleOpen,
    loadSearchPlans,
    loadDefaultSearchPlan
  };
}
