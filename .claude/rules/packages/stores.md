# @stores Package Specification

## 📋 概述

`@stores` 包提供基于 Pinia 的状态管理方案，包含用户、权限、认证等核心状态模块。

**职责边界：**
- ✅ 全局应用状态管理
- ✅ 跨组件状态共享
- ✅ 状态持久化（加密）
- ❌ 不包含 UI 逻辑
- ❌ 不包含 API 请求（应在 @effects）

## 🏗️ 目录结构

```
packages/@stores/src/
├── modules/            # Store 模块
│   ├── user.ts        # 用户信息
│   ├── auth.ts        # 认证状态
│   ├── access.ts      # 权限控制
│   └── tabbar.ts      # 标签页栏
├── setup.ts           # Pinia 初始化
├── types.ts           # 类型定义
└── index.ts           # 统一导出
```

## 📦 核心模块

### 1. User Store (用户信息)

```typescript
import { useUserStore } from '@sunny-base-web/stores';

const userStore = useUserStore();

// 状态
userStore.userInfo      // 用户信息
userStore.roles        // 角色列表
userStore.permissions  // 权限列表

// 操作
userStore.setUserInfo(info)
userStore.resetState()
```

### 2. Auth Store (认证状态)

```typescript
import { useAuthStore } from '@sunny-base-web/stores';

const authStore = useAuthStore();

// 状态
authStore.token        // 认证令牌
authStore.isLoggedIn   // 登录状态

// 操作
authStore.setToken(token)
authStore.clearToken()
```

### 3. Access Store (权限控制)

```typescript
import { useAccessStore } from '@sunny-base-web/stores';

const accessStore = useAccessStore();

// 状态
accessStore.accessMenus     # 菜单权限
accessStore.accessRoutes    # 路由权限

// 操作
accessStore.setAccessMenus(menus)
accessStore.setAccessRoutes(routes)
```

## 🎯 开发规范

### 1. 创建新 Store

**步骤：**

1. **定义类型** (在 `types.ts`)
```typescript
export interface MyStoreState {
  data: any[];
  loading: boolean;
}
```

2. **创建 Store** (在 `modules/my-store.ts`)
```typescript
import { defineStore } from 'pinia';
import type { MyStoreState } from '../types';

export const useMyStore = defineStore('my-store', {
  state: (): MyStoreState => ({
    data: [],
    loading: false,
  }),

  getters: {
    // computed properties
    isEmpty: (state) => state.data.length === 0,
  },

  actions: {
    // methods
    async fetchData() {
      this.loading = true;
      // fetch logic...
      this.loading = false;
    },

    resetState() {
      this.data = [];
      this.loading = false;
    },
  },

  // 持久化配置
  persist: {
    key: 'my-store',
    paths: ['data'], // 只持久化 data
  },
});
```

3. **导出 Store** (在 `index.ts`)
```typescript
export * from './modules/my-store';
```

### 2. 命名规范

- **Store 文件**: `kebab-case` (e.g., `user-profile.ts`)
- **Store 函数**: `use + PascalCase` (e.g., `useUserProfile`)
- **Store ID**: `kebab-case` (e.g., `'user-profile'`)
- **State 属性**: `camelCase` (e.g., `userInfo`, `isLoading`)
- **Actions**: `camelCase`，动词开头 (e.g., `fetchData`, `setToken`, `resetState`)

### 3. 状态设计原则

**State 设计：**
- ✅ 最小化状态，只存储必要数据
- ✅ 使用计算属性 (getters) 派生数据
- ✅ 使用 TypeScript 接口定义类型
- ❌ 避免在 state 中存储派生数据
- ❌ 避免存储可序列化的对象（如 Date、Map）

**Actions 设计：**
- ✅ 异步操作放在 actions 中
- ✅ 状态变更通过 actions，不直接修改
- ✅ 提供 reset 方法清理状态
- ❌ 避免在组件中直接修改 state

### 4. 持久化配置

**加密持久化**（默认）:
```typescript
persist: {
  key: 'store-name',
  // 使用 AES 加密存储
  encryption: true,
}
```

**选择性持久化**:
```typescript
persist: {
  key: 'store-name',
  paths: ['userInfo', 'token'], // 只持久化指定字段
}
```

**禁用持久化**:
```typescript
persist: false
```

### 5. 在应用中使用

**初始化** (在 `apps/web/src/bootstrap.ts`):
```typescript
import { initStores } from '@sunny-base-web/stores';

export async function bootstrap(app: App) {
  // 初始化 Pinia stores
  initStores(app, {
    namespace: 'sunny-base-web', // 多应用隔离
    secureKey: STORE_SECURE_KEY, // 加密密钥
  });
}
```

**在组件中使用**:
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from '@sunny-base-web/stores';

const userStore = useUserStore();
// 解构保持响应性
const { userInfo, roles } = storeToRefs(userStore);

// 方法不需要解构
const { logout } = userStore;
</script>
```

### 6. HMR 支持

**开发时热更新** (在 `setup.ts` 中已配置):
```typescript
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
```

## ⚠️ 注意事项

1. **职责边界**:
   - ✅ Store 只管理状态，不包含业务逻辑
   - ✅ API 请求应在 `@effects` 包中
   - ❌ 不在 store 中直接调用 API

2. **状态管理**:
   - ✅ 简单状态使用 `ref`/`reactive` 即可，不必都用 Pinia
   - ✅ 只有跨组件共享的状态才用 Store
   - ❌ 避免过度使用全局状态

3. **性能优化**:
   - ✅ 使用 `storeToRefs` 解构保持响应性
   - ✅ 大对象考虑选择性持久化
   - ❌ 避免在 store 中存储大量数据

4. **安全性**:
   - ✅ 敏感数据（token）使用加密持久化
   - ✅ 登出时清理所有状态
   - ❌ 不在持久化中存储敏感信息（或使用加密）

## 📝 TODO

- [ ] 添加更多单元测试
- [ ] 完善 TypeScript 类型定义
- [ ] 添加状态变更日志（开发环境）
- [ ] 考虑添加状态时序回溯功能
- [ ] 添加 Store 使用最佳实践文档
