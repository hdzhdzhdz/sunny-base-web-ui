# Modal 模态框

基于 Arco Design Vue Modal 组件二次封装，完整保留了原组件的所有功能与属性，并针对标题栏交互与底部操作区进行了深度增强。

## 简介

本组件在 [Arco Design Modal](https://arco.design/vue/component/modal) 的基础上，无缝继承了其所有属性（Props）、事件（Events）及插槽（Slots）。您完全可以按照 Arco Design 的官方文档来使用本组件的基础功能，同时享受以下增强特性：

- **增强标题栏**：支持双击标题栏最大化/还原，右上角集成帮助提示、最大化/还原、关闭按钮。
- **灵活的底部插槽**：提供 `insertFooter`、`centerFooter`、`appendFooter` 等插槽，方便在默认按钮周围插入自定义内容。
- **状态管理**：内置 `useKunkkaModal` Hook，通过 API 方式管理弹窗状态，逻辑更聚合。

## 基础用法

使用 `useKunkkaModal` Hook 可以轻松管理弹窗状态。

:::preview
demo-preview=./demos/modal/Basic.vue
:::

## 自定义底部

可以通过 `okText`、`cancelText` 及 `okButtonProps`、`cancelButtonProps` 自定义底部按钮。

:::preview
demo-preview=./demos/modal/CustomFooter.vue
:::

## 异步关闭

通过 `onBeforeOk` 可以控制确认按钮的 loading 状态，实现异步关闭。

:::preview
demo-preview=./demos/modal/AsyncClose.vue
:::

## 底部插槽

提供 `insertFooter`、`centerFooter`、`appendFooter` 插槽，方便在底部区域插入自定义内容。

:::preview
demo-preview=./demos/modal/Slots.vue
:::

## v-model 控制

如果您更喜欢使用组件式调用，可以直接使用 `Modal` 组件并通过 `v-model` 控制显隐。

:::preview
demo-preview=./demos/modal/VModel.vue
:::

## Hook Methods

`useKunkkaModal` 返回一个元组 `[ConnectedModal, methods]`，其中 `methods` 包含以下方法：

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| open | 打开弹窗 | `() => void` |
| close | 关闭弹窗 | `() => void` |
| setState | 更新弹窗状态（支持函数式更新） | `(stateOrFn: Partial<ModalProps> \| ((prev: ModalProps) => Partial<ModalProps>)) => void` |

## API

本组件完全兼容 Arco Design Modal 的 API。关于基础属性和事件的详细说明，请查阅 [Arco Design Modal 官方文档](https://arco.design/vue/component/modal#API)。

以下仅列出本组件新增或增强的属性与插槽：

### 增强 Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| helpMessage | 标题栏右上角的帮助提示信息 | `string` | `"双击标题栏可最大化/还原，按 ESC 可关闭弹窗"` |
| okText | 确认按钮文字 | `string` | `"确定"` |
| cancelText | 取消按钮文字 | `string` | `"取消"` |
| hideCancel | 是否隐藏取消按钮 | `boolean` | `false` |
| okLoading | 确认按钮 loading 状态 | `boolean` | `false` |
| onBeforeOk | 确认前的回调，返回 `false` 可阻止关闭 | `(done?: (closed: boolean) => void) => void \| boolean \| Promise<void \| boolean>` | - |
| onBeforeCancel | 取消前的回调，返回 `false` 可阻止关闭 | `() => boolean \| Promise<boolean>` | - |

### 增强 Slots

| 插槽名 | 说明 |
| --- | --- |
| title | 自定义标题内容 |
| footer | 自定义底部内容（完全替换默认按钮） |
| insertFooter | 在取消按钮左侧插入内容 |
| centerFooter | 在取消按钮和确认按钮之间插入内容 |
| appendFooter | 在确认按钮右侧插入内容 |
