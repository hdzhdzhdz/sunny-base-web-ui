# ErrorBoundary 错误边界

错误边界组件，用于捕获子组件树中的 JavaScript 错误，并显示友好的错误 UI。

## 简介

ErrorBoundary 是 Vue 3 的错误边界组件，基于 `onErrorCaptured` Hook 实现。它能够：

- **捕获子组件错误**：捕获子组件在 setup、render 阶段发生的错误
- **友好错误展示**：显示错误消息、堆栈信息（开发环境）
- **提供恢复选项**：支持重试、刷新页面、上报错误等操作

## 基础用法

:::preview
demo-preview=./demos/error-boundary/Basic.vue
:::

## Props

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| showRetry | `boolean` | 否 | `true` | 是否显示重试按钮 |
| showRefresh | `boolean` | 否 | `true` | 是否显示刷新按钮 |
| showReport | `boolean` | 否 | `true` | 是否显示上报错误按钮 |
| errorMessage | `string` | 否 | - | 自定义错误标题 |

## Events

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| retry | - | 点击重试按钮时触发 |
| report | `(error: Error)` | 点击上报错误按钮时触发 |

## 使用场景

### 1. 包裹路由视图

在 `App.vue` 中包裹 RouterView，实现全局错误捕获：

```vue
<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
</template>
```

### 2. 包裹独立组件

也可以单独包裹某个组件，局部捕获错误：

```vue
<template>
  <ErrorBoundary>
    <SuspiciousComponent />
  </ErrorBoundary>
</template>
```

## 注意事项

- ErrorBoundary 只捕获子组件的错误，不会捕获自身组件的错误
- 首次捕获错误后，会阻止后续错误的传播，避免控制台被刷屏
- 错误详情（消息、堆栈）在生产环境默认隐藏，可通过配置开启
