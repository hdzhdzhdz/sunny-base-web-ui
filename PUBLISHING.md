# Sunny Base Web Framework 发布指南

本文档说明当前 `sunny-base-web-framework` Monorepo 的正式发布流程。

当前推荐方案：

- 本地使用 `changesets` 记录变更和生成版本号
- GitLab CI 统一构建并发布到 npm
- 不再本地逐个执行 `pnpm publish --access public --no-git-checks`

---

## 当前发布方式

本项目当前已经配置：

- `changeset`：记录本次发布涉及哪些包
- `version-packages`：统一更新包版本与内部依赖版本
- `release`：执行整体构建并发布到 npm
- `.gitlab-ci.yml`：在 GitLab 中手动触发发布任务

根目录脚本如下：

```json
{
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "pnpm build && changeset publish"
  }
}
```

---

## 为什么改成这种流程

之前逐包手工发布有几个问题：

- npm 发布时需要二次验证，逐包发布非常繁琐
- 多个包存在依赖关系，容易漏发上游包
- 手工发布容易出现版本不同步

本项目中的包并不是完全独立构建的，存在明确依赖链。例如：

- `@sunny-base-web/constants -> @sunny-base-web/utils -> @sunny-base-web/stores`
- `@sunny-base-web/icons/@sunny-base-web/locales/@sunny-base-web/utils -> @sunny-base-web/ui`
- `@sunny-base-web/ui/@sunny-base-web/stores/@sunny-base-web/locales/@sunny-base-web/icons/@sunny-base-web/utils -> @sunny-base-web/effects`

`turbo.json` 中也已经配置了：

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

这意味着正式发布时更适合统一构建、统一发布。

---

## 发布前准备

### 1. npm 权限

确保你拥有 `@sunny-base-web` 作用域下相关包的发布权限。

### 2. GitLab CI 变量

GitLab 中需要配置 CI/CD 变量：

- 变量名：`NPM_TOKEN`
- 值：npm 上申请的 granular access token
- 建议勾选：`Masked`
- 如果只允许主分支发布，建议勾选：`Protected`

说明：

- 该 token 应具备 npm 发布权限
- 推荐使用支持 bypass 2FA 的 npm token
- 不要把 token 写入仓库文件

### 3. GitLab CI 配置

仓库根目录已配置：

- [.gitlab-ci.yml](f:/aGit/sunny-base-web-framework/.gitlab-ci.yml)

其中：

- `build_packages`：构建 `packages/**`
- `release_npm`：手动触发，执行统一发布

---

## 正式发布流程

### 第一步：本地开发并提交代码

正常开发代码，完成功能或修复后提交。

### 第二步：生成 changeset

在仓库根目录执行：

```powershell
pnpm changeset
```

交互式选择：

1. 选择本次变更涉及的包
2. 选择版本类型：`patch` / `minor` / `major`
3. 输入本次发布说明

执行后会在 `.changeset/` 下生成一个变更文件。

### 第三步：生成版本号

确认本次要发版后，在本地执行：

```powershell
pnpm version-packages
```

该命令会：

- 消耗 `.changeset` 中的记录
- 更新各包的 `package.json` 版本号
- 更新内部依赖版本
- 生成或更新 `CHANGELOG.md`

然后提交这些版本变更：

```powershell
git add .
git commit -m "chore: version packages"
git push
```

### 第四步：推送到 `main`

将包含版本变更的提交合并或推送到 `main` 分支。

### 第五步：在 GitLab 手动创建发布流水线

进入 GitLab：

`CI/CD -> Pipelines -> Run pipeline`

选择要发布的分支后，手动创建一条 pipeline。

由于当前 `.gitlab-ci.yml` 使用的是手动触发模式，这些任务只会出现在通过 GitLab 页面手动创建的 pipeline 中。

创建成功后，在该 pipeline 中手动点击：

- `build_packages`
- `release_npm`

该任务会执行：

```bash
pnpm release
```

也就是：

1. `pnpm build`
2. `changeset publish`

最终会一次性发布所有尚未发布的包。

---

## 当前 GitLab CI 行为

当前 `.gitlab-ci.yml` 的行为如下：

- 普通 `git push` 不会自动执行发布相关 job
- 只有在 GitLab 页面手动创建 pipeline 时，才会出现这些 job
- `build_packages` 需要手动点击
- `release_npm` 需要手动点击
- 发布前建议先手动执行一次 `build_packages`

因此：

- 日常提交不会自动消耗 CI 资源
- 构建和发布都由人工确认后手动触发

---

## 日常命令速查

### 记录变更

```powershell
pnpm changeset
```

### 生成版本号

```powershell
pnpm version-packages
```

### 本地构建所有包

```powershell
pnpm exec turbo run build --filter="./packages/**"
```

### 本地执行完整发布流程

仅用于调试，不作为正式推荐方式：

```powershell
pnpm release
```

说明：

- 本地执行 `pnpm release` 仍然依赖本地 npm 登录状态或 2FA
- 正式环境建议始终使用 GitLab CI 发布

---

## 常见问题

### 1. 为什么不能只更新 `ui`，外部项目却不生效？

因为外部项目安装的是 npm 发布后的包，而不是 monorepo 内的源码引用。

例如 `@sunny-base-web/effects` 会依赖 `@sunny-base-web/ui`。如果只发布了 `ui`，但外部项目实际仍在使用旧版 `effects` 锁定的 `ui` 依赖，就可能看起来“没有生效”。

所以在有依赖链时，应该通过 changesets 统一处理版本，而不是只手工发布单个包。

### 2. 是否可以逐包 `pnpm publish`？

可以，但不推荐。

原因：

- npm 二次验证繁琐
- 容易漏掉依赖链上的包
- 容易造成版本不同步

### 3. CI 发布失败怎么办？

优先检查：

1. `NPM_TOKEN` 是否已在 GitLab 配置
2. token 是否有发布权限
3. 当前版本号是否已经发布过
4. `main` 分支上的版本变更是否已经提交

### 4. 哪一步最容易漏？

最容易漏的是这一步：

```powershell
pnpm version-packages
```

如果没有先执行它并把版本提交到仓库，即使触发了 GitLab 的 `release_npm`，也不会产生你预期的正式版本发布。

---

## 推荐操作顺序

每次正式发版建议严格按下面顺序执行：

1. 开发完成并提交代码
2. `pnpm changeset`
3. `pnpm version-packages`
4. 提交版本变更并推送到目标分支
5. 在 GitLab 页面手动创建 pipeline
6. 手动点击 `build_packages`
7. 手动点击 `release_npm`

这是当前项目推荐的唯一正式发布流程。
