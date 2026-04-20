# QrcodeReader 二维码识别

基于 `vue-qrcode-reader` 封装的二维码/条形码识别组件，支持摄像头实时扫描、文件上传识别、拖拽图片识别三种模式。

## 简介

二维码识别组件提供了三种工作模式：

- **Stream（摄像头扫描）**：通过设备摄像头实时扫描二维码，适合移动端或需要连续扫描的场景
- **Capture（文件上传）**：通过文件选择器上传图片进行识别，适合桌面端单次识别场景
- **Drop-Zone（拖拽识别）**：通过拖拽图片到指定区域进行识别，适合桌面端批量识别场景

### 核心特性

- ✅ **多模式支持**：摄像头扫描、文件上传、拖拽识别
- ✅ **多格式支持**：支持 QR Code、EAN、Code128 等多种条形码格式
- ✅ **实时追踪**：摄像头模式下支持自定义绘制识别结果高亮
- ✅ **TypeScript 支持**：完整的类型定义

## 基础用法

使用 `mode` 属性切换识别模式，默认为 `stream`（摄像头扫描）。

:::preview
demo-preview=./demos/qrcode-reader/BasicStream.vue
:::

## 文件上传模式

设置 `mode="capture"` 使用文件上传模式，用户选择图片后自动识别。

:::preview
demo-preview=./demos/qrcode-reader/CaptureMode.vue
:::

## 拖拽识别模式

设置 `mode="drop-zone"` 使用拖拽识别模式，将图片拖拽到指定区域即可识别。

:::preview
demo-preview=./demos/qrcode-reader/DropZoneMode.vue
:::

## 自定义追踪样式

在 `stream` 模式下，通过 `track` 属性自定义识别结果的高亮绘制样式。

:::preview
demo-preview=./demos/qrcode-reader/CustomTrack.vue
:::

## 暂停与恢复

在 `stream` 模式下，通过 `paused` 属性控制扫描的暂停与恢复。

:::preview
demo-preview=./demos/qrcode-reader/PauseResume.vue
:::

## API

### Props

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| mode | `'stream' \| 'capture' \| 'drop-zone'` | 否 | `'stream'` | 识别模式 |
| paused | `boolean` | 否 | `false` | 是否暂停扫描（仅 stream 模式） |
| constraints | `MediaTrackConstraints` | 否 | `{ facingMode: 'environment' }` | 摄像头约束（仅 stream 模式） |
| torch | `boolean` | 否 | `false` | 是否开启手电筒（仅 stream 模式，需设备支持） |
| formats | `string[]` | 否 | `['qr_code']` | 要识别的条形码格式列表 |
| track | `function \| false` | 否 | - | 自定义追踪绘制函数（仅 stream 模式） |

### Events

| 事件名 | 参数 | 说明 |
| :--- | :--- | :--- |
| detect | `(barcodes: DetectedBarcode[])` | 识别到条形码时触发 |
| error | `(error: Error)` | 发生错误时触发 |
| camera-on | `(capabilities: MediaTrackCapabilities)` | 摄像头开启时触发（仅 stream 模式） |
| camera-off | - | 摄像头关闭时触发（仅 stream 模式） |

### Slots

| 插槽名 | 说明 | 适用模式 |
| :--- | :--- | :--- |
| default | 摄像头画面上的自定义内容 | stream |
| loading | 摄像头加载中的自定义内容 | stream |
| drop-zone | 拖拽区域的自定义内容 | drop-zone |

### DetectedBarcode

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| rawValue | `string` | 识别结果原始值 |
| format | `string` | 条形码格式 |
| boundingBox | `DOMRectReadOnly` | 边界框 |
| cornerPoints | `Point[]` | 四个角坐标 |

## 注意事项

1. **HTTPS 要求**：摄像头扫描模式（stream）要求页面在 HTTPS 环境或 localhost 下运行
2. **设备权限**：stream 模式需要用户授予摄像头权限
3. **浏览器兼容性**：依赖 `BarcodeDetector` API 或 `zxing` 库，请确认目标浏览器支持
4. **formats 可选值**：`qr_code`、`ean_13`、`ean_8`、`code_128`、`code_39`、`upc_a`、`upc_e`、`itf`、`data_matrix`、`aztec`、`pdf417`
