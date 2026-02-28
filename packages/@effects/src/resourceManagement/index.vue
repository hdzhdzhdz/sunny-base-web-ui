<template>
  <div class="flex h-full w-full overflow-hidden bg-[#f0f2f5] p-[5px]">
    <a-split
      class=" bg-white rounded-[8px] p-[5px]"
      :style="{
        height: '600px',
        width: '100%',
        minWidth: '500px',
        border: '1px solid var(--color-border)'
      }"
      :size="size"
      @update:size="size = String($event)"
      min="80px"
      :max="1"
    >
      <template #first>
        <ResourceTree @currentChange="treeCurrentChange" />
      </template>
      <template #second>
        <ConstructionConfig ref="constructionSeletor" />
      </template>
    </a-split>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ResourceTree from './components/ResourceTree.vue'
import ConstructionConfig from './components/ConstructionConfig.vue'

const size = ref('300px')
const constructionSeletor = ref()

const treeCurrentChange = (keys: any, { node }: { node: any }) => {
  constructionSeletor.value.editableBaseData.moduleInfo = node
}
</script>


<style lang="scss" scoped>
.page-body {
  &>div {
    border-radius: 8px;
    height: 100%;
    background-color: #ffffff;
    padding: 10px;
    overflow-y: auto;
  }
}
</style>
