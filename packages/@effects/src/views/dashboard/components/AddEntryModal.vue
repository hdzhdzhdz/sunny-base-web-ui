<script setup lang="ts">
import { ref, watch, computed } from 'vue';

import { useI18n } from '@sunny-base-web/locales';
import { Modal } from '@sunny-base-web/ui';
import { SunnyIcon } from '@sunny-base-web/ui';

import { querySelMod, type ModGroup, type ModListItem } from '../api';

defineOptions({
  name: 'AddEntryModal',
});

const props = defineProps<{
  visible: boolean;
  userId: string;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  confirm: [selected: ModListItem[]];
}>();

const { t } = useI18n();

const loading = ref(false);
const modGroups = ref<ModGroup[]>([]);
const activeGroup = ref<string>('');
const selectedMods = ref<Map<string, ModListItem>>(new Map());

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      await loadModules();
    }
  }
);

async function loadModules() {
  loading.value = true;
  selectedMods.value.clear();
  activeGroup.value = '';

  try {
    const response = await querySelMod({
      cCreateuser: props.userId,
    });
    modGroups.value = response.result || [];
    modGroups.value.forEach((group) => {
      group.modList?.forEach((mod) => {
        if (mod.check === '1') {
          selectedMods.value.set(mod.cShowname, mod);
        }
      });
    });
    if (modGroups.value.length > 0) {
      activeGroup.value = modGroups.value[0].cShowname;
    }
  } catch (error) {
    console.error('Failed to load modules:', error);
    modGroups.value = [];
  } finally {
    loading.value = false;
  }
}

function handleConfirm() {
  emit('confirm', Array.from(selectedMods.value.values()));
  emit('update:visible', false);
}

function addMod(mod: ModListItem) {
  // 创建新的 Map 实例以触发 Vue 响应式更新
  const newMap = new Map(selectedMods.value);
  newMap.set(mod.cShowname, mod);
  selectedMods.value = newMap;
}

function removeMod(name: string) {
  // 创建新的 Map 实例以触发 Vue 响应式更新
  const newMap = new Map(selectedMods.value);
  newMap.delete(name);
  selectedMods.value = newMap;
}

function handleClose() {
  emit('update:visible', false);
}

const currentGroup = computed(() => {
  return modGroups.value.find((g) => g.cShowname === activeGroup.value);
});

const availableMods = computed(() => {
  const selectedNames = new Set(selectedModList.value.map((m) => m.cShowname));
  return currentGroup.value?.modList?.filter((m) => !selectedNames.has(m.cShowname)) || [];
});

const selectedModList = computed(() => {
  return Array.from(selectedMods.value.values());
});
</script>

<template>
  <Modal
    :model-value="props.visible"
    :title="$t('common.create')"
    :width="800"
    :help-message="$t('common.dashboard.quickEntry.addEntryTip')"
    @update:model-value="emit('update:visible', $event)"
    @ok="handleConfirm"
    @close="handleClose"
  >
    <div class="flex gap-4 min-h-[440px]">
      <!-- 左侧：分类导航 -->
      <div class="w-52 shrink-0 flex flex-col rounded-xl border border-[var(--color-border-2)] overflow-hidden">
        <div class="px-4 py-3 text-xs font-medium text-[var(--color-text-3)] uppercase tracking-wider border-b border-[var(--color-border-2)] bg-[var(--color-fill-1)]">
          {{ $t('common.dashboard.quickEntry.category') }}
        </div>
        <div class="flex-1 overflow-y-auto p-2">
          <!-- 加载状态 -->
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="w-5 h-5 border-2 border-[var(--color-border-2)] border-t-[rgb(var(--primary-6))] rounded-full animate-spin" />
          </div>

          <!-- 分组列表 -->
          <div v-else class="space-y-1">
            <button
              v-for="group in modGroups"
              :key="group.cShowname"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150"
              :class="activeGroup === group.cShowname
                ? 'bg-[rgb(var(--primary-6))] text-white shadow-md'
                : 'text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)]'"
              @click="activeGroup = group.cShowname"
            >
              <SunnyIcon
                icon="lucide:folder"
                :size="15"
                :class="activeGroup === group.cShowname ? 'text-white' : 'text-[var(--color-text-3)]'"
              />
              <span class="text-sm truncate">{{ group.cShowname }}</span>
            </button>
          </div>

          <div v-if="!loading && modGroups.length === 0" class="py-12 text-center">
            <SunnyIcon icon="lucide:folder-x" :size="24" class="mx-auto mb-2 opacity-30 text-[var(--color-text-3)]" />
            <span class="text-xs text-[var(--color-text-3)]">{{ $t('common.noData') }}</span>
          </div>
        </div>
      </div>

      <!-- 中间：可选模块 -->
      <div class="flex-1 min-w-0 flex flex-col rounded-xl border border-[var(--color-border-2)] overflow-hidden">
        <div class="px-4 py-3 flex items-center justify-between border-b border-[var(--color-border-2)] bg-[var(--color-fill-1)]">
          <div class="flex items-center gap-2">
            <SunnyIcon icon="lucide:list" :size="15" class="text-[var(--color-text-3)]" />
            <span class="text-xs font-medium text-[var(--color-text-3)] uppercase tracking-wider">{{ $t('common.dashboard.quickEntry.available') }}</span>
          </div>
          <span class="text-xs text-[var(--color-text-4)] tabular-nums">{{ availableMods.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3">
          <div v-if="!activeGroup" class="h-full flex flex-col items-center justify-center text-[var(--color-text-3)]">
            <div class="w-12 h-12 rounded-full bg-[var(--color-fill-2)] flex items-center justify-center mb-3">
              <SunnyIcon icon="lucide:mouse-pointer" :size="20" class="opacity-50" />
            </div>
            <span class="text-xs">{{ $t('common.dashboard.quickEntry.selectCategory') }}</span>
          </div>

          <div v-else-if="availableMods.length" class="space-y-1.5">
            <button
              v-for="mod in availableMods"
              :key="mod.cShowname"
              class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-transparent text-left group transition-all duration-150 hover:border-[var(--color-border-2)] hover:bg-[var(--color-fill-1)]"
              @click="addMod(mod)"
            >
              <span class="text-sm text-[var(--color-text-1)] truncate">{{ mod.cShowname }}</span>
              <div class="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-fill-2)] group-hover:bg-[rgb(var(--primary-6))] group-hover:text-white">
                <SunnyIcon icon="lucide:plus" :size="14" />
              </div>
            </button>
          </div>

          <div v-else class="h-full flex flex-col items-center justify-center text-[var(--color-text-3)]">
            <div class="w-12 h-12 rounded-full bg-[var(--color-fill-2)] flex items-center justify-center mb-3">
              <SunnyIcon icon="lucide:check-circle" :size="20" class="opacity-50" />
            </div>
            <span class="text-xs">{{ $t('common.dashboard.quickEntry.allAdded') }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：已选模块 -->
      <div class="w-48 shrink-0 flex flex-col rounded-xl bg-[rgba(var(--primary-6),0.03)] border border-[rgba(var(--primary-6),0.15)] overflow-hidden">
        <div class="px-4 py-3 flex items-center justify-between border-b border-[rgba(var(--primary-6),0.1)] bg-[rgba(var(--primary-6),0.05)]">
          <div class="flex items-center gap-2">
            <SunnyIcon icon="lucide:star" :size="15" class="text-[rgb(var(--primary-6))]" />
            <span class="text-xs font-medium text-[rgb(var(--primary-6))] uppercase tracking-wider">{{ $t('common.dashboard.quickEntry.selected') }}</span>
          </div>
          <span class="text-xs font-medium text-[rgb(var(--primary-6))] tabular-nums">{{ selectedModList.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3">
          <div v-if="selectedModList.length === 0" class="h-full flex flex-col items-center justify-center text-[var(--color-text-3)]">
            <div class="w-12 h-12 rounded-full bg-[var(--color-fill-2)] flex items-center justify-center mb-3">
              <SunnyIcon icon="lucide:inbox" :size="20" class="opacity-50" />
            </div>
            <span class="text-xs">{{ $t('common.dashboard.quickEntry.noSelection') }}</span>
          </div>

          <div v-else class="space-y-1.5">
            <div
              v-for="mod in selectedModList"
              :key="mod.cShowname"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--color-bg-1)] border border-[rgba(var(--primary-6),0.12)] group"
            >
              <span class="text-sm text-[var(--color-text-1)] truncate">{{ mod.cShowname }}</span>
              <button
                class="w-6 h-6 rounded-full flex items-center justify-center text-[var(--color-text-4)] hover:bg-[rgb(var(--red-6))] hover:text-white transition-colors"
                @click="removeMod(mod.cShowname)"
              >
                <SunnyIcon icon="lucide:x" :size="13" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>
