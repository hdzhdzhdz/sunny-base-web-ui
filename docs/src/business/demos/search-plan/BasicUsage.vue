<template>
  <div class="demo-search-plan-basic">
    <h3>基础用法</h3>
    <p>点击下方按钮打开查询方案管理弹窗</p>
    
    <SunnySearchPlan
      :form-config="formConfig"
      v-model:model="model"
      :search-plan-list="searchPlanList"
      v-model:current-search-plan="currentSearchPlan"
      :form-props="formProps"
      :loading="loading"
      @add="handleAdd"
      @update="handleUpdate"
      @delete="handleDelete"
      @select="handleSelect"
      @search="handleSearch"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { SunnySearchPlan } from '@sunny-base-web/ui';
import { Message } from '@arco-design/web-vue';

// 表单配置
const formProps = {
  commonConfig: {
    colProps: {
      span: 8, // 一行三列
      lg: 8
    },
    labelWidth: 80
  }
};

// 导入表单配置
import formConfigData from './formConfig.json';

// 表单配置
const formConfig = formConfigData.formConfig;

// 表单模型
const model = reactive({
  name: '',
  age: undefined,
  gender: ''
});

// 搜索方案列表
const searchPlanList = ref([
  {
    ID: 1,
    CSEARCHPLANNAME: '全部用户'
  },
  {
    ID: 2,
    CSEARCHPLANNAME: '男性用户'
  },
  {
    ID: 3,
    CSEARCHPLANNAME: '女性用户'
  }
]);

// 当前选中的搜索方案
const currentSearchPlan = ref(undefined);

// 加载状态
const loading = ref(false);

// 初始化，模拟调用已保存查询方案列表查询接口
const initSearchPlans = async () => {
  loading.value = true;
  try {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 模拟返回的假数据
    const mockData = [
      { ID: 1, CSEARCHPLANNAME: '全部用户' },
      { ID: 2, CSEARCHPLANNAME: '男性用户' },
      { ID: 3, CSEARCHPLANNAME: '女性用户' }
    ];
    searchPlanList.value = mockData;
    console.log('初始化查询方案列表成功:', mockData);
  } catch (error) {
    console.error('初始化查询方案列表失败:', error);
    Message.error('初始化查询方案列表失败');
  } finally {
    loading.value = false;
  }
};

// 调用初始化函数
initSearchPlans();

// 操作成功提示
const showSuccessMessage = (message) => {
  console.log('操作成功:', message);
  // 使用 Arco Design 的 Message 组件
  Message.success({
    content: message,
    duration: 2000
  });
};

// 处理新增查询方案
const handleAdd = async (name, formModel) => {
  loading.value = true;
  try {
    console.log('新增查询方案:', { name, model: formModel });
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 模拟返回的假数据
    const newPlan = {
      ID: Date.now(),
      CSEARCHPLANNAME: name
    };
    searchPlanList.value.push(newPlan);
    // 自动切换到新查询方案
    currentSearchPlan.value = newPlan;
    console.log('新增查询方案成功:', newPlan);
    console.log('自动切换到新查询方案:', newPlan);
    showSuccessMessage('新增查询方案成功');
  } catch (error) {
    console.error('新增查询方案失败:', error);
    Message.error('新增查询方案失败');
  } finally {
    loading.value = false;
  }
};

// 处理覆盖查询方案
const handleUpdate = async (id, name, formModel) => {
  loading.value = true;
  try {
    console.log('覆盖查询方案:', { id, name, model: formModel });
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 模拟返回的假数据
    const index = searchPlanList.value.findIndex(item => item.ID === id);
    if (index !== -1) {
      searchPlanList.value[index].CSEARCHPLANNAME = name;
    }
    console.log('覆盖查询方案成功:', { id, name });
    showSuccessMessage('覆盖查询方案成功');
  } catch (error) {
    console.error('覆盖查询方案失败:', error);
    Message.error('覆盖查询方案失败');
  } finally {
    loading.value = false;
  }
};

// 处理删除查询方案
const handleDelete = async (id) => {
  loading.value = true;
  try {
    console.log('删除查询方案:', id);
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 模拟返回的假数据
    // 如果删除的是当前选中的查询方案，清除选中状态
    if (currentSearchPlan.value && currentSearchPlan.value.ID === id) {
      currentSearchPlan.value = undefined;
    }
    // 模拟从列表中删除
    searchPlanList.value = searchPlanList.value.filter(item => item.ID !== id);
    console.log('删除查询方案成功:', id);
    showSuccessMessage('删除查询方案成功');
  } catch (error) {
    console.error('删除查询方案失败:', error);
    Message.error('删除查询方案失败');
  } finally {
    loading.value = false;
  }
};

// 处理选择查询方案
const handleSelect = (plan) => {
  console.log('选择查询方案:', plan);
  currentSearchPlan.value = plan;
  // 模拟加载方案对应的表单数据
  let newModel;
  if (plan.ID === 1) {
    // 全部用户方案
    newModel = {
      name: '',
      age: undefined,
      gender: ''
    };
  } else if (plan.ID === 2) {
    // 男性用户方案
    newModel = {
      name: '',
      age: undefined,
      gender: 'male'
    };
  } else if (plan.ID === 3) {
    // 女性用户方案
    newModel = {
      name: '',
      age: undefined,
      gender: 'female'
    };
  } else {
    // 自定义方案
    newModel = {
      name: '',
      age: undefined,
      gender: ''
    };
  }
  // 创建新对象触发响应式更新
  Object.assign(model, newModel);
  showSuccessMessage('切换查询方案成功');
};

// 处理搜索
const handleSearch = (formModel) => {
  console.log('执行搜索:', formModel);
  // 这里可以执行实际的搜索逻辑
  showSuccessMessage('搜索执行成功');
};
</script>

<style scoped>
.demo-search-plan-basic {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.demo-search-plan-basic h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.demo-search-plan-basic p {
  margin-bottom: 20px;
  color: #666;
}
</style>