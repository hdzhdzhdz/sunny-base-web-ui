# @icons Package Specification

## 📋 概述

`@icons` 包提供图标组件解决方案，基于 Iconify 和 Lucide 图标库。

**职责边界：**
- ✅ 图标组件封装
- ✅ 图标集合管理
- ✅ 图标加载优化
- ❌ 不包含其他 UI 组件
- ❌ 不包含业务逻辑

## 🏗️ 目录结构

```
packages/@icons/src/
├── create-icon.ts     # 图标创建工具
├── lucide.ts          # Lucide 图标集成
└── index.ts           # 统一导出
```

## 📦 核心导出

### 1. Icon 组件

**基础使用：**
```vue
<script setup lang="ts">
import { Icon } from '@sunny-base-web/icons';
</script>

<template>
  <!-- 使用 Iconify 图标 -->
  <Icon icon="mdi:home" width="24" />
  <Icon icon="logos:vue" width="100" />

  <!-- 使用 Lucide 图标（已预加载） -->
  <Icon icon="lucide:home" />
  <Icon icon="lucide:user" />
</template>
```

### 2. Lucide 图标（推荐）

**直接导入：**
```vue
<script setup lang="ts">
import {
  Home,
  User,
  Settings,
  Search,
  ChevronDown,
} from '@sunny-base-web/icons';
</script>

<template>
  <Home :size="24" />
  <User :size="20" stroke-width="2" />
  <Settings class="text-blue-500" />
  <Search />
  <ChevronDown :size="16" />
</template>
```

**图标属性：**
- `size`: 图标大小（默认 24）
- `strokeWidth`: 线条粗细（默认 2）
- `color`: 颜色（默认继承）
- `class`: Tailwind CSS 类名

### 3. 工具函数

**`addIcon()` - 添加单个图标：**
```typescript
import { addIcon } from '@sunny-base-web/icons';

addIcon('my-icon', {
  body: '<svg><!-- SVG path --></svg>',
  width: 24,
  height: 24,
});
```

**`addCollection()` - 添加图标集合：**
```typescript
import { addCollection } from '@sunny-base-web/icons';

addCollection({
  prefix: 'my-icons',
  icons: {
    home: { body: '...', width: 24, height: 24 },
    user: { body: '...', width: 24, height: 24 },
  },
});
```

**`listIcons()` - 列出所有图标：**
```typescript
import { listIcons } from '@sunny-base-web/icons';

const icons = listIcons();
// ['lucide:home', 'lucide:user', ...]
```

## 🎯 开发规范

### 1. 图标选择原则

**优先级：**
1. **Lucide 图标**（推荐）- 已预加载，体积小
2. **Iconify 图标集** - 按需加载，选择丰富
3. **自定义 SVG** - 特殊需求时使用

**图标集选择：**
- **通用 UI**: Lucide（默认）
- **Logo**: Iconify `logos:` 集合
- **品牌**: Iconify `mdi:`、`fa:` 集合
- **特殊**: Iconify 其他集合（查看 [icones.js.org](https://icones.js.org/)）

### 2. 使用规范

**组件中使用：**
```vue
<script setup lang="ts">
// ✅ 推荐：直接导入 Lucide 图标
import { Home, User, Settings } from '@sunny-base-web/icons';

// ⚠️  按需：使用 Icon 组件
import { Icon } from '@sunny-base-web/icons';

// ❌ 避免：使用字符串名称（无法类型检查）
// const iconName = 'home';
</script>

<template>
  <!-- ✅ 推荐：Lucide 图标 -->
  <Home :size="20" />

  <!-- ✅ 可接受：Icon 组件 -->
  <Icon icon="lucide:home" :size="20" />

  <!-- ❌ 避免：字符串拼接 -->
  <!-- <Icon :icon="`lucide:${iconName}`" /> -->
</template>
```

**动态图标：**
```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@sunny-base-web/icons';

const iconName = computed(() => {
  return isOpen.value ? 'lucide:chevron-up' : 'lucide:chevron-down';
});
</script>

<template>
  <Icon :icon="iconName" />
</template>
```

### 3. 样式和尺寸

**使用 Tailwind CSS：**
```vue
<template>
  <!-- 尺寸 -->
  <Home :size="16" class="w-4 h-4" />
  <Home :size="20" class="w-5 h-5" />
  <Home :size="24" class="w-6 h-6" />

  <!-- 颜色 -->
  <Home class="text-blue-500" />
  <Home class="text-gray-400 hover:text-gray-600" />

  <!-- 响应式 -->
  <Home :size="isMobile ? 16 : 24" />
</template>
```

**内联样式：**
```vue
<template>
  <Home
    :size="24"
    :stroke-width="2.5"
    :color="isActive ? '#1890ff' : '#999'"
  />
</template>
```

### 4. 性能优化

**按需加载：**
```typescript
// ✅ 推荐：只导入需要的图标
import { Home, User } from '@sunny-base-web/icons';

// ❌ 避免：导入整个图标库
// import * as Icons from '@sunny-base-web/icons';
```

**预加载常用图标：**
```typescript
// 在应用入口处预加载
import { addCollection } from '@sunny-base-web/icons';
import lucide from '@sunny-base-web/icons/lucide';

addCollection(lucide);
```

### 5. 在 @ui 组件中使用

**组件内部使用图标：**
```vue
<!-- packages/@ui/src/feedback/SunnyModal.vue -->
<script setup lang="ts">
import { Close, Info } from '@sunny-base-web/icons';
import { SunnyModalProps } from './types';

defineProps<SunnyModalProps>();
</script>

<template>
  <div class="sunny-modal">
    <Close class="sunny-modal__close" />
    <Info v-if="type === 'info'" class="sunny-modal__icon" />
  </div>
</template>
```

**Props 传递图标组件：**
```typescript
// types.ts
export interface SunnyButtonProps {
  icon?: Component; // 图标组件
}

// SunnyButton.vue
<script setup lang="ts">
import { SunnyButtonProps } from './types';

defineProps<SunnyButtonProps>();
</script>

<template>
  <button class="sunny-button">
    <component :is="icon" v-if="icon" class="sunny-button__icon" />
  </button>
</template>

// 使用
<SunnyButton :icon="Home" />
```

### 6. 可访问性

**添加 aria-label：**
```vue
<template>
  <button aria-label="Close dialog">
    <Close aria-hidden="true" />
  </button>
</template>
```

**标题和描述：**
```vue
<template>
  <Icon icon="lucide:home">
    <title>Home</title>
    <desc>Go to home page</desc>
  </Icon>
</template>
```

## ⚠️ 注意事项

1. **图标一致性**:
   - ✅ 同一功能使用相同图标
   - ✅ 遵循 Arco Design 的图标规范
   - ❌ 避免混用不同风格的图标集

2. **性能考虑**:
   - ✅ Lucide 图标优先（已预加载）
   - ✅ 避免在同一页面使用过多不同图标集
   - ❌ 不要导入整个图标库

3. **设计规范**:
   - ✅ 默认尺寸：24px
   - ✅ 线条粗细：2px
   - ✅ 颜色：继承文本颜色
   - ✅ 间距：周围留 8px 空间

4. **版本管理**:
   - Lucide 图标定期更新
   - Iconify 图标集通过 CDN 加载
   - 自定义图标需要手动管理版本

## 📝 TODO

- [ ] 添加图标搜索工具
- [ ] 添加图标预览页面
- [ ] 集成更多图标集（Material Design、Remix Icon）
- [ ] 添加图标使用规范文档
- [ ] 考虑支持 SVG sprite 方式
