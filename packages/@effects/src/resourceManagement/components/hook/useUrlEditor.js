import { reactive, toRefs, ref } from 'vue'
import { queryMenuUrl, saveBatchMenuUrl } from '../../../api/resource'
import { Message } from '@arco-design/web-vue';

export const useUrlEditor = (emits) => {
  const editTable = ref()
  const urlData = reactive({
    data: [],
    moduleId: null,
    visible: false,
    confirmLoading: false,
    contentLoading: false,
    validRules: {
      cUrl: [{ required: true, message: '请填写URL地址' }],
      cDesc: [{ required: false, message: '请填写描述' }]
    }
  })
  // 打开编辑器
  const openEditor = (moduleId) => {
    urlData.moduleId = moduleId
    urlData.visible = true
    queryUrlList(moduleId)
  }
  const queryUrlList = (moduleId) => {
    urlData.confirmLoading = true
    urlData.contentLoading = true
    const payload = { authResMenu: { id: moduleId }}
    queryMenuUrl(payload).then(res => {
      if (res.success) {
        urlData.data = res.result || []
      } else {
        Message.error({
          closable: true,
          content: `error:${res.message}`,
        })
      }
    }).finally(() => {
      urlData.confirmLoading = false
      urlData.contentLoading = false
    })
  }
  // 点击保存时的回调
  const handleOk = async() => {
    const $table = editTable?.value
    
    if ($table) {
      const errMap = await $table.validate(true)
      if (errMap) {
        Message.warning({
          closable: true,
          content: `请填写所有必填项`,
        })
        return false
      }
    }
    const { fullData } = $table.getTableData()
    // const errMap = await $table.validate().catch(errMap => errMap)
    // console.log(errMap)
    // if (errMap) {
    //   Message.warning({
    //     closable: true,
    //     content: `请填写所有必填项`,
    //   })
    //   return false
    // }
    const list = fullData.map(it => {
      return {
        cUrl: it.cUrl.trim(),
        cDesc: it.cDesc?.trim() || '',
        id: it.id,
        nClicknum: it.nClicknum ? it.nClicknum : 0
      }
    })
    const payload = { parId: urlData.moduleId, authModuleUrlList: list }
    urlData.confirmLoading = true
    
    await saveBatchMenuUrl(payload).then(res => {
      if (res.success) {
        Message.success({
          closable: true,
          content: `保存成功!`,
        })
        urlData.visible = false
      } else {
        Message.error({
          closable: true,
          content: `error:${res.message}`,
        })
      }
    }).finally(() => {
      urlData.confirmLoading = false
    })
  }
  // 弹窗关闭时的回调
  const close = () => {
    console.log('close')
    urlData.data = []
    urlData.moduleId = null
    urlData.confirmLoading = false
    urlData.contentLoading = false
  }
  // 新增行
  const insertEvent = async() => {
    const record = {
      cUrl: '',
      cDesc: '',
      id: '',
      nClicknum: 0
    }
    urlData.data.unshift(record)
  }
  // 删除行
  const remove = (row) => {
    urlData.data = urlData.data.filter(it => it.id !== row.id)
  }
  return {
    ...toRefs(urlData),
    editTable,
    openEditor,
    handleOk,
    close,
    insertEvent,
    remove

  }
}
