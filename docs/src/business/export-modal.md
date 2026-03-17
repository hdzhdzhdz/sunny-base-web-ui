---
outline: [2, 3]
---

# ExportModal 公共导出弹窗

通用的数据导出弹窗组件，支持配置导出参数、字段选择、数据类型设置等功能。

## 基础用法

通过 `useExportModal` 组合式函数创建导出弹窗，支持在调用时动态传入导出参数。
<!-- <preview path="./demos/export-modal/BasicUsage.vue" /> -->

### 基本使用方式-静态配置
```vue
<script setup lang="ts">
import { useExportModal } from '@sunny-base-web/ui'
import { Message } from '@arco-design/web-vue'

// 初始化导出弹窗
const [exportModal, exportModalApi] = useExportModal({
  onExportSuccess: (response: any) => {
    Message.success('导出成功')
  },
  onExportError: (error: any) => {
    Message.error('导出失败')
  }
})

// 在需要导出时调用
const handleExport = async () => {

  // 打开导出弹窗并传入参数
  exportModalApi.open({
    exportUrl: '/url',
    nmodid: 88,
    nButtonid: 541,
    conditionMap: {}
  })
}
</script>

<template>
  <div>
    <exportModal />

    <Button @click="handleExport">导出数据</Button>
  </div>
</template>
```

## API 文档

### useExportModal

#### 参数

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `defaultOptions` | `Partial<ExportModalOptions>` | 否 | `{}` | 默认配置选项 |

#### 返回值

返回一个元组 `[ExportModal, exportModalApi]`：

- `ExportModal`: Vue 组件，用于渲染弹窗
- `exportModalApi`: API 对象，包含控制弹窗的方法

#### exportModalApi

| 方法 | 参数 | 说明 |
|------|------|------|
| `open` | `(options: Partial<ExportExecuteRequest>)` | 打开导出弹窗并传入动态参数 |
| `close` | `()` | 关闭导出弹窗 |

### ExportModalOptions

```typescript
interface ExportModalOptions {
  onExportSuccess?: (response: any) => void;  // 导出成功回调
  onExportError?: (error: any) => void;       // 导出失败回调
}
```

### ExportExecuteRequest

```typescript
interface ExportExecuteRequest {
  exportUrl?: string;           // 导出API地址
  nmodid: number | string | unknown;     // 模块ID
  nButtonid: number | string;  // 按钮ID
  conditionMap?: Record<string, any>;     // 查询条件
}
```

## 使用示例

### 在查询页表格中集成

```vue
<script setup lang="ts">
import { SunnyExportModal, useExportModal } from '@sunny-base-web/ui'
import { Message } from '@arco-design/web-vue'
import { useList } from '@sunny-base-web/effects'

import { useRouter } from 'vue-router'
const router = useRouter()

const [QueryForm, formApi] = useList({
  gridEvents
})

const gridEvents:VxeGridListeners = {
  async toolbarButtonClick (params: any) {
    switch (params.button.code) {
      case 'daochu/show':
        const formValues = await formApi.getValues()
        exportModalApi.open({
          nmodid: router.currentRoute.value.meta.id, // 菜单id
          nButtonid: params.button.nButtonid, // 按钮id
          exportUrl: '', // 导出API地址（可选）
          conditionMap: formValues // 表单数据（可选）
        })
        break
    }
  }
}

const [exportModal, exportModalApi] = useExportModal({
  onExportSuccess: () => {
    Message.success('导出成功')
  },
  onExportError: (error: any) => {
    Message.error(error.message || '导出失败')
  },
})
</script>

<template>
  <div class="export-demo">
    <QueryForm />
    <Grid />

    <exportModal />
  </div>
</template>
```


## 注意事项

1. **参数必填**：`nmodid` 和 `nButtonid` 是必需参数，需要与后端配置保持一致
2. **URL格式**：`exportUrl` 应该是相对路径，会自动添加API前缀
3. **条件数据**：`conditionMap` 应该包含完整的查询条件
4. **组件注册**：确保在模板中正确使用 `<exportModal />` 组件
5. **响应式更新**：参数会在 `nextTick` 后生效，确保组件重新渲染