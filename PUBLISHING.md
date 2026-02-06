# Sunny Base Web Framework 发布指南

本文档介绍如何在 `sunny-base-web-framework` Monorepo 项目中单独发布某个包至 npm。

## 前提条件

1.  **登录 npm**：确保你已经在终端中登录了 npm 账户。
    ```powershell
    npm login
    ```
    > 提示：如果开启了 2FA（两步验证），发布时需要输入 Authenticator App 中的一次性密码。

2.  **权限**：确保你拥有对应 npm 组织（如 `@sunny-base-web`）的发布权限。

---

## 方法一：在根目录发布（推荐）

使用 `pnpm` 的 `--filter` 参数，可以在项目根目录直接操作指定包，无需切换目录。

### 1. 修改版本号

手动修改目标包（例如 `@sunny-base-web/utils`）的 `package.json` 文件，将 `version` 字段更新为新的版本号。

> **注意**：新版本号必须大于 npm 上已发布的版本号。

### 2. 构建包

在发布前，务必确保 `dist` 目录是最新的。

```powershell
# 语法：pnpm --filter <包名> build
pnpm --filter @sunny-base-web/utils build
```

### 3. 发布包

执行发布命令。

```powershell
# 语法：pnpm publish --filter <包名> --access public --no-git-checks
pnpm publish --filter @sunny-base-web/utils --access public --no-git-checks
```

*   `--filter <包名>`: 指定要发布的包。
*   `--access public`: 显式指定为公开包（Scoped package 默认为私有，必须加此参数才能公开发布）。
*   `--no-git-checks`: 跳过 Git 状态检查（允许在未提交代码的情况下发布，适用于测试或调试；正式发布建议提交代码后去掉此参数）。

---

## 方法二：进入包目录发布

你也可以进入具体的包目录进行操作。

### 1. 进入目录

```powershell
cd packages/@utils
```

### 2. 修改版本号与构建

修改 `package.json` 中的 `version`，然后运行构建：

```powershell
pnpm build
```

### 3. 发布

```powershell
pnpm publish --access public --no-git-checks
```

---

## 常见问题与注意事项

### 1. 版本号冲突
如果 npm 上已经存在版本 `1.0.0`，你再次发布 `1.0.0` 会报错。必须升级为 `1.0.1` 或其他更高版本。

### 2. 依赖同步
如果 `packages/@ui` 依赖了 `packages/@utils`：
*   当你更新并发布了 `@sunny-base-web/utils@1.0.1` 后。
*   你应该同步更新 `@sunny-base-web/ui` 的 `package.json` 中对 `utils` 的依赖版本（例如 `"@sunny-base-web/utils": "^1.0.1"`）。
*   然后重新构建并发布 `ui` 包，以确保它使用最新的 `utils` 代码。

### 3. 2FA 验证
发布过程中如果终端提示 `Enter one-time password:`，请打开手机上的 Authenticator 应用（如 Google Authenticator），输入 npm 对应的 6 位验证码并回车。

### 4. 批量发布
如果需要一次性发布所有更改过的包，建议使用 `changesets` 工作流（项目中已配置），或者编写脚本批量执行上述命令。

---

## 方法三：使用 Changesets 批量发布（推荐用于正式发布）

Changesets 是一个专门用于管理 Monorepo 版本控制和发布日志的工具。它可以自动处理版本升级、依赖同步和 Changelog 生成。

项目根目录的 `package.json` 中已经配置了便捷脚本来简化此流程。

### 1. 添加变更集 (Changeset)

当你修改了代码并准备发布时，首先运行以下命令来记录变更：

```powershell
pnpm changeset
```

交互式流程如下：
1.  **选择要发布的包**：使用 `空格键` 选择有变动的包（如 `@sunny-base-web/utils`），按 `Enter` 确认。
2.  **选择版本类型**：选择是 `patch`（修复补丁）、`minor`（次要版本/新功能）还是 `major`（主版本/破坏性更新）。
3.  **输入更新说明**：简要描述你的更改内容（这将出现在 Changelog 中）。

此命令会在 `.changeset` 目录下生成一个随机命名的 Markdown 文件。

### 2. 消耗变更集并更新版本

当准备好正式发布时，运行以下命令：

```powershell
pnpm version-packages
```
*(对应脚本：`changeset version`)*

该命令会：
*   读取 `.changeset` 目录下的所有文件。
*   根据变更集自动更新对应包的 `package.json` 版本号。
*   自动更新相互依赖的包的版本（例如 `ui` 依赖 `utils`，`utils` 升级时 `ui` 也会自动升级依赖版本）。
*   生成或更新 `CHANGELOG.md` 文件。
*   删除已消耗的变更集文件。

> **提示**：运行完此命令后，你应该提交更改到 Git。
> ```powershell
> git add .
> git commit -m "chore: version packages"
> ```

> **注意：版本同步机制**
> 本项目配置了 Changesets 的 **Fixed Mode**（固定模式）。这意味着所有 `@sunny-base-web/*` 包会保持版本一致。
> 当任意一个包升级版本时，组内的其他包也会自动升级到相同版本，以维护整个框架的一致性。

### 3. 构建并发布

最后，运行发布脚本，它会自动构建所有包并发布到 npm：

```powershell
pnpm release
```
*(对应脚本：`pnpm build && changeset publish`)*

该命令会：
1.  **构建**：执行 `pnpm build` 确保 `dist` 目录是最新的。
2.  **发布**：执行 `changeset publish`。
    *   检查哪些包的版本尚未发布。
    *   自动将这些包发布到 npm（默认公开）。
    *   需要你输入 2FA 验证码（如果开启）。

---

## 常用命令速查

| 任务 | 命令 | 对应脚本 |
| :--- | :--- | :--- |
| **创建变更记录** | `pnpm changeset` | `changeset` |
| **升级版本号** | `pnpm version-packages` | `changeset version` |
| **一键构建并发布** | `pnpm release` | `pnpm build && changeset publish` |

