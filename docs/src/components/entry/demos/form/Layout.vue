<script setup lang="ts">
import { useSunnyForm } from '@sunny-base-web/ui';
import { Message, RadioGroup, Radio, Divider } from '@arco-design/web-vue';

const [Form, formApi] = useSunnyForm({
  // 全局标签宽度
  labelWidth: 100,
  // 布局
  layout: 'horizontal',
  // 紧凑模式
  compact: false,
  // 栅格容器配置 (a-grid props)
  gridProps: {
    xGap: 24,
    yGap: 24,
  },
  // 表单项通用配置
  commonConfig: {
    // 响应式栅格配置
    colProps: {
      xs: 24, // < 576px
      sm: 12, // >= 576px
      md: 8,  // >= 768px
      lg: 6,  // >= 992px
    },
  },
  schema: [
    { fieldName: 'f1', label: '字段1', component: 'Input', help: '尝试缩放浏览器窗口' },
    { fieldName: 'f2', label: '字段2', component: 'Input' },
    { fieldName: 'f3', label: '字段3', component: 'Input' },
    { 
      fieldName: 'f4_full', 
      label: '独占一行', 
      component: 'Input',
      // 单独覆盖配置
      colProps: { span: 24 }
    },
    { fieldName: 'f5', label: '字段5', component: 'Input' },
    { fieldName: 'f6', label: '字段6', component: 'Input' },
  ],
  handleSubmit: (values) => {
    Message.success('提交: ' + JSON.stringify(values));
  },
});
</script>

<template>
  <div style="margin-bottom: 16px; display: flex; gap: 24px; flex-wrap: wrap;">
    <div>
      <span style="margin-right: 8px">Layout:</span>
      <RadioGroup 
        type="button" 
        default-value="horizontal"
        @change="(val) => formApi.setState({ layout: val as any })"
      >
        <Radio value="horizontal">Horizontal</Radio>
        <Radio value="vertical">Vertical</Radio>
        <Radio value="inline">Inline</Radio>
      </RadioGroup>
    </div>
    
    <div>
      <span style="margin-right: 8px">Grid Gap:</span>
      <RadioGroup 
        type="button" 
        :default-value="24"
        @change="(val) => formApi.setState({ gridProps: { xGap: val, yGap: val } })"
      >
        <Radio :value="0">0px</Radio>
        <Radio :value="24">24px</Radio>
        <Radio :value="48">48px</Radio>
      </RadioGroup>
    </div>
  </div>
  
  <Form />
</template>
