# Icon 图标

通用图标组件，支持 Iconify 图标库、在线图片 URL、Vue 组件以及默认图标。

## 基础用法

首先从 `@sunny-base-web/ui` 引入组件。

```vue
<script setup lang="ts">
import { SunnyIcon } from "@sunny-base-web/ui";
</script>
```

## 代码演示

### 1. 使用 Iconify 图标字符串

支持使用 Iconify 的图标名称，格式为 `collection:name`。

该组件基于 [Iconify](https://iconify.design/) 实现，因此支持所有 Iconify 收录的图标库（包括 Material Design, Remix Icon, Carbon 等）。

- **Lucide 图标库（推荐）**：[https://lucide.dev/icons](https://lucide.dev/icons)
- **所有可用图标库**：[https://icon-sets.iconify.design/](https://icon-sets.iconify.design/)

<preview path="./demos/icon/BasicUsage.vue" title="使用 Iconify 图标" description="通过字符串指定图标集合和名称" />

### 其他图标库示例

除了 Lucide，你也可以使用其他流行的图标库，只需更改前缀即可。

<preview path="./demos/icon/OtherCollections.vue" title="多图标库支持" description="支持 MDI, Remix, Carbon, Ant Design 等多种图标库" />

### 2. 使用远程图片 URL

如果传入的是 HTTP/HTTPS 链接，组件会自动渲染为 `<img>` 标签。

<preview path="./demos/icon/RemoteUrl.vue" title="使用远程图片 URL" description="直接传入图片链接" />

### 3. 使用 Vue 组件

可以直接传入一个 Vue 组件对象或函数式组件。

<preview path="./demos/icon/ComponentUsage.vue" title="使用 Vue 组件" description="支持自定义渲染函数" />

### 4. 默认/Fallback 图标

如果未提供 `icon` 属性，或者设置了 `fallback` 属性，将显示默认图标。

<preview path="./demos/icon/FallbackUsage.vue" title="默认/Fallback 图标" description="显示兜底图标" />

## API

### Props

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| icon | 图标内容，支持字符串(Iconify/URL)或组件 | `string \| Component \| Function` | - |
| fallback | 是否显示默认图标 | `boolean` | `false` |

### Attributes

组件支持透传所有标准的 HTML 属性（如 `class`, `style`, `onClick` 等）。
