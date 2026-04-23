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
    class="sunny-modal"
    :style="{ '--sunny-modal-bg': `url(${bgImage})` }"
    @click.stop
    @mousedown.stop
  >
    <slot></slot>

    <template #title>
      <div class="sunny-modal__header" @dblclick="props.fullscreen && toggleMaximize()">
        <div class="sunny-modal__title-text">
          <slot name="title">{{ title }}</slot>
        </div>
        <div class="sunny-modal__header-actions">
          <a-tooltip v-if="displayHelpMessage" :content="displayHelpMessage">
            <button type="button" class="sunny-modal__action-btn sunny-modal__action-btn--help" @click.stop>
              <icon-question-circle />
            </button>
          </a-tooltip>

          <button v-if="props.fullscreen" type="button" class="sunny-modal__action-btn" @click.stop="toggleMaximize">
            <icon-fullscreen-exit v-if="isMaximized" />
            <icon-fullscreen v-else />
          </button>

          <button type="button" class="sunny-modal__action-btn sunny-modal__action-btn--close" @click.stop="handleClose">
            <icon-close />
          </button>
        </div>
      </div>
    </template>

    <template #footer>
      <slot name="footer" v-if="$slots.footer"></slot>
      <div v-else class="sunny-modal__footer">
        <slot name="insertFooter"></slot>

        <a-button
          v-if="!attrs.hideCancel"
          size="small"
          v-bind="(attrs.cancelButtonProps as any)"
          @click="handleCancel"
        >
          {{ attrs.cancelText || t('common.modal.cancel') }}
        </a-button>

        <slot name="centerFooter"></slot>

        <a-button
          v-if="!attrs.hideOk"
          type="primary"
          size="small"
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
import bgImage from "./bg.png";
import type { ModalProps } from "./types";

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
    const onBeforeCancel = props.onBeforeCancel;

    if (typeof onBeforeCancel === "function") {
      const res = await onBeforeCancel();
      if (res === false) return;
    }

    isMaximized.value = false;

    visible.value = false;
    emit("close");
  };

  const handleCancel = handleClose;

  const handleOk = async () => {
    const onBeforeOk = props.onBeforeOk;

    if (typeof onBeforeOk === "function") {
      try {
        loading.value = true;
        const res = await onBeforeOk();
        if (res !== false) {
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
      isMaximized.value = false;
      emit("ok");
      visible.value = false;
    }
  };

defineExpose({
  toggleMaximize
});
</script>

<style>
/* ===== Sunny Modal — Mini Business + Finesse ===== */

/* ---------- 弹窗外壳 ---------- */
.sunny-modal.arco-modal {
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(var(--primary-6), 0.06),
    0 8px 24px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.04);
}

/* ---------- 标题栏 ---------- */
.sunny-modal .arco-modal-header {
  position: relative;
  padding: 10px 16px;
  border-bottom: none;
}

/* 底部分隔线：渐变 + 流光动画 */
.sunny-modal .arco-modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    var(--color-border-2) 5%,
    rgba(var(--primary-6), 0.45) 50%,
    var(--color-border-2) 95%,
    transparent
  );
  background-size: 200% 100%;
  animation: sunnyModalLine 2.5s ease-in-out infinite;
}

/* ---------- 内容区 ---------- */
.sunny-modal .arco-modal-body {
  padding: 12px 16px;
  background-color: transparent;
  background-image: var(--sunny-modal-bg);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: right bottom;
}

/* ---------- 底部 ---------- */
.sunny-modal .arco-modal-footer {
  position: relative;
  padding: 12px 16px;
  border-top: none;
}

/* 顶部分隔线：渐变 + 流光动画 */
.sunny-modal .arco-modal-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    var(--color-border-2) 5%,
    rgba(var(--primary-6), 0.35) 50%,
    var(--color-border-2) 95%,
    transparent
  );
  background-size: 200% 100%;
  animation: sunnyModalLine 2.5s ease-in-out infinite;
}

@keyframes sunnyModalLine {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

/* ===== Header 内部布局 ===== */
.sunny-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 22px;
}

.sunny-modal__title-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--color-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sunny-modal__header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 12px;
}

/* ===== 操作按钮 ===== */
.sunny-modal__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-3);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.sunny-modal__action-btn:hover {
  background-color: var(--color-fill-2);
  color: var(--color-text-1);
  transform: scale(1.1);
}

.sunny-modal__action-btn:active {
  transform: scale(0.95);
}

/* 帮助按钮 hover 主题色 */
.sunny-modal__action-btn--help:hover {
  color: rgb(var(--primary-6));
  background-color: rgba(var(--primary-6), 0.06);
}

/* 关闭按钮 hover 红色 + 涟漪 */
.sunny-modal__action-btn--close:hover {
  background-color: rgba(var(--red-6), 0.08);
  color: rgb(var(--red-6));
}

.sunny-modal__action-btn--close:active {
  background-color: rgba(var(--red-6), 0.16);
}

/* ===== Footer 按钮 ===== */
.sunny-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* 主按钮呼吸光晕 */
.sunny-modal__footer .arco-btn-primary {
  position: relative;
  transition: all 0.2s ease;
}

.sunny-modal__footer .arco-btn-primary::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: rgb(var(--primary-6));
  opacity: 0;
  filter: blur(4px);
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.sunny-modal__footer .arco-btn-primary:hover::after {
  opacity: 0.2;
}

.sunny-modal__footer .arco-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--primary-6), 0.3);
}

.sunny-modal__footer .arco-btn-primary:active {
  transform: translateY(0);
}

/* ===== 全屏过渡 ===== */
.sunny-modal.arco-modal-fullscreen {
  border-radius: 0;
  animation: none;
}

/* ===== Loading 态旋转光圈 ===== */
.sunny-modal__footer .arco-btn-primary.arco-btn-loading {
  pointer-events: none;
}

.sunny-modal__footer .arco-btn-primary.arco-btn-loading::after {
  opacity: 0;
}
</style>
