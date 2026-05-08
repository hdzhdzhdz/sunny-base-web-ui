<script setup lang="ts">
import { reactive } from 'vue';
import { useSunnyEditGrid, EditRender } from '@sunny-base-web/ui';

const gridOptions = reactive({
  data: [{ name: '张三', age: 25 }, { name: '李四', age: 30 }],
  columns: [
    { type: 'checkbox', width: 40 },
    { field: 'name', title: '姓名', ...EditRender.InputRender },
    { field: 'age', title: '年龄', ...EditRender.InputNumberRender },
  ],
  border: true,
  size: 'mini'
});

const [Grid, gridApi] = useSunnyEditGrid({ gridOptions });
</script>

<template>
  <div class="vp-raw">
    <Grid />
  </div>
</template>
