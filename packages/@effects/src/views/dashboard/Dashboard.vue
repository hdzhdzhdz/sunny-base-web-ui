<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useI18n } from '@sunny-base-web/locales';
import { useUserStore } from '@sunny-base-web/stores';
import { SunnyIcon } from '@sunny-base-web/ui';

import { queryQuickEntry, insertQuickEntry, type QuickEntryItem, type ModListItem } from './api';
import AddEntryModal from './components/AddEntryModal.vue';

defineOptions({
  name: 'Dashboard',
});

const { t } = useI18n();
const userStore = useUserStore();

const quickEntries = ref<QuickEntryItem[]>([]);
const loading = ref(false);
const modalVisible = ref(false);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return t('common.dashboard.greeting.night');
  if (hour < 12) return t('common.dashboard.greeting.morning');
  if (hour < 18) return t('common.dashboard.greeting.afternoon');
  return t('common.dashboard.greeting.evening');
});

const currentDate = computed(() => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return now.toLocaleDateString('zh-CN', options);
});

function getUserId(): string {
  return userStore.userInfo?.id?.toString() || '1084870';
}

async function loadQuickEntries() {
  loading.value = true;
  try {
    const response = await queryQuickEntry({
      cCreateuser: getUserId(),
    });
    quickEntries.value = response.result || [];
  } catch (error) {
    console.error('Failed to load quick entries:', error);
    quickEntries.value = [];
  } finally {
    loading.value = false;
  }
}

function openAddModal() {
  modalVisible.value = true;
}

async function handleAddConfirm(selected: ModListItem[]) {
  if (selected.length === 0) {
    return;
  }

  try {
    await insertQuickEntry({
      assQuickentry: {
        cCreateuser: getUserId(),
      },
      assQuickentryList: selected.map((mod) => ({
        nResourceid: mod.nResourceid,
        nOrder: mod.nOrder,
      })),
    });
    loadQuickEntries();
  } catch (error) {
    console.error('Failed to save quick entries:', error);
  }
}

function navigateTo(path: string) {
  window.location.hash = path;
}

function getIcon(item: QuickEntryItem): string {
  if (item.cIcon) return item.cIcon;

  const url = (item.cUrl || '').toLowerCase();
  if (url.includes('user')) return 'lucide:user-circle';
  if (url.includes('role')) return 'lucide:shield';
  if (url.includes('resource') || url.includes('menu')) return 'lucide:layers';
  if (url.includes('log')) return 'lucide:scroll-text';
  if (url.includes('setting') || url.includes('config')) return 'lucide:sliders-horizontal';
  if (url.includes('report') || url.includes('chart')) return 'lucide:chart-line';
  if (url.includes('device')) return 'lucide:cpu';
  if (url.includes('monitor')) return 'lucide:activity';
  if (url.includes('data')) return 'lucide:database';
  return 'lucide:file-box';
}

onMounted(() => {
  loadQuickEntries();
});
</script>

<template>
  <div class="p-6 animate-in fade-in duration-500">
    <!-- 欢迎区域 -->
    <header class="relative p-8 mb-8 bg-[var(--color-fill-1)] rounded-2xl overflow-hidden">
      <div class="relative z-10">
        <p class="text-sm text-[var(--color-text-3)] mb-1 uppercase tracking-wide">{{ greeting }}</p>
        <h1 class="text-2xl font-semibold text-[var(--color-text-1)] mb-1">{{ userStore.userInfo?.name || 'User' }}</h1>
        <p class="text-sm text-[var(--color-text-3)]">{{ currentDate }}</p>
      </div>
      <div class="absolute -right-5 -top-5 w-[200px] h-[200px] pointer-events-none">
        <div class="absolute w-[180px] h-[180px] right-0 top-0 rounded-full border border-[var(--color-border-2)] animate-pulse opacity-50" />
        <div class="absolute w-[140px] h-[140px] right-5 top-5 rounded-full border border-[var(--color-border-2)] animate-pulse opacity-50 [animation-delay:0.5s]" />
        <div class="absolute w-[100px] h-[100px] right-10 top-10 rounded-full bg-[var(--color-fill-3)]" />
      </div>
    </header>

    <!-- 快捷入口 -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <span class="flex items-center justify-center w-8 h-8 rounded-md bg-[var(--color-fill-2)] text-[rgb(var(--primary-6))]">
            <SunnyIcon icon="lucide:compass" :size="18" />
          </span>
          <h2 class="text-base font-semibold text-[var(--color-text-1)]">{{ $t('common.dashboard.quickEntry.title') }}</h2>
        </div>
        <a-button type="text" size="small" @click="openAddModal">
          <template #icon>
            <SunnyIcon icon="lucide:plus" :size="16" />
          </template>
          {{ $t('common.create') }}
        </a-button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center p-12">
        <a-spin />
      </div>

      <!-- 空状态 -->
      <a-empty v-else-if="quickEntries.length === 0" :description="$t('common.noData')" />

      <!-- 入口网格 -->
      <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        <a-card
          v-for="entry in quickEntries"
          :key="entry.cUrl"
          class="group cursor-pointer hover:border-[rgb(var(--primary-6))] hover:shadow-md transition-all"
          :bordered="true"
          hoverable
          @click="navigateTo(entry.cUrl)"
        >
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center shrink-0 w-11 h-11 rounded-md bg-[var(--color-fill-2)] text-[rgb(var(--primary-6))] group-hover:bg-[var(--color-fill-3)] transition-colors">
              <SunnyIcon :icon="getIcon(entry)" :size="22" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-[var(--color-text-1)] truncate">{{ entry.cModname }}</div>
              <div v-if="entry.cModdesc" class="text-xs text-[var(--color-text-3)] truncate mt-0.5">{{ entry.cModdesc }}</div>
            </div>
          </div>
        </a-card>
      </div>
    </section>

    <!-- 新增弹窗 -->
    <AddEntryModal
      v-model:visible="modalVisible"
      :user-id="getUserId()"
      @confirm="handleAddConfirm"
    />
  </div>
</template>
