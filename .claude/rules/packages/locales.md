# @locales Package Specification

## 📋 概述

`@locales` 包提供基于 Vue I18n 的国际化解决方案，支持多语言动态加载。

**职责边界：**
- ✅ 国际化配置和工具函数
- ✅ 语言文件管理
- ✅ 翻译函数导出
- ❌ 不包含业务逻辑
- ❌ 不包含 UI 组件

## 🏗️ 目录结构

```
packages/@locales/src/
├── langs/              # 语言文件
│   ├── zh-CN/         # 简体中文
│   │   ├── common.json
│   │   └── components.json
│   └── en-US/         # 英文
│       ├── common.json
│       └── components.json
├── i18n.ts            # i18n 配置和工具
├── typing.ts          # TypeScript 类型定义
└── index.ts           # 统一导出
```

## 📦 核心导出

### 1. 翻译函数

**`$t` - 翻译函数**
```typescript
import { $t } from '@sunny-base-web/locales';

// 在模板或 JS 中使用
$t('common.confirm')
$t('ui.form.required')

// 带参数
$t('common.welcome', { name: 'John' })
```

**`$te` - 检查翻译是否存在**
```typescript
import { $te } from '@sunny-base-web/locales';

if ($te('common.confirm')) {
  // 存在该翻译
}
```

### 2. Composable

**`useI18n()` - Vue I18n Hook**
```typescript
import { useI18n } from '@sunny-base-web/locales';

const { t, locale, availableLocales } = useI18n();

// 使用翻译
t('common.confirm')

// 切换语言
locale.value = 'en-US';
```

### 3. 工具函数

**`setupI18n()` - 初始化 i18n**
```typescript
import { setupI18n } from '@sunny-base-web/locales';

await setupI18n(app, {
  defaultLocale: 'zh-CN',
  loadLocalesMap: localesMap,
});
```

**`loadLocaleMessages()` - 动态加载语言包**
```typescript
import { loadLocaleMessages } from '@sunny-base-web/locales';

await loadLocaleMessages('en-US', {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
});
```

## 🎯 开发规范

### 1. 添加新翻译

**步骤：**

1. **确定分类** (通用/组件/业务)
   - `common.json` - 通用文案（按钮、提示等）
   - `components.json` - 组件文案
   - `*.json` - 业务模块文案

2. **在所有语言文件中添加**
```json
// langs/zh-CN/common.json
{
  "myFeature": {
    "title": "我的功能",
    "description": "这是一个新功能"
  }
}

// langs/en-US/common.json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is a new feature"
  }
}
```

3. **使用翻译**
```typescript
import { $t } from '@sunny-base-web/locales';

$t('myFeature.title')
$t('myFeature.description')
```

### 2. 命名规范

**翻译 Key 命名：**
- **层级结构**: 使用点号分隔 (e.g., `common.confirm`)
- **命名风格**: `camelCase`
- **分类前缀**:
  - `common.*` - 通用文案
  - `ui.[componentName].*` - UI 组件文案
  - `[businessModule].*` - 业务模块文案

**语言代码：**
- 遵循 [BCP 47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) 标准
- 格式: `language-Script-REGION`
- 示例: `zh-CN`, `en-US`, `ja-JP`

### 3. 翻译文件组织

**JSON 结构：**
```json
{
  "category": {
    "key": "翻译文本",
    "nestedKey": {
      "deepKey": "嵌套翻译"
    }
  }
}
```

**最佳实践：**
- ✅ 按功能模块分组
- ✅ 使用嵌套结构组织相关翻译
- ✅ 保持 key 语义化
- ❌ 避免过深的嵌套（最多 3 层）
- ❌ 避免使用特殊字符和空格

### 4. 复数处理

**使用复数形式：**
```json
{
  "item": "no items | one item | {n} items"
}
```

```typescript
$t('item', 0)  // "no items"
$t('item', 1)  // "one item"
$t('item', 5)  // "5 items"
```

### 5. 参数插值

**定义带参数的翻译：**
```json
{
  "welcome": "Welcome, {name}!",
  "itemCount": "You have {count} items"
}
```

```typescript
$t('welcome', { name: 'John' })
$t('itemCount', { count: 5 })
```

### 6. 日期和数字格式化

**日期本地化：**
```typescript
import { useI18n } from '@sunny-base-web/locales';

const { d } = useI18n();
d(new Date(), 'short')  // 根据当前语言格式化
```

**数字本地化：**
```typescript
const { n } = useI18n();
n(1234.56, 'currency')  // ¥1,234.56 / $1,234.56
```

### 7. 缺失翻译处理

**开发环境警告：**
```typescript
// i18n.ts 中已配置
missingHandler: (locale, key) => {
  console.warn(`[i18n] Missing translation: ${locale}.${key}`);
}
```

**降级策略：**
1. 尝试使用当前语言
2. 如果缺失，使用 `zh-CN`（默认语言）
3. 如果仍缺失，显示 key 本身

## ⚠️ 注意事项

1. **完整性**:
   - ✅ 添加新翻译时，确保所有语言文件同步更新
   - ✅ 定期检查缺失的翻译 key
   - ❌ 避免只更新一种语言

2. **性能优化**:
   - ✅ 使用动态导入按需加载语言包
   - ✅ 避免在翻译 key 中使用动态拼接
   - ❌ 不要在循环中频繁调用 `$t`

3. **工具集成**:
   - 考虑使用 i18n-ally (VS Code 插件)
   - 考虑使用 i18next-scanner 扫描代码中的翻译
   - 翻译文件格式化（2 空格缩进）

4. **类型安全**:
```typescript
// typing.ts 中定义翻译 key 类型
export type I18nKey =
  | 'common.confirm'
  | 'common.cancel'
  | 'ui.form.required'
  // ... 更多 keys

// 使用时获得类型提示
declare function $t(key: I18nKey, params?: Record<string, any>): string;
```

## 📝 TODO

- [ ] 添加翻译 key 类型自动生成
- [ ] 集成 i18n-ally VS Code 插件
- [ ] 添加翻译文件格式检查 CI
- [ ] 支持更多语言（日语、韩语等）
- [ ] 添加翻译使用统计工具
- [ ] 考虑添加云端翻译管理服务集成
