<template>
  <div class="p-4">
    <sunny-form :schema="schema" />
  </div>
</template>

<script setup lang="ts">
import { SunnyForm } from '@sunny-base-web/ui';
import type { FormSchema } from '@sunny-base-web/ui';
import { requestClient } from '@sunny-base-web/effects';

// 模拟用户搜索接口
const fetchUserList = (params: Record<string, any>) => {
  return requestClient.post('/core/assSelect/commonQuery', {
    cNum: 'UserSearch',
    searchCondition: params.keyword,
    pageNum: 1,
    pageSize: 20,
  });
};

const schema: FormSchema[] = [
  {
    fieldName: 'user',
    label: '用户搜索',
    component: 'SunnyApiSelect',
    componentProps: {
      allowSearch: true,
      searchField: 'keyword',
      searchDebounce: 300,
      api: {
        api: fetchUserList,
        paramsMapper: (_formValues, _depValues, searchValue) => ({
          keyword: searchValue?.keyword,
        }),
        resultMapper: (res) => {
          const records = res?.data?.result?.records || [];
          return records.map((item: any) => ({
            label: item.cName,
            value: item.id,
          }));
        },
      },
      placeholder: '请输入用户名搜索',
    },
  },
];
</script>
