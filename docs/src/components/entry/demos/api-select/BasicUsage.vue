<template>
  <div class="p-4">
    <sunny-form :schema="schema" />
  </div>
</template>

<script setup lang="ts">
import { SunnyForm } from '@sunny-base-web/ui';
import type { FormSchema } from '@sunny-base-web/ui';

// 模拟 API 请求
const fetchProducts = async (params: Record<string, any>) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const mockData: Record<string, Array<{ label: string; value: string }>> = {
    electronics: [
      { label: 'iPhone 15', value: 'iphone15' },
      { label: 'MacBook Pro', value: 'macbook' },
      { label: 'AirPods', value: 'airpods' },
    ],
    clothing: [
      { label: 'T恤', value: 'tshirt' },
      { label: '牛仔裤', value: 'jeans' },
    ],
    food: [
      { label: '巧克力', value: 'chocolate' },
      { label: '咖啡', value: 'coffee' },
    ],
  };

  return mockData[params.category] || [];
};

const schema: FormSchema[] = [
  {
    fieldName: 'category',
    label: '商品分类',
    component: 'SunnySelect',
    componentProps: {
      options: [
        { label: '电子产品', value: 'electronics' },
        { label: '服装', value: 'clothing' },
        { label: '食品', value: 'food' },
      ],
      placeholder: '请选择分类',
    },
  },
  {
    fieldName: 'product',
    label: '商品',
    component: 'SunnyApiSelect',
    componentProps: {
      deps: ['category'],
      api: {
        api: fetchProducts,
        paramsMapper: (formValues, depValues) => ({
          category: depValues.category,
        }),
        resultMapper: (result) => result,
      },
      placeholder: '请选择商品',
    },
    dependencies: {
      disabled: (values) => !values.category,
    },
  },
];
</script>
