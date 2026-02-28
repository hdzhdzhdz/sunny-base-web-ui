<template>
  <div :loading="contentLoading" class="config-content">
    <div v-if="editableBaseData.moduleInfo" class="w-full h-full">
      <a-tabs v-model="editableBaseData.activeName" class="w-full h-full">
        <a-tab-pane v-for="item in tabList" :key="item.key" :title="item.label">
          <edit-table
            :type="item.type"
            :area="item.area"
            :height="fullHeight"
            :data="editableBaseData.resourceData"
            :module-info="editableBaseData.moduleInfo"
            @saveResourceCallback="saveResourceCallback"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
    <div v-else class="empty">
      <a-empty description="点击左侧菜单节点，管理资源配置" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { filter, find, reduce, first, assign, uniq, map } from 'lodash-es'
import { queryResource, queryAreaResource } from '../../api/resource'
import EditTable from './EditTable/index.vue'
import selectOpts from '../../utils/select-options'

const contentLoading = ref(false)
// page basic reactive data
const editableBaseData = reactive({
  moduleInfo: null as any, // 为后期模块有模板类型做准备，放一个个moduleInfo在此容器，不然可以直接将muduleInfo传给子组件
  activeName: '', // for default tabs
  contentHeight: 0,
  resourceData: {}
})

const tabList = computed(() => {
  let tabs = []
  const { cTemplatetype, cMeta } = editableBaseData.moduleInfo
  if (cTemplatetype === '-1') { // 自定义模板
    tabs = [
      {
        label: `字段`,
        type: 'Field',
        key: `Field`
      },
      {
        label: `按钮`,
        type: 'Button',
        key: `Button`
      }
    ]
  } else if (cTemplatetype === '1') { // tabs标签
    const metaTabsObj = JSON.parse(cMeta)
    tabs = reduce(metaTabsObj, function(result: any[], value: any, key: string) {
      value.cArea.forEach((al: any) => {
        result.push({
          label: `${al.label}字段`,
          type: 'Field',
          area: al.value,
          key: `${al.value}Field`
        })
        result.push({
          label: `${al.label}按钮`,
          type: 'Button',
          area: al.value,
          key: `${al.value}Button`
        })
      })
      return result
    }, [])
  } else if (cTemplatetype === '4') { // form+tabs 模板
    const metaTabsObj = JSON.parse(cMeta)
    tabs = reduce(metaTabsObj, function(result: any[], value: any, key: string) {
      result.push({
        label: `${value.label}字段`,
        type: 'Field',
        area: value.name,
        key: `${value.name}Field`
      })
      result.push({
        label: `${value.label}按钮`,
        type: 'Button',
        area: value.name,
        key: `${value.name}Button`
      })
      return result
    }, [])
    const searchFormData = [
      {
        area: 'form',
        key: 'formField',
        label: 'form字段',
        type: 'Field'
      },
      {
        area: 'form',
        key: 'formButton',
        label: 'form按钮',
        type: 'Button'
      }
    ]
    tabs = [...searchFormData, ...tabs]
  } else {
    const templateArea = find(selectOpts.templateList, ['value', cTemplatetype])?.cArea
    tabs = reduce(templateArea, function(result: any[], value: any, key: string) {
      result.push({
        label: `${value}字段`,
        type: 'Field',
        area: value,
        key: `${value}Field`
      })
      result.push({
        label: `${value}按钮`,
        type: 'Button',
        area: value,
        key: `${value}Button`
      })
      return result
    }, [])
  }
  console.log(tabs)
  return tabs
})

watch(
  () => editableBaseData.moduleInfo,
  async (newValue, oldValue) => {
    if (newValue) {
      const { id } = newValue
      await getMuduleResouce(id)
      editableBaseData.activeName = tabList.value.length > 0 ? first(tabList.value).key : ''
    }
  }
)

const handleResize = () => {
  const el = document.querySelector('.config-content') as HTMLElement
  editableBaseData.contentHeight = el?.offsetHeight || 0
}

// 监听窗口变化，更新高度
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
const fullHeight = computed(() => {
  return editableBaseData.contentHeight - 55
})

const getMuduleResouce = (nParkeyid: string | number) => {
  contentLoading.value = true
  const payload = { authResMenu: { id: nParkeyid }}
  queryResource(payload).then(res => {
    if (res.success) {
      const { resButtonList, resFieldList } = res.result
      const templateArea = uniq([
        ...uniq(map(resFieldList, 'cArea')),
        ...uniq(map(resButtonList, 'cArea'))
      ])
      // @ts-ignore
      const templateResource = reduce(templateArea, function(result: any[], value: any, key: string) {
        result[value] = {
          'Field': filter(resFieldList, ['cArea', value]),
          'Button': filter(resButtonList, ['cArea', value])
        }
        return result
      }, {})
      editableBaseData.resourceData = assign({}, templateResource, {
        'Field': resFieldList,
        'Button': resButtonList
      })
    }
  }).finally(() => {
    contentLoading.value = false
  })
}

const saveResourceCallback = ({ area, type }: { area: string, type: string }) => {
  queryAreaResource({
    'authResMenu': {
      'id': editableBaseData?.moduleInfo?.id
    },
    'area': area
  }).then(res => {
    const path = type === 'Field' ? 'resFieldList' : 'resButtonList'
    if (area && type) {
      (editableBaseData.resourceData as any)[area][type] = res.result[path]
    } else {
      (editableBaseData.resourceData as any)[type] = res.result[path]
    }
  })
}

defineExpose({
  editableBaseData
})
</script>

<style lang="scss" scoped>
.config-content {
  width: 100%;
  height: 100%;
  padding-left: 10px;
  overflow-y: auto;
}

.empty{
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
