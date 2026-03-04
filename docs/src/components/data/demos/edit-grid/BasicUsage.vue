<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useSunnyEditGrid, EditRender, SunnyIcon, Validators } from '@sunny-base-web/ui';
import { Message } from '@arco-design/web-vue';

const roleOptions = [
  { label: '管理员', value: '0' },
  { label: '普通用户', value: '1' },
  { label: '访客', value: '2' }
]

const gridOptions = reactive({
  columns: [
    { type: 'checkbox', width: 40, align: 'center', fixed: 'left' },
    {
      type: 'seq',
      title: '序号',
      width: 50,
      align: 'center',
      fixed: 'left',
      dragSort: true
    },
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
        cNum: 'XTGL_USER_ROLE',
        multiple: false,
        fieldNames: { // 弹窗已选项映射关系
          label: 'C_ROLENAME',
          value: 'ID',
          desc: 'C_ROLENUMB'
        },
        mapping: { // 弹窗确定时，反写到绑定数据
          "a": 'b'
        },
        arrto: ['publicSearch']
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
    {
      field: 'description',
      title: '描述',
      width: 200,
      ...EditRender.TextareaRender,
      params: {
        placeholder: '请输入描述内容'
      }
    },
    { field: 'mySlots', title: '自定义插槽', width: 200, slots: { default: 'mySlots' } },
  ],
  editRules: {
    name: [{ required: true, message: '请输入姓名' }],
    role: [{ required: true, message: '请选择角色' }],
    stringRange: [
      { required: true, field: 'minScore', message: '请输入最小值', validator: Validators.requiredValidator },
      { required: true, field: 'maxScore', message: '请输入最大值', validator: Validators.requiredValidator },
    ],
  },
  border: true,
  showOverflow: 'title',
  showHeaderOverflow: 'title',
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
    keyField: 'id',
    drag: true,
  },
  editConfig: {
    enabled: true,
    trigger: 'click',
    mode: 'row'
  },
  columnConfig: {
    resizable: true,
  }
});

const tableData = ref([
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
    maxScore: '结束',
    description: '这是一个描述文本，点击输入框可以展开更多内容进行编辑'
  }
])

onMounted(() => {
})

const gridEvents = {
  // cellClick: ({ row }: any) => {
  //   console.log('单元格点击:', row);
  // }
};

const [Grid, gridApi] = useSunnyEditGrid({ gridOptions, gridEvents });

const reloadData = async () => {
  await gridApi.reloadData(tableData.value);
}

const handleAdd = () => {
  gridApi.addEvent({});
};

const handleDelete = () => {
  gridApi.deleteSelection();
};

const setHeader = (column: any) => {
  column.slots.header = 'myTitle'
}

const toggleEdit = () => {
  const currentConfig = gridOptions.editConfig
  currentConfig.enabled = !currentConfig?.enabled
}

const fullValidEvent = async () => {
  const errMap = await gridApi.validate()
  if (errMap) {
    Message.error('校验不通过！')
  } else {
    Message.success('校验成功！')
  }
}

const getFullData = async () => {
  const data = await gridApi.getFullData()
  console.log(data)
}
</script>

<template>
  <div class="vp-raw">
    <Grid>
      <template #toolbar>
        <a-space class="mb-2">
          <a-button type="primary" @click="reloadData">重新加载数据</a-button>
          <a-button type="primary" @click="handleAdd">添加</a-button>
          <a-button type="primary" @click="handleDelete">删除选中</a-button>
          <a-button type="primary" @click="toggleEdit">切换编辑模式</a-button>
          <a-button type="primary" @click="fullValidEvent">校验全量数据</a-button>
          <a-button type="primary" @click="getFullData">获取表格数据</a-button>
        </a-space>
      </template>
      <template #mySlots="{ row, column }">
        <a-button type="primary" @click="setHeader(column)">设置自定义头</a-button>
      </template>
      <template #myTitle>
        <div class="flex items-center gap-2">
          这是自定义头
          <a-tooltip content="这是提示">
            <SunnyIcon icon="lucide:plus" class="cursor-pointer outline-none" />
          </a-tooltip>
        </div>
      </template>
    </Grid>
  </div>
</template>
