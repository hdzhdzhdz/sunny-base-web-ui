<template>
  <a-modal
    v-model:visible="visible"
    :mask-closable="false"
    :unmount-on-close="true"
    draggable
    :title="`菜单路径变更`"
    width="500px"
    :ok-loading="loading"
    @before-ok="submit"
  >
    <div class="mb-2">当前选择的菜单：{{ nodeData.cModname }}</div>
    <!-- {{ nodeData.id }} to {{ menuID }} -->
    <a-cascader
      v-model="menuID"
      :options="options"
      check-strictly
      allow-clear
      allow-search
      :field-names="{
        label: 'label',
        value: 'value',
        children: 'childList'
      }"
    />
  </a-modal>
</template>

<script>
import { queryCascader, saveMenuMove } from '../../../api/resource'

export default {
  data() {
    return {
      menuID: '',
      visible: false,
      nodeData: {},
      options: [],
      loading: false
    }
  },
  methods: {
    openEditor(node) {
      queryCascader({
        authResMenu: {
          id: node.id,
          cSystem: node.cSystem
        }
      }).then(res => {
        this.menuID = ''
        this.options = res.result
        this.nodeData = node
        this.visible = true
      })
    },
    submit(done) {
      if (!this.menuID) {
        this.$message.error('请选择菜单路径')
        return false
      }
      var json = {
        authResMenu: {
          id: this.nodeData.id,
          nParkeyid: this.menuID
        }
      }
      this.loading = true
      saveMenuMove(json).then(res => {
        if (res.code === 200) {
          this.$message.success(res.message)
          this.$emit('refresh-nodes', {
            nodeIds: [this.nodeData.nParkeyid, this.menuID]
          })
          done()
        } else {
          this.$message.info(res.message)
        }
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
