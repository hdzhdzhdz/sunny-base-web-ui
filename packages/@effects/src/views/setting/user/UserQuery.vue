<script lang="tsx" setup>
import { ref } from 'vue'
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
import { Modal, Message } from '@arco-design/web-vue';

import { useExportModal, useImportModal } from '@sunny-base-web/ui'
import { requestClient, searchPlanApi, useList } from '@sunny-base-web/effects'
import { getUserConfig } from './config'

import UserAdd from './UserAdd.vue';
const UserAddRef = ref()
import UserAuth from './UserAuth.vue'
const UserAuthRef = ref()
import UserBindMac from './UserBindMac.vue'
const UserBindMacRef = ref()
import UserOtherAuth from './UserOtherAuth.vue'
const UserOtherAuthRef = ref()

import { useRouter } from 'vue-router'
const router = useRouter()

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const { searchFormSchema, tableColumns, resourceConfig } = getUserConfig({ t })

const queryFunction = async ({ page, formValues }: { page: { currentPage: number; pageSize: number }; formValues: Record<string, any> }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    assUserOperationLog: formValues
  };

  return requestClient.post('/core/authUser/selectForPage', queryParams);
};

const gridEvents:VxeGridListeners = {
  async toolbarButtonClick (params: any) {
    console.log(params)
    const selectRecords = [
      // ...params.$grid.getCheckboxReserveRecords(), // 保留选中的记录
      ...params.$grid.getCheckboxRecords() // 当前选中的记录
    ]
    switch (params.button.code) {
      case 'userManagement/add':
        UserAddRef.value.addInit()
        break
      case 'userManagement/update':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        UserAddRef.value.editInit(selectRecords[0])
        break
      case 'userManagement/delete':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        Modal.confirm({
          title: t('common.prompt'),
          content: `确定删除选中 ${selectRecords.length} 项吗？`,
          onBeforeOk: async () => {
            // 调用删除接口
            const res = await requestClient.post('/core/authUser/delete', {
              id: selectRecords[0].id
            });
            if (res.code === 200) {
              Message.success(res.message)
              // 刷新表格数据
              params.$grid.commitProxy('query', {})
              return true;
            } else {
              Message.error(res.message)
              return false;
            }
          }
        });
        break
      case 'userManagement/detail':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        UserAddRef.value.detailInit(selectRecords[0])
        break
      case 'userManagement/resetPassword':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        Modal.confirm({
          title: t('common.prompt'),
          content: t('user.resetPasswordTips', { username: selectRecords[0].cUsername }),
          onBeforeOk: async () => {
            // 调用重置密码接口
            const res = await requestClient.post('/core/authUser/resetPwd', {
              id: selectRecords[0].id
            });
            if (res.code === 200) {
              Message.success(res.message)
              // 刷新表格数据
              params.$grid.commitProxy('query', {})
              return true;
            } else {
              Message.error(res.message)
              return false;
            }
          }
        });
        break
      case 'userManagement/enable':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        Modal.confirm({
          title: t('common.prompt'),
          content: t('user.enableTips', { username: selectRecords[0].cUsername }),
          onBeforeOk: async () => {
            // 调用启用接口
            const res = await requestClient.post('/core/authUser/updateSign', {
              id: selectRecords[0].id,
              cSign: '0'
            });
            if (res.code === 200) {
              Message.success(res.message)
              // 刷新表格数据
              params.$grid.commitProxy('query', {})
              return true;
            } else {
              Message.error(res.message)
              return false;
            }
          }
        });
        break
      case 'userManagement/disable':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        Modal.confirm({
          title: t('common.prompt'),
          content: t('user.disableTips', { username: selectRecords[0].cUsername }),
          onBeforeOk: async () => {
            // 调用禁用接口
            const res = await requestClient.post('/core/authUser/updateSign', {
              id: selectRecords[0].id,
              cSign: '1'
            });
            if (res.code === 200) {
              Message.success(res.message)
              // 刷新表格数据
              params.$grid.commitProxy('query', {})
              return true;
            } else {
              Message.error(res.message)
              return false;
            }
          }
        });
        break
      case 'userManagement/auth':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        UserAuthRef.value.openInit(selectRecords[0])
        break
      case 'userManagement/macBind':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        UserBindMacRef.value.openInit(selectRecords[0])
        break
      case 'userManagement/otherAuth':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        UserOtherAuthRef.value.openInit(selectRecords[0])
        break
      case 'daoru/show':
        importModalApi.open({
          nModid: router.currentRoute.value.meta.id,
          nButtonid: params.button.nButtonid,
        })
        break
      case 'daochu/show':
        const formValues = await formApi.getValues()
        exportModalApi.open({
          nmodid: router.currentRoute.value.meta.id,
          nButtonid: params.button.nButtonid,
          conditionMap: formValues
        })
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

const [exportModal, exportModalApi] = useExportModal({})
const [importModal, importModalApi] = useImportModal({})
</script>

<template>
  <div class="operation-log-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter" tabindex="-1">
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

      <exportModal />
      <importModal />
      <UserAdd ref="UserAddRef" @success="() => gridApi.commitProxy('query')" />
      <UserAuth ref="UserAuthRef" @success="() => gridApi.commitProxy('query')" />
      <UserBindMac ref="UserBindMacRef" @success="() => gridApi.commitProxy('query')" />
      <UserOtherAuth ref="UserOtherAuthRef" @success="() => gridApi.commitProxy('query')" />
    </div>
  </div>
</template>
