<script setup lang="ts">
import { useKunkkaForm, z } from '@sunny-base-web/ui';
import { Message, Space, Button, Card } from '@arco-design/web-vue';
import { ref } from 'vue';

const [Form, formApi] = useKunkkaForm({
  fieldMappingTime: [
    ['dateRange', ['startDate', 'endDate'], 'YYYY-MM-DD']
  ],
  arrayToStringFields: [
    ['hobbies', ',']
  ],
  scrollToFirstError: true,
  schema: [
    {
      fieldName: 'name', 
      label: '姓名', 
      component: 'Input', 
      rules: z.string().min(1, '请输入姓名'),
      defaultValue: 'Kunkka'
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
    {
      fieldName: 'hobbies',
      label: '爱好',
      component: 'CheckboxGroup',
      componentProps: {
        options: [
          { label: 'Coding', value: 'coding' },
          { label: 'Reading', value: 'reading' },
          { label: 'Gaming', value: 'gaming' },
        ]
      },
      defaultValue: ['coding']
    }
  ],
  handleSubmit: (values) => {
    Message.success('提交成功: ' + JSON.stringify(values));
  }
});

const formState = ref<any>({});

const handleGetValues = async () => {
  const values = await formApi.getValues();
  Message.info('当前表单值: ' + JSON.stringify(values));
};

const handleSetValues = async () => {
  await formApi.setValues({
    name: 'New Name',
    age: 25,
    role: 'admin'
  });
  Message.success('已设置表单值');
};

const handleValidate = async () => {
  const result = await formApi.validate();
  if (result.valid) {
    Message.success('校验通过');
  } else {
    Message.error('校验失败: ' + Object.keys(result.errors).join(', '));
  }
};

const handleUpdateSchema = () => {
  formApi.updateSchema([
    {
      fieldName: 'name',
      label: '用户姓名 (Updated)',
      help: 'Label has been updated via API'
    },
    {
      fieldName: 'role',
      componentProps: {
        disabled: true
      }
    }
  ]);
  Message.success('Schema 已更新');
};

const handleGetState = () => {
  // getState() 返回的是表单的配置状态 (store state)
  // getState() returns the form configuration state (store state)
  const configState = formApi.getState();
  
  // 运行时状态 (如 isSubmitting) 存储在 vee-validate 的 form 上下文中
  // Runtime state (like isSubmitting) is stored in vee-validate's form context
  // 可以通过 formApi.form 访问
  // Can be accessed via formApi.form
  const { isSubmitting, isValidating, submitCount } = formApi.form;

  formState.value = {
    // 运行时状态 (需解包 Ref)
    isSubmitting: isSubmitting?.value,
    isValidating: isValidating?.value,
    submitCount: submitCount?.value,
    
    // 配置状态
    currentValues: configState?.values,
    schemaCount: configState?.schema?.length
  };
  Message.info('获取状态成功 (见下方展示)');
};

const handleReset = async () => {
  await formApi.resetForm();
  Message.warning('表单已重置');
};
</script>

<template>
  <Space direction="vertical" fill>
    <Card title="表单区域">
      <Form />
    </Card>

    <Card title="API 操作区">
      <Space wrap>
        <Button @click="handleGetValues">获取值 (getValues)</Button>
        <Button @click="handleSetValues">设置值 (setValues)</Button>
        <Button status="success" @click="handleValidate">手动校验 (validate)</Button>
        <Button status="warning" @click="handleUpdateSchema">更新 Schema (updateSchema)</Button>
        <Button @click="handleGetState">获取状态 (getState)</Button>
        <Button status="danger" @click="handleReset">重置 (resetForm)</Button>
      </Space>
      
      <div v-if="Object.keys(formState).length" style="margin-top: 16px; background: #f5f5f5; padding: 12px; border-radius: 4px;">
        <pre>{{ JSON.stringify(formState, null, 2) }}</pre>
      </div>
    </Card>
  </Space>
</template>
