<template>
  <a-space>
    <a-button status="success" @click="handleOpen">异步关闭</a-button>
    <ConnectedModal
      title="异步关闭"
      :on-before-ok="handleBeforeOk"
    >
      <p>点击确定后，按钮会进入 loading 状态，2秒后关闭。</p>
    </ConnectedModal>
  </a-space>
</template>

<script setup lang="ts">
import { useKunkkaModal } from "@sunny-base-web/ui";

const [ConnectedModal, { open }] = useKunkkaModal();

const handleOpen = () => {
  open();
};

const handleBeforeOk = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return true;
};
</script>
