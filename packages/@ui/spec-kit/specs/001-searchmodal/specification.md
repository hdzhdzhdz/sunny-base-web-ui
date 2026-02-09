# Specification: SunnySearchModal (公共查询弹窗)

## 1. Overview
`SunnySearchModal` 是一个基于配置驱动的通用查询弹窗组件。它主要用于在业务系统中快速查找并选择数据（如选择设备、选择用户等）。
该组件设计为与 `SunnySearchInputTag` 配合使用，后者作为触发器和结果展示容器。
组件的核心逻辑由**传入的配置**驱动，不再依赖 `sqlNum` 进行内部配置请求。
前端需直接传入**搜索表单配置** (`formSchema`) 和 **数据表格配置** (`tableColumns`)。
数据查询通过 `searchApi` 属性指定，组件负责收集表单数据并调用该接口刷新表格。

## 2. User Stories
- **作为用户**，我可以通过顶部的搜索栏筛选数据。
- **作为用户**，我可以点击搜索栏的“重置”按钮，清空搜索条件并重新加载默认数据。
- **作为用户**，我可以在左侧表格中勾选多条数据，并在右侧“已选区”实时看到我选中的条目。
- **作为用户**，我可以在右侧“已选区”点击删除按钮快速取消勾选。

## 3. Architecture & Design

### 3.1 Component Structure
遵循 **Hook + Component** 模式：
- `packages/@ui/src/feedback/search-modal/`
  - `SunnySearchModal.vue`: 纯 UI 组件，负责布局和渲染。
  - `use-sunny-search-modal.ts`: 核心逻辑 Hook，负责状态管理、数据联动。
  - `types.ts`: 类型定义。
  - `index.ts`: 导出。

### 3.2 UI Layout
弹窗主体内容区域分为上下两部分，下部分为左右分栏。
**布局要求**：
- **Modal Header**:
  - **Title Area**: 左侧显示标题，支持通过 `helpMessage` 属性显示帮助图标和提示信息。
- **Header (Search Form)**: `SunnyForm` 渲染的搜索区域。
  - **Layout**: 采用 **垂直布局 (Vertical)**，即标签 (Label) 位于输入框上方。
  - **Buttons**: 包含“查询”和“重置”按钮。
  - **Responsive Grid**: 必须响应式。
    - 大屏 (>=1200px/xxl): 4列
    - 中屏 (>=992px/lg): 4列
    - 小屏 (<768px/sm): 1列或2列 (根据字段数自动调整)
- **Body (Content)**:
  - **Table Height Configuration**:
    - 支持配置固定高度 (`contentHeight`)，默认值为 `300px`。
    - 该高度仅应用于**表格内容区域** (包含左侧表格和右侧已选列表)，不影响搜索表单。
    - 表格组件的高度设置为 `100%`，以填满该固定高度区域并支持内部滚动。
    - **Note**: 移除了弹窗最大化功能。
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
1.  **Initialization**: 组件挂载或 `visible` 变为 `true` 时，使用传入的 `formSchema` 和 `tableColumns` 初始化界面。
2.  **Search**: 用户在 `SunnyForm` 输入 -> 触发 Search -> 组装请求体 (Payload) -> 调用 `searchApi` -> 更新 Table 数据。
    - **Payload Structure**:
      ```json
      {
        "pageNo": 1,
        "pageSize": 200,
        // ... search form fields merged here
      }
      ```
    - **Reset**: 用户点击重置 -> 清空表单数据 -> 触发重新查询。
3.  **Selection**:
    - **Cross-page Selection**: 采用**手动管理** (`manual management`) 策略。组件内部维护 `selectedRows` 数组，监听 Grid 的 `checkboxChange` 和 `checkboxAll` 事件，手动添加/移除选中项。每次表格数据加载后，自动调用 `setCheckboxRow` 恢复选中状态。
    - **Row Click**: 点击表格行任意位置即可触发勾选/取消勾选 (`trigger: 'row'`)。
    - **Update**: 更新 `selectedRows` -> 右侧列表渲染 (使用 `fieldNames.label`) -> 更新 `v-model` (如果需要实时) 或暂存直到点击确认。
4.  **Quick Action**:
    - **Double Click**: 双击表格行 -> 等同于点击“确认”按钮 (Save & Close)。

### 3.4 Internationalization (i18n)
组件内部文本需支持国际化，使用 `@sunny-base-web/locales`。
- **Keys**:
  - `common.searchModal.selectedRecords`: "已选记录" / "Selected Records"
  - `common.selected`: "已选择" / "Selected"
  - `common.clear`: "清空" / "Clear"
  - `common.noData`: "暂无数据" / "No Data"
  - `common.confirm`: "确认" / "Confirm"
  - `common.cancel`: "取消" / "Cancel"

## 4. API Interface

### 4.1 Props

```typescript
import type { FormSchema } from '@/entry/form/types';
import type { VxeGridPropTypes } from 'vxe-table';

export interface SunnySearchModalProps {
  /**
   * 弹窗显示状态 (v-model)
   */
  visible: boolean;
  /**
   * 搜索表单配置
   */
  formSchema: FormSchema[];
  /**
   * 表格列配置
   */
  tableColumns: VxeGridPropTypes.Columns;
  /**
   * 查询接口地址或函数
   * 如果是 string，则发起 POST 请求
   * 如果是 Function，则直接调用，需返回 Promise
   */
  searchApi: string | ((params: any) => Promise<any>);
  /**
   * 默认选中的数据 (回显)
   * 数组中的对象至少包含 rowKey 指定的字段
   */
  modelValue?: Record<string, any>[];
  /**
   * 弹窗标题
   * @default "数据查询"
   */
  title?: string;
  /**
   * 帮助信息 (显示在标题旁)
   * @default "支持跨页多选，翻页保留选中状态；双击表格行可快速确认。"
   */
  helpMessage?: string;
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
  /**
   * 显示字段映射
   * label: 主显示字段 (第一行)
   * value: 值字段 (通常同 rowKey)
   * desc: 描述字段 (第二行)
   */
  fieldNames?: {
    label: string;
    value: string;
    desc?: string;
  };
  /**
   * 搜索表单通用配置 (Col layout等)
   */
  commonConfig?: Record<string, any>;
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
