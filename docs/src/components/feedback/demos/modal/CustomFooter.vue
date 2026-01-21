<template>
  <a-space>
    <a-button @click="handleOpen">自定义底部按钮</a-button>
    <ConnectedModal
      title="自定义底部"
      ok-text="提交"
      cancel-text="放弃"
      :ok-button-props="{ status: 'warning' }"
    >
      <p>可以通过 okText 和 cancelText 修改按钮文字。</p>
      <p>通过 okButtonProps 和 cancelButtonProps 修改按钮样式。</p>
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
