<template>
  <div class="p-4">
    <sunny-form :schema="schema" />
  </div>
</template>

<script setup lang="ts">
import { SunnyForm } from '@sunny-base-web/ui';
import type { FormSchema } from '@sunny-base-web/ui';

// 模拟三级联动数据
const fetchCities = async (params: Record<string, any>) => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const mockData: Record<string, Array<{ label: string; value: string }>> = {
    beijing: [
      { label: '朝阳区', value: 'chaoyang' },
      { label: '海淀区', value: 'haidian' },
      { label: '东城区', value: 'dongcheng' },
    ],
    shanghai: [
      { label: '浦东新区', value: 'pudong' },
      { label: '徐汇区', value: 'xuhui' },
      { label: '静安区', value: 'jingan' },
    ],
  };

  return {
    data: mockData[params.province] || [],
  };
};

const fetchDistricts = async (params: Record<string, any>) => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const mockData: Record<string, Array<{ label: string; value: string }>> = {
    chaoyang: [
      { label: '三里屯', value: 'sanlitun' },
      { label: '国贸', value: 'guomao' },
    ],
    haidian: [
      { label: '中关村', value: 'zhongguancun' },
      { label: '五道口', value: 'wudaokou' },
    ],
    pudong: [
      { label: '陆家嘴', value: 'lujiazui' },
      { label: '张江', value: 'zhangjiang' },
    ],
  };

  return {
    data: mockData[params.city] || [],
  };
};

const schema: FormSchema[] = [
  {
    fieldName: 'province',
    label: '省份',
    component: 'SunnySelect',
    componentProps: {
      options: [
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
      ],
      placeholder: '请选择省份',
    },
  },
  {
    fieldName: 'city',
    label: '城市',
    component: 'SunnyApiSelect',
    componentProps: {
      deps: ['province'],
      api: {
        api: fetchCities,
        paramsMapper: (formValues, depValues) => ({
          province: depValues.province,
        }),
        resultMapper: (res) => res.data,
      },
      placeholder: '请先选择省份',
    },
    dependencies: {
      disabled: (values) => !values.province,
    },
  },
  {
    fieldName: 'district',
    label: '区县',
    component: 'SunnyApiSelect',
    componentProps: {
      deps: ['city'],
      api: {
        api: fetchDistricts,
        paramsMapper: (formValues, depValues) => ({
          city: depValues.city,
        }),
        resultMapper: (res) => res.data,
      },
      placeholder: '请先选择城市',
    },
    dependencies: {
      disabled: (values) => !values.city,
    },
  },
];
</script>
