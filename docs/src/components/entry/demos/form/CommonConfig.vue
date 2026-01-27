<script lang="ts" setup>
import { useKunkkaForm } from '@kunkka/ui';
import { Message } from '@arco-design/web-vue';

const schema = [
  { fieldName: 'name', label: '姓名', component: 'Input', help: '输入时观察控制台或上方提示' },
  { fieldName: 'age', label: '年龄', component: 'InputNumber' },
];

// 表单 A: 默认行为
const [FormA, formApiA] = useKunkkaForm({
  schema,
  handleValuesChange: (values) => {
    Message.info(`表单 A 触发变更: ${JSON.stringify(values)}`);
    console.log('Form A changed:', values);
  }
});

// 表单 B: 禁用 Change 监听
const [FormB, formApiB] = useKunkkaForm({
  schema,
  commonConfig: {
    disabledOnChangeListener: true,
  },
  handleValuesChange: (values) => {
    Message.warning(`表单 B 触发变更: ${JSON.stringify(values)}`);
    console.log('Form B changed:', values);
  }
});
</script>

<template>
  <div class="demo-wrapper">
    <a-divider orientation="left">1. 启用监听 (默认)</a-divider>
    <p class="desc">默认情况下，表单值的任何变化都会触发 handleValuesChange 回调。</p>
    <FormA />
    
    <a-divider orientation="left">2. 禁用监听 (Performance)</a-divider>
    <p class="desc">设置 <code>disabledOnChangeListener: true</code> 后，将不再监听变化事件，适用于不需要联动逻辑的超大表单以提升性能。</p>
    <FormB />
  </div>
</template>

<style scoped>
.desc {
  color: var(--color-text-3);
  margin-bottom: 16px;
  font-size: 13px;
}
</style>