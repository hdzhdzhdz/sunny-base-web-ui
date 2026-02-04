<template>
  <a-space>
    <a-button type="primary" @click="handleOpen">打开弹窗</a-button>
    <ConnectedModal title="基础弹窗">
      <p>这是一个通过 useKunkkaModal 控制的基础弹窗。</p>
      <p>支持拖拽、双击标题栏最大化、ESC 关闭等功能。</p>
    </ConnectedModal>
  </a-space>
</template>

<script setup lang="ts">
import { useKunkkaModal } from "@sunny-base-web/ui";

const [ConnectedModal, { open }] = useKunkkaModal();

const handleOpen = () => {
  open();
};
</script>
