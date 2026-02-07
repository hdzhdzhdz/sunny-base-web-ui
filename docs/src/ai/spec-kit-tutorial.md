# Spec-Driven Development (SDD) with SpecKit

SpecKit 是本项目采用的一种**规格驱动开发 (Spec-Driven Development, SDD)** 模式。它通过标准化的文档结构，让 AI Agent 能够更准确地理解需求、规划任务并追踪进度。

## 核心理念

在传统的开发流程中，需求往往散落在聊天记录或口头沟通中。SpecKit 将其结构化为三个核心文件，作为 AI 与开发者协作的"Single Source of Truth"。

## 目录结构

每个功能模块在 `.specs/` 目录下拥有独立的文件夹，命名格式为 `<id>-<name>`。

```
.specs/
└── 001-searchmodal/           # 功能模块 ID + 名称
    ├── specification.md       # 需求规格说明书
    ├── plan.md                # 开发计划与进度
    ├── status.md              # 当前状态概览
    └── tasks.md               # 详细任务清单 (可选)
```

## 工作流程

### 1. 定义规格 (Specification)

`specification.md` 是开发的基石。它详细描述了功能背景、用户故事、UI/UX 设计、API 定义和数据结构。

**关键要素：**
- **Context**: 为什么要做这个功能？
- **User Stories**: 用户如何使用？
- **UI/UX**: 界面布局与交互逻辑。
- **API**: 输入输出参数、数据模型。

### 2. 制定计划 (Plan)

`plan.md` 由 AI 根据规格书生成，将复杂功能拆解为可执行的步骤。

**包含内容：**
- **Phase**: 开发阶段（如：脚手架搭建、核心逻辑、UI 实现）。
- **Status**: 任务状态 (Pending, In Progress, Completed)。
- **Verification**: 每个步骤的验证方法。

### 3. 追踪状态 (Status)

`status.md` 是项目的仪表盘，实时反映当前的整体进度。

**状态流转：**
- `Draft` -> `Planned` -> `In Progress` -> `Completed`

## 实践案例：SearchModal 组件

在 `SunnySearchModal` 的开发过程中，我们完整实践了这一流程：

1.  **需求分析**：确立了"通用搜索弹窗"的核心定位，支持静态/远程配置。
2.  **规格定义**：在 `specification.md` 中明确了 `staticConfig` 优先于远程配置的逻辑，以及跨页多选的交互细节。
3.  **迭代开发**：
    - 实现了基础的弹窗结构。
    - 完善了 `use-sunny-search-modal` hook 处理核心逻辑。
    - 解决了"跨页选择丢失"等复杂状态管理问题。
4.  **持续维护**：随着功能变更（如新增 `helpMessage`、自定义宽高），同步更新 Spec 文档，保持文档与代码的一致性。

## AI 协作技巧

- **文档先行**：在写代码前，先让 AI 更新或确认 Spec 文档。
- **显式指令**：告诉 AI "请根据 specification.md 更新代码" 或 "完成功能后请更新 plan.md"。
- **保持同步**：代码变更后，务必同步回写到文档，防止上下文漂移。

## 参考文章

- [微信公众平台文章1](https://mp.weixin.qq.com/s?__biz=MzkxMTY4NTAyNQ==&mid=2247498905&idx=1&sn=11f105d458ed8012fb03244da9959a3b&scene=21&poc_token=HKiZhmmj4SZ1RMyd74e28BcRsvEamAls1HThTji1)
- [基于 TRAE + Spec-kit 实现树莓派智能小车控制系统](https://mp.weixin.qq.com/s/qNyd54N_4A1MwKiOTeJrSQ)
