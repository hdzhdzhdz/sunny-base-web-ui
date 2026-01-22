# Input 输入框

基于 Arco Design 的 Input 组件封装，增强了输入提示功能。

## 主要特性

- **规则提示**：支持传入正则表达式或预设规则，自动在右侧显示提示图标。
- **预设集成**：内置了手机号、邮箱、身份证等常用正则配置。
- **完全兼容**：继承所有 Arco Input 的属性和事件。

## 基础用法

<preview path="./demos/input/Basic.vue" title="基础用法" description="演示不同配置下的输入提示" />

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 绑定值 | `string \| number` | - |
| rule | 预设校验规则 key | `PatternKey` | - |
| regex | 自定义正则 | `RegExp \| string` | - |
| tip | 提示信息 (覆盖预设) | `string` | - |
| showTipIcon | 是否显示提示图标 | `boolean` | `true` |
| ... | 继承所有 `a-input` 属性 | - | - |

### PatternKey

支持的预设规则 Key (来自 `@utils` 包)，完整列表及说明请参考 [Regex 正则表达式](/utilities/regex)。

- `phone`: 手机号
- `landline`: 座机号码
- `email`: 邮箱
- ... (更多规则请查看完整文档)
