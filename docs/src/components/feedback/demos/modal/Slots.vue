<template>
  <a-space>
    <a-button status="warning" @click="handleOpen">底部插槽示例</a-button>
    <ConnectedModal title="底部插槽">
      <p>使用了 insertFooter 插槽在左侧添加了一个额外按钮。</p>
      <template #insertFooter>
        <span style="color: #86909c; margin-right: 12px">额外信息</span>
      </template>
      <template #appendFooter>
          <a-button type="text">帮助</a-button>
      </template>
    </ConnectedModal>
  </a-space>
</template>

<script setup lang="ts">
import { useKunkkaModal } from "@kunkka/ui";

const [ConnectedModal, { open }] = useKunkkaModal();

const handleOpen = () => {
  open();
};
</script>
