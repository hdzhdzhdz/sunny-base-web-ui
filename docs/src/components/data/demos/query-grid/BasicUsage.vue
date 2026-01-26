<script setup lang="ts">
import { reactive } from 'vue';
import { useKunkkaQueryGrid } from '@kunkka/ui';

const gridOptions = reactive({
  columns: [
    { type: 'checkbox', width: 50 },
    { field: 'name', title: '姓名' },
    { field: 'age', title: '年龄' }
  ],
  data: [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
  ]
});

const gridEvents = {
  cellClick: ({ row }: any) => {
    console.log('单元格点击:', row);
  }
};

const [Grid, gridApi] = useKunkkaQueryGrid({ gridOptions, gridEvents });
</script>

<template>
  <div class="vp-raw">
    <Grid />
  </div>
</template>
