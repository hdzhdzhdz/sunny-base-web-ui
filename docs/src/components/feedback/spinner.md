# Spinner 加载动画

提供两种风格的加载动画组件：`SunnyLoading`（带文字提示的四点旋转动画）和 `SunnySpinner`（跳跃方块动画），用于页面或区块的加载状态展示。

## 简介

加载动画组件用于在数据加载过程中给用户提供视觉反馈，避免用户在等待时感到困惑。本组件提供两种风格：

- **SunnyLoading**：四点旋转动画，支持自定义图标和文字提示
- **SunnySpinner**：跳跃方块动画，简洁现代

### 核心特性

- ✅ **平滑过渡**：支持渐入渐出动画效果
- ✅ **最小加载时间**：避免闪烁，提升用户体验
- ✅ **主题色跟随**：自动适配项目主题色
- ✅ **自定义图标**：支持通过插槽自定义加载图标
- ✅ **TypeScript 支持**：完整的类型定义

## SunnyLoading 基础用法

使用 `spinning` 属性控制加载状态，`text` 属性设置提示文字。

:::preview
demo-preview=./demos/spinner/LoadingBasic.vue
:::

## SunnySpinner 基础用法

`SunnySpinner` 提供跳跃方块风格的加载动画。

:::preview
demo-preview=./demos/spinner/SpinnerBasic.vue
:::

## 自定义图标

通过 `icon` 插槽可以自定义加载图标。

:::preview
demo-preview=./demos/spinner/CustomIcon.vue
:::

## 最小加载时间

通过 `minLoadingTime` 设置最小加载时间，避免快速加载导致的闪烁。

:::preview
demo-preview=./demos/spinner/MinLoadingTime.vue
:::

## 实际应用场景

结合实际业务场景，在数据加载时展示加载动画。

:::preview
demo-preview=./demos/spinner/RealWorld.vue
:::

## API

### SunnyLoading Props

| 参数名         | 类型      | 必填 | 默认值  | 说明                           |
| -------------- | --------- | ---- | ------- | ------------------------------ |
| spinning       | `boolean` | 否   | `false` | 加载状态，控制动画显示与隐藏   |
| text           | `string`  | 否   | `''`    | 加载提示文字，显示在动画下方   |
| minLoadingTime | `number`  | 否   | `50`    | 最小加载时间（毫秒），避免闪烁 |
| class          | `string`  | 否   | -       | 自定义类名                     |

### SunnySpinner Props

| 参数名         | 类型      | 必填 | 默认值  | 说明                           |
| -------------- | --------- | ---- | ------- | ------------------------------ |
| spinning       | `boolean` | 否   | `false` | 加载状态，控制动画显示与隐藏   |
| minLoadingTime | `number`  | 否   | `50`    | 最小加载时间（毫秒），避免闪烁 |
| class          | `string`  | 否   | -       | 自定义类名                     |

### SunnyLoading Slots

| 插槽名  | 说明                     |
| ------- | ------------------------ |
| icon    | 自定义加载图标           |
| default | 默认插槽，可放置额外内容 |

## 注意事项

1. **容器定位**：组件使用 `absolute` 定位，父容器需要设置 `position: relative`
2. **最小加载时间**：建议设置合理的 `minLoadingTime`，避免快速加载时的闪烁
3. **主题色跟随**：动画颜色自动跟随主题色，无需手动设置
4. **性能优化**：组件会在隐藏后自动暂停动画，减少性能消耗

## 最佳实践

### 1. 合理设置最小加载时间

```vue
<!-- ✅ 推荐：设置合理的时间 -->
<SunnyLoading :spinning="loading" :min-loading-time="200" />

<!-- ❌ 避免：时间过长影响用户体验 -->
<SunnyLoading :spinning="loading" :min-loading-time="2000" />
```

### 2. 提供清晰的加载提示

```vue
<!-- ✅ 推荐：提供明确的提示 -->
<SunnyLoading :spinning="loading" text="正在加载数据..." />

<!-- ⚠️  可选：简单场景可不提供文字 -->
<SunnySpinner :spinning="loading" />
```

### 3. 结合业务场景使用

```vue
<template>
  <div class="relative">
    <!-- 内容区域 -->
    <div v-if="!loading">
      <!-- 实际内容 -->
    </div>

    <!-- 加载动画 -->
    <SunnyLoading :spinning="loading" text="加载中..." />
  </div>
</template>
```

## 常见问题

### Q: 如何让动画覆盖整个页面？

A: 将组件放置在 `fixed` 定位的容器中：

```vue
<div class="fixed inset-0 z-50">
  <SunnyLoading :spinning="loading" text="加载中..." />
</div>
```

### Q: 如何自定义动画颜色？

A: 动画颜色自动跟随主题色，如需自定义，可通过 CSS 变量覆盖：

```css
:root {
  --primary-6: your-custom-color;
}
```

### Q: 两种加载动画如何选择？

A:

- **SunnyLoading**：适合需要文字提示的场景，如数据加载、表单提交
- **SunnySpinner**：适合简洁场景，如页面切换、局部刷新
