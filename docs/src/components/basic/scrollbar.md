# Scrollbar 滚动条

## 基础用法

<preview path="./demos/scrollbar/BasicUsage.vue" title="基础用法" description="垂直方向的滚动条" />

## 水平滚动

设置 `horizontal` 属性开启水平滚动。

<preview path="./demos/scrollbar/Horizontal.vue" title="水平滚动" description="水平方向的滚动条" />

## 阴影提示

设置 `shadow` 属性开启滚动阴影提示，当内容可滚动时显示阴影。

<preview path="./demos/scrollbar/Shadow.vue" title="阴影提示" description="滚动时显示顶部/底部阴影" />

### CSS Variables

组件使用了以下 CSS 变量，你可以覆盖它们来自定义样式：

| 变量名 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `--background` | `0 0% 100%` | 背景颜色 (HSL) |
| `--scroll-shadow` | `var(--background)` | 滚动阴影颜色 (HSL) |
| `--border` | `214.3 31.8% 91.4%` | 边框颜色 (HSL) |

### Events

| 事件名 | 说明 | 回调参数 |
| :--- | :--- | :--- |
| `scrollAt` | 滚动位置改变时触发 | `{ top: boolean, bottom: boolean, left: boolean, right: boolean }` |