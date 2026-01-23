<script setup lang="ts">
  import { reactive } from 'vue'
  import { useKunkkaEditGrid } from "@kunkka/ui";

const gridOptions = reactive({
  border: true,
  showOverflow: 'title',
  height: 400,
  editConfig: {
    trigger: 'click',
    mode: 'cell'
  },
  columns: [
    { type: 'checkbox', width: 60 },
    { type: 'seq', width: 70 },
    { field: 'name', title: 'Name', editRender: { name: 'input' } },
    { field: 'sex', title: 'Sex', editRender: { name: 'input' } },
    { field: 'age', title: 'Age', editRender: { name: 'input' } }
  ],
  data: [
    { id: 10001, name: 'Test1', role: 'Develop', sex: 'Man', age: 28, address: 'test abc' },
    { id: 10002, name: 'Test2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
    { id: 10003, name: 'Test3', role: 'PM', sex: 'Man', age: 32, address: 'Shanghai' },
    { id: 10004, name: 'Test4', role: 'Designer', sex: 'Women', age: 24, address: 'Shanghai' }
  ]
})

const gridEvents = {
  cellClick: (data: any) => {
    console.log(data)
  },
  ready: (grid: any) => {
    console.log('ready', grid)
  },
  'data-change': (data: any) => {
    console.log('data-change', data)
  }
};

const [Grid, gridApi] = useKunkkaEditGrid({ gridOptions, gridEvents });

const addEvent = async () => {
  console.log(gridApi)
  gridApi.addEvent()
}

const delEvent = async () => {
  console.log(gridApi)
  gridApi.deleteSelection()
}

</script>

<template>
  <div>
    <a-button type="primary" @click="addEvent">新增</a-button>
    <a-button type="primary" @click="delEvent">删除</a-button>
    <Grid />
  </div>
</template>
