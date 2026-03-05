# SimpleUpload 简易上传

简化的文件上传组件，使用标签形式展示文件列表，用于在表格中轻量级的文件上传需求。

## 基础用法

<preview path="./demos/simple-upload/BasicUsage.vue" title="基础用法" description="最简单的用法，支持文件选择和标签列表展示" />

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 文件列表 JSON 字符串 | `string` | `''` |
| action | 上传接口地址 | `string` | `''` |
| delAction | 删除接口地址 | `string` | `''` |
| accept | 接受的文件类型 | `string` | - |
| encryptFile | 是否加密文件 | `boolean` | `false` |
| storeType | 存储类型 | `string` | `'amazon'` |
| s3FileDir | S3 目录路径 | `string` | `''` |
| preSigned | 是否生成预签名 URL | `boolean` | `false` |
| preSignedExpire | 预签名 URL 过期时间（天） | `number` | `7` |
| limit | 最大文件数量 | `number` | - |
| maxSize | 最大文件大小 (MB) | `number` | - |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 文件列表更新时触发 | `(value: string) => void` |
| change | 文件列表变化时触发 | `(value: string) => void` |

### FileItem Interface

```typescript
interface FileItem {
  uid: string;
  name: string;
  size: number;
  type: string;
  file?: File;
  response?: any;
  status?: string;
  [key: string]: any;
}
```