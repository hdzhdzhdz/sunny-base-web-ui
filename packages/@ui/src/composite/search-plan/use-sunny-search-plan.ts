import { ref, computed, type SetupContext } from 'vue';
import type { SunnySearchPlanProps, SunnySearchPlanEmits, SearchPlanItem } from './types';

export interface UseSunnySearchPlanReturn {
  visible: ReturnType<typeof ref<boolean>>;
  inputValue: ReturnType<typeof ref<string>>;
  showNameError: ReturnType<typeof ref<boolean>>;
  handleAdd: () => void;
  handleUpdate: () => void;
  handleDelete: (plan: SearchPlanItem) => void;
  handleSelect: (plan: SearchPlanItem) => void;
  handleReset: () => Promise<void>;
  handleSearch: () => Promise<void>;
  handleClose: () => void;
  handleOpen: () => void;
}

import type { FormApi } from '../../entry/form';

export function useSunnySearchPlan(
  props: SunnySearchPlanProps,
  emit: SetupContext<(keyof SunnySearchPlanEmits)[]>['emit'],
  localModel?: ReturnType<typeof ref<Record<string, any>>>,
  formApi?: FormApi
): UseSunnySearchPlanReturn {
  const visible = ref(false);
  const inputValue = ref('');
  const showNameError = ref(false);

  /**
   * 新增查询方案
   */
  const handleAdd = async () => {
    if (!inputValue.value.trim()) {
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
    emit('add', inputValue.value.trim(), { ...formValues });
    inputValue.value = '';
  };

  /**
   * 覆盖查询方案
   */
  const handleUpdate = async () => {
    if (!inputValue.value.trim()) {
      showNameError.value = true;
      return;
    }
    if (!props.currentSearchPlan) {
      showNameError.value = true;
      console.error('No search plan selected for update');
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
    emit('update', props.currentSearchPlan.ID, inputValue.value.trim(), { ...formValues });
    inputValue.value = '';
  };

  /**
   * 删除查询方案
   */
  const handleDelete = (plan: SearchPlanItem) => {
    // 如果删除的是当前选中的查询方案，触发删除事件后，覆盖按钮会自动禁用
    // 因为父组件会更新 currentSearchPlan 为 undefined
    emit('delete', plan.ID);
  };

  /**
   * 选择查询方案
   */
  const handleSelect = async (plan: SearchPlanItem) => {
    emit('select', plan);
    // 触发 select 事件后，使用 formApi 更新表单值
    // 这样可以确保弹窗中的表单值与父组件的 model 同步
    if (formApi && localModel) {
      try {
        await formApi.setValues(localModel.value);
        console.log('handleSelect formApi.setValues() called');
      } catch (error) {
        console.error('handleSelect setValues error:', error);
      }
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
        console.log('formApi.resetForm() called');
      } catch (error) {
        console.error('handleReset resetForm error:', error);
      }
    }
    if (localModel) {
      console.log(localModel.value)
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
        console.log('handleSearch formApi.getValues():', values);
        if (values) {
          formValues = values;
        }
      } catch (error) {
        console.error('handleSearch getValues error:', error);
      }
    }
    console.log('handleSearch formValues:', formValues);
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
        console.log('handleOpen formApi.resetForm() called');
      } catch (error) {
        console.error('handleOpen resetForm error:', error);
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
    handleOpen
  };
}
