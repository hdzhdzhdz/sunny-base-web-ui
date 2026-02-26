<template>
  <div class="page-body">
    <a-split
      :style="{
        height: '600px',
        width: '100%',
        minWidth: '500px',
        border: '1px solid var(--color-border)'
      }"
      v-model:size="size"
      min="80px"
      :max="1"
    >
      <template #first>
        <resource-tree @currentChange="treeCurrentChange" />
      </template>
      <template #second>123123
        <!-- <construction-config ref="constructionSeletor" /> -->
      </template>
    </a-split>
  </div>
</template>

<!-- <script> export default { name: 'ResourceManagement' }</script> -->

<script setup lang="ts">
import { ref } from 'vue'
const size = ref('300px')
import ResourceTree from './components/ResourceTree.vue'
// import ConstructionConfig from '../components/ConstructionConfig.vue'
const constructionSeletor = ref(null)
// tree current value change callback
const treeCurrentChange = (data: any) => {
  console.log(data)
  // set new module info
  // constructionSeletor.value.editableBaseData.moduleInfo = data
}
</script>

<style lang="scss" scoped>
.page-body {
  display: flex;
  flex-direction: row !important;
  height: 100%;
  overflow: hidden;
  background: #f0f2f5;
  padding: 12px;

  &>div {
    border-radius: 8px;
    height: 100%;
    background-color: #ffffff;
    padding: 10px;
    overflow-y: auto;
  }

  .left_tree {
    width: 280px;
  }

  .right_info {
    margin-left: 10px;
    flex: 1;
    position: relative;
    z-index:1;
    .loading {
      position: absolute;
      top: 50%;
      right: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
