# AGENTS.md — RocketSim3D

面向 AI 编码助手的项目指南。修改代码前请先阅读 [README.md](README.md) 与 [UI.md](UI.md)。

## 项目概述

RocketSim3D 是**纯前端**火箭弹道仿真与三维可视化 Web 应用：

- 左侧：参数输入（按型号动态表单）+ 特征点参数表格
- 中间：Cesium 三维地球 + 弹道轨迹
- 右侧：飞行时序；底部：ECharts 弹道曲线

弹道计算、用户登录、模板与用户方案均由 **[ASTROX.Rocket WebApi](../ASTROX.Rocket)**（`http://astrox.cn:8764`）提供。本仓库**无** `server/` 目录。

## 技术栈

| 类别 | 选型 |
| ---- | ---- |
| 框架 | React 19 + Vite 8（JS/JSX，非 TypeScript） |
| 曲线 | ECharts 5 |
| 3D | CesiumJS + `vite-plugin-cesium` |
| 样式 | 纯 CSS（`src/styles/theme.css`、`app.css`） |
| 状态 | React `useState` / `useMemo`，无 Redux |
| 后端 | ASTROX.Rocket WebApi（Identity + JWT + SQLite，独立仓库） |

## 目录结构

```
RocketSim3D/
├── public/
│   ├── models/              # GLB 火箭模型
│   └── templates/           # 开发用模板（生产以 WebApi Templates/ 为准）
├── src/
│   ├── App.jsx
│   ├── api/
│   │   ├── trajectory.js    # POST /api/Rocket/TrajectoryOptim
│   │   ├── auth.js          # /auth/login、/auth/register
│   │   └── schemes.js       # /templates、/schemes
│   ├── data/rockets.js
│   ├── utils/               # adapt.js、useRocketInput.js、remainingFuel.js
│   ├── components/
│   └── styles/
├── vite.config.js           # 代理 → VITE_WEBAPI_TARGET（默认 :8764）
├── 迁移.md
├── UI.md
└── README.md
```

## 数据流

### 弹道计算

```
用户编辑 payload
    ↓
calculateTrajectory / optimizeTrajectory  (src/api/trajectory.js)
    ↓ POST /api/Rocket/TrajectoryOptim  →  WebApi /Rocket/TrajectoryOptim
    ↓ JSON 响应
adapt.js → TrajectoryCharts / ShiXuTable / Cesium3D
```

### 方案加载与保存

```
GET /templates          → WebApi 读 Templates/
GET/POST /schemes       → WebApi SQLite（需 Bearer JWT）
未登录保存              → 下载 JSON 文件
```

## 后端 API（ASTROX.Rocket WebApi :8764）

| 方法 | 路径 | 认证 |
| ---- | ---- | ---- |
| POST | /auth/register、/auth/login | 无 |
| GET | /templates、/templates/:file | 无 |
| GET/POST/DELETE | /schemes | JWT |
| POST | /Rocket/TrajectoryOptim | 无 |

开发时 Vite 将 `/api`、`/auth`、`/templates`、`/schemes` 代理到 `VITE_WEBAPI_TARGET`（默认 `http://astrox.cn:8764`）。`/api` 前缀会被 rewrite 去掉。

## 开发命令

```bash
# 先启动 WebApi（ASTROX.Rocket 仓库）
dotnet run --project ASTROX.RocketWebApi/ASTROX.Rocket.WebApi.csproj --urls http://astrox.cn:8764

# 本仓库
npm install
npm run dev
npm run build
```

**联调需 WebApi 与 `npm run dev` 同时运行**，否则登录/方案/模板不可用。

## 部署

- 本仓库：`npm run build` → 托管 `dist/`（Nginx/Caddy/IIS 静态站点）；**Windows IIS 详见 [deploy/iis/README.md](deploy/iis/README.md)**
- 后端：单独部署 ASTROX.Rocket WebApi；生产 **Jwt:Secret** 配置见 WebApi [README.md](../ASTROX.Rocket/ASTROX.RocketWebApi/README.md)
- 反代：将 `/Rocket`、`/auth`、`/templates`、`/schemes`（及可选 `/api`）指向 WebApi

## 编码约定

1. **最小改动**：只改与任务相关的文件。
2. **保持 JSX/JS 风格**：不引入 TypeScript 除非明确要求。
3. **API 适配**：新曲线/表格列在 `adapt.js` 扩展。
4. **不修改**：`.cursor/plans/` 除非用户要求。
5. **后端变更**：在 ASTROX.Rocket 仓库修改，勿在本仓库恢复 Express。

## 常见任务指引

| 任务 | 主要文件 |
| ---- | -------- |
| 新增曲线 Tab | `adapt.js`、`TrajectoryCharts.jsx` |
| 调整弹道 API | `api/trajectory.js`、`App.jsx` |
| 登录/方案 API（前端） | `src/api/auth.js`、`src/api/schemes.js` |
| 登录/方案 API（后端） | ASTROX.Rocket `Controllers/AuthController.cs`、`SchemesController.cs` |
| 跨域/代理 | `vite.config.js`；生产反代规则 |
| 3D 轨迹 | `Cesium3D.jsx` |

## 测试建议

```bash
curl http://astrox.cn:8764/templates
curl -X POST http://localhost:5173/api/Rocket/TrajectoryOptim \
  -H "Content-Type: application/json" \
  -d "@public/templates/CZ2D_SSO_260601.json"
```

## 相关文档

- [README.md](README.md)
- [UI.md](UI.md)
- [迁移.md](迁移.md)
- [ASTROX.Rocket WebApi README](../ASTROX.Rocket/ASTROX.RocketWebApi/README.md)

## Cursor Cloud specific instructions

| 服务 | 命令 | URL |
| ---- | ---- | --- |
| ASTROX.Rocket WebApi | `dotnet run --project ASTROX.RocketWebApi ... --urls http://astrox.cn:8764` | http://astrox.cn:8764 |
| Vite | `npm run dev` | http://localhost:5173 |

端到端联调需要 WebApi + Vite；底图默认 `tile.openstreetmap.org`。

### 可选环境变量

- `VITE_WEBAPI_TARGET`：开发代理目标（默认 `http://astrox.cn:8764`）
- `VITE_CESIUM_ION_TOKEN`：Cesium Ion（构建期）
