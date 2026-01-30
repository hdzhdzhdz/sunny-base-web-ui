<script setup lang="ts">
import { useKunkkaForm, patterns, setupKunkkaForm } from '@kunkka/ui';
import { z } from 'zod';
import { Message } from '@arco-design/web-vue';

// 个性化注入 @sunny-base-web/utils/regex 规则 (Personalized Injection)
// 方式 2: 使用 setupKunkkaForm 批量注册所有正则规则
// 将 patterns 对象转换为 vee-validate 可用的规则函数
const rules = Object.entries(patterns).reduce((acc, [key, config]) => {
  acc[key] = (value: any) => {
    // 处理空值，非必填时通过
    if (value === undefined || value === null || String(value) === '') {
      return true;
    }
    return config.pattern.test(String(value)) || config.message;
  };
  return acc;
}, {} as Record<string, any>);

// 注册自定义 required 规则
rules.required = (value: any, _params: any, ctx: any) => {
  if (value === undefined || value === null || value.length === 0) {
    return '请输入：' + (ctx.label || ctx.field);
  }
  return true;
};

// 批量注册规则
console.log('Patterns keys:', Object.keys(patterns));
console.log('Registering rules:', Object.keys(rules));
setupKunkkaForm({
  defineRules: rules
});

const [Form] = useKunkkaForm({
  showDefaultActions: true,
  schema: [
    {
      fieldName: 'username',
      label: '用户名',
      component: 'Input',
      // 字符串规则简写
      rules: 'required',
      help: '必填项 (字符串规则)',
    },
    {
      fieldName: 'email',
      label: '邮箱',
      component: 'Input',
      // Zod 规则: 必填 + 邮箱格式
      rules: z.string().min(1, '请输入邮箱').email('邮箱格式不正确'),
      help: '必填 + 邮箱格式 (Zod)',
    },
    {
      fieldName: 'phone',
      label: '手机号',
      component: 'Input',
      // 组合使用规则：必填 + 手机号
      rules: 'required|phone',
      help: '组合规则 (required|phone)',
    },
    {
      fieldName: 'idCard',
      label: '身份证',
      component: 'Input',
      // 尝试直接使用规则函数，绕过全局注册可能存在的问题
      rules: rules.idCard,
      help: '直接使用规则函数 (避免注册问题)',
    },
    {
      fieldName: 'age',
      label: '年龄',
      component: 'InputNumber',
      defaultValue: 18,
      // Zod 规则: 数字范围
      rules: z.number().min(18, '必须年满18岁').max(60, '最大60岁'),
      help: '18-60 (Zod Number)',
    },
    {
      fieldName: 'password',
      label: '密码',
      component: 'InputPassword',
      // Zod 自定义校验
      rules: z.string().min(6, '至少6位').refine((val) => !val.includes('123'), {
        message: '密码不能包含 "123"',
      }),
      help: '自定义校验 (不能包含 123)',
    },
    {
      fieldName: 'confirm',
      label: '确认密码',
      component: 'InputPassword',
      dependencies: {
        // 动态校验规则：依赖 password 字段
        rules: (values) => {
          return z.string().refine((val) => val === values.password, {
            message: '两次输入的密码不一致',
          });
        },
      },
      help: '动态校验 (依赖密码字段)',
    },
  ],
  handleSubmit: (values) => {
    Message.success('校验通过，提交成功');
    console.log('Form Values:', values);
  }
});
</script>

<template>
  <Form />
</template>
