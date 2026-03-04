<template>
  <div class="p-4">
    <sunny-form :schema="schema" />

    <a-divider />

    <div class="text-sm text-gray-500">
      <div class="font-medium mb-2">最后一次请求参数：</div>
      <pre class="bg-gray-100 p-2 rounded text-xs">{{ lastRequestParams || '暂无请求' }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SunnyForm } from '@sunny-base-web/ui';
import type { FormSchema } from '@sunny-base-web/ui';
import { Message } from '@arco-design/web-vue';

const lastRequestParams = ref('');

// 模拟 API 请求
const fetchFactories = async (params: Record<string, any>) => {
  // 记录请求参数用于展示
  lastRequestParams.value = JSON.stringify(params, null, 2);

  await new Promise((resolve) => setTimeout(resolve, 300));

  // 模拟返回数据
  const factories = [
    { label: `${params.attrParam?.companyId || '默认'}-工厂1`, value: 'factory1' },
    { label: `${params.attrParam?.companyId || '默认'}-工厂2`, value: 'factory2' },
    { label: `${params.attrParam?.companyId || '默认'}-工厂3`, value: 'factory3' },
  ];

  Message.success('已发送请求，参数见下方');
  return factories;
};

const schema: FormSchema[] = [
  {
    fieldName: 'company',
    label: '公司',
    component: 'SunnySelect',
    componentProps: {
      options: [
        { label: '公司 A', value: '1400' },
        { label: '公司 B', value: '1500' },
      ],
      placeholder: '请选择公司',
    },
  },
  {
    fieldName: 'keyword',
    label: '搜索关键字',
    component: 'Input',
    componentProps: {
      placeholder: '输入搜索关键字',
    },
  },
  {
    fieldName: 'factory',
    label: '工厂',
    component: 'SunnyApiSelect',
    componentProps: {
      deps: ['company', 'keyword'],
      api: {
        api: fetchFactories,
        // 自定义参数映射：将表单值转换为后端需要的格式
        paramsMapper: (formValues, depValues) => ({
          // 业务参数放在 attrParam
          attrParam: {
            companyId: depValues.company,
          },
          // 搜索条件单独传递
          searchCondition: depValues.keyword,
          // 固定参数
          pageNum: 1,
          pageSize: 20,
        }),
        resultMapper: (result) => result,
      },
      placeholder: '请选择工厂',
    },
    dependencies: {
      disabled: (values) => !values.company,
    },
  },
];
</script>
