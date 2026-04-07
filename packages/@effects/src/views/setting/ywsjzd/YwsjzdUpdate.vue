<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { Message, Tabs } from '@arco-design/web-vue'
const { TabPane } = Tabs
import { Modal } from '@sunny-base-web/ui'
import { requestClient } from '../../../api/request'
import { useFormTabs } from '../../../hooks/useFormTabs'
import { addFormSchema, tabsConfig } from './config'
import type { YwsjzdFormVO, MetaItem, YwsjzdVO } from './types'

defineOptions({
  name: 'YwsjzdUpdate'
})

interface Props {
  visible: boolean
  row?: YwsjzdVO
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  row: undefined
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const loading = ref(false)
const activeTab = ref(0)

// 使用集成的表单标签页配置
const [Form, formApi, gridComponents, gridApis] = useFormTabs({
  formSchema: addFormSchema,
  tabsConfig: tabsConfig
})

// 监听弹窗打开，加载数据
watch(() => props.visible, async (val) => {
  if (val && props.row) {
    formApi.resetForm()
    gridApis.value[0].reloadData([])
    
    try {
      // 调用修改初始化接口
      const res = await requestClient.post<{ result: YwsjzdVO }>('/core/authDict/editInit', {
        authDict: {
          id: props.row.id
        }
      })
      
      const data = res.result
      if (data) {
        // 设置表单值
        formApi.setValues({
          cXuhao: data.authDict.cXuhao,
          cName: data.authDict.cName,
          cSign: data.authDict.cSign,
          nOrder: data.authDict.nOrder
        })
        
        // 解析额外属性
        if (data.authDict.cMeta) {
          try {
            const metaObj = JSON.parse(data.authDict.cMeta)
            const metaItems: MetaItem[] = Object.keys(metaObj).map(key => ({
              key,
              value: metaObj[key]
            }))
            gridApis.value[0].reloadData(metaItems)
          } catch (e) {
            console.error('解析额外属性失败:', e)
          }
        }

        // 加载子级数据字典
        if (data.childList && data.childList.length > 0) {
          gridApis.value[1].reloadData(data.childList)
        } else {
          gridApis.value[1].reloadData([])
        }
      }
    } catch (error: any) {
      console.error('加载数据失败:', error)
      Message.error('加载数据失败')
    }
  }
})

// 弹窗标题
const modalTitle = computed(() => '修改字典')

// 提交表单
async function handleSubmit() {
  try {
    const { valid } = await formApi.validate()
    if (!valid) return false

    // 校验额外属性表格
    const gridErrMap = await gridApis.value[0].validate()
    if (gridErrMap) return false

    // 检查属性键是否重复
    const metaData = await gridApis.value[0].getFullData()
    const keys = metaData.filter(item => item.key).map(item => item.key)
    const uniqueKeys = new Set(keys)
    if (keys.length !== uniqueKeys.size) {
      Message.warning('属性键不能重复')
      return false
    }

    const values = await formApi.getValues() as YwsjzdFormVO

    // 将额外属性转换为 JSON 对象
    const metaObj: Record<string, string> = {}
    metaData.forEach(item => {
      if (item.key) {
        metaObj[item.key] = item.value || ''
      }
    })

    // 获取子级数据字典表格数据
    const authDictData = await gridApis.value[1].getFullData()

    const params = {
      authDict: {
        id: props.row?.id,
        cXuhao: values.cXuhao,
        cName: values.cName,
        cSign: values.cSign,
        nOrder: values.nOrder || 0,
        cMeta: JSON.stringify(metaObj),
        nParent: props.row?.nParent || 0,
        nType: props.row?.nType || 1
      },
      authDictList: authDictData
    }

    const res = await requestClient.post<{ message?: string }>('/core/authDict/editBS', params)
    Message.success(res.message)
    emit('success')
    return true
  } catch (error: any) {
    console.error('修改失败:', error)
    return false
  }
}

// 取消
function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <Modal :model-value="props.visible" :title="modalTitle" :width="700" :on-before-ok="handleSubmit"
    @update:model-value="emit('update:visible', $event)" @close="handleClose">
    <Form />
    
    <Tabs v-model="activeTab">
      <TabPane v-for="(tab, index) in tabsConfig" :key="index" :title="tab.title">
        <component :is="gridComponents[index]" 
                  :id="`grid-${index}`" 
                  border 
                  max-height="300" />
      </TabPane>
    </Tabs>
  </Modal>
</template>
