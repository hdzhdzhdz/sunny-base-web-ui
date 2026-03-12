# 错误处理测试指南

## 🧪 测试方法

### 1. 测试组件错误（ErrorBoundary）

在任意路由页面中添加测试代码：

```vue
<script setup lang="ts">
import { ref } from 'vue';

// 测试按钮：抛出组件错误
function testComponentError() {
  throw new Error('测试组件错误');
}
</script>

<template>
  <div class="p-4">
    <a-button type="primary" danger @click="testComponentError">
      测试组件错误
    </a-button>
  </div>
</template>
```

**预期结果：**
- ✅ 页面不会白屏
- ✅ 显示友好的错误提示 UI（带有图标和文案）
- ✅ 显示错误消息："测试组件错误"
- ✅ 控制台打印详细错误日志（开发环境）
- ✅ 可以点击"重试"、"刷新页面"、"返回"按钮

---

### 2. 测试全局错误处理器

在任意组件中添加测试代码：

```vue
<script setup lang="ts">
// 测试按钮：触发全局错误
function testGlobalError() {
  setTimeout(() => {
    throw new Error('测试全局错误');
  }, 100);
}

// 测试按钮：触发 Promise 错误
function testPromiseError() {
  Promise.reject('测试 Promise 错误');
}
</script>

<template>
  <div class="p-4 space-x-2">
    <a-button @click="testGlobalError">
      测试全局错误
    </a-button>
    <a-button @click="testPromiseError">
      测试 Promise 错误
    </a-button>
  </div>
</template>
```

**预期结果：**
- ✅ 显示 Message.error 提示："应用发生错误: 测试全局错误"
- ✅ 控制台打印详细错误日志（分组显示）
- ✅ 生产环境会调用 reportError 函数（可在控制台看到 [Error Report]）

---

### 3. 测试未捕获的 Promise 错误

在浏览器控制台执行：

```javascript
// 方法 1：直接 reject
Promise.reject('未捕获的 Promise rejection');

// 方法 2：异步错误
async function asyncError() {
  throw new Error('异步函数错误');
}
asyncError();
```

**预期结果：**
- ✅ 显示 Message.error 提示："异步操作发生错误"
- ✅ 控制台打印详细错误日志（开发环境）
- ✅ 生产环境会调用 reportUnhandledRejection 函数

---

### 4. 测试错误边界重试功能

1. 在某个页面中添加测试代码：

```vue
<script setup lang="ts">
const shouldError = ref(false);

// 模拟条件错误
if (shouldError.value) {
  throw new Error('条件错误');
}

function toggleError() {
  shouldError.value = true;
}
</script>

<template>
  <a-button @click="toggleError">触发错误</a-button>
</template>
```

2. 点击"触发错误"按钮
3. 点击错误边界 UI 中的"重试"按钮

**预期结果：**
- ✅ 错误状态清除
- ✅ 页面重新渲染（但会再次抛出错误，因为条件仍为 true）

---

### 5. 测试国际化

1. 切换应用语言（中文 ↔ 英文）
2. 触发任意错误

**预期结果：**
- ✅ 错误提示文案跟随语言切换
- ✅ 中文：`common.error.title` = "页面出现错误"
- ✅ 英文：`common.error.title` = "Page Error"

---

## ✅ 验证清单

- [ ] 组件错误不会导致白屏
- [ ] ErrorBoundary 显示友好的错误 UI
- [ ] 全局错误显示 Message.error 提示
- [ ] Promise 错误显示 Message.error 提示
- [ ] 开发环境控制台有详细错误日志
- [ ] 生产环境调用错误上报函数
- [ ] "重试"按钮可以清除错误状态
- [ ] "刷新页面"按钮可以刷新页面
- [ ] "返回"按钮可以返回上一页
- [ ] 国际化文案正确显示

---

## 🔍 调试技巧

### 查看错误上报日志

在浏览器控制台执行：

```javascript
// 生产环境可以看到错误上报
localStorage.setItem('debug', 'error-report:*');
```

### 手动触发错误上报

```javascript
import { reportError } from '@sunny-base-web/effects';

reportError(new Error('手动测试错误上报'), {
  component: 'TestComponent',
  info: '手动测试',
});
```

### 检查 ErrorBoundary 是否生效

在 Vue DevTools 中查看组件树，应该能看到 `<ErrorBoundary>` 组件包裹着路由视图。

---

## 🚨 常见问题

### Q1: 为什么点击"重试"后页面还是报错？

**A:** 这是因为触发错误的条件仍然存在。重试只是清除了错误状态，但如果组件重新渲染时条件仍满足，会再次抛出错误。这是正常行为。

### Q2: 为什么开发环境没有调用错误上报？

**A:** 错误上报只会在生产环境 (`import.meta.env.PROD === true`) 时调用。开发环境只会打印控制台日志。

### Q3: 如何测试生产环境的错误上报？

**A:**
1. 构建生产版本：`pnpm build`
2. 启动生产服务器：`pnpm preview`
3. 触发错误，查看控制台的 `[Error Report]` 日志

### Q4: ErrorBoundary 没有捕获到错误？

**A:** 检查以下几点：
- ErrorBoundary 是否正确包裹了路由视图（在 App.vue 中）
- 错误是否在组件的生命周期内抛出（onErrorCaptured 只能捕获子组件错误）
- 全局错误（如 setTimeout 中的错误）不会被 ErrorBoundary 捕获，但会被全局错误处理器捕获

---

## 📊 性能影响

- **开发环境**: 详细的错误日志会略微影响性能，但有助于调试
- **生产环境**: 最小化日志输出，错误上报是异步的，不影响用户体验
- **ErrorBoundary**: 仅在发生错误时渲染，正常情况下无性能开销

---

## 🔗 相关文件

- [bootstrap.ts](../../apps/web/src/bootstrap.ts) - 全局错误处理器
- [ErrorBoundary.vue](../../packages/@ui/src/feedback/error-boundary/ErrorBoundary.vue) - 错误边界组件
- [error-report.ts](../../packages/@effects/src/utils/error-report.ts) - 错误上报工具
- [common.json](../../packages/@locales/src/langs/zh-CN/common.json) - 国际化文案
