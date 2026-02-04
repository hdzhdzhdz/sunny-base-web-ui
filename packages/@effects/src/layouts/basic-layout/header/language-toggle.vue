<template>
  <a-dropdown trigger="click" @select="handleSelect">
    <div
      class="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-300 hover:bg-[var(--color-fill-3)] text-[var(--color-text-2)] hover:text-[var(--color-text-1)]"
    >
      <SunnyIcon icon="lucide:languages" :size="20" />
    </div>
    <template #content>
      <a-doption
        v-for="item in langList"
        :key="item.id"
        :value="item.cXuhao"
      >
        <span>{{ item.cName }}</span>
        <template #suffix v-if="preferences.app.locale === item.cXuhao">
          <SunnyIcon icon="lucide:check" class="text-[rgb(var(--primary-6))]" />
        </template>
      </a-doption>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SunnyIcon } from '@sunny-base-web/ui';
import { queryByXuhao } from '../../../api/core';
import { loadLocaleMessages } from '@sunny-base-web/locales';
import { preferences } from '#/preferences';

defineOptions({ name: 'LanguageToggle' });

const langList = ref<any[]>([]);

onMounted(() => {
  queryByXuhao({ cXuhao: 'LANG_V3' }).then(res => {
    langList.value = res.result || [];
  });
});

const handleSelect = async (val: string | number | Record<string, any>) => {
  if (!val) return;
  const locale = val;
  preferences.app.locale = locale;
  await loadLocaleMessages(locale);
};
</script>
