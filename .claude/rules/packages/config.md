# @config Package Specification

## 📋 概述

`@config` 包提供项目级别的配置常量和工具配置，包括应用常量、Tailwind CSS 配置、TypeScript 配置等。

**职责边界：**
- ✅ 应用常量定义
- ✅ 构建工具配置（Tailwind、TypeScript）
- ✅ 设计 token 定义
- ❌ 不包含业务逻辑
- ❌ 不包含运行时配置（应在 @effects）

## 🏗️ 目录结构

```
packages/@config/
├── constants/         # 应用常量
│   └── src/
│       └── index.ts
├── tailwind-config/   # Tailwind CSS 配置
│   └── tailwind.config.ts
└── tsconfig/          # TypeScript 基础配置
```

## 📦 核心导出

### 1. 应用常量

**命名空间：**
```typescript
import { DEFAULT_NAMESPACE } from '@sunny-base-web/config';

DEFAULT_NAMESPACE // 'sunny-base'
```

**存储配置：**
```typescript
import { STORE_SECURE_KEY } from '@sunny-base-web/config';

STORE_SECURE_KEY // AES 加密密钥（用于 Pinia 状态持久化）
```

**应用配置：**
```typescript
import {
  SSO_ORIGIN,        // SSO 登录地址
  TABBAR_MAX_COUNT,  // 标签页最大数量（20）
} from '@sunny-base-web/config';
```

### 2. Tailwind CSS 配置

**主题扩展：**
```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // 基于 Arco Design 的颜色变量
        primary: {
          DEFAULT: 'var(--color-primary-6)',
          1: 'var(--color-primary-1)',
          // ... 1-6
        },
      },
      gridTemplateColumns: {
        // 支持 24 列网格系统
        24: 'repeat(24, minmax(0, 1fr))',
      },
    },
  },
}
```

**使用：**
```vue
<template>
  <div class="bg-primary text-primary-1 grid grid-cols-24">
    <!-- Tailwind 类名 + Arco Design 变量 -->
  </div>
</template>
```

### 3. TypeScript 配置

**基础配置：**
```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "paths": {
      "@ui": ["packages/@ui/src"],
      "@utils": ["packages/@utils/src"],
      // ...
    }
  }
}
```

## 🎯 开发规范

### 1. 添加新常量

**步骤：**

1. **定义常量** (在 `constants/src/index.ts`)
```typescript
/**
 * API 基础路径
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * 请求超时时间（毫秒）
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * 分页大小
 */
export const PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
```

2. **导出常量** (在 `constants/src/index.ts`)
```typescript
export * from './api';
export * from './pagination';
```

3. **使用常量**
```typescript
import { API_BASE_URL, PAGE_SIZE } from '@sunny-base-web/config';

fetch(`${API_BASE_URL}/users?limit=${PAGE_SIZE}`);
```

### 2. 命名规范

**常量命名：**
- **格式**: `SCREAMING_SNAKE_CASE` (全大写 + 下划线)
- **前缀**: 按功能分组（如 `API_*`, `STORE_*`, `TABBAR_*`）
- **类型**: 使用 `as const` 确保类型推断

```typescript
// ✅ 推荐
const API_BASE_URL = '/api';
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const SUPPORTED_FORMATS = ['jpg', 'png', 'gif'] as const;

// ❌ 避免
const apiBaseUrl = '/api';
const maxUploadSize = 10485760;
```

### 3. Tailwind 配置扩展

**添加新颜色：**
```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // 自定义业务颜色
        brand: {
          light: 'var(--color-brand-light)',
          DEFAULT: 'var(--color-brand)',
          dark: 'var(--color-brand-dark)',
        },
      },
    },
  },
}
```

**添加新间距：**
```javascript
export default {
  theme: {
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
}
```

**添加断点：**
```javascript
export default {
  theme: {
    screens: {
      'xs': '475px',
      '3xl': '1600px',
    },
  },
}
```

### 4. CSS 变量定义

**在全局样式文件中定义：**
```css
/* packages/@ui/src/styles/tokens.css */
:root {
  /* UI 组件专用变量 */
  --ui-modal-mask-bg: rgba(0, 0, 0, 0.45);
  --ui-modal-border-radius: 8px;
  --ui-form-label-width: 100px;
}

/* 暗黑模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --ui-modal-mask-bg: rgba(0, 0, 0, 0.7);
  }
}
```

**在 Tailwind 中引用：**
```javascript
export default {
  theme: {
    extend: {
      backgroundColor: {
        'modal-mask': 'var(--ui-modal-mask-bg)',
      },
      borderRadius: {
        'modal': 'var(--ui-modal-border-radius)',
      },
    },
  },
}
```

### 5. 环境变量

**定义环境变量** (在 `apps/web/.env`):
```bash
VITE_API_BASE_URL=/api
VITE_APP_TITLE=My App
VITE_APP_MOCK_ENABLED=true
```

**类型定义** (在 `apps/web/src/env.d.ts`):
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_MOCK_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**使用环境变量：**
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const isMock = import.meta.env.VITE_APP_MOCK_ENABLED === 'true';
```

### 6. 配置分层

**全局配置** (`packages/@config`):
- 应用常量
- Tailwind 基础配置
- TypeScript 基础配置

**应用配置** (`apps/web/vite.config.ts`):
- 应用特定别名
- 应用特定插件
- 构建优化配置

**组件配置** (组件内部):
- 组件默认值
- 组件特定配置

## ⚠️ 注意事项

1. **常量管理**:
   - ✅ 常量应集中管理，不分散在各个文件
   - ✅ 使用 TypeScript `as const` 确保类型安全
   - ✅ 添加 JSDoc 注释说明用途
   - ❌ 不在常量文件中存储敏感信息（使用环境变量）

2. **配置继承**:
   - ✅ Tailwind 配置在 monorepo 中统一
   - ✅ TypeScript 配置通过 `extends` 继承
   - ✅ 各应用可在此基础上扩展
   - ❌ 不重复定义相同的配置

3. **性能考虑**:
   - ✅ Tailwind 配置只包含实际使用的类
   - ✅ CSS 变量优先于硬编码值
   - ✅ 使用 `purge` 移除未使用的样式
   - ❌ 避免过度扩展 Tailwind 默认配置

4. **版本管理**:
   - ✅ 配置变更遵循语义化版本
   - ✅ 重大变更需要更新文档
   - ✅ 提供迁移指南
   - ❌ 不随意破坏性修改

## 📝 TODO

- [ ] 添加更多业务常量
- [ ] 完善 Tailwind 配置（添加更多设计 token）
- [ ] 添加配置校验工具
- [ ] 考虑支持配置热更新
- [ ] 添加配置文档页面
- [ ] 统一环境变量管理
