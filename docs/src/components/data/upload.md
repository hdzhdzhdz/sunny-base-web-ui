# Upload 上传

支持 S3 上传、文件预览和管理的上传组件。

## 基础用法

<preview path="./demos/upload/BasicUsage.vue" title="基础用法" description="最简单的用法，支持文件选择和列表展示" />

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 文件列表 JSON 字符串 | `string` | `''` |
| action | 上传接口地址 | `string` | `''` |
| delAction | 删除接口地址 | `string` | `''` |
| accept | 接受的文件类型 | `string` | `'.csv,.pdf,.xls,.xlsx'` |
| limit | 最大文件数量 | `number` | `10` |
| maxSize | 最大文件大小 (MB) | `number` | `10` |
| storeType | 存储类型 | `string` | `'amazon'` |
| s3FileDir | S3 目录路径 | `string` | `''` |
| preSigned | 预签名 URL 标识 | `string` | `''` |
| preSignedExpire | 预签名 URL 过期时间 | `string` | `''` |
| readonly | 是否只读 | `boolean` | `false` |
| showEncrypt | 是否显示加密选项 | `boolean` | `false` |

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
  percentage: number;
  checked?: boolean;
  url?: string;
  status?: string;
  [key: string]: any;
}
```
