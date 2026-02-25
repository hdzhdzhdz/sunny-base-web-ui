<script setup lang="ts">
import { useSunnyForm } from '@sunny-base-web/ui';
import { Message } from '@arco-design/web-vue';
import { z } from 'zod';

const [Form] = useSunnyForm({
  commonConfig: {
    colProps: { span: 24, md: 12, lg: 8 },
  },
  schema: [
    {
      fieldName: 'userType',
      label: '用户类型',
      component: 'Select',
      defaultValue: 'personal',
      componentProps: {
        options: [
          { label: '个人用户', value: 'personal' },
          { label: '企业用户', value: 'enterprise' },
        ],
      },
    },
    {
      fieldName: 'companyName',
      label: '公司名称',
      component: 'Input',
      dependencies: {
        // 无需指定 triggerFields，Vue 自动追踪 values.userType 的依赖
        show: (values) => values.userType === 'enterprise',
        required: (values) => values.userType === 'enterprise',
        componentProps: (values) => ({
          placeholder: values.userType === 'enterprise' ? '请输入公司全称' : '无需填写',
        }),
      },
    },
    {
      fieldName: 'companyCode',
      label: '统一社会信用代码',
      component: 'Input',
      dependencies: {
        // 企业用户时才渲染 DOM
        if: (values) => values.userType === 'enterprise',
      },
    },
    {
      fieldName: 'needInvoice',
      label: '需要发票',
      component: 'Switch',
      defaultValue: false,
    },
    {
      fieldName: 'invoiceTitle',
      label: '发票抬头',
      component: 'Input',
      dependencies: {
        // 访问了 needInvoice 和 userType，任一变化都会重新计算
        show: (values) => values.needInvoice === true,
        required: (values) => values.needInvoice === true,
        disabled: (values) => values.userType === 'enterprise',
      },
      componentProps: {
        placeholder: '需要发票时必填',
      },
    },
    {
      fieldName: 'agreement',
      label: '用户协议',
      component: 'Checkbox',
      componentProps: {
        defaultChecked: false,
      },
      dependencies: {
        // 动态验证规则
        rules: (values) => {
          if (values.userType === 'enterprise') {
            return z.literal(true, {
              errorMap: () => ({ message: '企业用户必须同意用户协议' }),
            });
          }
          return z.boolean();
        },
      },
    },
  ],
  handleSubmit: (values) => {
    Message.success('提交成功: ' + JSON.stringify(values));
    console.log('Form Values:', values);
  },
});
</script>

<template>
  <Form />
</template>
