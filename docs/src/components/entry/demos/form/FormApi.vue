<script setup lang="ts">
import { useSunnyForm, z } from '@sunny-base-web/ui';
import { Message, Button } from '@arco-design/web-vue';
import { ref } from 'vue';

const [Form, formApi] = useSunnyForm({
  fieldMappingTime: [
    ['dateRange', ['startDate', 'endDate'], 'YYYY-MM-DD']
  ],
  scrollToFirstError: true,
  schema: [
    {
      fieldName: 'name',
      label: '姓名',
      component: 'Input',
      rules: z.string().min(1, '请输入姓名'),
      defaultValue: 'Sunny'
    },
    {
      fieldName: 'age',
      label: '年龄',
      component: 'InputNumber',
      rules: z.number().min(18, '必须年满18岁')
    },
    {
      fieldName: 'role',
      label: '角色',
      component: 'Select',
      componentProps: {
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ]
      }
    },
    {
      fieldName: 'dateRange',
      label: '日期范围',
      component: 'RangePicker',
    },
    // 嵌套对象字段
    {
      fieldName: 'user',
      label: '用户对象',
      component: 'Input',
      componentProps: {
        placeholder: 'JSON 格式的用户对象',
      },
      defaultValue: { name: 'test', email: 'test@example.com' }
    },
  ],
  handleSubmit: (values) => {
    Message.success('提交成功: ' + JSON.stringify(values));
    console.log('handleSubmit:', values);
  }
});

// 调试：检查 formApi 方法是否存在
console.log('formApi instance:', formApi);
console.log('setFieldValue:', typeof formApi.setFieldValue);
console.log('setValues:', typeof formApi.setValues);
console.log('getValues:', typeof formApi.getValues);

// 日志输出
const logs = ref<string[]>([]);
const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString();
  logs.value.unshift(`[${time}] ${msg}`);
  if (logs.value.length > 15) logs.value.pop();
};

// ========== 值管理 ==========

const handleGetValues = async () => {
  const values = await formApi.getValues();
  addLog(`getValues: ${JSON.stringify(values)}`);
};

const handleSetValues = async () => {
  await formApi.setValues({
    name: 'New Name',
    age: 25,
    role: 'admin'
  });
  addLog('setValues: 已设置 name, age, role');
};

const handleSetFieldValue = async () => {
  await formApi.setFieldValue('name', 'Field Value Test');
  addLog('setFieldValue: name = "Field Value Test"');
};

const handleSetValuesNoFilter = async () => {
  // 第二个参数 false = 不过滤非 schema 字段
  await formApi.setValues({
    name: 'Test',
    extraField: 'This is extra'  // 这个字段不在 schema 中
  }, false);
  const values = await formApi.getValues();
  addLog(`setValues(无过滤): extraField = "${(values as any).extraField || 'undefined'}"`);
};

// ========== 嵌套路径测试 ==========

const handleSetNestedFieldValue = async () => {
  // 使用嵌套路径设置单个字段
  await formApi.setFieldValue('user.name', 'Nested Name');
  const values = await formApi.getValues();
  addLog(`setFieldValue(嵌套): user.name = "${(values as any).user?.name}"`);
};

const handleSetNestedValues = async () => {
  // 使用嵌套路径设置多个字段
  await formApi.setValues({
    'user.name': 'John',
    'user.email': 'john@example.com',
  });
  const values = await formApi.getValues();
  addLog(`setValues(嵌套): user = ${JSON.stringify((values as any).user)}`);
};

const handleSetArrayPath = async () => {
  // 使用数组索引路径
  await formApi.setFieldValue('items[0].name', 'Item 0');
  await formApi.setFieldValue('items[0].price', 100);
  const values = await formApi.getValues();
  addLog(`setFieldValue(数组路径): items[0] = ${JSON.stringify((values as any).items?.[0])}`);
};

// ========== 校验与提交 ==========

const handleValidate = async () => {
  const result = await formApi.validate();
  addLog(`validate: ${result.valid ? '✅ 通过' : '❌ 失败'}`);
};

const handleValidateField = async () => {
  const result = await formApi.validateField('name');
  addLog(`validateField('name'): ${result.valid ? '✅ 通过' : '❌ 失败'}`);
};

const handleSubmit = async () => {
  const result = await formApi.submitForm();
  addLog(`submitForm: valid=${result?.valid}`);
};

const handleValidateAndSubmit = async () => {
  const result = await formApi.validateAndSubmitForm();
  addLog(`validateAndSubmitForm: ${result ? '已提交' : '校验失败'}`);
};

const handleResetForm = async () => {
  await formApi.resetForm();
  addLog('resetForm: 表单已重置');
};

const handleResetValidate = async () => {
  await formApi.resetValidate();
  addLog('resetValidate: 错误已清除');
};

// ========== 状态管理 ==========

const handleGetState = () => {
  const state = formApi.getState();
  addLog(`getState: schema.length=${state?.schema?.length}`);
};

const handleSetState = () => {
  formApi.setState({
    schema: [
      {
        fieldName: 'name',
        label: '动态姓名',
        component: 'Input',
        rules: z.string().min(1)
      }
    ]
  });
  addLog('setState: schema 已更新为单个字段');
};

// ========== Schema 操作 ==========

const handleUpdateSchema = () => {
  formApi.updateSchema([
    {
      fieldName: 'name',
      label: '用户姓名 (Updated)',
      help: '通过 updateSchema 更新'
    }
  ]);
  addLog('updateSchema: name label 已更新');
};

const handleRemoveSchemaByFields = async () => {
  await formApi.removeSchemaByFields(['dateRange']);
  addLog('removeSchemaByFields: dateRange 已移除');
};

// 清空日志
const clearLogs = () => {
  logs.value = [];
};
</script>

<template>
  <div class="space-y-4">
    <!-- 表单区域 -->
    <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border">
      <div class="text-sm font-medium text-gray-500 mb-3">表单区域</div>
      <Form />
    </div>

    <!-- API 操作区 -->
    <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border">
      <div class="text-sm font-medium text-gray-500 mb-3">FormApi 方法测试</div>

      <!-- 值管理 -->
      <div class="mb-4">
        <div class="text-xs text-gray-400 mb-2">值管理</div>
        <div class="flex flex-wrap gap-2">
          <Button size="small" @click="handleGetValues">getValues</Button>
          <Button size="small" @click="handleSetValues">setValues</Button>
          <Button size="small" @click="handleSetFieldValue">setFieldValue</Button>
          <Button size="small" @click="handleSetValuesNoFilter">setValues(无过滤)</Button>
        </div>
      </div>

      <!-- 嵌套路径测试 -->
      <div class="mb-4">
        <div class="text-xs text-gray-400 mb-2">嵌套路径 (Nested Path)</div>
        <div class="flex flex-wrap gap-2">
          <Button size="small" type="outline" @click="handleSetNestedFieldValue">setFieldValue('user.name')</Button>
          <Button size="small" type="outline" @click="handleSetNestedValues">setValues(嵌套)</Button>
          <Button size="small" type="outline" @click="handleSetArrayPath">setFieldValue('items[0]')</Button>
        </div>
      </div>

      <!-- 校验与提交 -->
      <div class="mb-4">
        <div class="text-xs text-gray-400 mb-2">校验与提交</div>
        <div class="flex flex-wrap gap-2">
          <Button size="small" status="success" @click="handleValidate">validate</Button>
          <Button size="small" status="success" @click="handleValidateField">validateField</Button>
          <Button size="small" type="primary" @click="handleSubmit">submitForm</Button>
          <Button size="small" type="primary" @click="handleValidateAndSubmit">validateAndSubmitForm</Button>
          <Button size="small" status="warning" @click="handleResetForm">resetForm</Button>
          <Button size="small" status="warning" @click="handleResetValidate">resetValidate</Button>
        </div>
      </div>

      <!-- 状态管理 -->
      <div class="mb-4">
        <div class="text-xs text-gray-400 mb-2">状态管理</div>
        <div class="flex flex-wrap gap-2">
          <Button size="small" @click="handleGetState">getState</Button>
          <Button size="small" @click="handleSetState">setState</Button>
        </div>
      </div>

      <!-- Schema 操作 -->
      <div class="mb-4">
        <div class="text-xs text-gray-400 mb-2">Schema 操作</div>
        <div class="flex flex-wrap gap-2">
          <Button size="small" @click="handleUpdateSchema">updateSchema</Button>
          <Button size="small" status="danger" @click="handleRemoveSchemaByFields">removeSchemaByFields</Button>
        </div>
      </div>
    </div>

    <!-- 日志区域 -->
    <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-200">执行日志</span>
        <Button size="small" @click="clearLogs">清空</Button>
      </div>
      <div class="space-y-1 text-sm font-mono max-h-60 overflow-auto">
        <div
          v-for="(log, index) in logs"
          :key="index"
          class="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
        >
          {{ log }}
        </div>
        <div v-if="logs.length === 0" class="text-gray-400 text-center py-4">
          点击上方按钮测试 FormApi 方法
        </div>
      </div>
    </div>
  </div>
</template>
