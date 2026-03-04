<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSunnyForm } from '@sunny-base-web/ui';
import { Message, Input, Button, Modal } from '@arco-design/web-vue';
import axios from 'axios';

const cNum = ref('MACHINE_SBBH');
const token = ref('');

// 监听 Token 变化并设置到全局 axios header
watch(token, (newVal) => {
  if (newVal) {
    axios.defaults.headers.common['Authorization'] = newVal.startsWith('Bearer ') ? newVal : `Bearer ${newVal}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
});

const [Form, formApi] = useSunnyForm({
  layout: 'horizontal',
  // 配置对象数组与值字符串的双向转换字段
  // Configure bidirectional conversion between object array and value string
  // setValues: 'M001,M002' → [{ C_DEVICE_NO: 'M001', ... }, ...]
  // getValues/submit: [{ C_DEVICE_NO: 'M001', ... }, ...] → 'M001,M002'
  objectToValueFields: ['machineCode'],
  schema: [
    {
      fieldName: 'machineCode',
      label: '设备选择',
      component: 'SunnyBusinessSearch',
      // 使用函数形式的 componentProps 以支持响应式参数 (如 cNum)
      componentProps: () => ({
        cNum: cNum.value,
        placeholder: '请选择设备 (动态配置)',
        modalProps: {
          // 在 modalProps 中配置 multiple，优先级最高
          multiple: true,
          fieldNames: {
            label: 'C_DEVICE_NAME',
            value: 'C_DEVICE_NO'
          }
        }
      }),
      rules: 'required'
    }
  ],
  handleSubmit: (values) => {
    Message.success('提交: ' + JSON.stringify(values));
  },
});

const handleCheckValues = async () => {
  const values = await formApi.getValues();
  Modal.info({
    title: '当前表单值',
    content: JSON.stringify(values, null, 2),
    width: 600
  });
};

const handleSetMockValue = () => {
  // 现在可以直接使用字符串格式，会自动转换成组件需要的对象数组
  // Now you can use string format directly, it will be automatically converted to object array
  formApi.setValues({
    machineCode: 'M001,M002'
  });
  Message.success('已设置模拟值');
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-4 mb-4 bg-gray-50 p-4 rounded">
      <div class="flex-1">
        <label class="block text-sm font-medium mb-1">C-Num (动态参数)</label>
        <Input v-model="cNum" placeholder="请输入配置编码" />
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium mb-1">Token (Authorization)</label>
        <Input v-model="token" placeholder="请输入 Token" />
      </div>
    </div>

    <Form />
    
    <div class="flex gap-4">
      <Button type="primary" @click="handleCheckValues">查看表单值</Button>
      <Button @click="handleSetMockValue">设置模拟值</Button>
    </div>
    
    <div class="bg-gray-100 p-4 rounded mt-4">
      <h3 class="font-bold mb-2">实时表单值 (Reactive):</h3>
      <!-- Correctly unwrap the Ref value using .value in JS expression if useStore returns Ref, 
           BUT in template top-level refs are unwrapped. 
           However, inside JSON.stringify(), they are NOT. 
           We should assign it to a variable in script or use .value inside stringify -->
      <pre class="text-xs">{{ JSON.stringify(formApi.useStore((s) => s.values).value, null, 2) }}</pre>
    </div>
  </div>
</template>
