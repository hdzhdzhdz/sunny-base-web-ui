<script lang="ts" setup>
import { ref, nextTick, watch } from 'vue';
import { Input, Select } from '@arco-design/web-vue';

interface Option {
  label: string;
  value: string | number;
}

const props = defineProps<{
  title: string;
  type?: 'input' | 'select';
  options?: Option[];
}>();

const emit = defineEmits<{
  (e: 'search', value: string | number): void;
}>();

const isEditing = ref(false);
const internalValue = ref<string | number>();
const inputRef = ref();
const selectRef = ref();

const startEdit = async () => {
  isEditing.value = true;
  await nextTick();
  if (props.type === 'input' && inputRef.value) {
    inputRef.value.focus();
  } else if (props.type === 'select' && selectRef.value) {
    if (typeof selectRef.value.focus === 'function') {
      selectRef.value.focus();
    }
  }
};

const finishEdit = () => {
  isEditing.value = false;
  // Clear value when cancelling edit
  internalValue.value = undefined;
};

const handleBlur = () => {
  finishEdit();
};

const handleEnter = () => {
  isEditing.value = false;
  emit('search', internalValue.value!);
  // Clear value after search
  internalValue.value = undefined;
};

const handleChange = () => {
  // select change triggers search immediately
  emit('search', internalValue.value!);
  // Clear value after search
  internalValue.value = undefined;
  isEditing.value = false;
};

const handlePopupVisibleChange = (visible: boolean) => {
  if (!visible) {
    finishEdit();
  }
};
</script>

<template>
  <div class="custom-header w-full h-full flex items-center justify-start cursor-pointer" @click="startEdit">
    <div v-if="!isEditing" class="select-none hover:text-blue-500 transition-colors">
      {{ title }}
      <span v-if="internalValue" class="text-xs text-gray-400 ml-1">({{ internalValue }})</span>
    </div>
    <div v-else class="w-full" @click.stop>
      <Input
        v-if="type === 'input'"
        ref="inputRef"
        v-model="internalValue"
        size="mini"
        allow-clear
        @blur="handleBlur"
        @press-enter="handleEnter"
      />
      <Select
        v-else-if="type === 'select'"
        ref="selectRef"
        v-model="internalValue"
        :options="options"
        size="mini"
        allow-clear
        @change="handleChange"
        @popup-visible-change="handlePopupVisibleChange"
      />
    </div>
  </div>
</template>

<style scoped>
.custom-header {
  min-height: 24px;
}
</style>
