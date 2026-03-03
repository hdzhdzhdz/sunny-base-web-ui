<script setup lang="ts">
import { reactive } from 'vue';
import { useSunnyEditGrid, EditRender } from '@sunny-base-web/ui';

const roleOptions = [
  { label: '管理员', value: '0' },
  { label: '普通用户', value: '1' },
  { label: '访客', value: '2' }
]
console.log(EditRender)
const gridOptions = reactive({
  columns: [
    { type: 'checkbox', width: 40, align: 'center' },
    {
      field: 'name',
      title: '输入框',
      width: 120,
      ...EditRender.InputRender,
      params: {
        allowClear: true,
        placeholder: '请选择'
      },
    },
    { 
      field: 'role', 
      title: '选择框',
      width: 120,
      ...EditRender.SelectRender,
      params: {
        options: roleOptions,
        allowClear: true,
        placeholder: '请选择',
      }
    },
    {
      field: 'publicSearch',
      title: '公共弹窗',
      width: 120,
      ...EditRender.BusinessSearchRender,
      params: {
        cNum: 'XTGL_USER_ROLE'
      }
    },
    { field: 'createTime', title: '日期选择器', width: 120, ...EditRender.DatePickerRender },
    { field: 'month', title: '月份选择器', width: 120, ...EditRender.MonthPickerRender },
    { field: 'year', title: '年份选择器', width: 120, ...EditRender.YearPickerRender },
    { field: 'week', title: '周选择器', width: 120, ...EditRender.WeekPickerRender },
    {
      field: 'dateRange',
      title: '日期范围选择器',
      width: 200,
      ...EditRender.RangePickerRender,
      params: {
        placeholder: ['开始时间', '结束时间'],
        fieldNames: {
          start: 'startDate',
          end: 'endDate'
        }
      },
    },
    {
      field: 'dateTimeRange',
      title: '日期时间范围选择器',
      width: 300,
      ...EditRender.RangePickerRender,
      params: {
        'showTime': true,
        placeholder: ['开始时间', '结束时间'],
        fieldNames: {
          start: 'startTime',
          end: 'endTime'
        }
      },
    },
    {
      field: 'enabled',
      title: '开关',
      width: 100,
      ...EditRender.SwitchRender,
      params: {
        checkedValue: '0',
        checkedText: '开启',
        uncheckedValue: '1',
        uncheckedText: '关闭'
      }
    },
    { field: 'price', title: '数字输入', width: 100, ...EditRender.InputNumberRender },
    {
      field: 'priceRange',
      title: '价格区间',
      width: 200,
      ...EditRender.InputRangeRender,
      params: {
        inputType: 'number',
        fieldNames: {
          start: 'minPrice',
          end: 'maxPrice'
        }
      },
    },
    {
      field: 'stringRange',
      title: '字符串区间',
      width: 200,
      ...EditRender.InputRangeRender,
      params: {
        fieldNames: {
          start: 'minScore',
          end: 'maxScore'
        }
      },
    },
    { field: 'mySlots', title: '自定义插槽', width: 120, editRender: {}, slots: { default: 'mySlots', edit: 'mySlots' } },
  ],
  data: [
    {
      name: 'John',
      role: '0',
      createTime: '2024-01-15',
      month: '2024-01',
      year: '2024',
      week: '2024-03',
      dateRange: ['2024-01-01', '2024-01-31'],
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      startTime: '2024-01-01 00:00:00',
      endTime: '2024-01-31 23:59:59',
      enabled: '0',
      price: 99.99,
      minPrice: '10',
      maxPrice: 100,
      minScore: '开始',
      maxScore: '结束'
    },
  ],
  border: true,
  showOverflow: true,
  showHeaderOverflow: true,
  showFooterOverflow: true,
  size: 'mini',
  // virtualYConfig: {
  //   enabled: true,
  //   gt: 0
  // },
  // virtualXConfig: {
  //   enabled: true,
  //   gt: 0
  // },
  rowConfig: {
    keyField: 'id'
  },
  editConfig: {
    enabled: true,
    trigger: 'click',
    mode: 'row'
  },
});

const gridEvents = {
  // cellClick: ({ row }: any) => {
  //   console.log('单元格点击:', row);
  // }
};

const [Grid, gridApi] = useSunnyEditGrid({ gridOptions, gridEvents });

const handleAdd = () => {
  gridApi.addEvent();
};

const handleDelete = () => {
  gridApi.deleteSelection();
};
</script>

<template>
  <div class="vp-raw">
    <Grid>
      <!-- <template #toolbar>
        <a-button type="primary" @click="handleAdd">添加</a-button>
        <a-button @click="handleDelete">删除选中</a-button>
      </template> -->
      <template #mySlots>
        mySlots
      </template>
    </Grid>
    <pre>{{ JSON.stringify(gridOptions.data, null, 2) }}</pre>
  </div>
</template>
