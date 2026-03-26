<script lang="tsx" setup>
import { ref } from 'vue'
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
import { Modal, Message } from '@arco-design/web-vue';

import { requestClient, useList } from '@sunny-base-web/effects'
import { getRoleConfig } from './config'

import RoleAdd from './RoleAdd.vue';
const RoleAddRef = ref()
import RoleAuth from './RoleAuth.vue'
const RoleAuthRef = ref()

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const { searchFormSchema, tableColumns, resourceConfig } = getRoleConfig({ t })

// 表格查询函数
const queryFunction = async ({ page, formValues }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    authRole: formValues
  };

  return requestClient.post('/core/authRole/selectForPage', queryParams);
};

const gridEvents:VxeGridListeners = {
  async toolbarButtonClick (params: any) {
    const selectRecords = [
      ...params.$grid.getCheckboxRecords()
    ]
    switch (params.button.code) {
      case 'roleManagement/add':
        RoleAddRef.value.addInit()
        break
      case 'roleManagement/update':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        RoleAddRef.value.editInit(selectRecords[0])
        break
      case 'roleManagement/delete':
        if (selectRecords.length === 0) {
          Message.warning(t('role.selectDeleteRecords'))
          return
        }
        Modal.confirm({
          title: t('common.prompt'),
          content: t('role.deleteConfirm', { count: selectRecords.length }),
          onBeforeOk: async () => {
            const idList = selectRecords.map((row: any) => row.id)
            const res = await requestClient.post('/core/authRole/deleteRole', { idList });
            if (res.code === 200) {
              Message.success(res.message)
              params.$grid.commitProxy('query', {})
              return true;
            } else {
              Message.error(res.message)
              return false;
            }
          }
        });
        break
      case 'roleManagement/detail':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        RoleAddRef.value.detailInit(selectRecords[0])
        break
      case 'roleManagement/auth':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        RoleAuthRef.value.openInit(selectRecords[0])
        break
    }
  }
}

// 使用useList钩子
const {
  QueryForm,
  formApi,
  Grid,
  gridApi,
  submitting,
  handleGlobalEnter,
  searchPlanList,
  currentSearchPlan,
  resourceId,
  nResourceid,
  handleSearchPlanSearch,
  handleDefaultPlanLoaded
} = useList<any>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction,
  gridEvents,
});

</script>

<template>
  <div class="role-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter" tabindex="-1">
    <!-- Main Container -->
    <div
      class="flex-1 bg-[var(--color-bg-2)] flex flex-col shadow-sm border border-[var(--color-border)] overflow-hidden rounded"
    >
      <!-- Search Form Area -->
      <div class="px-4 border-b py-2 pb-3 border-[var(--color-border)]">
        <QueryForm />
      </div>

      <!-- Data Grid Area -->
      <div class="flex-1 px-2 pt-1 overflow-hidden flex flex-col">
        <Grid class="flex-1" />
      </div>

      <RoleAdd ref="RoleAddRef" @success="() => gridApi.commitProxy('query')" />
      <RoleAuth ref="RoleAuthRef" @success="() => gridApi.commitProxy('query')" />
    </div>
  </div>
</template>

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 0;
}

.role-query {
  outline: none;
}
</style>