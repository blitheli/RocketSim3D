# AGENTS.md — RocketSim3D

面向 AI 编码助手的项目指南。修改代码前请先阅读 [README.md](README.md) 与 [UI.md](UI.md)。

## 项目概述

RocketSim3D 是火箭弹道仿真与三维可视化 Web 应用：

- 左侧：参数输入（按型号动态表单）+ 特征点参数表格
- 右侧：Cesium 三维地球 + 弹道轨迹 + GLB 火箭模型
- 底部：ECharts 弹道曲线

弹道计算通过 AstroX 弹道优化 Web API 完成，前端不实现弹道算法本身。用户登录与方案持久化由本地 Express 后端提供。

## 技术栈


| 类别   | 选型                                      |
| ---- | --------------------------------------- |
| 框架   | React 19 + Vite 8（JS/JSX，非 TypeScript）  |
| 曲线   | ECharts 5                               |
| 3D   | CesiumJS + `vite-plugin-cesium`         |
| 样式   | 纯 CSS（`src/styles/theme.css`、`app.css`） |
| 状态   | React `useState` / `useMemo`，无 Redux    |
| 本地后端 | Express（`:3001`），JWT + JSON 文件存储        |


## 目录结构

```
RocketSim3D/
├── public/
│   ├── models/              # GLB 火箭模型（CZ-2D.glb 等）
│   └── templates/           # 模板方案 JSON + index.json 索引
├── server/                  # Express 后端（生产同时托管 dist/ 与 /api 代理）
│   ├── index.js             # 入口，监听 :3001；/api 反代 astrox + 静态托管 dist/
│   ├── auth.js              # 注册/登录
│   ├── schemes.js           # 用户方案 CRUD
│   ├── templates.js         # 模板列表与读取
│   ├── middleware.js        # JWT 验证
│   └── data/
│       ├── users.json       # 用户账户
│       └── schemes/         # 每用户独立目录 {userId}/*.json
├── src/
│   ├── App.jsx              # 根组件：状态、API 调用、布局编排
│   ├── api/
│   │   ├── trajectory.js    # AstroX 弹道 API 封装
│   │   ├── auth.js          # 登录/注册/token（localStorage）
│   │   └── schemes.js       # 模板与用户方案 API
│   ├── data/rockets.js      # 火箭型号元数据、Panel 映射
│   ├── utils/
│   │   ├── adapt.js           # API 响应 → 曲线/表格/轨迹点适配
│   │   ├── useRocketInput.js  # 参数/发动机字段更新
│   │   └── remainingFuel.js   # 剩余推进剂 burnConsumption（支持推力/比冲节流积分）
│   ├── components/
│   │   ├── TopBar.jsx       # 顶栏：型号标签 + 方案名 + 操作按钮
│   │   ├── LoginModal.jsx
│   │   ├── SchemeModal.jsx  # 打开模板/用户方案
│   │   ├── SaveSchemeModal.jsx
│   │   ├── OptimConfigModal.jsx
│   │   ├── Cesium3D.jsx
│   │   ├── rockets/         # CZ2DPanel、CZ4BPanel、CZ4CPanel、Falcon9Panel
│   │   ├── params/          # 参数 GroupBox 子组件（含 ShiXuTable.jsx、EngineThrottlingModal.jsx）
│   │   └── charts/TrajectoryCharts.jsx
│   └── styles/
├── vite.config.js           # 开发代理：/api→astrox，/auth|/templates|/schemes→:3001
├── UI.md
└── README.md
```

## 数据流

### 弹道计算

```
用户编辑 payload (RocketInput + Profiles)
    ↓
calculateTrajectory / optimizeTrajectory  (src/api/trajectory.js)
    ↓ POST /api/Rocket/TrajectoryOptim
astrox.cn:8764
    ↓ JSON 响应
adapt.js 提取 DicAllData / DicKeyData
    ↓
TrajectoryCharts / ShiXuTable / Cesium3D
```

### 方案加载与保存

```
启动 → GET /templates → 加载默认模板 payload
打开方案 → SchemeModal
    ├─ 模板：GET /templates/:file
    └─ 用户方案：GET /schemes/:id（需 JWT）
保存
    ├─ 未登录 → 下载 JSON 文件
    └─ 已登录 → POST /schemes（需 JWT）
```

### 核心状态（App.jsx）

- `payload`：当前输入 JSON（含 `RocketInput`、`Profiles`、`RunProfiles`）
- `apiResult`：最近一次 AstroX API 返回
- `schemeName`：当前方案显示名称（TopBar）
- `user`：当前登录用户（`null` 为未登录，token 存 localStorage）

## 本地后端 API（Express :3001）


| 方法     | 路径                   | 说明                                    | 认证  |
| ------ | -------------------- | ------------------------------------- | --- |
| POST   | /auth/register       | 注册                                    | 无   |
| POST   | /auth/login          | 登录，返回 JWT                             | 无   |
| GET    | /templates           | 模板列表（读 `public/templates/index.json`） | 无   |
| GET    | /templates/:filename | 获取模板 JSON                             | 无   |
| GET    | /schemes             | 当前用户方案列表                              | JWT |
| GET    | /schemes/:id         | 获取用户方案详情                              | JWT |
| POST   | /schemes             | 保存方案                                  | JWT |
| DELETE | /schemes/:id         | 删除方案                                  | JWT |


开发时 Vite 将 `/auth`、`/templates`、`/schemes` 代理到 `localhost:3001`；生产时这些请求与前端同源，直接由 Express 处理。

## 弹道 API（AstroX）

- **统一调用路径**: `POST /api/Rocket/TrajectoryOptim`（[src/api/trajectory.js](src/api/trajectory.js) 中 `API_BASE = '/api'`）
  - **开发环境**: Vite 代理 `/api` → `astrox.cn:8764`
  - **生产环境**: Express 反向代理 `/api` → `astrox.cn:8764`（同源，无 CORS / HTTPS 混合内容问题）
  - 上游地址可由环境变量 `ASTROX_TARGET` 覆盖（默认 `http://astrox.cn:8764`）
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
- 支持型号：`CZ-2D`（二级）、`CZ-4B`（三级）、`CZ-4C`（三级二次工作）、`Falcon9`（二级二次工作）
- 可优化型号见 `src/data/rockets.js` 的 `API_SUPPORTED_ROCKET_TYPES`

### 响应关键字段


| 字段           | 用途                      |
| ------------ | ----------------------- |
| `DicAllData` | 全程弹道序列（曲线数据源）           |
| `DicKeyData` | 特征点弹道（特征点表格数据源）         |
| `DicShiXu`   | 飞行时序/段边界                |
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


### 特征点表格（extractShiXuTable）

- 数据源：`DicKeyData`（**不是** `DicShiXu`）
- 行选取：偶数索引 `0, 2, 4, …`（每飞行段首状态，`Text` 成对重复）
- 列定义：`adapt.js` 中 `SHIXU_FIELD_DEFS`，`field` 直接对应 `DicKeyData` 字段名
- 组件：`ShiXuTable.jsx` 为纯展示，接收 `{ columns, rows }`（已格式化的字符串矩阵）
- 新增列：只改 `SHIXU_FIELD_DEFS`，不要改组件

**单位注意**：`sma0` 为米（m），UI 显示时除以 1000 为 km；推力 N，质量 kg，比冲 m/s；表格中推力列 scale `1/1000` 显示 kN。

## 火箭型号与模板方案

- 型号元数据：`src/data/rockets.js` → `ROCKET_TYPES`、`ROCKET_PANELS`
- **运行时模板**：`public/templates/index.json` + 对应 JSON 文件
- 新增模板：在 `public/templates/` 添加 JSON 并更新 `index.json`
- 时序/级/质量表字段：各型号 Panel 内硬编码（`src/components/rockets/CZ2DPanel.jsx` 等）
- 新增型号时：同步更新 `ROCKET_TYPES`、`ROCKET_PANELS`、新建 Panel 组件，并添加模板 JSON

## GLB 模型

- 模型文件仍位于 `public/models/`（CZ-2D.glb 等），当前 `Cesium3D.jsx` **暂未加载** GLB，仅显示发射点与弹道轨迹
- 恢复模型时：在 `ROCKET_TYPES` 补回 `modelPath` 等配置，并在 `Cesium3D.jsx` 重新接入加载逻辑

## 开发命令

```bash
npm install
npm run server   # Express 后端 http://localhost:3001（含 /api 代理）
npm run dev      # Vite 前端 http://localhost:5173
npm run build    # 产出 dist/（生产静态文件）
npm run preview
```

**联调需同时启动 `npm run server` 与 `npm run dev`**，否则登录/方案/模板 API 不可用。

## 部署（生产）

推荐「Express 单进程托管」模式：前端、后端、弹道代理同源同端口，**无需 IIS/Nginx，无 CORS / 混合内容问题**。

```bash
npm install
npm run build            # 生成 dist/
$env:JWT_SECRET="生产密钥"   # PowerShell；Linux 用 export
node server/index.js     # 默认 :3001，自动检测并托管 dist/
```

- [server/index.js](server/index.js) 启动时若发现 `dist/` 即托管静态文件 + SPA 回退；未发现则仅提供后端 API（开发模式）
- 服务器需带的文件：`server/`、`public/`（模板/模型）、`dist/`、`package.json` 与依赖（`npm install --omit=dev`）
- 守护进程：Windows 用 **NSSM** 或 **PM2** 注册为服务（开机自启、崩溃重启）
- HTTPS：前置 **Caddy**（自动签发证书）反代到 `:3001`，无需改代码
- 相关环境变量：`PORT`、`JWT_SECRET`、`ASTROX_TARGET`、`VITE_CESIUM_ION_TOKEN`（构建期）

详见 [README.md](README.md) 的「部署」一节。

## 编码约定

1. **最小改动**：只改与任务相关的文件，不重构无关模块。
2. **保持 JSX/JS 风格**：与现有组件一致，不引入 TypeScript 除非明确要求。
3. **参数表单**：新字段在对应 `params/*.jsx` 或 `rockets/*Panel.jsx` 中直接渲染；发射点选项见 `BasicParams.jsx` 内 `LAUNCH_SITES`。
4. **API 适配**：新曲线或表格列在 `adapt.js` 扩展，不要在组件内硬编码字段名。
5. **样式**：使用 `theme.css` 中的 CSS 变量（`--accent`、`--bg-panel` 等），保持暗色工程风。
6. **不修改**：计划文件 `.cursor/plans/` 除非用户要求。
7. **用户数据**：`server/data/` 含运行时生成的用户与方案，勿提交测试账户到版本库（可考虑 `.gitignore`）。

## 常见任务指引


| 任务          | 主要文件                                                                        |
| ----------- | --------------------------------------------------------------------------- |
| 新增曲线 Tab    | `adapt.js`（buildChartConfigs）、`TrajectoryCharts.jsx`                        |
| 新增特征点表格列    | `adapt.js`（`SHIXU_FIELD_DEFS`）                                              |
| 新增参数项       | `params/*.jsx`、`rockets/*Panel.jsx`                                         |
| 新增火箭型号      | `rockets.js`、新建 `rockets/*Panel.jsx`、`public/templates/`                    |
| 新增模板方案      | `public/templates/` JSON + `index.json`                                     |
| 调整弹道 API 调用 | `api/trajectory.js`、`App.jsx`                                               |
| 用户登录/方案 API | `server/auth.js`、`server/schemes.js`、`src/api/auth.js`、`src/api/schemes.js` |
| 3D 轨迹       | `Cesium3D.jsx`                                                              |
| 跨域/代理       | 开发 `vite.config.js`；生产 `server/index.js`（`/api` 反代 + 静态托管）                  |


## 测试建议

- 弹道 API（不经 UI）：

```bash
curl -X POST "http://astrox.cn:8764/Rocket/TrajectoryOptim" \
  -H "Content-Type: application/json" \
  -d "@public/templates/CZ2D_SSO_260601.json"
```

- 本地后端模板列表：`curl http://localhost:3001/templates`
- UI：启动 server + dev，打开 [http://localhost:5173，「打开方案」选模板，点击「计算」应出现](http://localhost:5173，「打开方案」选模板，点击「计算」应出现) ECharts 曲线与 Cesium 弹道
- 快速验证弹道（不优化）：请求体设 `RunProfiles: false`、`Profiles: []`
- 检查 `IsSuccess` 与 `Message`；失败时查看 `Profiles[].OptimTerminationType`

## 已知限制

- Cesium 打包体积较大（>1MB），暂不做 code-splitting；建议生产开启 gzip/br 压缩
- 顶栏「开始/结束/步长」目前为 UI 占位，尚未传入 API
- 用户方案存 JSON 文件，无数据库，不适合大规模多用户生产环境

## 相关文档

- [README.md](README.md) — 产品功能需求
- [UI.md](UI.md) — UI 布局与设计细节

## Cursor Cloud specific instructions

### 服务与端口


| 服务            | 命令                  | URL                                                          |
| ------------- | ------------------- | ------------------------------------------------------------ |
| Express 本地后端  | `npm run server`    | [http://localhost:3001](http://localhost:3001)               |
| Vite 开发服务器    | `npm run dev`       | [http://localhost:5173](http://localhost:5173)               |
| AstroX 弹道 API | 无需本地启动；开发时经 Vite 代理 | `POST /api/Rocket/TrajectoryOptim` → `http://astrox.cn:8764` |


端到端联调需要：Express 后端（登录/方案）、外网 `astrox.cn:8764`（弹道计算）、默认 OSM 瓦片 `tile.openstreetmap.org`。

### 依赖安装（Linux x64）

Vite 8 使用 rolldown/lightningcss 原生绑定。在部分 Linux 云环境中，仅 `npm install` 可能因 npm 可选依赖问题导致 `npm run build` 失败。VM 启动更新脚本会在 `npm install` 后补装：

`@rolldown/binding-linux-x64-gnu`、`lightningcss-linux-x64-gnu`（`--no-save`，不修改 `package.json`）。

`npm run dev` 通常不依赖上述绑定即可运行；**生产构建**需要它们。

### 常用命令

```bash
npm install
npm run server   # 后台运行
npm run dev
npm run build
npm run preview
```

仓库**未配置** ESLint/Prettier 或 `npm test` 脚本。

### 启动 dev 服务器

建议 tmux 中分别启动后端与前端：

```bash
tmux new-session -d -s rocket-server -c /workspace -- npm run server
tmux new-session -d -s vite-dev-server -c /workspace -- npm run dev
```

### 快速验证

- 弹道 API：`curl -X POST "http://localhost:5173/api/Rocket/TrajectoryOptim" -H "Content-Type: application/json" -d "@public/templates/CZ2D_SSO_260601.json"`
- 模板列表：`curl http://localhost:3001/templates`
- UI：打开 [http://localhost:5173，「打开方案」→](http://localhost:5173，「打开方案」→) 选模板 →「计算」

### 可选环境变量

- `VITE_CESIUM_ION_TOKEN`：启用 Cesium Ion 地形；未设置时使用 OpenStreetMap 底图（构建期生效）
- `JWT_SECRET`：Express JWT 密钥（默认开发用内置值，生产务必设置）
- `PORT`：Express 监听端口（默认 3001）
- `ASTROX_TARGET`：弹道 API 上游地址（默认 `http://astrox.cn:8764`）

