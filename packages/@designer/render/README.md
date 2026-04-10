# @sunny-base-web/designer-render

统一渲染引擎 — 将 BlockModelJSON / NodeModelJSON 编译为真实的 Vue 组件。

## 架构概览

```
BlockModelJSON
      │
      ▼
┌──────────────────────────────────┐
│  block.ts    createRenderer()    │
│  BlockSchema → Vue Component     │
│  setup(): Context 初始化         │
│  render(): renderNode() 递归     │
└──────────────────────────────────┘
      │ renderNode()
      ▼
┌──────────────────────────────────┐
│  node.ts     renderNode()        │
│  NodeSchema → VNode（递归）      │
│  解析 props/events/directives    │
│  处理 slots/children             │
└──────────────────────────────────┘
      │ loader.load()
      ▼
┌──────────────────────────────────┐
│  loader.ts   createLoader()      │
│  按名找组件                      │
│  Registry / Schema异步 / 占位符  │
│                │                 │
│                ▼                 │
│  component-registry.ts           │
│  组件名 → Vue Component 映射表   │
└──────────────────────────────────┘
      │ 上面三个都依赖
      ▼
┌──────────────────────────────────┐
│  context.ts  RenderContext       │
│  运行时上下文                    │
│  state/evaluate/assign/clone/ref │
│  设计态: DOM 标记 + draggable    │
└──────────────────────────────────┘
```

## 文件清单

```
src/
├── context.ts              # RenderContext — 运行时上下文（最底层，无外部依赖）
├── component-registry.ts   # ComponentRegistry — 组件名 → Vue 组件映射表
├── loader.ts               # createLoader — 组件查找器（三种策略）
├── node.ts                 # renderNode — 递归渲染节点为 VNode
├── block.ts                # createRenderer — Block → Vue Component 编译入口
├── use-renderer.ts         # useRenderer — Vue Composable 封装
├── types.ts                # 类型定义
└── index.ts                # 统一导出
```

## 核心模块

### 1. context.ts — RenderContext

运行时上下文，被 block/node/loader 共同依赖。

| API | 说明 |
|-----|------|
| `state` | 响应式数据对象（reactive） |
| `refs` | DOM 引用存储（设计态用） |
| `evaluate(expr)` | 在 state 上下文中求值表达式 |
| `parseFunction(body, params)` | 解析函数体为可执行函数 |
| `assign(path, value)` | 赋值（v-model 双向绑定） |
| `clone(locals)` | 克隆作用域（v-for 迭代） |
| `ref(nodeId)` | 创建 DOM ref 绑定函数（设计态） |
| `markElement(el, nodeId)` | 给 DOM 打设计态标记 |

### 2. loader.ts — ComponentLoader

组件查找器，三种策略按优先级依次尝试：

| 策略 | 条件 | 行为 |
|------|------|------|
| Registry 查找 | `from` 为空或普通字符串 | 从 ComponentRegistry 获取已注册组件 |
| Schema 异步 | `from` 以 `schema:` 开头 | 通过 schemaLoader 异步加载 BlockModelJSON，递归 createRenderer |
| 占位符 | 未找到 | 返回灰色虚线框占位组件 |

```typescript
const loader = createLoader({
  registry,
  schemaLoader: async (id) => fetch(`/api/schema/${id}`),
})

loader.load('SunnyButton')                        // 同步，从 registry
loader.load('SubBlock', 'schema:block-123')       // 异步，加载子 Schema
```

### 3. node.ts — renderNode

纯函数，将 NodeModelJSON 递归渲染为 VNode。

处理能力：

| 能力 | 设计态 | 预览态 |
|------|--------|--------|
| v-if | 默认显示 | 执行 evaluate 求值 |
| v-show | 默认显示 | 执行 evaluate，注入 display:none |
| v-for | 渲染单个 | 执行 evaluate 获取列表，clone 作用域 |
| v-model | 不绑定 | evaluate 取值 + assign 更新 |
| props | 原样传递 | evaluate 求值 |
| events | 不绑定 | parseFunction 绑定 |
| DOM ref | 注入 ref(nodeId) | 不注入 |
| DOM 标记 | markElement | 不注入 |

### 4. block.ts — createRenderer

编译入口，将 BlockModelJSON 编译为 `defineComponent` 产物。

setup() 中按顺序初始化：

```
state → ref(基础类型) / reactive(对象)
methods → parseFunction
computed → computed(() => evaluate(expr))
watch → watch(source, callback)
lifecycle → onMounted/onUnmounted/onUpdated
```

```typescript
const BlockComponent = createRenderer(blockJSON, loader, { mode: 'preview' })
// BlockComponent 是标准 Vue 组件，可直接在 h() 或 <component :is> 中使用
```

### 5. component-registry.ts — ComponentRegistry

纯数据存储，Map<string, string | Component>。

```typescript
const registry = new ComponentRegistry()
registry.register('SunnyButton', SunnyButton)
registry.register('SunnyForm', SunnyForm)
registry.registerBuiltInElements()  // div, span, input 等 HTML 原生元素
```

### 6. use-renderer.ts — useRenderer

Composable 封装，组合 createLoader + createRenderer。

```typescript
const { RendererComponent, loader } = useRenderer({
  block: blockJSON,
  registry,
  mode: 'preview',
  schemaLoader: async (id) => fetchSchema(id),
})
```

## 依赖关系

```
block.ts
  ├── context.ts
  ├── node.ts
  └── loader.ts

node.ts
  ├── context.ts
  └── loader.ts

loader.ts
  ├── component-registry.ts
  └── block.ts（延迟导入，避免循环依赖）

context.ts
  └── 仅依赖 vue（reactive）
```

## 两种模式

| | 设计态 (design) | 预览态 (preview) |
|---|---|---|
| 用途 | 可视化编辑器画布 | 运行时预览/发布 |
| 表达式求值 | 不执行 | evaluate 执行 |
| 事件绑定 | 不绑定 | 完整绑定 |
| v-model | 不绑定 | 双向绑定 |
| v-for | 渲染单个 | 列表渲染 |
| DOM ref | 注入（选中/拖拽） | 不注入 |
| DOM 标记 | draggable + nodeId | 不标记 |

## 使用示例

### 预览态

```typescript
import { createRenderer, createLoader, ComponentRegistry } from '@sunny-base-web/designer-render'

const registry = new ComponentRegistry()
registry.register('SunnyButton', SunnyButton)
registry.registerBuiltInElements()

const loader = createLoader({ registry })

// blockJSON 来自 @sunny-base-web/designer-core 的 BlockModel.toJSON()
const PreviewComponent = createRenderer(blockJSON, loader, { mode: 'preview' })
```

### 设计态（iframe 沙箱）

```typescript
import { renderNode, RenderContext, createLoader } from '@sunny-base-web/designer-render'

const ctx = new RenderContext()
const loader = createLoader({ registry })

// 在 iframe 的 Vue App 中
const vnode = renderNode(nodeJSON, ctx, loader, 'design')
```

## NodeModelJSON.from 字段

NodeModelJSON 新增可选 `from` 字段，供 loader 区分组件查找策略：

```typescript
interface NodeModelJSON {
  id: string
  name: string
  from?: string       // ← 新增
  props: Record<string, any>
  events: Record<string, string>
  directives: DirectiveBinding[]
  children: NodeModelJSON[]
  slots: Record<string, NodeModelJSON[]>
  isContainer: boolean
}
```
