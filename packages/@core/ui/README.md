# 学习笔记：Package.json 配置详解

## 基础信息
- **name**: `@core/ui-kit` - 包名，使用 @scope/name 格式，避免命名冲突
- **version**: `0.0.1` - 版本号
- **private**: `true` - 私有包，防止意外发布到公共 npm 仓库

## 入口文件配置
> 注意：因为我们是 Monorepo 内部源码引用，所以直接指向了 src 下的 .tsx 源码。
> 如果是要发布到 npm 的库，这里通常会指向 dist/index.js 和 dist/index.d.ts。

- **main**: `./src/index.tsx` - CommonJS 入口 (兼容旧工具)
- **module**: `./src/index.tsx` - ES Module 入口 (现代构建工具优先使用)
- **types**: `./src/index.tsx` - 类型定义入口 (TS 寻找类型的地方)

## 现代模块导出
- **exports**: 定义了包的导出路径，支持条件导出。
  - `.` : 允许通过 `import { ... } from "@core/ui-kit"` 导入

## 依赖管理 (核心概念)

### peerDependencies (对等依赖)
> 告诉宿主应用："想用我，你自己必须先安装好这些包"

- **作用**: 避免 React 多重实例问题 (Singleton Problem)。
- **场景**: UI 组件库、插件开发。
- **例子**: `react`, `react-dom`。

### devDependencies (开发依赖)
> 仅在开发这个包时需要，不会随包发布，也不会被安装到宿主应用

- **作用**: 提供开发工具、类型定义、构建工具。
- **例子**: `@types/react` (类型提示), `typescript` (编译器)。
