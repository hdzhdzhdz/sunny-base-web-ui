<!--
  * 用户头像组件
  * 显示用户名首字母，支持下拉菜单
-->
<template>
  <a-dropdown trigger="click" position="br">
    <div
      class="flex items-center justify-center w-8 h-8 rounded-full bg-[rgb(var(--primary-6))] text-white text-sm font-medium cursor-pointer hover:bg-[rgb(var(--primary-5))] transition-colors select-none"
      :title="userStore.name"
    >
      {{ avatarText }}
    </div>
    <template #content>
      <div class="w-52">
        <!-- 用户信息 -->
        <div class="flex items-center gap-3 px-4 py-3">
          <!-- 头像 -->
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--primary-5))] to-[rgb(var(--primary-7))] flex items-center justify-center text-white text-base font-medium shadow-sm">
            {{ avatarText }}
          </div>
          <!-- 用户名和工号 -->
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-sm font-medium text-[var(--color-text-1)] truncate">{{ userStore.name }}</span>
            <span class="flex items-center gap-1 text-xs text-[var(--color-text-3)]">
              <SunnyIcon icon="lucide:badge-check" :size="12" />
              {{ userStore.code }}
            </span>
          </div>
        </div>
        <!-- 菜单项 -->
        <div class="border-t border-[var(--color-border-2)] py-1">
          <a-doption @click="handleOpenPasswordModal">
            <template #icon>
              <SunnyIcon icon="lucide:key-round" :size="16" />
            </template>
            修改密码
          </a-doption>
          <a-doption @click="handleOpenSettingsModal">
            <template #icon>
              <SunnyIcon icon="lucide:settings" :size="16" />
            </template>
            设置
          </a-doption>
          <a-doption class="!text-[rgb(var(--danger-6))]">
            <template #icon>
              <SunnyIcon icon="lucide:log-out" :size="16" />
            </template>
            退出登录
          </a-doption>
        </div>
      </div>
    </template>
  </a-dropdown>

  <!-- 修改密码弹窗 -->
  <PasswordModal ref="passwordModalRef" />
  <!-- 设置弹窗 -->
  <SettingsModal ref="settingsModalRef" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUserStore } from '@sunny-base-web/stores';
import { SunnyIcon } from '@sunny-base-web/ui';
import PasswordModal from './password-modal.vue';
import SettingsModal from './settings-modal.vue';

defineOptions({ name: 'UserAvatar' });

const userStore = useUserStore();
const passwordModalRef = ref<InstanceType<typeof PasswordModal> | null>(null);
const settingsModalRef = ref<InstanceType<typeof SettingsModal> | null>(null);

/**
 * 获取头像显示文字（取名字最后两个字符或首字母）
 */
const avatarText = computed(() => {
  const name = userStore.name || '';
  if (name.length <= 2) {
    return name;
  }
  // 取名字最后两个字符
  return name.slice(-2);
});

/**
 * 打开修改密码弹窗
 */
const handleOpenPasswordModal = () => {
  passwordModalRef.value?.open();
};

/**
 * 打开设置弹窗
 */
const handleOpenSettingsModal = () => {
  settingsModalRef.value?.open();
};
</script>
