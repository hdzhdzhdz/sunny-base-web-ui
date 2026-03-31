# Sunny Base Web Framework 发布说明

本文档记录当前仓库已经验证通过的发布流程。

当前推荐方案：

- 使用 `changesets` 管理版本号和 changelog
- 只构建 `packages/**`
- 使用 `pnpm publish:packages` 选择要发布的包
- 实际发布时先 `pnpm pack`，再发布生成的 tarball
- 当前环境下，不再把 `changeset publish` 作为主发布方式

## 为什么这样发布

仓库里的包存在构建依赖关系，不适合跳过构建直接发包。

例如：

- `@sunny-base-web/constants -> @sunny-base-web/utils -> @sunny-base-web/stores`
- `@sunny-base-web/icons / @sunny-base-web/locales / @sunny-base-web/utils -> @sunny-base-web/ui`
- `@sunny-base-web/ui / @sunny-base-web/stores / @sunny-base-web/locales / @sunny-base-web/icons / @sunny-base-web/utils -> @sunny-base-web/effects`

另外，这个仓库使用了 `pnpm` 的 `catalog:` 和 `workspace:` 协议。它们在 monorepo 内开发没有问题，但对外发布到 npm 时，必须先转换成真实版本号。

已经验证出的结论是：

- `pnpm pack` 生成的 tarball 会把 `catalog:` 和 `workspace:` 转换成正常版本
- 直接在包目录执行 `npm publish`，会把这些协议原样带进最终包清单
- 外部项目如果用 `npm install` 安装这类包，会报 `EUNSUPPORTEDPROTOCOL`

所以当前正确的发布方式是：

1. 用 `changesets` 生成版本变更
2. 用 `changeset version` 落盘版本号
3. 构建 `packages/**`
4. 用脚本选择包
5. 先 `pnpm pack`
6. 再发布生成的 `.tgz`

## 当前可用脚本

根目录 [package.json](/f:/aGit/sunny-base-web-framework/package.json) 里和发布相关的脚本如下：

```json
{
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version",
    "build:packages": "turbo run build --filter=\"./packages/**\"",
    "publish:packages": "node ./scripts/publish-packages.mjs",
    "release": "pnpm build:packages && changeset publish"
  }
}
```

含义：

- `pnpm changeset`：创建 changeset
- `pnpm version-packages`：消费 changeset，更新版本号、内部依赖和 changelog
- `pnpm build:packages`：只构建 `packages/**`
- `pnpm publish:packages`：交互式选择包，先打 tarball，再发布 tarball
- `pnpm release`：当前保留，但不作为推荐发布命令

## npm 认证

仓库根目录的 [.npmrc](/f:/aGit/sunny-base-web-framework/.npmrc) 使用环境变量读取 token：

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
always-auth=true
@sunny-base-web:registry=https://registry.npmjs.org/
```

发布前先在当前 PowerShell 会话里注入 token：

```powershell
$env:NPM_TOKEN="your_npm_token"
```

可先验证身份：

```powershell
npm whoami
```

注意：

- 不要把明文 token 提交到仓库
- `.npmrc` 已被忽略，不要移出忽略规则
- token 需要具备发布权限

## 标准发布流程

### 1. 创建 changeset

```powershell
pnpm changeset
```

根据提示选择：

1. 哪些包变更了
2. 版本类型是 `patch` / `minor` / `major`
3. 本次变更说明

执行后会在 `.changeset/` 下生成变更文件。

### 2. 更新版本号

```powershell
pnpm version-packages
```

这一步会：

- 更新包版本
- 更新内部依赖版本
- 更新 changelog
- 消费 `.changeset/*`

### 3. 检查并提交版本变更

建议先检查变更：

```powershell
git status
```

然后提交版本变更：

```powershell
git add .
git commit -m "chore: version packages"
```

### 4. 只构建 packages

```powershell
pnpm build:packages
```

这一步只构建 `packages/**`，不会去构建 `apps/web` 或 `docs`。

### 5. 交互式选择要发布的包

```powershell
pnpm publish:packages
```

脚本定义在 [scripts/publish-packages.mjs](/f:/aGit/sunny-base-web-framework/scripts/publish-packages.mjs)，会自动：

- 扫描 `packages/**` 下所有可发布包
- 列出包名、版本和目录
- 让你输入要发布的包
- 在每个选中的包目录里执行 `pnpm pack --pack-destination .packed`
- 发布生成的 `.packed/*.tgz`
- 发布后自动清理 `.packed`

支持的输入方式：

- 输入序号：`1,8,9`
- 输入包名：`@sunny-base-web/ui,@sunny-base-web/utils`
- 输入全部：`all`

确认后脚本会逐个发布。

### 6. 发布完成后推送代码

```powershell
git push
```

## 推荐命令顺序

按下面顺序执行即可：

```powershell
$env:NPM_TOKEN="your_npm_token"
pnpm changeset
pnpm version-packages
git add .
git commit -m "chore: version packages"
pnpm build:packages
pnpm publish:packages
git push
```

如果版本提交已经做好了，可以从 `pnpm build:packages` 开始。

## 为什么不用 `pnpm release`

`pnpm release` 当前执行的是：

```powershell
pnpm build:packages && changeset publish
```

这条命令目前不作为推荐方案，原因有两个：

- `changeset publish` 在当前环境下会先请求 npm 的 `/-/npm/v1/user`，并返回 `403 Forbidden`
- 直接对包目录执行 `npm publish` 会把 `catalog:` 和 `workspace:` 原样带进最终发布包

所以当前结论是：

- `changesets` 继续负责版本管理
- 实际发布改用 `pnpm publish:packages`

## 常用命令

创建 changeset：

```powershell
pnpm changeset
```

更新版本号：

```powershell
pnpm version-packages
```

只构建 packages：

```powershell
pnpm build:packages
```

交互式发布：

```powershell
pnpm publish:packages
```

手动发布单个包：

```powershell
cd packages/@ui
pnpm pack --pack-destination .packed
npm publish .packed/sunny-base-web-ui-x.y.z.tgz --access public
```

单个包 dry-run：

```powershell
cd packages/@ui
pnpm pack --pack-destination .packed
npm publish .packed/sunny-base-web-ui-x.y.z.tgz --dry-run --access public
```

## 常见排查

### `npm whoami` 失败

说明当前终端没有可用 token，或者 npm 认证未生效。

检查：

```powershell
echo $env:NPM_TOKEN
npm whoami
```

### `pnpm build:packages` 构建了 web

正常情况下不会。请确认执行的是：

```powershell
pnpm build:packages
```

### `pnpm publish:packages` 没列出任何包

检查：

- 目标包是否位于 `packages/**`
- 对应 `package.json` 是否不是 `private: true`

### 外部项目 `npm install` 报 `EUNSUPPORTEDPROTOCOL`

这通常说明发布到 npm 的包里仍带着 `catalog:` 或 `workspace:`。

正确做法是：

- 不要直接对包目录执行 `npm publish`
- 使用 `pnpm publish:packages`
- 或手动先 `pnpm pack`，再发布生成的 `.tgz`

### npm 提示版本已存在

同一版本不能重复发布。需要重新生成变更并更新版本：

```powershell
pnpm changeset
pnpm version-packages
```

## 当前正式建议

在当前仓库里，正式建议的发布流程是：

1. `pnpm changeset`
2. `pnpm version-packages`
3. `pnpm build:packages`
4. `pnpm publish:packages`

这就是当前已经验证通过、可重复执行的标准发布流程。
