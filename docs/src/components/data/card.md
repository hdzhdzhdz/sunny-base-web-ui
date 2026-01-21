# HoverCard 悬停卡片

供用户预览内容。

## 基础用法

<preview path="./demos/card/BasicUsage.vue" title="基础用法" description="悬停显示详细信息" />

## API

### HoverCard

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| defaultOpen | 默认是否打开 | `boolean` | `false` |
| open | 受控的打开状态 | `boolean` | `false` |
| openDelay | 打开延迟 (ms) | `number` | `700` |
| closeDelay | 关闭延迟 (ms) | `number` | `300` |

### HoverCardContent

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| align | 对齐方式 | `'start' \| 'center' \| 'end'` | `'center'` |
| sideOffset | 偏移量 | `number` | `4` |
