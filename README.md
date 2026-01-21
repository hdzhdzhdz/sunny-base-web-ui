# Vue 3 Monorepo Starter

这是一个基于 [Turbo](https://turbo.build/) 和 [pnpm](https://pnpm.io/) 构建的 Vue 3 Monorepo 项目。

## 环境要求

- **Node.js**: 建议使用最新的 LTS 版本
- **pnpm**: 推荐版本 9.x

## 快速开始

### 1. 安装依赖

在项目根目录下运行：

```bash
pnpm install
```

### 2. 启动开发服务器

启动所有应用（包含 Web 应用和文档）：

```bash
pnpm dev
```

该命令会执行 `turbo run dev`，并行启动 `apps/` 目录下所有应用的开发服务。

- **Web App**: 通常运行在 http://localhost:5173 (具体端口请查看终端输出)
- **Docs**: 通常运行在 http://localhost:5174 (具体端口请查看终端输出)

### 3. 构建项目

构建所有应用和包：

```bash
pnpm build
```

### 4. 代码检查与格式化

```bash
# 运行 Lint 检查
pnpm lint

# 格式化代码
pnpm format
```

## 项目结构

```text
.
├── apps/
│   ├── web/                # 主 Web 应用程序 (Vue 3 + Vite)
│   └── docs/               # 文档站点 (VitePress)
├── packages/
│   ├── @config/            # 共享配置
│   │   ├── tailwind-config # Tailwind CSS 配置
│   │   └── tsconfig        # TypeScript 基础配置
│   ├── @effects/           # 特效/交互组件
│   ├── @icons/             # 图标组件库
│   ├── @kunkka/            # 核心 UI 组件库
│   └── @utils/             # 共享工具函数
├── pnpm-workspace.yaml     # pnpm workspace 配置
├── turbo.json              # Turbo 任务管道配置
└── package.json            # 根项目配置
```

## 依赖管理

本项目使用 **pnpm catalogs** 功能统一管理第三方依赖版本。所有的共享依赖版本都定义在 `pnpm-workspace.yaml` 的 `catalog` 字段中。

- 内部包依赖使用 `workspace:*` 协议。
- 外部共享依赖使用 `catalog:` 协议。
