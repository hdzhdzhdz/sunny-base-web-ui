<template>
  <a-modal
    v-model:visible="visible"
    :mask-closable="false"
    :unmount-on-close="true"
    draggable
    title="URL管理"
    width="600px"
    :ok-loading="confirmLoading"
    @before-ok="handleOk"
    @cancel="close"
  >
    <vxe-table
      ref="editTable"
      :row-config="{
        useKey: true,
        isCurrent: true
      }"
      :column-config="{
        resizable: true
      }"
      show-overflow
      keep-source
      size="small"
      :data="data"
      :loading="contentLoading"
      border="inner"
      :edit-rules="validRules"
      :edit-config="{ trigger: 'click' , mode: 'row', showIcon: false }"
      :tooltip-config="{}"
      max-height="400px"
      empty-text="暂无URL信息"
    >
      <vxe-column
        width="50%"
        field="cUrl"
        title="接口URL"
        :edit-render="{ autofocus: '.vxe-input--inner' }"
      >
        <template #edit="{ row }">
          <vxe-input v-model="row.cUrl" type="text" placeholder="请输入接口URL" />
        </template>
      </vxe-column>
      <vxe-column
        field="cDesc"
        title="描述"
        :edit-render="{ autofocus: '.vxe-input--inner' }"
      >
        <template #edit="{ row }">
          <vxe-input v-model="row.cDesc" type="text" placeholder="请输入描述" />
        </template>
      </vxe-column>
      <vxe-column
        field="nClicknum"
        title="记录点击数"
        :edit-render="{ autofocus: '.vxe-input--inner' }"
      >
        <template #default="{ row }">
          <vxe-switch v-model="row.nClicknum" open-label="是" :open-value="1" close-label="否" :close-value="0" />
        </template>
        <template #edit="{ row }">
          <vxe-switch v-model="row.nClicknum" open-label="是" :open-value="1" close-label="否" :close-value="0" />
        </template>
      </vxe-column>
      <vxe-column width="80" show-overflow align="center">
        <template #header>
          <a-button type="primary" status="success" shape="circle" size="small" @click="insertEvent">
            <icon-plus />
          </a-button>
        </template>
        <template #default="{ row }">
          <a-button type="primary" status="danger" shape="circle" size="small" @click="remove(row)">
            <template #icon>
              <icon-delete />
            </template>
          </a-button>
        </template>
      </vxe-column>
    </vxe-table>
  </a-modal>
</template>

<script setup>
import { useUrlEditor } from '../hook/useUrlEditor'
import { VxeInput, VxeSwitch } from 'vxe-pc-ui'
import { IconPlus, IconDelete } from '@arco-design/web-vue/es/icon';
const emits = defineEmits(['save'])
const
  {
    editTable,
    data,
    visible,
    confirmLoading,
    contentLoading,
    handleOk,
    close,
    insertEvent,
    remove,
    openEditor,
    validRules
  } = useUrlEditor(emits) // useHook
  // expose
defineExpose({
  openEditor
})
</script>

  <style lang="scss" scoped>
  :deep(.el-dialog__body){
    padding-top:10px;
  }
  :deep(.vxe-cell--valid-msg){
    padding:6px !important;
  }
</style>

