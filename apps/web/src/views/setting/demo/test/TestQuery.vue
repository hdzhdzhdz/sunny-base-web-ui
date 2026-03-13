<script lang="tsx" setup>
/**
 * 简化版查询页面
 * 只包含基础查询、分页、搜索、查询方案功能
 */
import { SunnySearchPlan, SunnyIcon } from "@sunny-base-web/ui"
import { searchPlanApi, useList } from '@sunny-base-web/effects';
import { selectForPage } from '#/api/setting/demo/test';
import { searchFormSchema, tableColumns, resourceConfig } from './config';
import type { TestVO, TestQueryParams } from './types';

defineOptions({
  name: 'TestQuery'
})

// ----------------------------------------------------------------------
// 类型定义
// ----------------------------------------------------------------------

/**
 * 查询函数参数接口
 */
interface QueryFunctionParams {
  /** 分页信息 */
  page: {
    /** 当前页码 */
    currentPage: number;
    /** 每页大小 */
    pageSize: number;
  };
  /** 表单值 */
  formValues: {
    /** 姓名 */
    cName?: string;
    /** 创建人工号 */
    cCrenumb?: string;
    /** 状态 */
    nZt?: number | null;
    /** 创建日期范围 */
    dCredate?: string[];
  };
}

// ----------------------------------------------------------------------
// 查询逻辑
// ----------------------------------------------------------------------

/**
 * 查询数据函数
 * @param params - 查询参数对象
 * @param params.page - 分页信息，包含当前页码和每页大小
 * @param params.formValues - 表单值，包含查询条件
 * @returns Promise 返回查询结果
 * @throws {Error} 当 API 请求失败时抛出错误
 * @example
 * ```ts
 * const result = await queryFunction({
 *   page: { currentPage: 1, pageSize: 20 },
 *   formValues: { cName: '张三' }
 * });
 * ```
 */
const queryFunction = async ({ page, formValues }: QueryFunctionParams) => {
  try {
    // 构造查询参数
    const queryParams: TestQueryParams = {
      pageNo: page.currentPage,
      pageSize: page.pageSize,
      testEntity: {
        cName: formValues.cName || '',
        cCrenumb: formValues.cCrenumb || '',
        nZt: formValues.nZt,
        dCredate: formValues.dCredate || []
      }
    };
    // 调用真实 API
    const result = await selectForPage(queryParams);
    return result;
  } catch (error) {
    console.error('查询数据失败:', error);
    throw error;
  }
}

const {
  QueryForm,
  Grid,
  searchPlanList,
  currentSearchPlan,
  resourceId,
  nResourceid,
  handleSearchPlanSearch,
  handleDefaultPlanLoaded,
  handleGlobalEnter
} = useList<TestVO>({
  searchFormSchema,
  tableColumns: tableColumns || [],  // 提供默认空数组，避免 undefined
  resourceConfig,
  queryFunction,
  objectToValueFields: ['businessSearchValue']
})
</script>

<template>
  <div class="h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter" tabindex="-1">
    <!-- Main Container -->
    <div
      class="flex-1 bg-[var(--color-bg-2)] flex flex-col shadow-sm border border-[var(--color-border)] overflow-hidden rounded">
      <!-- Search Form Area -->
      <div class="px-4 border-b py-2 pb-3 border-[var(--color-border)]">
        <QueryForm>
          <template #expand-before>
            <SunnySearchPlan :form-config="searchFormSchema" v-model:current-search-plan="currentSearchPlan"
              v-model:search-plan-list="searchPlanList" :resource-id="resourceId" :n-resourceid="nResourceid"
              :api="searchPlanApi" @search="handleSearchPlanSearch" @default-plan-loaded="handleDefaultPlanLoaded">
              <template #trigger="{ open }">
                <button type="button"
                  class="px-3 py-1.5 border border-[var(--color-border-2)] rounded bg-white text-sm transition-all hover:border-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-6))] disabled:cursor-not-allowed disabled:opacity-60 mr-2"
                  @click="open" title="查询方案" aria-label="查询方案">
                  <SunnyIcon icon="lucide:filter" class="w-4 h-4" />
                </button>
              </template>
            </SunnySearchPlan>
          </template>
        </QueryForm>
      </div>

      <!-- Data Grid Area -->
      <div class="flex-1 px-2 pt-1 overflow-hidden flex flex-col">
        <Grid>
          <!-- 姓名列自定义插槽 -->
          <template #cNameSlot="{ row }">
            <!-- 当姓名是 A2 时展示个性化内容 -->
            <div v-if="row.cName === 'A2'" class="flex items-center gap-2">
              <a-tag color="purple" class="animate-pulse">
                <template #icon>
                  <SunnyIcon icon="lucide:sparkles" class="w-3 h-3" />
                </template>
                特别用户
              </a-tag>
              <span class="font-bold text-[rgb(var(--primary-6))]">{{ row.cName }}</span>
              <a-badge :count="1" dot>
                <SunnyIcon icon="lucide:star" class="w-4 h-4 text-yellow-500" />
              </a-badge>
            </div>
            <!-- 其他情况正常显示 -->
            <span v-else class="text-[var(--color-text-1)]">{{ row.cName }}</span>
          </template>

          <!-- 名称1列自定义插槽 - 当值为 A3 时高亮 -->
          <template #cName1Cell="{ row }">
            <div
              :class="row.cName1 === 'A3' ? 'bg-purple-500 text-white font-bold h-full w-full flex items-center px-2' : ''">
              {{ row.cName1 }}
            </div>
          </template>
        </Grid>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 0;
}
</style>
