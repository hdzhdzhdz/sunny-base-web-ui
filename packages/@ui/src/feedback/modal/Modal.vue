<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :width="width"
    :top="top"
    :z-index="zIndex"
    :mask-closable="closeOnClickModal"
    :esc-to-close="closeOnEsc"
    :fullscreen="isMaximized"
    :closable="false"
    v-bind="$attrs"
    class="k-modal-custom"
    :style="{ '--modal-bg-image': `url(${bgImage})` }"
    @click.stop
    @mousedown.stop
  >
    <slot></slot>

    <template #title>
      <div class="flex items-center justify-between w-full" @dblclick="props.fullscreen && toggleMaximize()">
        <div class="flex-1 font-semibold text-base text-[var(--color-text-1)] overflow-hidden text-ellipsis whitespace-nowrap">
          <slot name="title">{{ title }}</slot>
        </div>
        <div class="flex items-center gap-3 ml-3">
          <a-tooltip v-if="displayHelpMessage" :content="displayHelpMessage">
            <div class="cursor-pointer text-[var(--color-text-2)] flex items-center justify-center transition-colors duration-200 text-base hover:text-[var(--color-text-1)]">
              <icon-question-circle />
            </div>
          </a-tooltip>

          <div v-if="props.fullscreen" class="cursor-pointer text-[var(--color-text-2)] flex items-center justify-center transition-colors duration-200 text-base hover:text-[var(--color-text-1)]" @click.stop="toggleMaximize">
            <icon-fullscreen-exit v-if="isMaximized" />
            <icon-fullscreen v-else />
          </div>

          <div class="cursor-pointer text-[var(--color-text-2)] flex items-center justify-center transition-colors duration-200 text-base hover:text-[rgb(var(--red-6))]" @click.stop="handleClose">
            <icon-close />
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <slot name="footer" v-if="$slots.footer"></slot>
      <div v-else class="flex items-center justify-end gap-2">
        <slot name="insertFooter"></slot>

        <a-button
          v-if="!attrs.hideCancel"
          v-bind="(attrs.cancelButtonProps as any)"
          @click="handleCancel"
        >
          {{ attrs.cancelText || t('common.modal.cancel') }}
        </a-button>

        <slot name="centerFooter"></slot>

        <a-button
          type="primary"
          :loading="loading || (attrs.okLoading as boolean) || (attrs.confirmLoading as boolean)"
          v-bind="(attrs.okButtonProps as any)"
          @click="handleOk"

        >
          {{ attrs.okText || t('common.modal.confirm') }}
        </a-button>

        <slot name="appendFooter"></slot>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, useAttrs } from "vue";
import {
  Modal as AModal,
  Tooltip as ATooltip,
  Button as AButton,
} from "@arco-design/web-vue";
import {
  IconClose,
  IconFullscreen,
  IconFullscreenExit,
  IconQuestionCircle,
} from "@arco-design/web-vue/es/icon";
import { useI18n } from "@sunny-base-web/locales";
import type { ModalProps } from "./types";
import bgImage from './bg.png';

const { t } = useI18n();

const props = withDefaults(defineProps<ModalProps>(), {
  modelValue: false,
  title: "Title",
  width: "50%",
  zIndex: 1000,
  closeOnEsc: true,
  fullscreen: true,
  closeOnClickModal: true,
  helpMessage: "",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
  (e: "ok"): void;
  (e: "fullscreen-change", value: boolean): void;
}>();

const attrs = useAttrs();
const loading = ref(false);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const displayHelpMessage = computed(() => {
  return props.helpMessage || t('common.modal.helpTip');
});

const isMaximized = ref(false);

const toggleMaximize = () => {
    isMaximized.value = !isMaximized.value;
    emit("fullscreen-change", isMaximized.value);
  };

const handleClose = async () => {
    // 获取 onBeforeCancel 回调
    const onBeforeCancel = props.onBeforeCancel;

    // 如果定义了 onBeforeCancel，则执行它
    if (typeof onBeforeCancel === "function") {
      const res = await onBeforeCancel();
      // 如果返回 false，则阻止关闭
      if (res === false) return;
    }

    // 重置最大化状态
    isMaximized.value = false;
    
    visible.value = false;
    emit("close");
  };

  const handleCancel = handleClose;

  const handleOk = async () => {
    // 获取 onBeforeOk 回调
    const onBeforeOk = props.onBeforeOk;

    // 如果定义了 onBeforeOk，则执行它
    if (typeof onBeforeOk === "function") {
      try {
        loading.value = true;
        const res = await onBeforeOk();
        // 如果返回 false，则阻止关闭
        if (res !== false) {
          // 重置最大化状态
          isMaximized.value = false;
          emit("ok");
          visible.value = false;
        }
      } catch (e) {
        console.error(e);
      } finally {
        loading.value = false;
      }
    } else {
      // 默认行为：触发 ok 事件并关闭弹窗
      // 重置最大化状态
      isMaximized.value = false;
      emit("ok");
      visible.value = false;
    }
  };

// 暴露方法给父组件
defineExpose({
  toggleMaximize
});
</script>

<style>
.k-modal-custom .arco-modal-body {
  background-color: transparent;
  background-image: var(--modal-bg-image);
  background-repeat: no-repeat !important;
  background-size: 80% !important;
  background-position: bottom !important;
}
</style>