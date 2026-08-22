# AGENTS.md — RocketSim3D

面向 AI 编码助手。改代码前请读 [README.md](README.md) 与 [UI.md](UI.md)。

## 概述

纯前端火箭弹道仿真与三维可视化：

- 左：参数表单 + 特征点表格
- 中：Cesium 地球 + 轨迹
- 右：飞行时序；底：ECharts 曲线

本仓库无 `server/`。弹道、登录、模板、方案由外部 WebApi 提供。

## 技术栈

| 类别 | 选型 |
| ---- | ---- |
| 框架 | React 19 + Vite 8（JS/JSX） |
| 曲线 | ECharts 5 |
| 3D | CesiumJS + `vite-plugin-cesium` |
| 样式 | `src/styles/theme.css`、`app.css` |
| 状态 | `useState` / `useMemo` |

## 目录

```
RocketSim3D/
├── public/
│   ├── models/              # GLB
│   ├── templates/           # 本地示例 JSON
│   └── web.config           # IIS 静态站点（含 SPA fallback）
├── src/
│   ├── App.jsx
│   ├── api/                 # trajectory / auth / schemes
│   ├── data/rockets.js
│   ├── utils/
│   ├── components/
│   └── styles/
├── vite.config.js           # 开发代理 VITE_WEBAPI_TARGET
├── UI.md
└── README.md
```

## 数据流

```
payload → calculateTrajectory / optimizeTrajectory
       → POST /api/Rocket/TrajectoryOptim
       → adapt.js → TrajectoryCharts / ShiXuTable / Cesium3D
```

模板与方案：`GET /templates`、`GET/POST/DELETE /schemes`（方案需 Bearer）。未登录保存为下载 JSON。

开发时 Vite 代理上述路径；`/api` 前缀会被 rewrite 去掉。

## 命令

```bash
npm install
npm run dev
npm run build
```

## 编码约定

1. 只改与任务相关的文件。
2. 保持 JSX/JS，不引入 TypeScript（除非明确要求）。
3. 新曲线/表格列在 `adapt.js` 扩展。
4. 不修改 `.cursor/plans/`（除非用户要求）。
5. 不在本仓库恢复 Express 或编写后端。

## 任务指引

| 任务 | 文件 |
| ---- | ---- |
| 新增曲线 Tab | `adapt.js`、`TrajectoryCharts.jsx` |
| 弹道请求 | `api/trajectory.js`、`App.jsx` |
| 登录/方案 | `src/api/auth.js`、`src/api/schemes.js` |
| 开发代理 | `vite.config.js` |
| 3D 轨迹 | `Cesium3D.jsx` |

## 环境变量

- `VITE_WEBAPI_TARGET`：开发代理目标（默认 `http://astrox.cn:8764`）
- `VITE_CESIUM_ION_TOKEN`：Cesium Ion（构建期）
