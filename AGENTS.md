# AGENTS.md — RocketSim3D

面向 AI 编码助手的项目指南。修改代码前请先阅读 [README.md](README.md) 与 [UI.md](UI.md)。

## 项目概述

RocketSim3D 是火箭弹道仿真与三维可视化 Web 应用：

- 左侧：参数输入（按型号动态表单）
- 右侧：Cesium 三维地球 + 弹道轨迹 + GLB 火箭模型
- 底部：ECharts 弹道曲线 + 飞行段表格

后端计算通过 AstroX 弹道优化 Web API 完成，前端不实现弹道算法本身。

## 技术栈


| 类别  | 选型                                      |
| --- | --------------------------------------- |
| 框架  | React 19 + Vite 8（JS/JSX，非 TypeScript）  |
| 曲线  | ECharts 5                               |
| 3D  | CesiumJS + `vite-plugin-cesium`         |
| 样式  | 纯 CSS（`src/styles/theme.css`、`app.css`） |
| 状态  | React `useState` / `useMemo`，无 Redux    |


## 目录结构

```
RocketSim3D/
├── DDJS/                    # 示例弹道 JSON（及 rocket.png 参考 UI）
├── public/models/           # GLB 火箭模型（CZ-2D.glb 等）
├── src/
│   ├── App.jsx              # 根组件：状态、API 调用、布局编排
│   ├── api/trajectory.js    # 弹道 API 封装
│   ├── data/rockets.js      # 火箭预设、型号元数据、默认 JSON 导入
│   ├── utils/
│   │   ├── adapt.js         # API 响应 → 曲线/表格/轨迹点适配
│   │   └── rocketSchema.js  # 时序/级参数字段定义、表单工具
│   ├── components/
│   │   ├── TopBar.jsx
│   │   ├── ParamPanel.jsx
│   │   ├── Cesium3D.jsx
│   │   ├── StageTable.jsx
│   │   ├── params/          # 参数 GroupBox 子组件
│   │   └── charts/TrajectoryCharts.jsx
│   └── styles/
├── vite.config.js           # /api 代理 → astrox.cn:8764
├── UI.md                    # UI 设计文档
└── README.md                # 产品需求说明
```

## 数据流

```
用户编辑 payload (RocketInput + Profiles)
    ↓
calculateTrajectory / optimizeTrajectory  (src/api/trajectory.js)
    ↓ POST /Rocket/TrajectoryOptim
astrox.cn:8764
    ↓ JSON 响应
adapt.js 提取 DicAllData / DicShiXu / DicKeyData
    ↓
TrajectoryCharts / StageTable / Cesium3D
```

### 核心状态（App.jsx）

- `payload`：当前输入 JSON（含 `RocketInput`、`Profiles`、`RunProfiles`）
- `apiResult`：最近一次 API 返回
- `presetId`：顶部下拉选中的预设方案 ID

## 弹道 API

- **开发环境**: `POST /api/Rocket/TrajectoryOptim`（Vite 代理）
- **生产环境**: `POST http://astrox.cn:8764/Rocket/TrajectoryOptim`
- **Skill 参考**: [https://github.com/blitheli/astrox-skills](https://github.com/blitheli/astrox-skills) — `skills/rocket-trajectory-optim`

### 请求体

```json
{
  "RocketInput": { "$type": "CZ-2D", "...": "..." },
  "Profiles": [],
  "RunProfiles": false,
  "GetAllData": true,
  "GetKeyData": true
}
```

- `RunProfiles: false` → 仅计算；`true` → 运行 Profiles 优化
- 支持型号：`CZ-2D`（二级）、`CZ-4B`（三级）、`CZ-4C`（三级二次工作）

### 响应关键字段


| 字段           | 用途                      |
| ------------ | ----------------------- |
| `DicAllData` | 全程弹道序列（曲线数据源）           |
| `DicShiXu`   | 飞行时序/段边界（表格数据源）         |
| `DicKeyData` | 特征点弹道                   |
| `DicZJLD`    | 子级落点                    |
| `Profiles`   | 优化后更新的 Controls/Results |


### DicAllData 字段映射（已在 adapt.js 实现）


| 曲线      | 字段               |
| ------- | ---------------- |
| 时间      | `tt`             |
| 动压      | `q`              |
| 高度      | `h`              |
| 速度      | `V`              |
| 轴向过载    | `nx`             |
| 质量      | `mass`           |
| 推力      | `Fx`             |
| 经度 / 纬度 | `Lambda` / `d_B` |


**单位注意**：`sma0` 为米（m），UI 显示时除以 1000 为 km；推力 N，质量 kg，比冲 m/s。

## 火箭型号与示例数据

- 预设定义：`src/data/rockets.js` → `ROCKET_PRESETS`
- 原始 JSON：`DDJS/CZ-2D/`、`DDJS/CZ-4B/`、`DDJS/CZ-4C/`
- 时序/级参数字段：`src/utils/rocketSchema.js` → `TIMELINE_FIELDS`、`STAGE_CONFIG`
- 新增型号时：同步更新 `ROCKET_TYPES`、`TIMELINE_FIELDS`、`STAGE_CONFIG`，并添加 DDJS 示例 JSON

## GLB 模型

- 路径：`public/models/CZ-2D.glb`、`CZ-4B.glb`、`CZ-4C.glb`
- 配置：`src/data/rockets.js` → `modelPath`、`targetHeight`
- 加载逻辑：`src/components/Cesium3D.jsx`（失败时回退占位圆柱）
- 可选环境变量：`VITE_CESIUM_ION_TOKEN`（启用 Cesium World Terrain；未设置则用 OpenStreetMap 底图）

## 开发命令

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## 编码约定

1. **最小改动**：只改与任务相关的文件，不重构无关模块。
2. **保持 JSX/JS 风格**：与现有组件一致，不引入 TypeScript 除非明确要求。
3. **参数表单**：新字段优先加入 `rocketSchema.js` 的字段表，再在对应 `params/*.jsx` 渲染；飞行时序必须独立 GroupBox。
4. **API 适配**：新曲线或表格列在 `adapt.js` 扩展，不要在组件内硬编码字段名。
5. **样式**：使用 `theme.css` 中的 CSS 变量（`--accent`、`--bg-panel` 等），保持暗色工程风。
6. **不修改**：`DDJS/` 下示例 JSON 除非用户要求；计划文件 `.cursor/plans/` 除非用户要求。

## 常见任务指引


| 任务        | 主要文件                                                 |
| --------- | ---------------------------------------------------- |
| 新增曲线 Tab  | `adapt.js`（buildChartConfigs）、`TrajectoryCharts.jsx` |
| 新增参数项     | `rocketSchema.js`、`params/*.jsx`                     |
| 新增火箭型号    | `rockets.js`、`rocketSchema.js`、`DDJS/` 示例 JSON       |
| 调整 API 调用 | `api/trajectory.js`、`App.jsx`                        |
| 3D 轨迹/模型  | `Cesium3D.jsx`、`rockets.js`（modelPath）               |
| 跨域/代理     | `vite.config.js`                                     |


## 测试建议

- 用 `DDJS/` 中 JSON 通过 UI「计算」按钮联调，或：

```bash
curl -X POST "http://astrox.cn:8764/Rocket/TrajectoryOptim" \
  -H "Content-Type: application/json" \
  -d "@DDJS/CZ-2D/CZ2D_SSO_260601.json"
```

- 快速验证弹道（不优化）：请求体设 `RunProfiles: false`、`Profiles: []`
- 检查 `IsSuccess` 与 `Message`；失败时查看 `Profiles[].OptimTerminationType`

## 已知限制

- 生产构建直接请求 `astrox.cn:8764`，需服务端允许 CORS 或另行配置反向代理
- Cesium 打包体积较大（>1MB），暂不做 code-splitting
- 顶栏「开始/结束/步长」目前为 UI 占位，尚未传入 API
- README 曾提及 three.js，当前 3D 实现已统一为 CesiumJS

## 相关文档

- [README.md](README.md) — 产品功能需求
- [UI.md](UI.md) — UI 布局与设计细节

## Cursor Cloud specific instructions

### 服务与端口


| 服务            | 命令                         | URL                                                          |
| ------------- | -------------------------- | ------------------------------------------------------------ |
| Vite 开发服务器    | `npm run dev`（见下方 tmux 说明） | [http://localhost:5173](http://localhost:5173)               |
| AstroX 弹道 API | 无需本地启动；开发时经 Vite 代理        | `POST /api/Rocket/TrajectoryOptim` → `http://astrox.cn:8764` |


本项目无本地后端、无数据库。端到端联调需要能访问外网 `astrox.cn:8764`（及默认 OSM 瓦片 `tile.openstreetmap.org`）。

### 依赖安装（Linux x64）

Vite 8 使用 rolldown/lightningcss 原生绑定。在部分 Linux 云环境中，仅 `npm install` 可能因 npm 可选依赖问题导致 `npm run build` 失败。VM 启动更新脚本会在 `npm install` 后补装：

`@rolldown/binding-linux-x64-gnu`、`lightningcss-linux-x64-gnu`（`--no-save`，不修改 `package.json`）。

`npm run dev` 通常不依赖上述绑定即可运行；**生产构建**需要它们。

### 常用命令

标准命令见上文「开发命令」：`npm install`、`npm run dev`、`npm run build`、`npm run preview`。仓库**未配置** ESLint/Prettier 或 `npm test` 脚本。

### 启动 dev 服务器

Cesium 与 Vite 适合在 tmux 中长期运行，例如：

```bash
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s vite-dev-server -c /workspace -- npm run dev
```

### 快速验证

- API（不经 UI）：`curl -X POST "http://localhost:5173/api/Rocket/TrajectoryOptim" -H "Content-Type: application/json" -d "@DDJS/CZ-2D/CZ2D_SSO_260601.json"`
- UI：打开 [http://localhost:5173，点击顶栏「计算」，应出现](http://localhost:5173，点击顶栏「计算」，应出现) ECharts 曲线与 Cesium 弹道。

### 可选环境变量

- `VITE_CESIUM_ION_TOKEN`：启用 Cesium Ion 地形；未设置时使用 OpenStreetMap 底图（与本地开发一致）。

