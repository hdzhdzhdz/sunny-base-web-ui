---
outline: [2, 3]
---

# ImportModal 公共导入弹窗

通用的数据导入弹窗组件，支持文件上传、模板下载、加密上传等功能。

## 基础用法

通过 `useImportModal` 组合式函数创建导入弹窗，支持在调用时动态传入导入参数。

### 基本使用方式

```vue
<script setup lang="ts">
import { useImportModal } from '@sunny-base-web/ui'
import { Message } from '@arco-design/web-vue'

// 初始化导入弹窗
const [importModal, importModalApi] = useImportModal({
  onUploadSuccess: (response: any) => {
    Message.success('导入成功')
  },
  onUploadError: (error: any) => {
    Message.error('导入失败')
  }
})

// 在需要导入时调用
const handleImport = async () => {
  // 打开导入弹窗并传入参数
  importModalApi.open({
    templateUrl: '/url',
    uploadUrl: '/url',
    nModid: 88,
    nButtonid: 541,
    params: {}
  })
}
</script>

<template>
  <div>
    <importModal />

    <Button @click="handleImport">导入数据</Button>
  </div>
</template>
```

## API 文档

### useImportModal

#### 参数

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `defaultOptions` | `Partial<ImportModalOptions>` | 否 | `{}` | 默认配置选项 |

#### 返回值

返回一个元组 `[ImportModal, importModalApi]`：

- `ImportModal`: Vue 组件，用于渲染弹窗
- `importModalApi`: API 对象，包含控制弹窗的方法

#### importModalApi

| 方法 | 参数 | 说明 |
|------|------|------|
| `open` | `(options: Partial<ImportModalExecuteRequest>)` | 打开导入弹窗并传入动态参数 |
| `close` | `()` | 关闭导入弹窗 |

### ImportModalOptions

```typescript
interface ImportModalOptions {
  onUploadSuccess?: (response: any) => void;  // 上传成功回调
  onUploadError?: (error: any) => void;       // 上传失败回调
  onDownloadSuccess?: () => void;             // 模板下载成功回调
  onDownloadError?: (error: any) => void;     // 模板下载失败回调
  onClose?: () => void;                        // 弹窗关闭回调
}
```

### ImportModalExecuteRequest

```typescript
interface ImportModalExecuteRequest {
  title?: string;                   // 弹窗标题
  width?: string | number;          // 弹窗宽度
  templateUrl?: string;             // 模板下载API地址
  uploadUrl?: string;               // 文件上传API地址
  accept?: string;                  // 允许上传的文件类型
  maxSize?: number;                 // 文件最大大小（MB）
  limit?: number;                   // 最大上传文件数量
  params?: Record<string, any>;      // 附加参数
  nModid?: number | string;         // 模块ID
  nButtonid?: number | string;      // 按钮ID
}
```

### ImportModal Props

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `title` | `string` | 否 | `'模板导入'` | 弹窗标题 |
| `width` | `string \| number` | 否 | `'500px'` | 弹窗宽度 |
| `templateUrl` | `string` | 否 | `''` | 模板下载API地址 |
| `uploadUrl` | `string` | 否 | `''` | 文件上传API地址 |
| `accept` | `string` | 否 | `'.xlsx,.xls'` | 允许上传的文件类型 |
| `maxSize` | `number` | 否 | `10` | 文件最大大小（MB） |
| `limit` | `number` | 否 | `1` | 最大上传文件数量 |
| `params` | `Record<string, any>` | 否 | `{}` | 附加参数 |
| `nModid` | `number \| string` | 否 | - | 模块ID |
| `nButtonid` | `number \| string` | 否 | - | 按钮ID |

### ImportModal Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `upload-success` | `(response: any)` | 上传成功触发 |
| `upload-error` | `(error: any)` | 上传失败触发 |
| `download-success` | `()` | 模板下载成功触发 |
| `download-error` | `(error: any)` | 模板下载失败触发 |
| `close` | `()` | 弹窗关闭时触发 |

## 使用示例

### 在查询页表格中集成

```vue
<script setup lang="ts">
import { useImportModal } from '@sunny-base-web/ui'
import { Message } from '@arco-design/web-vue'
import { useList } from '@sunny-base-web/effects'
import { useRouter } from 'vue-router'

const router = useRouter()

const gridEvents:VxeGridListeners = {
  async toolbarButtonClick (params: any) {
    switch (params.button.code) {
      case 'daoru/show':
        importModalApi.open({
          nModid: router.currentRoute.value.meta.id, // 菜单id
          nButtonid: params.button.nButtonid, // 按钮id
          templateUrl: '', // 模板下载API地址（可选）
          uploadUrl: '', // 上传API地址（可选）
          params: {} // 附加参数（可选）
        })
        break
    }
  }
}

const [QueryForm, formApi] = useList<any>({
  gridEvents
})

const [importModal, importModalApi] = useImportModal({
  onUploadSuccess: () => {
    Message.success('导入成功')
    formApi.submit() // 刷新表格数据
  },
  onUploadError: (error: any) => {
    Message.error(error.message || '导入失败')
  },
})
</script>

<template>
  <div class="import-demo">
    <QueryForm />
    <Grid />

    <importModal />
  </div>
</template>
```

### 自定义文件类型和大小限制

```vue
<script setup lang="ts">
import { useImportModal } from '@sunny-base-web/ui'

const [importModal, importModalApi] = useImportModal({
  onUploadSuccess: (response: any) => {
    console.log('上传成功', response)
  }
})

const handleImport = () => {
  importModalApi.open({
    title: 'Excel导入',
    templateUrl: '/api/export/template',
    uploadUrl: '/api/import/upload',
    accept: '.xlsx,.xls,.csv',
    maxSize: 20,
    limit: 1,
    nModid: 100,
    nButtonid: 200,
    params: {
      customParam: 'value'
    }
  })
}
</script>

<template>
  <div>
    <importModal />
    <Button @click="handleImport">导入数据</Button>
  </div>
</template>
```

### 监听所有事件

```vue
<script setup lang="ts">
import { useImportModal } from '@sunny-base-web/ui'
import { Message } from '@arco-design/web-vue'

const [importModal, importModalApi] = useImportModal({
  onUploadSuccess: (response: any) => {
    Message.success('导入成功')
    console.log('上传成功', response)
  },
  onUploadError: (error: any) => {
    Message.error(`导入失败: ${error.message}`)
    console.error('上传失败', error)
  },
  onDownloadSuccess: () => {
    Message.success('模板下载成功')
  },
  onDownloadError: (error: any) => {
    Message.error(`模板下载失败: ${error.message}`)
  },
  onClose: () => {
    console.log('弹窗已关闭')
  }
})

const handleImport = () => {
  importModalApi.open({
    templateUrl: '/api/export/template',
    uploadUrl: '/api/import/upload',
    nModid: 100,
    nButtonid: 200
  })
}
</script>

<template>
  <div>
    <importModal />
    <Button @click="handleImport">导入数据</Button>
  </div>
</template>
```

## 功能说明

### 文件上传

导入弹窗支持文件上传功能，包含以下特性：
- 文件类型验证：根据 `accept` 属性限制上传文件类型
- 文件大小验证：根据 `maxSize` 属性限制文件大小（MB）
- 文件数量限制：根据 `limit` 属性限制同时上传的文件数量
- 自动上传：点击"开始上传"按钮后触发上传

### 模板下载

点击"模板下载"按钮可下载导入模板，需要配置 `templateUrl` 和 `nModid`、`nButtonid` 参数。

### 加密上传

弹窗提供"是否加密"开关，开启后会调用不同的上传接口：
- 未加密：`/upload/fileUpload`
- 已加密：`/upload/fileUploadDecode`

上传时会自动在请求中添加以下参数：
- `fileName`: 上传的文件
- `nModid`: 模块ID
- `nButtonid`: 按钮ID
- `paramMap`: 附加参数（JSON字符串）

## 注意事项

1. **参数必填**：`nModid` 和 `nButtonid` 是必需参数，需要与后端配置保持一致
2. **URL格式**：`templateUrl` 和 `uploadUrl` 应该是相对路径，会自动添加API前缀
3. **文件类型**：默认只支持 `.xlsx` 和 `.xls` 格式，可通过 `accept` 属性修改
4. **文件大小**：默认限制为 10MB，可通过 `maxSize` 属性调整
5. **组件注册**：确保在模板中正确使用 `<importModal />` 组件
6. **响应式更新**：参数会在 `nextTick` 后生效，确保组件重新渲染
7. **刷新数据**：导入成功后建议调用查询方法刷新表格数据
8. **错误处理**：建议在 `onUploadError` 回调中处理错误情况，给用户友好的提示
