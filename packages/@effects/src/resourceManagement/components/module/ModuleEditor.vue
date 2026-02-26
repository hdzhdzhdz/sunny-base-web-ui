<template>
  <a-modal
    v-model:visible="visible"
    width="800px"
    :mask-closable="false"
    :title="`资源${!type ? '新增' : '编辑'}`"
    :unmount-on-close="true"
    draggable
    @before-ok="handleBeforeOk"
    @cancel="close"
  >
    <Form>
      <template #cViewpath="{ model, field }">
        <a-auto-complete
          v-model="model[field.name]"
          :data="['Layout', 'Second']"
          :trigger-props="{ trigger: 'focus' }"
          allow-clear
        />
      </template>
      <template #cIcon>
        cIcon
      </template>
      <template #cMeta="{ model, field }">
        <TabMetaEditor
          v-if="model.cTemplatetype == '1'"
          ref="tabMetaEditor"
          v-model="model[field.name]"
        />
        <FormTabsMetaEditor
          v-else-if="model.cTemplatetype == '4'"
          ref="formTabsMetaEditor"
          v-model="model[field.name]"
        />
        <a-textarea
          v-else
          v-model="model[field.name]"
          allow-clear
        />
      </template>
    </Form>
    <!-- <NodeFile ref="nodefile" @handleOk="handleNodefileOk" /> -->
  </a-modal>
</template>

<script setup>
import { useModuleEditor } from '../hook/useModuleEditor'
import TabMetaEditor from './TabMetaEditor.vue'
import FormTabsMetaEditor from './FormTabsMetaEditor.vue'
// import NodeFile from './NodeFile.vue'
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { endsWith } from 'lodash-es'

const emits = defineEmits(['save'])
const nodefile = ref() // 模块信息编辑器弹窗

const openNodeFile = () => {
  nodefile?.value.onDataReceive({ visible: true })
}

const handleBeforeOk = async(done) => {
  const result = await formApi.validate();
  const formValues = await formApi.getValues();

  if (result.valid) {
    // Form + Table 查询页，cViewpath 组件路径必须以Query结尾
    if (formValues.cTemplatetype === '0') {
      if (endsWith(formValues.cViewpath, 'Query')) {
        Message.error({
          closable: true,
          content: `error: Form + Table 查询页，组件路径必须以Query结尾`,
        })
        return false
      }
    }

    // 通过校验
    handleOk()
  } else {
    Message.error('校验失败: ' + Object.keys(result.errors).join(', '));
    return false
  }
};

const {
  openEditor,
  data,
  type,
  visible,
  events,
  formInstance,
  formFields,
  tabMetaEditor,
  formTabsMetaEditor,
  rules,
  confirmLoading,
  handleOk,
  handleNodefileOk,
  close,
  Form,
  formApi
} = useModuleEditor(emits) // useHook

// expose
defineExpose({
  openEditor
})
</script>
