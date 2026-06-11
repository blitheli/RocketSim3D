# RocketSim3D

火箭弹道仿真与三维可视化（纯前端 React 应用）

## UI 主要功能

- 火箭弹道仿真计算：可选择不同火箭型号，输入参数后进行计算与优化
- 弹道曲线：时间-动压、时间-高度/速度、时间-过载、时间-质量、时间-推力等
- 3D 弹道：CesiumJS 显示计算完成后的三维轨迹
- 用户登录与方案保存：依赖 [ASTROX.Rocket WebApi](../ASTROX.Rocket)（Identity + JWT + SQLite）

## 架构

```
RocketSim3D（本仓库，:5173 开发 / dist/ 生产）
    │  Vite 代理 / 生产反代
    ▼
ASTROX.Rocket WebApi（:8764）
    ├─ POST /Rocket/TrajectoryOptim   弹道计算（本地算法）
    ├─ POST /auth/login|register      登录注册
    ├─ GET  /templates                模板方案
    └─ GET/POST/DELETE /schemes       用户方案（JWT）
```

本仓库**不再包含** Node.js Express 后端（原 `server/` 已移除）。详见 [迁移.md](迁移.md)。

## 火箭弹道仿真计算

- 内置 CZ-2D、CZ-4B、CZ-4C、Falcon9 等型号，示例见 `public/templates/`
- 调用 `POST /api/Rocket/TrajectoryOptim`（开发时 Vite 将 `/api` 重写为 `/Rocket/...` 并代理到 WebApi）
- Skill 参考：[astrox-skills / rocket-trajectory-optim](https://github.com/blitheli/astrox-skills)

## 开发

需 Node.js 18+，并**先启动 ASTROX.Rocket WebApi**（默认 `http://localhost:8764`）。

```bash
# 终端 1：WebApi（在 ASTROX.Rocket 仓库）
dotnet run --project ASTROX.RocketWebApi/ASTROX.Rocket.WebApi.csproj --urls http://localhost:8764

# 终端 2：前端（本仓库）
npm install
npm run dev      # http://localhost:5173
```

Vite 将所有 API 代理到 WebApi（可通过环境变量 `VITE_WEBAPI_TARGET` 覆盖，见 [vite.config.js](vite.config.js)）。

### 快速验证

```bash
curl http://localhost:8764/templates
curl -X POST http://localhost:5173/api/Rocket/TrajectoryOptim \
  -H "Content-Type: application/json" \
  -d "@public/templates/CZ2D_SSO_260601.json"
```

## 部署（生产）

前端为静态站点；认证、方案、模板、弹道均由 **ASTROX.Rocket WebApi** 提供。

### 1. 构建前端

```bash
npm install
npm run build    # 产出 dist/
```

### 2. 部署 WebApi

在 ASTROX.Rocket 仓库部署 WebApi（默认 `:8764`），并**在生产环境设置 JWT 密钥**（见 [ASTROX.RocketWebApi/README.md](../ASTROX.Rocket/ASTROX.RocketWebApi/README.md) 的「JWT 密钥（生产环境）」一节）。

### 3. 静态托管 + 反向代理

将 `dist/` 托管为静态文件，并把以下路径反代到 WebApi（示例 Caddy）：

```caddyfile
your-domain.com {
    root * /path/to/RocketSim3D/dist
    try_files {path} /index.html

    reverse_proxy /Rocket/*    localhost:8764
    reverse_proxy /auth/*      localhost:8764
    reverse_proxy /templates*  localhost:8764
    reverse_proxy /schemes*    localhost:8764
}
```

若前端仍使用 `/api/Rocket/...` 路径，需增加：

```caddyfile
    handle_path /api/* {
        rewrite * /{path}
        reverse_proxy localhost:8764
    }
```

### 环境变量（本仓库）

| 变量 | 说明 | 默认 |
| ---- | ---- | ---- |
| `VITE_WEBAPI_TARGET` | 开发时代理目标 WebApi 地址 | `http://localhost:8764` |
| `VITE_CESIUM_ION_TOKEN` | Cesium Ion 地形（构建期） | 未设置则用 OSM 底图 |

> 用户与方案数据在 WebApi 的 SQLite 库（`Data/rocketsim.db`），部署 WebApi 时需保留该文件。模板 JSON 以 WebApi 的 `Templates/` 目录为准（与 `public/templates/` 同步维护）。

## 相关文档

- [UI.md](UI.md) — 布局与设计
- [AGENTS.md](AGENTS.md) — AI 编码助手指南
- [迁移.md](迁移.md) — 从 Express 迁移至 WebApi 的说明
- [ASTROX.Rocket WebApi README](../ASTROX.Rocket/ASTROX.RocketWebApi/README.md) — 后端部署与 JWT 配置
