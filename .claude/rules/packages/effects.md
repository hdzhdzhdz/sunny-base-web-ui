# @effects Package Specification

## 📋 概述

`@effects` 包提供副作用相关的功能，包括 HTTP 客户端、API 请求、登录组件、布局组件等。

**职责边界：**
- ✅ HTTP 请求客户端（拦截器、上传、下载、SSE）
- ✅ API 请求封装
- ✅ 业务组件（登录、布局）
- ✅ 权限控制
- ✅ 加密工具
- ❌ 不包含纯 UI 组件（应在 @ui）

## 🏗️ 目录结构

```
packages/@effects/src/
├── access/            # 权限控制
│   └── accessible.ts
├── api/               # API 请求
│   ├── core/          # 核心 API
│   ├── request.ts     # 请求配置
│   └── user/          # 用户相关 API
├── config.ts          # 配置工具
├── layouts/           # 布局组件
├── login/             # 登录组件
├── request/           # HTTP 客户端
│   └── src/request-client/
│       ├── modules/
│       │   ├── downloader.ts     # 下载器
│       │   ├── interceptor.ts    # 拦截器
│       │   ├── sse.ts            # Server-Sent Events
│       │   └── uploader.ts       # 上传器
│       └── request-client.ts
└── utils/             # 工具函数
    └── encryption.ts  # 加密工具
```

## 📦 核心模块

### 1. Request Client (HTTP 客户端)

**基础使用：**
```typescript
import { requestClient } from '@sunny-base-web/effects';

// GET 请求
const data = await requestClient.get('/api/users');

// POST 请求
const result = await requestClient.post('/api/users', { name: 'John' });

// 带类型
interface User {
  id: number;
  name: string;
}
const user = await requestClient.get<User>('/api/users/1');
```

**配置选项：**
```typescript
requestClient.request({
  url: '/api/data',
  method: 'POST',
  data: { key: 'value' },
  timeout: 5000,
  headers: {
    'Custom-Header': 'value',
  },
});
```

### 2. Interceptor (拦截器)

**请求拦截器：**
```typescript
import { requestInterceptor } from '@sunny-base-web/effects';

requestInterceptor.request({
  fulfilled: (config) => {
    // 添加 token
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  rejected: (error) => {
    return Promise.reject(error);
  },
});
```

**响应拦截器：**
```typescript
requestInterceptor.response({
  fulfilled: (response) => {
    // 统一处理响应
    return response.data;
  },
  rejected: (error) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // 跳转登录
    }
    return Promise.reject(error);
  },
});
```

### 3. Uploader (文件上传)

**基础上传：**
```typescript
import { uploader } from '@sunny-base-web/effects';

const file = document.querySelector('input[type="file"]').files[0];

await uploader.upload(file, {
  url: '/api/upload',
  onProgress: (percent) => {
    console.log(`Upload: ${percent}%`);
  },
});
```

**分片上传：**
```typescript
await uploader.upload(file, {
  url: '/api/upload/chunks',
  chunkSize: 5 * 1024 * 1024, // 5MB
  concurrent: 3, // 并发数
});
```

### 4. Downloader (文件下载)

**基础下载：**
```typescript
import { downloader } from '@sunny-base-web/effects';

await downloader.download({
  url: '/api/files/download',
  filename: 'report.pdf',
  onProgress: (percent) => {
    console.log(`Download: ${percent}%`);
  },
});
```

### 5. SSE (Server-Sent Events)

**建立 SSE 连接：**
```typescript
import { sseClient } from '@sunny-base-web/effects';

const eventSource = sseClient.connect('/api/events', {
  onMessage: (event) => {
    console.log('SSE message:', event.data);
  },
  onError: (error) => {
    console.error('SSE error:', error);
  },
});

// 关闭连接
eventSource.close();
```

### 6. Encryption (加密工具)

**RSA 加密：**
```typescript
import { encrypt } from '@sunny-base-web/effects';

const encrypted = encrypt('sensitive data', publicKey);
```

## 🎯 开发规范

### 1. API 模块组织

**创建新 API 模块：**
```typescript
// packages/@effects/src/api/my-module/index.ts
import { requestClient } from '../request';

export interface MyData {
  id: number;
  name: string;
}

export function fetchMyData(id: number) {
  return requestClient.get<MyData>(`/api/my-module/${id}`);
}

export function createMyData(data: Omit<MyData, 'id'>) {
  return requestClient.post<MyData>('/api/my-module', data);
}

export function updateMyData(id: number, data: Partial<MyData>) {
  return requestClient.put<MyData>(`/api/my-module/${id}`, data);
}

export function deleteMyData(id: number) {
  return requestClient.delete(`/api/my-module/${id}`);
}
```

**在应用中使用：**
```typescript
// apps/web/src/api/my-module.ts
// 直接从 @effects 导入，或在此处扩展应用特定 API
export * from '@sunny-base-web/effects/api/my-module';
```

### 2. 请求规范

**类型定义：**
```typescript
// 统一的响应格式
export interface ResponseResult<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 使用
const result = await requestClient.get<ResponseResult<User>>('/api/user/1');
if (result.success) {
  console.log(result.data);
}
```

**错误处理：**
```typescript
try {
  const data = await requestClient.get('/api/data');
} catch (error) {
  // 错误已被拦截器统一处理
  // 这里可以添加特定于调用的处理
  console.error('Request failed:', error);
}
```

### 3. 业务组件开发

**登录组件：**
```vue
<!-- packages/@effects/src/login/Login.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { SunnyForm } from '@sunny-base-web/ui';

const emit = defineEmits<{
  success: [user: User];
}>();

const formRef = ref();

async function handleLogin(values: LoginFormData) {
  // 调用登录 API
  // 发射成功事件
  emit('success, user);
}
</script>

<template>
  <SunnyForm ref="formRef" @submit="handleLogin">
    <!-- 表单配置 -->
  </SunnyForm>
</template>
```

**布局组件：**
```vue
<!-- packages/@effects/src/layouts/BasicLayout.vue -->
<script setup lang="ts">
import { SunnyLayout } from '@sunny-base-web/ui';
</script>

<template>
  <SunnyLayout>
    <template #header>...</template>
    <template #sidebar>...</template>
    <template #content>...</template>
  </SunnyLayout>
</template>
```

### 4. 权限控制

**使用权限指令：**
```vue
<template>
  <button v-access="['admin']">Admin Only</button>
  <button v-access="['user', 'admin']">User & Admin</button>
</template>
```

**使用权限函数：**
```typescript
import { hasAccess } from '@sunny-base-web/effects';

if (hasAccess(['admin'])) {
  // 执行管理员操作
}
```

### 5. 加密使用

**密码加密：**
```typescript
import { encryptPassword } from '@sunny-base-web/effects';

// 登录前加密密码
const encryptedPassword = encryptPassword(password);
await login({ username, password: encryptedPassword });
```

## ⚠️ 注意事项

1. **API 设计**:
   - ✅ 所有 API 请求都应有类型定义
   - ✅ 统一错误处理（在拦截器中）
   - ✅ 统一响应格式（ResponseResult）
   - ❌ 不要在组件中直接调用 axios，使用 requestClient

2. **组件职责**:
   - ✅ 业务组件应依赖 @ui 组件
   - ✅ 不重复实现已有 UI 组件
   - ❌ 不在 @effects 中开发纯展示组件

3. **安全性**:
   - ✅ 敏感数据传输加密
   - ✅ Token 存储使用加密持久化
   - ✅ HTTPS 生产环境
   - ❌ 不在 URL 中传递敏感信息

4. **性能优化**:
   - ✅ 请求防抖/节流
   - ✅ 取消重复请求
   - ✅ 缓存策略（如需要）
   - ❌ 避免频繁轮询（考虑使用 SSE/WebSocket）

## 📝 TODO

- [ ] 添加请求缓存功能
- [ ] 添加请求重试机制
- [ ] 完善错误码映射
- [ ] 添加 Mock 数据支持
- [ ] 优化上传/下载性能
- [ ] 添加 WebSocket 支持
- [ ] 完善单元测试覆盖
