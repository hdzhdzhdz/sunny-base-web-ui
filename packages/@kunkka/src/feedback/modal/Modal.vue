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
  >
    <slot></slot>

    <template #title>
      <div class="flex items-center justify-between w-full" @dblclick="toggleMaximize">
        <div class="flex-1 font-semibold text-base text-[var(--color-text-1)] overflow-hidden text-ellipsis whitespace-nowrap">
          <slot name="title">{{ title }}</slot>
        </div>
        <div class="flex items-center gap-3 ml-3">
          <a-tooltip v-if="helpMessage" :content="helpMessage">
            <div class="cursor-pointer text-[var(--color-text-2)] flex items-center justify-center transition-colors duration-200 text-base hover:text-[var(--color-text-1)]">
              <icon-question-circle />
            </div>
          </a-tooltip>

          <div class="cursor-pointer text-[var(--color-text-2)] flex items-center justify-center transition-colors duration-200 text-base hover:text-[var(--color-text-1)]" @click.stop="toggleMaximize">
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
          v-bind="attrs.cancelButtonProps"
          @click="handleCancel"
        >
          {{ attrs.cancelText || "取消" }}
        </a-button>

        <slot name="centerFooter"></slot>

        <a-button
          type="primary"
          :loading="loading || (attrs.okLoading as boolean) || (attrs.confirmLoading as boolean)"
          v-bind="attrs.okButtonProps"
          @click="handleOk"
        >
          {{ attrs.okText || "确定" }}
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
import type { ModalProps } from "./types";

const props = withDefaults(defineProps<ModalProps>(), {
  modelValue: false,
  title: "Title",
  width: "50%",
  zIndex: 1000,
  closeOnEsc: true,
  closeOnClickModal: true,
  helpMessage: "双击标题栏可最大化/还原，按 ESC 可关闭弹窗",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
  (e: "ok"): void;
}>();

const attrs = useAttrs();
const loading = ref(false);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const isMaximized = ref(false);

const toggleMaximize = () => {
    isMaximized.value = !isMaximized.value;
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
      emit("ok");
      visible.value = false;
    }
  };
</script>

