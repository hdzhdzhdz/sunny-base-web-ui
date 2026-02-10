# Web Application Specification

## 📋 概述

`apps/web` 是基于 Vue 3 + Vite 的主应用，使用 monorepo 中的 packages 提供的功能。

**技术栈：**
- Vue 3 (Composition API + Script Setup)
- TypeScript
- Vite 6.x
- Vue Router 4
- Pinia
- Arco Design Vue
- @ui (内部组件库)

## 🏗️ 目录结构

```
apps/web/
├── src/
│   ├── api/              # API 层
│   │   └── user/         # 用户相关 API
│   ├── assets/           # 静态资源
│   ├── components/       # 应用级组件
│   ├── layouts/          # 布局组件
│   ├── locales/          # 国际化
│   │   └── langs/        # 语言文件
│   ├── router/           # 路由配置
│   │   ├── core.ts       # 核心路由
│   │   ├── static/       # 静态路由
│   │   ├── dynamic/      # 动态路由
│   │   └── guard.ts      # 路由守卫
│   ├── views/            # 页面组件
│   │   ├── _core/        # 核心页面（登录、404等）
│   │   ├── dashboard/    # 仪表板
│   │   └── setting/      # 设置页面
│   ├── App.vue           # 根组件
│   ├── bootstrap.ts      # 应用初始化
│   ├── main.ts           # 入口文件
│   └── preferences.ts    # 应用配置
├── public/               # 公共资源
├── index.html            # HTML 模板
├── vite.config.ts        # Vite 配置
├── tailwind.config.ts    # Tailwind 配置
└── package.json
```

## 📦 核心模块

### 1. 路由 (Router)

**路由组织：**
```typescript
// src/router/core.ts - 核心路由（无需权限）
export const coreRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/_core/login.vue'),
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/_core/404.vue'),
  },
];

// src/router/static/index.ts - 静态路由（需要权限但固定）
export const staticRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/dashboard/index.vue'),
    meta: { requiresAuth: true },
  },
];

// src/router/dynamic/ - 动态路由（基于权限加载）
// 通过 import.meta.glob 自动发现
```

**路由守卫：**
```typescript
// src/router/guard.ts
import { createRouterGuard } from './guard';

router.beforeEach(async (to, from, next) => {
  // 1. 检查登录状态
  // 2. 检查权限
  // 3. 加载动态路由
  // 4. 设置页面标题
});
```

### 2. 状态管理 (Pinia)

**使用 @stores：**
```typescript
// src/bootstrap.ts
import { initStores } from '@sunny-base-web/stores';

export async function bootstrap(app: App) {
  initStores(app, {
    namespace: 'sunny-base-web',
  });
}
```

**在组件中使用：**
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore, useAuthStore } from '@sunny-base-web/stores';

const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

const authStore = useAuthStore();
const { logout } = authStore;
</script>
```

### 3. API 层

**API 模块组织：**
```typescript
// src/api/user/index.ts
import { requestClient } from '@sunny-base-web/effects';

export interface User {
  id: number;
  name: string;
  email: string;
}

export async function fetchUserInfo(): Promise<User> {
  return requestClient.get<User>('/core/contact/getCurrentUserAndResources');
}

export async function updateUser(data: Partial<User>): Promise<User> {
  return requestClient.put(`/core/contact/${data.id}`, data);
}
```

**在页面中使用：**
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchUserInfo } from '@/api/user';

const userInfo = ref<User | null>(null);

onMounted(async () => {
  userInfo.value = await fetchUserInfo();
});
</script>
```

### 4. 布局系统

**使用 @effects 布局：**
```vue
<!-- src/layouts/basic-layout/index.vue -->
<script setup lang="ts">
import { BasicLayout } from '@sunny-base-web/effects';
</script>

<template>
  <BasicLayout>
    <template #header>
      <!-- 头部内容 -->
    </template>
    <template #sidebar>
      <!-- 侧边栏内容 -->
    </template>
    <template #content>
      <router-view />
    </template>
  </BasicLayout>
</template>
```

### 5. 国际化

**应用特定语言文件：**
```json
// src/locales/langs/zh-CN/app.json
{
  "title": "我的应用",
  "menu": {
    "dashboard": "仪表板",
    "settings": "设置"
  }
}
```

**使用翻译：**
```vue
<template>
  <h1>{{ $t('app.title') }}</h1>
  <a-menu>
    <a-menu-item key="dashboard">
      {{ $t('app.menu.dashboard') }}
    </a-menu-item>
  </a-menu>
</template>
```

## 🎯 开发规范

### 1. 创建新页面

**步骤：**

1. **创建页面文件** (`src/views/my-feature/index.vue`)
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SunnyQueryGrid } from '@sunny-base-web/ui';
import { fetchMyData } from '@/api/my-feature';

const data = ref([]);

onMounted(async () => {
  data.value = await fetchMyData();
});
</script>

<template>
  <div class="page-container">
    <SunnyQueryGrid :data="data" :config="gridConfig" />
  </div>
</template>

<style scoped lang="scss">
.page-container {
  padding: 16px;
}
</style>
```

2. **添加路由** (`src/router/static/my-feature.ts`)
```typescript
export const myFeatureRoutes = [
  {
    path: '/my-feature',
    name: 'MyFeature',
    component: () => import('@/views/my-feature/index.vue'),
    meta: {
      title: 'app.menu.myFeature',
      requiresAuth: true,
    },
  },
];
```

3. **添加翻译** (`src/locales/langs/zh-CN/app.json`)
```json
{
  "menu": {
    "myFeature": "我的功能"
  }
}
```

### 2. 创建应用组件

**组件位置：**
- **应用级组件** (`src/components/`) - 仅在此应用使用的组件
- **通用组件** (`packages/@ui/`) - 跨应用复用的组件

**示例：**
```vue
<!-- src/components/UserAvatar.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@sunny-base-web/stores';

interface Props {
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
});

const userStore = useUserStore();
const avatarUrl = computed(() => userStore.userInfo?.avatar);
</script>

<template>
  <a-avatar :size="size" :url="avatarUrl" />
</template>
```

### 3. API 开发规范

**类型定义：**
```typescript
// src/api/my-feature/types.ts
export interface MyData {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CreateMyDataDto {
  name: string;
  status: 'active' | 'inactive';
}
```

**API 函数：**
```typescript
// src/api/my-feature/index.ts
import { requestClient } from '@sunny-base-web/effects';
import type { MyData, CreateMyDataDto } from './types';

export function getMyDataList(params: QueryParams) {
  return requestClient.get<ResponseResult<MyData[]>>('/api/my-data', { params });
}

export function createMyData(data: CreateMyDataDto) {
  return requestClient.post<ResponseResult<MyData>>('/api/my-data', data);
}

export function updateMyData(id: number, data: Partial<CreateMyDataDto>) {
  return requestClient.put<ResponseResult<MyData>>(`/api/my-data/${id}`, data);
}

export function deleteMyData(id: number) {
  return requestClient.delete<ResponseResult<void>>(`/api/my-data/${id}`);
}
```

### 4. 样式规范

**使用 Tailwind CSS：**
```vue
<template>
  <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
    <h2 class="text-lg font-semibold text-gray-900">Title</h2>
    <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      Action
    </button>
  </div>
</template>
```

**自定义样式（必要时）：**
```vue
<style scoped lang="scss>
.my-component {
  // 使用 Arco Design 变量
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border-2);

  // 嵌套选择器（BEM）
  &__header {
    padding: 16px;
  }

  &--active {
    color: var(--color-primary-6);
  }
}
</style>
```

### 5. 环境变量

**定义环境变量** (`.env.development`):
```bash
VITE_API_BASE_URL=/api
VITE_APP_MOCK_ENABLED=true
VITE_APP_TITLE=My App (Dev)
```

**使用环境变量：**
```typescript
// src/preferences.ts
export const preferences = {
  app: {
    title: import.meta.env.VITE_APP_TITLE,
    mockEnabled: import.meta.env.VITE_APP_MOCK_ENABLED === 'true',
  },
};
```

### 6. 构建配置

**Vite 别名配置：**
```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // @ui 等已在根级别配置
    },
  },
});
```

## ⚠️ 注意事项

1. **职责边界**:
   - ✅ 应用特定逻辑放在 `apps/web/src/`
   - ✅ 通用逻辑抽取到 `packages/`
   - ❌ 不在应用中开发可复用的组件

2. **依赖管理**:
   - ✅ 优先使用 workspace packages
   - ✅ 应用特定依赖安装在 `apps/web/`
   - ❌ 避免重复安装已在 packages 中的依赖

3. **性能优化**:
   - ✅ 路由懒加载
   - ✅ 组件按需导入（Arco Design）
   - ✅ 图片资源优化
   - ❌ 避免打包整个库

4. **代码风格**:
   - ✅ 遵循项目通用规范 (`rules/general.md`)
   - ✅ 使用 TypeScript 严格模式
   - ✅ 组件命名清晰（PascalCase）
   - ❌ 不使用 `any` 类型

## 📝 TODO

- [ ] 添加单元测试
- [ ] 添加 E2E 测试
- [ ] 优化首屏加载性能
- [ ] 添加 PWA 支持
- [ ] 完善错误处理和错误日志
- [ ] 添加性能监控
