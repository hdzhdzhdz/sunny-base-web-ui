# AccessControl 权限控制

`AccessControl` 是一个用于组件级别的细粒度权限控制组件。通过设置工号或角色权限码，决定内容是否对当前用户可见。

## 引入

```ts
import { AccessControl } from '@sunny-base-web/effects'
```

## 基础用法

### 按工号判断

```vue
<template>
  <AccessControl :codes="['AC_100100', 'AC_100101']" type="code">
    <Button type="primary">只有指定工号可见</Button>
  </AccessControl>
</template>
```

### 按角色判断

```vue
<template>
  <AccessControl :codes="['admin', 'editor']" type="role">
    <Button type="primary">只有指定角色可见</Button>
  </AccessControl>
</template>
```

## 自定义权限

使用 `authorize` 属性自定义权限判断逻辑：

```vue
<script setup lang="ts">
import { useUserStore } from '@sunny-base-web/stores'

const userStore = useUserStore()

const checkPermission = () => {
  // 自定义逻辑：工号以 AC_ 开头
  return userStore.code.startsWith('AC_')
}
</script>

<template>
  <AccessControl :authorize="checkPermission">
    <Button>工号以 AC_ 开头可见</Button>
  </AccessControl>
</template>
```

## 无权限显示

使用 `fallback` 插槽自定义无权限时显示的内容：

```vue
<template>
  <AccessControl :codes="['admin']" type="role">
    <Button type="primary">有权限可见</Button>
    <template #fallback>
      <Button disabled>无权限操作</Button>
    </template>
  </AccessControl>
</template>
```

## 事件

`change` 事件在权限状态变化时触发：

```vue
<template>
  <AccessControl
    :codes="['admin']"
    type="role"
    @change="handleChange"
  >
    <Button>内容</Button>
  </AccessControl>
</template>

<script setup lang="ts">
const handleChange = (visible: boolean) => {
  console.log('权限状态变化:', visible)
}
</script>
```

## API

### Props

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| codes | `string[]` | 否 | `[]` | 权限码数组（工号或角色） |
| type | `'code' \| 'role'` | 否 | `'code'` | 判断类型，code=工号，role=角色 |
| authorize | `() => boolean` | 否 | - | 自定义权限判断函数 |

### Slots

| 插槽名 | 说明 |
| :--- | :--- |
| default | 有权限时显示的内容 |
| fallback | 无权限时显示的内容 |

### Events

| 事件名 | 参数 | 说明 |
| :--- | :--- | :--- |
| change | `(visible: boolean)` | 权限状态变化时触发 |

## 注意事项

- 权限判断依赖 `@stores` 中的用户信息（工号 `code`、角色 `roles`）
- 自定义方法 `authorize` 优先级高于 `codes` 和 `type`
- 空数组 `codes` 会返回 `true`（视为无需权限验证）
