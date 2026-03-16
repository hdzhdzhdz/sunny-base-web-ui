<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SunnyLoading } from '@sunny-base-web/ui';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
}

const loading = ref(true);
const userData = ref<UserData | null>(null);

// 模拟数据加载
async function fetchUserData() {
  loading.value = true;

  // 模拟 API 请求
  await new Promise(resolve => setTimeout(resolve, 1500));

  userData.value = {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '138-0000-0000',
  };

  loading.value = false;
}

// 重新加载
function handleReload() {
  userData.value = null;
  fetchUserData();
}

onMounted(() => {
  fetchUserData();
});
</script>

<template>
  <div class="space-y-4">
    <a-button type="primary" @click="handleReload">
      重新加载
    </a-button>

    <div class="relative min-h-[280px] rounded-lg border border-[var(--color-border-2)] bg-[var(--color-bg-1)] p-6">
      <SunnyLoading :spinning="loading" text="加载用户数据..." />

      <!-- 用户信息卡片 -->
      <div v-if="!loading && userData" class="space-y-4">
        <div class="text-lg font-semibold text-[var(--color-text-1)]">用户信息</div>

        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="text-[rgb(var(--primary-6))]">👤</div>
            <div>
              <div class="text-xs text-[var(--color-text-3)]">姓名</div>
              <div class="text-sm font-medium text-[var(--color-text-1)]">{{ userData.name }}</div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-[rgb(var(--primary-6))]">📧</div>
            <div>
              <div class="text-xs text-[var(--color-text-3)]">邮箱</div>
              <div class="text-sm font-medium text-[var(--color-text-1)]">{{ userData.email }}</div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-[rgb(var(--primary-6))]">📞</div>
            <div>
              <div class="text-xs text-[var(--color-text-3)]">电话</div>
              <div class="text-sm font-medium text-[var(--color-text-1)]">{{ userData.phone }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
