<template>
  <el-dialog
    v-bind="$attrs"
    :model-value="modelValue"
    :fullscreen="fullscreen"
    :title="title"
    :width="width"
    :before-close="handleBeforeClose"
    @close="handleClose"
    @open="handleOpen"
    @opened="handleOpened"
    @closed="handleClosed"
    @update:modelValue="handleUpdateModelValue"
    ref="dialogRef"
    class="kunkka-modal"
  >
    <!-- Pass through all slots -->
    <template v-for="(_, name) in slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>

    <!-- Default content slot (if not handled by loop above, but loop covers it if it's in slots) -->
    <!-- Wait, v-for in slots covers 'default' too? Yes. -->

    <!-- Footer handling -->
    <!-- We check if footer slot is provided by parent. If so, the v-for above passed it. -->
    <!-- But we want to provide a DEFAULT footer if showOkBtn/CancelBtn is true and NO footer slot is provided. -->

    <template #footer v-if="!slots.footer && (showOkBtn || showCancelBtn)">
      <div class="kunkka-modal-footer">
        <el-button v-if="showCancelBtn" @click="handleCancel">
          {{ cancelText }}
        </el-button>
        <el-button
          v-if="showOkBtn"
          type="primary"
          :loading="confirmLoading"
          @click="handleOk"
        >
          {{ okText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, useSlots, useAttrs } from "vue";
import { ElDialog, ElButton } from "element-plus";
import type { ModalProps } from "./types";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ModalProps>(), {
  modelValue: false,
  fullscreen: false,
  canFullscreen: true,
  canMinimize: true,
  showCancelBtn: true,
  cancelText: "取消",
  showOkBtn: true,
  okText: "确定",
  confirmLoading: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "ok"): void;
  (e: "cancel"): void;
  (e: "close"): void;
  (e: "open"): void;
  (e: "opened"): void;
  (e: "closed"): void;
}>();

const slots = useSlots();
const attrs = useAttrs();
const dialogRef = ref<InstanceType<typeof ElDialog>>();

// Expose public methods/properties of ElDialog
defineExpose({
  dialogRef,
});

const handleUpdateModelValue = (val: boolean) => {
  emit("update:modelValue", val);
};

const handleCancel = () => {
  props.onCancel?.();
  emit("cancel");
  handleUpdateModelValue(false);
};

const handleOk = () => {
  props.onOk?.();
  emit("ok");
};

const handleBeforeClose = (done: () => void) => {
  // Pass through before-close if it was in attrs?
  // But defineProps didn't take it.
  // Wait, if user passed :before-close="fn", it is in $attrs.
  // ElDialog has :before-close prop.
  // We bound v-bind="$attrs".
  // BUT we also bound :before-close="handleBeforeClose".
  // This overrides $attrs.before-close!
  // So we must call the user's before-close if it exists in attrs.

  const userBeforeClose = attrs["before-close"] as
    | ((done: () => void) => void)
    | undefined;
  if (userBeforeClose) {
    userBeforeClose(done);
  } else {
    done();
  }
};

const handleClose = () => {
  props.onClose?.();
  emit("close");
};

const handleOpen = () => {
  emit("open");
};

const handleOpened = () => {
  emit("opened");
};

const handleClosed = () => {
  emit("closed");
};
</script>

<style scoped>
.kunkka-modal-footer {
  text-align: right;
}
</style>
