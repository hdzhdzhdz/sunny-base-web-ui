# useNamespace

`useNamespace` 是一个用于生成符合 BEM (Block-Element-Modifier) 规范的类名和 CSS 变量的组合式函数（Composable）。它有助于统一组件库的样式命名规则，简化样式类名的生成过程。

## 引入

```ts
import { useNamespace } from '@utils'
```

## 用法

```ts
const ns = useNamespace('button')
```

## API

### 基础 BEM 生成

| 方法 | 描述 | 示例 (namespace='kunkka', block='button') | 结果 |
| :--- | :--- | :--- | :--- |
| `b()` | 生成 Block 类名 | `ns.b()` | `kunkka-button` |
| `b('primary')` | 生成带后缀的 Block | `ns.b('group')` | `kunkka-button-group` |
| `e('icon')` | 生成 Element 类名 | `ns.e('icon')` | `kunkka-button__icon` |
| `m('disabled')` | 生成 Modifier 类名 | `ns.m('disabled')` | `kunkka-button--disabled` |
| `be('group', 'item')` | Block Suffix + Element | `ns.be('group', 'item')` | `kunkka-button-group__item` |
| `em('icon', 'color')` | Element + Modifier | `ns.em('icon', 'color')` | `kunkka-button__icon--color` |
| `bm('group', 'vertical')` | Block Suffix + Modifier | `ns.bm('group', 'vertical')` | `kunkka-button-group--vertical` |
| `bem('group', 'item', 'active')` | 全组合 | `ns.bem('group', 'item', 'active')` | `kunkka-button-group__item--active` |

### 状态生成

`is` 函数用于生成状态类名（通常以 `is-` 开头）。

```ts
// 基础用法
ns.is('disabled') // -> 'is-disabled'

// 条件用法
ns.is('active', true) // -> 'is-active'
ns.is('active', false) // -> ''
```

### CSS 变量生成

用于生成组件相关的 CSS 变量样式对象或名称。

| 方法 | 描述 | 示例 | 结果 |
| :--- | :--- | :--- | :--- |
| `cssVar({ color: 'red' })` | 生成 CSS 变量对象 | `ns.cssVar({ color: 'red' })` | `{ '--kunkka-color': 'red' }` |
| `cssVarBlock({ padding: '10px' })` | 生成带 Block 的 CSS 变量对象 | `ns.cssVarBlock({ padding: '10px' })` | `{ '--kunkka-button-padding': '10px' }` |
| `cssVarName('color')` | 获取 CSS 变量名 | `ns.cssVarName('color')` | `--kunkka-color` |
| `cssVarBlockName('padding')` | 获取带 Block 的 CSS 变量名 | `ns.cssVarBlockName('padding')` | `--kunkka-button-padding` |

## 示例

在 Vue 组件中使用：

```vue
<script setup lang="ts">
import { useNamespace } from '@utils'

const ns = useNamespace('card')
</script>

<template>
  <div :class="[ns.b(), ns.is('always-shadow')]">
    <div :class="ns.e('header')">
      Header
    </div>
    <div :class="ns.e('body')">
      Body Content
    </div>
  </div>
</template>

<style scoped>
.kunkka-card {
  /* styles */
}
.kunkka-card__header {
  /* styles */
}
.is-always-shadow {
  box-shadow: ...
}
</style>
```
