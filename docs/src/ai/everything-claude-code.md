# Everything Claude Code 使用教程

[Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 是一套荣获 **Anthropic Hackathon** 大奖的 Claude Code 配置集合，提供了丰富的开发辅助技能、钩子和配置。

## 安装配置

### 前置条件

确保已安装 Claude Code CLI：

```bash
npm install -g @anthropic-ai/claude-code
```

### 安装方式

#### 方式一：从插件市场安装（推荐）

```bash
# Step 1: 添加市场源
/plugin marketplace add affaan-m/everything-claude-code

# Step 2: 安装插件
/plugin install everything-claude-code
```

#### 方式二：npm 安装

```bash
npm install ecc-universal
```

#### 方式三：手动安装

```bash
# 克隆仓库
git clone https://github.com/affaan-m/everything-claude-code.git

# 复制技能到 Claude 目录
cp -r everything-claude-code/skills/* ~/.claude/skills/

# 复制项目级技能（可选）
cp -r everything-claude-code/skills/* .claude/skills/
```

然后将 `hooks/hooks.json` 中的钩子配置添加到你的 `~/.claude/settings.json` 或项目的 `.claude/settings.json` 中。

### 安装后重启

安装完成后，**重启 Claude Code** 使技能生效。

### 包管理器自动检测

插件会自动检测你的包管理器偏好（npm、pnpm、yarn 或 bun），检测优先级：

1. 环境变量：`CLAUDE_PACKAGE_MANAGER`
2. 项目配置：`.claude/package-manager.json`
3. `package.json` 中的 `packageManager` 字段
4. 锁文件检测

## 可用技能

### 代码审查 (code-review)

对指定代码进行全面的安全和质量审查。

#### 使用方法

```bash
/everything-claude-code:code-review <文件或目录路径>
```

#### 功能特性

- **安全检查 (CRITICAL)**：检测硬编码凭证、SQL 注入、XSS 漏洞等
- **代码质量 (HIGH)**：检查函数长度、文件大小、嵌套深度、错误处理
- **最佳实践 (MEDIUM)**：检查可变性、Emoji 使用、测试覆盖、可访问性

#### 示例

```bash
# 审查单个组件
/everything-claude-code:code-review @packages/@ui/src/basic/scrollbar

# 审查变更的文件
/everything-claude-code:code-review src/components/
```

#### 审查报告示例

```
代码审查报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 严重 (CRITICAL): 0 个  ✅ 通过
🟠 高危 (HIGH): 1 个     ⚠️ 需关注
🟡 中等 (MEDIUM): 4 个   ⚠️ 建议改进
🟢 低危 (LOW): 2 个      📝 可选优化
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 代码清理 (refactor-clean)

安全识别并移除死代码，每一步都进行测试验证。

#### 使用方法

```bash
/everything-claude-code:refactor-clean <文件或目录路径>
```

#### 工作流程

1. **检测死代码**：运行 knip、depcheck、ts-prune 等分析工具
2. **分类发现**：将发现分为 SAFE、CAUTION、DANGER 三个安全等级
3. **安全删除循环**：
   - 运行测试套件建立基线
   - 删除死代码
   - 重新运行测试验证
   - 如果失败则立即回滚
4. **合并重复**：识别并合并重复代码

#### 安全等级说明

| 等级 | 示例 | 操作 |
|------|------|------|
| **SAFE** | 未使用的工具函数、测试辅助函数 | 可放心删除 |
| **CAUTION** | 组件、API 路由、中间件 | 验证无动态导入或外部消费 |
| **DANGER** | 配置文件、入口点、类型定义 | 删除前需深入调查 |

#### 示例

```bash
# 清理指定目录的死代码
/everything-claude-code:refactor-clean @packages/@ui/src/basic/scrollbar
```

#### 输出示例

```
死代码清理报告
──────────────────────────────
删除:    12 个未使用函数
         3 个未使用文件
         5 个未使用依赖
跳过:    2 项（测试失败）
节省:    ~450 行代码
──────────────────────────────
所有测试通过 ✅
```

---

## 更多技能

Everything Claude Code 还提供了许多其他有用的技能：

| 技能 | 说明 |
|------|------|
| `tdd` | 测试驱动开发，先写测试再实现 |
| `security-review` | 安全漏洞检测和修复 |
| `python-review` | Python 代码审查 |
| `go-review` | Go 代码审查 |
| `e2e` | 生成和运行 E2E 测试 |
| `plan` | 需求分析并制定实施计划 |
| `commit` | 智能生成 Git 提交信息 |

## 最佳实践

### 1. 代码审查时机

- **提交前**：运行 code-review 确保代码质量
- **合并请求**：作为 PR 检查的一部分
- **定期审查**：每周对关键模块进行审查

### 2. 代码清理时机

- **重构前**：先清理死代码，减少干扰
- **依赖更新后**：清理不再使用的依赖
- **功能删除后**：清理相关的遗留代码

### 3. 组合使用

```bash
# 1. 先清理死代码
/everything-claude-code:refactor-clean @src/utils

# 2. 再进行代码审查
/everything-claude-code:code-review @src/utils

# 3. 提交更改
/commit
```

## 注意事项

1. **始终运行测试**：refactor-clean 会自动运行测试，确保没有破坏功能
2. **一次一个更改**：原子化修改便于回滚
3. **不确定就跳过**：保留死代码比破坏生产环境更安全
4. **不要同时重构**：清理和重构分开进行

## 参考链接

- [Everything Claude Code GitHub](https://github.com/affaan-m/everything-claude-code)
- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [Anthropic 官方技能库](https://github.com/anthropics/skills)
- [技能市场 skillsmp.com](https://skillsmp.com)
