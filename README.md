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

将 `dist/` 作为静态站点托管即可。Windows 上打包/同步脚本见 [deploy/iis/](deploy/iis/)。

### 环境变量

| 变量 | 说明 | 默认 |
| ---- | ---- | ---- |
| `VITE_WEBAPI_TARGET` | 开发时代理目标 | `http://astrox.cn:8764` |
| `VITE_CESIUM_ION_TOKEN` | Cesium Ion（构建期） | 未设置则仅 OSM 底图 |

写入 `.env.local` 后需重启 Vite。

## 文档

- [UI.md](UI.md) — 布局与界面
- [AGENTS.md](AGENTS.md) — 前端编码约定
