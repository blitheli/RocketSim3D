# RocketSim3D

火箭弹道仿真与三维可视化（纯前端 React 应用）。

## 功能

- 选择火箭型号，编辑参数后计算 / 优化弹道
- ECharts：动压、高度/速度、过载、质量、推力等曲线
- CesiumJS：三维地球与弹道轨迹
- 登录与方案保存：请求同域 `/auth`、`/templates`、`/schemes`（由后端 WebApi 提供，本仓库不含服务端代码）

## 技术栈

React 19 + Vite 8（JSX）、ECharts 5、CesiumJS、纯 CSS。

## 开发

需 Node.js 18+。本地 `npm run dev` 时，Vite 会把 `/api`、`/auth`、`/templates`、`/schemes` 转到 `VITE_WEBAPI_TARGET`（默认 `http://astrox.cn:8764`），见 [vite.config.js](vite.config.js)。

```bash
npm install
npm run dev      # http://localhost:5173
```

弹道接口：`POST /api/Rocket/TrajectoryOptim`（Vite 会去掉 `/api` 前缀再转发）。

示例模板在 `public/templates/`。

## 构建与托管

```bash
npm run build    # 产出 dist/
```

将 `dist/` 作为静态站点托管即可。Windows 上本地打包/同步脚本见 [deploy/iis/](deploy/iis/)。

### GitHub Actions 自动部署（阿里云 IIS）

推送到 `main`（相关路径变更）或手动 `workflow_dispatch` 时，[`.github/workflows/deploy-aliyun-iis.yml`](.github/workflows/deploy-aliyun-iis.yml) 会：

1. 检查 Repository secrets（非 Environment）是否齐全
2. `npm ci` + `npm run build`（Node 20）
3. 校验存在 `dist/index.html`
4. `rsync` 到 `_deploy/`，经 OpenSSH 清空并 SCP 上传到 `D:/IIS/RocketSim3D`（站点根直接是 `index.html`、`assets/`，不含嵌套 `dist/`）

机制与 **ASTROX.Docs** 一致：`ubuntu-latest` + `appleboy/ssh-action@v1.2.0` + `appleboy/scp-action@v0.1.7`（`port: 22`，`tar_dereference: true`，不设 `overwrite`）。仓库需配置：

| Secret | 说明 |
| ------ | ---- |
| `ALIYUN_HOST` | 阿里云 Windows 主机 |
| `ALIYUN_USERNAME` | OpenSSH 用户名 |
| `ALIYUN_PASSWORD` | OpenSSH 密码 |

服务器需开启 OpenSSH Server。不要把密码写进仓库或打印到日志。

本地仍可用 `deploy/iis/pack.ps1` / `publish.ps1` 手工发布，与 CI 互不替代。

### 环境变量

| 变量 | 说明 | 默认 |
| ---- | ---- | ---- |
| `VITE_WEBAPI_TARGET` | 开发时代理目标 | `http://astrox.cn:8764` |
| `VITE_CESIUM_ION_TOKEN` | Cesium Ion（构建期） | 未设置则仅 OSM 底图 |

写入 `.env.local` 后需重启 Vite。

## 文档

- [UI.md](UI.md) — 布局与界面
- [AGENTS.md](AGENTS.md) — 前端编码约定
