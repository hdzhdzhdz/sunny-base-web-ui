# 学习笔记：TypeScript 基础配置 (tsconfig.base.json)

这是整个 Monorepo 项目的 "TypeScript 宪法"，所有子包都继承此配置。

## 关键配置项

### compilerOptions

- **composite**: `false`
  - 不启用项目引用模式 (Project References)，通常在 Monorepo 根配置中关闭。

- **declaration**: `true`
  - 生成 `.d.ts` 声明文件，让其他包引用时有类型提示。

- **declarationMap**: `true`
  - 生成 `.d.ts.map` 文件，支持声明文件的源码映射，方便调试（点击定义可以直接跳转到源码）。

- **esModuleInterop**: `true`
  - 允许导入 CommonJS 模块就像 ES 模块一样 (`import React from 'react'`)，提供更好的兼容性。

- **forceConsistentCasingInFileNames**: `true`
  - 强制文件名大小写一致，防止 Windows/macOS 开发（大小写不敏感）在 Linux 部署（大小写敏感）时出错。

- **isolatedModules**: `true`
  - 强制每个文件作为独立模块编译。这对 Vite/esbuild 等单文件转译工具是必须的，因为它们不进行全项目类型检查。

- **moduleResolution**: `node`
  - 模块解析策略，模拟 Node.js 的解析机制。

- **skipLibCheck**: `true`
  - 跳过 `node_modules` 中声明文件的类型检查，显著提升编译速度。我们只关心自己的代码，不关心第三方库的类型错误。

- **strict**: `true`
  - 开启所有严格类型检查选项 (`noImplicitAny`, `strictNullChecks` 等)。这是现代 TS 项目的标配，能防止大部分低级错误。

- **resolveJsonModule**: `true`
  - 允许直接导入 `.json` 文件 (`import data from './data.json'`)。
