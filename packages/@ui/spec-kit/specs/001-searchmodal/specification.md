# Specification: SunnySearchModal (公共查询弹窗)

## 1. Overview
`SunnySearchModal` 是一个基于配置驱动的通用查询弹窗组件。它主要用于在业务系统中快速查找并选择数据（如选择设备、选择用户等）。
该组件设计为与 `SunnySearchInputTag` 配合使用，后者作为触发器和结果展示容器。
核心逻辑是通过传入一个唯一的配置编号 (`sqlNum`)，组件内部自动请求后端接口获取**搜索表单配置** (`formSchema`) 和 **数据表格配置** (`tableColumns`)。
同时，组件也支持**静态配置** (`staticConfig`)，允许前端直接传入配置对象，适用于无后端配置接口的场景。

在进行数据查询时，组件会将 `sqlNum` 和额外的 `conditions` 参数封装在请求体中，通过通用或指定的查询接口获取数据。

## 2. User Stories
- **作为开发者**，我只需要传入 `sqlNum` (配置编号) 和 `conditions` (额外查询条件)，以及 `v-model`，就能直接唤起一个包含完整搜索、列表展示、多选功能的弹窗。
- **作为用户**，我可以通过顶部的搜索栏筛选数据。
- **作为用户**，我可以在左侧表格中勾选多条数据，并在右侧“已选区”实时看到我选中的条目。
- **作为用户**，我可以在右侧“已选区”点击删除按钮快速取消勾选。

## 3. Architecture & Design

### 3.1 Component Structure
遵循 **Hook + Component** 模式：
- `packages/@ui/src/composite/search-modal/`
  - `SunnySearchModal.vue`: 纯 UI 组件，负责布局和渲染。
  - `use-sunny-search-modal.ts`: 核心逻辑 Hook，负责状态管理、配置加载、数据联动。
  - `types.ts`: 类型定义。
  - `index.ts`: 导出。

### 3.2 UI Layout
弹窗主体内容区域分为上下两部分，下部分为左右分栏。
**布局要求**：
- **Modal Header**:
  - **Title Area**: 左侧显示标题，支持通过 `helpMessage` 属性显示帮助图标和提示信息。
- **Header (Search Form)**: `SunnyForm` 渲染的搜索区域。
  - **Responsive Grid**: 必须响应式。
    - 大屏 (>=1200px/xxl): 4列
    - 中屏 (>=992px/lg): 3列
    - 小屏 (<768px/sm): 1列或2列 (根据字段数自动调整)
- **Body (Content)**:
  - **Fixed Height**: 内容区域应有固定高度或最大高度 (建议 `height: 500px`)，超出部分内部滚动。
  - **Left (Main)**: `SunnyQueryGrid` (或复用 `vxe-grid`) 展示数据列表，支持多选。
    - **Pagination**: 表格内部不显示分页，分页组件移至 Modal Footer。
  - **Right (Sidebar)**: “已选列表”区域。
    - **Header**: "已选项 (Count)"。
    - **List**: 垂直列表，每项为一个**卡片 (Card)**。
    - **Card Style**: 固定高度 (e.g., 40-50px) 的紧凑卡片。
      - **Layout**: 两行文本垂直排列，超出宽度自动显示省略号 (...)。
      - **Interaction**: **鼠标移入 (Hover)** 时通过 Tooltip 显示完整内容。
      - **Title**: `row[fieldNames.label]` (e.g., 设备编号)
      - **Desc**: `row[fieldNames.desc]` (e.g., 设备名称/车间)
      - **Action**: 右上角 "X" 关闭图标，**仅在鼠标 Hover 时显示**。
- **Footer (Action Bar)**:
  - **Left**: **分页组件 (Pagination)**。展示 "共 X 条" 和 "< current/pages >" 翻页器。
  - **Right**: **操作按钮**。 "取消" 和 "确认"。

### 3.3 Data Flow
1.  **Initialization**: 组件挂载或 `visible` 变为 `true` 时，执行初始化流程。
    - **Open Init**: 必须首先调用 `/core/assDialog/openInit` 接口。
      - **Request**: `{ cNum: props.sqlNum, token: props.token }`。
      - **Response**: 返回包含 `formSchema` (搜索项配置) 和 `tableColumns` (列表配置) 的对象。
2.  **Configuration Loading**: 
    - **Static Config Priority**: 若存在 `props.staticConfig`，直接使用该配置，无需请求接口。
    - **Remote Config**: 若无静态配置，则使用 `/core/assDialog/openInit` 返回的配置。
3.  **Search**: 用户在 `SunnyForm` 输入 -> 触发 Search -> 组装请求体 (Payload) -> 调用查询接口 -> 更新 Table 数据。
    - **Payload Structure**:
      ```json
      {
        "pageNo": 1,
        "pageSize": 200,
        "sqlNum": "MACHINE_SBBH",
        "conditions": {
          "C_FACTORY": "1200", // 来自 props.conditions
          "C_FACTORY_AREA": "1201",
          "KEYWORD": "abc" // 来自搜索表单输入
        }
      }
      ```
4.  **Selection**:
    - **Cross-page Selection**: 采用**手动管理** (`manual management`) 策略。组件内部维护 `selectedRows` 数组，监听 Grid 的 `checkboxChange` 和 `checkboxAll` 事件，手动添加/移除选中项。每次表格数据加载后，自动调用 `setCheckboxRow` 恢复选中状态。此方案比单纯依赖 Grid 的 `reserve` 属性更可靠。
    - **Row Click**: 点击表格行任意位置即可触发勾选/取消勾选 (`trigger: 'row'`)。
    - **Update**: 更新 `selectedRows` -> 右侧列表渲染 (使用 `fieldNames.label`) -> 更新 `v-model` (如果需要实时) 或暂存直到点击确认。
5.  **Quick Action**:
    - **Double Click**: 双击表格行 -> 等同于点击“确认”按钮 (Save & Close)。

## 4. API Interface

### 4.1 Props

```typescript
export interface SunnySearchModalProps {
  /**
   * 弹窗显示状态 (v-model)
   */
  visible: boolean;
  /**
   * 配置编号 (核心参数)
   * 对应后端接口传参中的 cNum / sqlNum
   * e.g., "MACHINE_SBBH"
   */
  sqlNum: string;
  /**
   * 权限令牌
   * 对应后端接口传参中的 token
   */
  token?: string;
  /**
   * 额外的查询条件
   * 对应后端接口传参中的 conditions
   * e.g., { "C_FACTORY": "1200" }
   */
  conditions?: Record<string, any>;
  /**
   * 默认选中的数据 (回显)
   * 数组中的对象至少包含 rowKey 指定的字段
   */
  modelValue?: Record<string, any>[];
  /**
   * 字段名映射配置
   * 用于指定回显时显示的文本字段和值字段
   * @default { label: 'label', value: 'value', desc: 'desc' }
   */
  fieldNames?: {
    label?: string;
    value?: string;
    desc?: string; // 第二行描述文本字段
  };
  /**
   * 表单通用配置 (如 colProps, labelWidth 等)
   * 用于控制内部搜索表单的布局和属性，与 SunnyForm 的 commonConfig 保持一致
   * @default { colProps: { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 } }
   */
  commonConfig?: Record<string, any>;
  /**
   * 静态配置 (用于前端直接传入配置，无需请求接口)
   * 优先级高于 sqlNum
   */
  staticConfig?: SearchConfig;
  /**
   * 帮助提示文本
   * 显示在标题栏问号图标的 Tooltip 中
   */
  helpMessage?: string;
  /**
   * 弹窗标题
   * 若不传，优先使用配置接口返回的 title，否则默认为 "数据查询"
   */
  title?: string;
  /**
   * 单选/多选模式
   * @default true (多选)
   */
  multiple?: boolean;
  /**
   * 数据主键字段名
   * @default 'id'
   */
  rowKey?: string;
}
```

### 4.2 Events

```typescript
export interface SunnySearchModalEmits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'update:modelValue', values: Record<string, any>[]): void;
  /**
   * 确认选择事件
   */
  (e: 'confirm', values: Record<string, any>[]): void;
  /**
   * 取消事件
   */
  (e: 'cancel'): void;
}
```

### 4.3 Slots
- `header`: 自定义顶部区域（在 Form 之上）。
- `footer-extra`: 底部左侧扩展区域。

## 5. Implementation Details

### 5.1 Configuration Protocol (Mock)

#### 5.1.1 Get Config
Request: `GET /api/common/search-config?sqlNum={sqlNum}` (示例)
Response:
```json
{
  "title": "设备编号查询",
  "searchApi": "/api/common/query", // 通用查询接口
  "rowKey": "deviceCode",
  "formSchema": [
    { "field": "deviceCode", "label": "设备编号", "component": "Input" },
    { "field": "deviceName", "label": "设备名称", "component": "Input" }
  ],
  "tableColumns": [
    { "field": "deviceCode", "title": "设备编号", "width": 120 },
    { "field": "deviceName", "title": "设备名称" },
    { "field": "workshop", "title": "生产车间" }
  ]
}
```

#### 5.1.2 Query Data
Request: `POST {searchApi}` (e.g., `/api/common/query`)
Payload:
```json
{
  "pageNo": 1,
  "pageSize": 200,
  "sqlNum": "MACHINE_SBBH",
  "conditions": {
    "C_FACTORY": "1200",
    "C_FACTORY_AREA": "1201",
    // ... search form fields merged here
  }
}
```

### 5.2 Reuse Strategy
- **Form**: 使用 `packages/@ui/src/entry/form/SunnyForm.vue`。
- **Table**: 使用 `packages/@ui/src/data/query-grid/SunnyQueryGrid` (或复用 `vxe-grid`)。
- **Modal**: 使用 `packages/@ui/src/feedback/modal/SunnyModal` (或 Arco Modal 封装)。
- **Empty**: 右侧无数据时使用 `SunnyEmpty`。

## 6. Styling
- 使用 **Tailwind CSS** 构建布局。
- **Body Height**: 设定固定高度 (e.g., `h-[500px]`) 确保弹窗在不同数据量下不抖动。
- **Search Form**: 通过 `SunnyForm` 的 `commonConfig.colProps` 配置响应式布局，而非直接使用 Tailwind Grid 类。
  - **Configuration**:
    ```javascript
    // 目标：大屏4列，中屏3列，小屏1-2列
    commonConfig: {
      colProps: {
        xs: 24, // < 576px
        sm: 12, // >= 576px
        lg: 8,  // >= 992px
        xl: 6,  // >= 1200px
        xxl: 6  // >= 1600px
      }
    }
    ```
- **Right Sidebar**:
  - Container: `w-64 border-l border-[var(--color-border-2)] p-4 flex flex-col bg-[var(--color-bg-2)]`.
  - **Item Card**:
    - Style: `relative h-[46px] px-2 py-1 mb-2 border border-[var(--color-border-2)] rounded bg-[var(--color-bg-1)] hover:shadow-sm transition-shadow flex flex-col justify-center`.
    - **Typography**:
      - Line 1 (Label): `text-xs font-bold text-[var(--color-text-1)] truncate leading-tight`.
      - Line 2 (Desc): `text-[10px] text-[var(--color-text-3)] truncate leading-tight mt-0.5`.
    - **Tooltip**: 使用 `a-tooltip` 包裹整个 Card 或文本区域，展示完整信息。
    - **Close Icon**: `absolute top-1.5 right-1.5 text-[var(--color-text-3)] hover:text-[var(--color-text-1)] cursor-pointer bg-[var(--color-bg-1)]`.
- **Footer**: `flex justify-between items-center`.
