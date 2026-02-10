# @utils Package Specification

## 📋 概述

`@utils` 包提供通用的工具函数和 Composables，供整个 monorepo 使用。

**职责边界：**
- ✅ 通用工具函数（日期、对象、数组、类型检查等）
- ✅ Vue Composables（命名空间、样式类名等）
- ✅ 不包含业务逻辑
- ❌ 不包含 UI 组件
- ❌ 不包含 API 请求

## 🏗️ 目录结构

```
packages/@utils/src/
├── color/              # 颜色工具（TinyColor 集成）
│   └── index.ts
├── composables/        # Vue Composables
│   └── use-namespace.ts
├── is/                 # 类型检查工具
│   └── index.ts
├── object/             # 对象操作工具
│   └── index.ts
├── regex/              # 正则表达式工具
│   └── index.ts
├── route/              # Vue Router 工具
│   └── index.ts
├── style/              # CSS 样式工具
│   └── index.ts        # cn() 函数（clsx + tailwind-merge）
├── tree/               # 树形数据工具
│   └── index.ts
└── index.ts            # 统一导出
```

## 📦 核心导出

### 1. 样式工具

**`cn()` - 类名合并**
```typescript
import { cn } from '@sunny-base-web/utils';

// 合并 Tailwind 类名，处理冲突
cn('px-4', 'py-2', isActive && 'bg-blue-500');
```

### 2. 命名空间工具

**`useNamespace()` - BEM 类名生成**
```typescript
import { useNamespace } from '@sunny-base-web/utils';

const { b, e, m, be, bm, em, bem } = useNamespace('button');

// b() => 'sunny-button'
// e('icon') => 'sunny-button__icon'
// m('primary') => 'sunny-button--primary'
// be('icon', 'small') => 'sunny-button__icon--small'
```

### 3. 颜色工具

**`isValidColor()` - 颜色验证**
```typescript
import { isValidColor } from '@sunny-base-web/utils';

isValidColor('#ffffff'); // true
isValidColor('rgb(255, 0, 0)'); // true
isValidColor('notacolor'); // false
```

## 🎯 开发规范

### 1. 添加新工具函数

**步骤：**
1. 在对应分类目录下创建函数
2. 导出该函数
3. 在 `src/index.ts` 中统一导出
4. 添加 JSDoc 注释和类型定义

**示例：**
```typescript
// packages/@utils/src/date/index.ts
/**
 * 格式化日期为 ISO 字符串
 * @param date - 日期对象
 * @returns ISO 格式字符串
 * @example
 * ```ts
 * formatToIso(new Date())
 * // => '2024-01-01T00:00:00.000Z'
 * ```
 */
export function formatToIso(date: Date): string {
  return date.toISOString();
}

// packages/@utils/src/date/index.ts
export * from './formatToIso';

// packages/@utils/src/index.ts
export * from './date';
```

### 2. 命名规范

- **目录**: `kebab-case` (e.g., `date-utils/`)
- **函数**: `camelCase` (e.g., `formatDate`, `isValidColor`)
- **Composable**: `use-*` (e.g., `useNamespace`, `useDateFormat`)

### 3. 代码风格

- **纯函数优先**: 工具函数应无副作用
- **不可变性**: 不修改输入参数
- **类型安全**: 完整的 TypeScript 类型定义
- **JSDoc**: 所有导出函数必须包含注释

### 4. 依赖管理

- **第三方库**: 优先使用轻量级库
  - `clsx` + `tailwind-merge` - 类名处理
  - `tinycolor2` - 颜色处理
- **避免重型依赖**: 不引入整个 lodash，按需引入 `lodash-es`

### 5. 测试要求

工具函数**必须**包含单元测试：
- **覆盖率要求**: ≥ 90%
- **测试位置**: `packages/@utils/src/**/*.test.ts`
- **测试框架**: Vitest

```typescript
// packages/@utils/src/date/index.test.ts
import { describe, it, expect } from 'vitest';
import { formatToIso } from './index';

describe('formatToIso', () => {
  it('should format date to ISO string', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    expect(formatToIso(date)).toBe('2024-01-01T00:00:00.000Z');
  });

  it('should handle invalid date', () => {
    expect(() => formatToIso(new Date('invalid'))).toThrow();
  });
});
```

## ⚠️ 注意事项

1. **职责单一**: 只包含工具函数，不包含业务逻辑
2. **无 Vue 依赖**: 除了 Composables，其他模块不应依赖 Vue
3. **轻量级**: 避免引入大型依赖库
4. **Tree-shaking**: 确保导出方式支持 tree-shaking
5. **向后兼容**: 修改现有函数时保持 API 兼容性

## 📝 TODO

- [ ] 添加更多日期处理工具
- [ ] 添加数字格式化工具
- [ ] 添加字符串处理工具
- [ ] 补充单元测试覆盖
- [ ] 添加使用示例文档
