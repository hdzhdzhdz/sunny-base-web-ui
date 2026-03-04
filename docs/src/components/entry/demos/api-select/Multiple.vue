<template>
  <div class="p-4">
    <sunny-form :schema="schema" />
  </div>
</template>

<script setup lang="ts">
import { SunnyForm } from '@sunny-base-web/ui';
import type { FormSchema } from '@sunny-base-web/ui';

// 模拟 API 请求
const fetchEmployees = async (params: Record<string, any>) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const mockData: Record<string, Array<{ label: string; value: string }>> = {
    tech: [
      { label: '张三', value: 'zhangsan' },
      { label: '李四', value: 'lisi' },
      { label: '王五', value: 'wangwu' },
      { label: '赵六', value: 'zhaoliu' },
      { label: '钱七', value: 'qianqi' },
    ],
    sales: [
      { label: '孙八', value: 'sunba' },
      { label: '周九', value: 'zhoujiu' },
      { label: '吴十', value: 'wushi' },
    ],
    hr: [
      { label: '郑一', value: 'zhengyi' },
      { label: '王二', value: 'wanger' },
    ],
  };

  return mockData[params.department] || [];
};

const schema: FormSchema[] = [
  {
    fieldName: 'department',
    label: '部门',
    component: 'SunnySelect',
    componentProps: {
      options: [
        { label: '技术部', value: 'tech' },
        { label: '销售部', value: 'sales' },
        { label: '人事部', value: 'hr' },
      ],
      placeholder: '请选择部门',
    },
  },
  {
    fieldName: 'employees',
    label: '员工（多选）',
    component: 'SunnyApiSelect',
    componentProps: {
      deps: ['department'],
      api: {
        api: fetchEmployees,
        paramsMapper: (formValues, depValues) => ({
          department: depValues.department,
        }),
        resultMapper: (result) => result,
      },
      multiple: true,
      placeholder: '请选择员工（支持全选和粘贴）',
    },
    dependencies: {
      disabled: (values) => !values.department,
    },
  },
];
</script>
