<template>
  <a-space>
    <a-button @click="visible = true">v-model 控制</a-button>
    <Modal v-model="visible" title="v-model 控制">
      <p>这是一个直接使用 Modal 组件并通过 v-model 控制显隐的例子。</p>
    </Modal>
  </a-space>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Modal } from "@kunkka/ui";

const visible = ref(false);
</script>
