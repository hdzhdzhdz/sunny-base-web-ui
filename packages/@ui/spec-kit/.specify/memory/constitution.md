# UI Engineering Specification

## 1. Overview
本规格说明书定义了 `@ui` 包的工程化标准、架构原则及开发规范。旨在确保组件库的一致性、可维护性和高质量构建，所有基于 Arco Design Vue 二次封装的组件（含基础原子、复合业务组件）均需严格遵循，新增组件需继承本规范并补充专属约束。

## 2. Architecture Principles
- **Configuration Driven (配置驱动)**: 复杂组件（如 Form, Grid）应优先支持 Schema/Config 驱动，以适应低代码或动态渲染需求；配置结构需做标准化定义，支持扩展自定义配置项。
- **Hook + Component (逻辑分离)**: 业务逻辑复杂的组件(代码超 200 行/含异步逻辑/多状态管理)应采用 `useLogic` + `Component` 的分离模式。
  - `useXxx`: 负责状态管理、API 交互、事件处理、配置解析与映射，对外暴露状态和方法，与 UI 解耦。
  - `Component`: 负责纯 UI 渲染，仅接受 props、slots 和 Hook 暴露的状态 / 方法，无业务逻辑。
- **Arco Design Extended**: 基于 Arco Design Vue 进行二次封装，优先复用 Arco 原生命令/Props/事件/样式，仅对缺失能力做扩展，不随意重写原有逻辑；Arco 组件的透传需遵循统一规则。
- **Tailwind First**: 样式优先使用 Tailwind CSS Utility Classes，减少手写 CSS/Less；自定义样式需基于 Arco Design Token 扩展。
- **TypeScript First**: 所有组件均采用 TypeScript 编写，类型定义在 `types.ts` 中。
- **Composite Component Reuse (复合组件复用)**: 由多个基础/通用组件组合的复合组件（如 SearchModal=Modal+Form+Table），必须复用 @ui 包内已封装的Sunny系列组件（如 SunnyModal、SunnyForm、SunnyTable），不直接使用Arco原生组件，保证组件库风格/能力统一。

## 3. Directory Structure
组件库遵循以下目录结构规范：

```text
packages/@ui/src/
├── basic/          # 基础原子组件 (Icon, Scrollbar, Button)
├── data/           # 数据展示类 (Grid, Table, Upload)
├── entry/          # 数据录入类 (Form, Select, InputTag)
├── feedback/       # 反馈类 (Modal, Drawer, Toast)
├── navigation/     # 导航类 (Menu, Breadcrumb)
└── layout/         # 布局类 (Container, Divider)
└── composite/      # 复合组件目录（由多组件组合的复杂组件，如SearchModal、QueryPage）
```

每个组件目录应包含：
- `index.ts`: 统一导出（组件、类型、Hook <可选>）
- `SunnyXxx.vue`: 组件实现（严格 PascalCase+Sunny 前缀）
- `types.ts`: 类型定义（Props、配置 Schema、事件参数、返回值等）
- `api.ts` (可选): 独立的 API 请求 / 配置加载逻辑，与 Hook 解耦，支持按需引入
- `use-component.ts` (可选/复合/复杂组件必选): 逻辑 Hook（kebab-case 命名，与组件名对应）

## 4. Naming Convention (命名规范)

### 4.1 Files & Directories (文件与目录)
- **Directories**: 使用 `kebab-case` (e.g., `user-profile`, `data-grid`)。
- **Vue Components**: 使用 `PascalCase` (e.g., `SunnyForm.vue`, `UserProfile.vue`)。
- **TS/JS Files**: 使用 `kebab-case` (e.g., `use-form.ts`, `data-utils.ts`)。例外：导出的类定义可使用 `PascalCase`。
- **Index Files**: 每个组件文件夹必须包含 `index.ts` 用于导出;复合组件需在 index.ts 中同时导出组件、Hook 和核心类型。
- **Hook Files**: 逻辑 Hook 文件命名为 `use-sunny-[component-name].ts`（与组件名严格对应，e.g., `use-sunny-form.ts`、`use-sunny-search-modal.ts`）。

### 4.2 Component Identification (组件标识)
- **Component Name**: 必须以 `Sunny` 为前缀，采用 `PascalCase` (e.g., `SunnyButton`, `SunnyModal`);复合组件名称需体现核心能力（如 SearchModal = 搜索 + 弹窗），避免模糊命名。
- **name Option**: 组件内部必须显示定义 `name` 属性，与文件名保持一致。

### 4.3 Props & Events (属性与事件)
- **Props**: 定义时使用 `camelCase` (e.g., `modelValue`, `showIcon`); 复用 Arco内部组件的Props需与原名称保持一致，不自定义别名（如 Arco Modal 的visible，不改为open）。
- **Events**:
  - `emit` 定义使用`camelCase` (e.g., `update:modelValue`, `change`, `clickRow`, `loadConfigSuccess`)；异步操作相关事件需区分成功/失败（如`loadConfigSuccess`/`loadConfigFail`）。
  - 模板中使用 `@kebab-case` (e.g., `@click-row`)。
  - 事件参数：单个参数封装为对象，便于后续扩展（e.g., `emit('search', { params, configId })` 而非 `emit('search', params, configId)`）。
- **Event Handlers**: 处理函数命名使用 `handle` + `EventName` (e.g., `handleClick`, `handleValueChange`); 异步操作相关事件处理函数需增加async标识（e.g., `async handleConfigLoad`）。
- **Slots**: 插槽命名使用 kebab-case (e.g., `form-header`, `table-footer`)；默认插槽仅用于核心内容，自定义插槽需明确用途，避免无意义插槽。
### 4.4 Hooks & Functions (属性与事件)
- **Hook 导出**: Hook 函数命名为 useSunny[ComponentName] (PascalCase+Sunny 前缀，e.g., useSunnyForm, useSunnySearchModal)，与 Hook 文件名对应。
- **Hook 内部方法/状态**: 小驼峰命名，私有方法/状态加下划线前缀（e.g., `_parseConfig`, `_configCache`），公共暴露的不加。
- **工具函数**: 通用工具函数抽离至`@ui/src/utils/`，组件内仅保留专属工具函数；工具函数命名为[动作]+[对象]（e.g., `parseQueryConfig`, `mapFormSchema`）。
## 5. Component Design Principles (组件设计原则)

### 5.1 Props & Types (属性与类型)
- **Explicit Types**: 所有 Props 必须通过 TypeScript 接口定义类型，并在 `types.ts` 中导出。
- **Defaults**: 必须为非必填 Prop 提供合理的默认值 (使用 `withDefaults`)。
- **JSDoc**: 每个 Prop 必须包含 JSDoc 注释，说明用途、默认值及枚举值。
- **Props 分类**: Props 按功能分类定义（如基础属性、弹窗属性、表单属性、表格属性），便于维护和阅读；复合组件的 Props 可按内部子组件拆分接口。
- **Config Schema 标准化**: 配置驱动的组件（如 `SunnyForm`、`SunnySearchModal`），其 Schema 接口需包含基础必选字段（如field、type）和扩展可选字段（如props、slot、hidden），支持自定义子组件配置。

```typescript
// types.ts
export interface SunnyButtonProps {
  /**
   * 按钮类型
   * @default 'default'
   */
  type?: 'primary' | 'default' | 'dashed';
}
```

### 5.2 State Management (状态管理)
- **Controlled & Uncontrolled**: 支持受控 (`v-model`) 和非受控模式。
- **Stateless UI**: 尽量保持 UI 组件无状态，状态上移至 `useXxx` Hook 或父组件。

### 5.3 Inheritance & Attributes (继承与属性)
- **inheritAttrs**: 明确设置 `inheritAttrs: false` 如果根元素不是主要的交互元素。
- **v-bind="$attrs"**: 手动绑定透传属性到内部核心元素 (e.g., `input`, `button`)。
- **Arco Props/Events Inheritance**: 二次封装Arco组件时，全量透传Arco的原生Props和事件，不做屏蔽；需扩展的 Props/事件在原基础上新增，不覆盖原有能力。
- **Slot Inheritance**: 复合组件需透传内部子组件的所有插槽，插槽命名与子组件保持一致；自定义插槽需增加前缀区分（如form-header、table-footer）。
### 5.4 Asynchronous Logic & Error Handling
- **Async Operations**: 所有异步操作（如 API 调用）必须在 `useXxx` Hook 中处理，组件内仅负责触发和展示结果。
- **Error Handling**: 异步操作失败时，必须通过事件通知父组件（如 `loadConfigFail`），并在组件内展示错误信息。
### 5.5 Empty State & Fallback
- **Empty State Handling**: 组件在无数据/空状态时，必须展示友好的空状态提示（需复用 @ui 包内的SunnyEmpty组件（若无则基于 Arco Empty 封装），保证全局空状态样式 / 文案统一。），避免展示空数组或对象。
- **Fallback Content**: 复合组件需提供默认插槽（如 `default`），用于展示空状态或自定义内容。



## 6. Code Style & Best Practices (代码风格与最佳实践)

### 6.1 Script Setup
- 强制使用 `<script setup lang="ts">`。
- **Import Order**:
  1. Vue Core (`ref`, `computed`, `watch`)
  2. Third-party Libraries (`lodash`, `@arco-design/web-vue`)
  3. Internal Utils/Hooks (`@sunny-base-web/utils`)
  4. Types (`./types`)
  5. Sub-components (`./SubComponent.vue`)

- **Import Aliases**: 统一使用别名导入，禁止使用相对路径上层导入（如`../../utils`）；别名配置在 `vite.config.ts` 中，如`@ui = packages/@ui/src、@utils = packages/@ui/src/utils`。

### 6.2 Logic Extraction
- 超过 200 行的组件应考虑将逻辑提取到 `use[ComponentName].ts`。

## 7. Styling (样式规范)

- **Tailwind First**: 优先使用 Tailwind Utility Classes。
- **Scoped CSS**: 自定义样式必须使用 `<style scoped>`.
- **BEM Naming**: 如果必须写 CSS，使用 BEM 命名法 (`.block__element--modifier`) 以避免冲突。
- **Design Tokens**:
  - **Color Variables**: 严禁硬编码颜色值 (Hex/RGB)。必须使用 Arco Design 提供的 CSS 变量 (e.g., `var(--color-primary-6)`, `var(--color-text-1)`, `var(--color-bg-2)`) 以确保主题一致性及暗黑模式支持。
  - **Tailwind Config**: 在 `tailwind.config.js` 中引用 Arco 变量，例如 `text-color-text-1` 应映射到 `var(--color-text-1)`。
  - **Custom Tokens**: 组件库自定义的样式变量，需在@ui/src/styles/tokens.css中统一定义，命名为--ui-[name]-[value]（e.g., --ui-search-modal-form-margin），基于 Arco Token 扩展。
- **Responsive Design**: 所有组件需支持基础的响应式适配（如桌面端/平板端/移动端）；优先使用 Tailwind 的响应式类（如`md:w-80`），复合组件需做布局自适应（如 Form 表单列数随宽度变化）。
- **Style Inheritance**: 二次封装 Arco 组件时，不覆盖 Arco 的原生样式，仅通过 Tailwind/自定义类做样式扩展；复合组件的子组件样式可通过 Props 控制（如formCompact、tableSmall），复用 Arco 的尺寸类（如`size-small`）。 
## 8. Documentation (文档规范)

- **Component Header**: 文件头部必须包含组件说明注释。
- **Demos**: 每个组件至少提供 `Basic` (基础用法) 和 `Complex` (复杂场景) 两个 Demo。

## 10. Internationalization (国际化)

- **Mandatory I18n**: 组件内严禁出现硬编码的中文字符串。所有展示文案必须使用国际化。
- **Usage**:
  - 引入: `import { $t } from '@sunny-base-web/locales';`
  - 使用: `label: $t('common.confirm')` 或模板中 `{{ $t('common.confirm') }}`。
- **Key Naming**:
  - 通用文案优先复用 `common.json` (e.g., `common.confirm`, `common.cancel`)。
  - 组件专用文案建议命名为 `ui.[componentName].[key]` (需在 `@locales` 包中扩展)。
- **Props**: 接受文本的 Props (如 `placeholder`, `title`) 应允许传入字符串，由父组件负责翻译传入；或组件内部提供默认翻译。

- **Build Tool**: Vite (Library Mode)
- **Type System**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + CSS Variables
- **Package Manager**: pnpm (Workspace)