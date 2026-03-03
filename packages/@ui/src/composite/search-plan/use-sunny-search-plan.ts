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
        console.error('handleAdd getValues error:', error);
      }
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
        colMap: formValues
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
      
      emit('add', planName, { ...formValues });
      inputValue.value = '';
    } catch (error) {
      console.error('handleAdd error:', error);
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
        console.error('handleUpdate getValues error:', error);
      }
    }
    
    try {
      const response = await api.update({
        assSearchplan: {
          id: props.currentSearchPlan.ID,
          ...(props.nResourceid && { nResourceid: props.nResourceid }),
          ...(inputValue.value.trim() && { cSearchplanname: inputValue.value.trim() })
        },
        colMap: formValues
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
      
      emit('update', props.currentSearchPlan.ID, inputValue.value.trim() || props.currentSearchPlan.CSEARCHPLANNAME, { ...formValues });
      inputValue.value = '';
    } catch (error) {
      console.error('handleUpdate error:', error);
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
      console.error('handleDelete error:', error);
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
      const formValues = response.result || {};
      
      // 更新本地模型
      if (localModel) {
        localModel.value = { ...formValues };
      }
      
      // 使用 formApi 更新表单值
      if (formApi) {
        try {
          await formApi.setValues(formValues);
        } catch (error) {
          console.error('handleSelect setValues error:', error);
        }
      }
      
      emit('select', plan);
    } catch (error) {
      console.error('handleSelect error:', error);
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
      console.error('loadSearchPlans error:', error);
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
        // 更新本地模型
        if (localModel) {
          localModel.value = { ...formValues };
        }
        
        // 使用 formApi 更新表单值
        if (formApi) {
          try {
            await formApi.setValues(formValues);
          } catch (error) {
            console.error('loadDefaultSearchPlan setValues error:', error);
          }
        }
        
        // 发射默认查询方案加载完成事件
        emit('default-plan-loaded', formValues);
        return formValues;
      }
    } catch (error) {
      console.error('loadDefaultSearchPlan error:', error);
      emit('error', error);
    }
    return {};
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
        console.error('handleReset resetForm error:', error);
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
        console.error('handleSearch getValues error:', error);
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
        console.error('handleOpen resetForm error:', error);
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
          const formValues = response.result || {};
          
          // 更新本地模型
          if (localModel) {
            localModel.value = { ...formValues };
          }
          
          // 使用 formApi 更新表单值
          if (formApi) {
            try {
              await formApi.setValues(formValues);
            } catch (error) {
              console.error('handleOpen setValues error:', error);
            }
          }
          
          emit('select', plans[0]);
        }
      } catch (error) {
        console.error('handleOpen loadSearchPlans error:', error);
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
