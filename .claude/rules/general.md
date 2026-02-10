# General Development Standards

本文档定义了适用于整个项目的通用开发规范。所有模块和包都应遵守这些规范。

## 1. Git Conventions

### Commit Message Format
遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Type 类型：**
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构（既不是新功能也不是修复）
- `perf`: 性能优化
- `test`: 添加或修改测试
- `chore`: 构建/工具链更新
- `build`: 构建系统或依赖变更

**示例：**
```bash
feat(ui): add SunnySearchModal component
fix(utils): correct date format in parseDate function
docs(readme): update installation instructions
```

### Branch Naming
- `master/main` - 主分支
- `feature/*` - 功能开发
- `fix/*` - Bug 修复
- `refactor/*` - 重构
- `docs/*` - 文档更新

## 2. Code Style Guidelines

### TypeScript
- **Strict Mode**: 所有项目必须启用 `strict: true`
- **Type Definitions**: 禁止使用 `any`，优先使用具体类型或 `unknown`
- **Null Handling**: 启用 `strictNullChecks`，明确处理 `null`/`undefined`

### Import Order
统一按以下顺序组织导入：

```typescript
// 1. Vue Core
import { ref, computed } from 'vue';

// 2. Third-party Libraries
import { Message } from '@arco-design/web-vue';
import lodash from 'lodash-es';

// 3. Internal Packages
import { someUtil } from '@sunny-base-web/utils';
import { SunnyButton } from '@sunny-base-web/ui';

// 4. Types
import type { MyComponentProps } from './types';

// 5. Sub-components
import SubComponent from './SubComponent.vue';
```

### Export Conventions
- **Named Exports**: 优先使用具名导出
- **Barrel Files**: 使用 `index.ts` 统一导出
- **Type Exports**: 类型使用 `export type` 单独导出

```typescript
// ✅ 推荐
export const util1 = () => {};
export const util2 = () => {};
export type { UtilType };

// ❌ 避免
export default {
  util1,
  util2
};
```

## 3. File Naming Conventions

### General Rules
- **Files**: `kebab-case` (e.g., `user-profile.ts`, `api-client.ts`)
- **Components**: `PascalCase` (e.g., `UserProfile.vue`, `SunnyButton.vue`)
- **Directories**: `kebab-case` (e.g., `user-profile/`, `api-hooks/`)
- **Test Files**: `{name}.test.ts` 或 `{name}.spec.ts`

### Special Cases
- **Hook Files**: `use-{purpose}.ts` (e.g., `use-form-state.ts`)
- **Type Files**: `types.ts` 或 `{name}.types.ts`
- **Constant Files**: `constants.ts` 或 `{name}.constants.ts`
- **API Files**: `api.ts` 或 `{name}.api.ts`

## 4. Code Organization

### Single Responsibility
- 每个文件/函数只负责一件事
- 文件大小建议不超过 300 行
- 函数长度建议不超过 50 行

### Directory Structure Standard
```
package-name/
├── src/
│   ├── index.ts          # 统一导出
│   ├── types.ts          # 类型定义
│   ├── constants.ts      # 常量定义
│   ├── utils/            # 工具函数
│   ├── components/       # 组件
│   ├── composables/      # Composables/Hooks
│   └── assets/           # 静态资源
├── tests/                # 测试文件
├── README.md             # 包说明文档
└── package.json
```

## 5. Error Handling

### Promise/Async Error Handling
```typescript
// ✅ 推荐：使用 try-catch
async function fetchData() {
  try {
    const data = await api.getData();
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error; // 或返回默认值
  }
}

// ✅ 推荐：使用 .catch()
api.getData()
  .then(data => processData(data))
  .catch(error => handleError(error));
```

### Error Logging
- 使用 `console.error` 记录错误
- 生产环境应集成错误追踪服务
- 用户友好的错误提示（通过 UI 组件）

## 6. Performance Best Practices

### Vue 3
- **Computed Properties**: 缓存计算结果
- **v-once**: 静态内容使用 `v-once`
- **v-memo**: Vue 3.2+ 列表渲染优化
- **Lazy Loading**: 路由和组件按需加载

### Bundle Size
- Tree-shaking 友好的导入方式
- 避免导入整个库（如 `lodash-es` 代替 `lodash`）
- 使用 Bundle Analyzer 分析体积

## 7. Security Guidelines

### Input Validation
- 所有用户输入必须验证
- 使用 Zod 或类似库进行类型验证

### API Keys & Secrets
- **禁止**将密钥提交到 Git
- 使用环境变量（`.env` 文件，不提交）
- 生产环境密钥通过 CI/CD 注入

### XSS Prevention
- Vue 模板默认转义 HTML
- 使用 `v-html` 时必须确保内容可信
- 避免使用 `dangerouslySetInnerHTML` 类似 API

## 8. Testing Guidelines

### Test Structure
```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // 每个测试前的准备
  });

  it('should do something when condition', () => {
    // Arrange
    const input = {};

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Coverage Goals
- 核心业务逻辑：≥ 80%
- 工具函数：≥ 90%
- UI 组件：≥ 60%

## 9. Documentation Standards

### Code Comments
- **JSDoc**: 导出的函数和类型必须包含 JSDoc
- **Inline Comments**: 复杂逻辑必须添加注释说明
- **TODO/FIXME**: 使用标准标记，并附带 issue 链接

```typescript
/**
 * 将日期格式化为 ISO 字符串
 * @param date - 要格式化的日期对象
 * @param timezone - 可选时区，默认为 UTC
 * @returns ISO 格式的日期字符串
 * @example
 * ```ts
 * formatDate(new Date(), 'Asia/Shanghai')
 * // => '2024-01-01T00:00:00+08:00'
 * ```
 */
export function formatDate(date: Date, timezone?: string): string {
  // TODO: 添加对无效日期的处理
  // Issue: https://github.com/xxx/issues/123
  return date.toISOString();
}
```

### README Files
每个包/应用应包含：
- **Purpose**: 包的用途和职责
- **Installation**: 安装步骤
- **Usage**: 基本用法示例
- **API**: 主要 API 说明
- **Examples**: 示例代码

## 10. Monorepo Specific Rules

### Dependency Management
- 优先使用 `pnpm workspace` 协议
- 共享依赖在根目录 `package.json` 管理
- 使用 `pnpm catalog` 统一版本

### Cross-Package Imports
```typescript
// ✅ 正确：使用 workspace 协议
import { SunnyButton } from '@sunny-base-web/ui';

// ❌ 错误：相对路径导入
import { SunnyButton } from '../../../packages/@ui/src';
```

### Build Order
依赖关系：`apps` 依赖 `packages`，`packages` 之间可互相依赖
- 构建时先构建 `packages`
- 确保依赖包先构建完成

---

**注意：** 本规范是最低标准，各包/应用可在此基础上制定更严格的要求。详见各模块的专门规范文件。
