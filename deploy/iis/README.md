# Windows 静态站点发布

本仓库只产出前端静态文件。`npm run build` 后把 `dist/` 放到 IIS（或其它静态托管）站点根目录即可。

`public/web.config` 会随构建复制到 `dist/`，用于 SPA 回退（`index.html`）以及 `.glb` / `.wasm` MIME。

## CI 自动部署（推荐）

推送到 `main` 时，GitHub Actions「部署到阿里云 IIS」会构建并把 `dist/` 内容同步到服务器 `D:\IIS\RocketSim3D`。

- Workflow：`.github/workflows/deploy-aliyun-iis.yml`
- Secrets（与同组织 CesiumAI 共用命名）：`ALIYUN_HOST`、`ALIYUN_USERNAME`、`ALIYUN_PASSWORD`
- 传输：OpenSSH（`appleboy/ssh-action` 清空目录 + `appleboy/scp-action` 上传）

CI 与下方本地脚本目标一致：站点根直接是 `index.html`、`assets/`，不要多套一层 `dist`。

## 本地打包上传

在仓库根目录：

```powershell
.\deploy\iis\pack.ps1
```

生成 `deploy/iis/RocketSim3D-dist.zip`。解压到站点目录（例如 `D:\IIS\RocketSim3D`），根下应直接有 `index.html`、`assets/`，不要多套一层 `dist`。

本机同步：

```powershell
.\deploy\iis\publish.ps1 -SitePath "D:\IIS\RocketSim3D"
```

## IIS 站点

- 物理路径指向解压后的目录（如 `D:\IIS\RocketSim3D`）
- 绑定所需端口（如 8088）
- 应用程序池：无托管代码

刷新路由出现 404 时，确认站点根目录有 `web.config`。
