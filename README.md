# RocketSim3D

火箭弹道仿真与三维可视化

## UI主要功能

- 火箭弹道仿真计算，可选择不同类型的火箭，在界面上输入相应的参数，进行计算和优化设计
- 弹道曲线显示功能，弹道计算后，可显示关键弹道曲线,例如：时间-动压；时间-高度（速度）；时间-过载等典型参数曲线
- 3D窗口弹道轨迹显示,使用three.js或CesiumJS显示计算完成后的弹道3D曲线

## 火箭弹道仿真计算

- 可进行世界上不同类型的火箭弹道计算,用户可选择,每个弹道的输入为一个json文件,描述了详细的弹道参数
- UI页面显示对应的火箭3D模型(gltf/glb格式)及相应的弹道参数
- 使用webapi方式([http://astrox.cn:8764/Rocket/TrajectoryOptim)进行弹道优化或计算,返回的也为json,包含了完整的弹道输出参数](http://astrox.cn:8764/Rocket/TrajectoryOptim)进行弹道优化或计算,返回的也为json,包含了完整的弹道输出参数)
- 可参考skill,地址:[https://github.com/blitheli/astrox-skills](https://github.com/blitheli/astrox-skills), skills文件夹下rocket-trajectory-optim
- 目前内置 CZ-2D、CZ-4B、CZ-4C、Falcon9 等型号，示例方案见 `public/templates/` 下 JSON 文件
- 除了公用参数外,飞行时序单独一个GroupBox,火箭各级参数应组合在一起，例如一级: 总质量,推进剂，发动机参数...
- 发动机若配置了推力/比冲节流（`ThrustThrottling`/`IpsThrottling`），发动机卡片会出现「节流曲线」按钮，点击可在弹窗中编辑节流点并实时查看真实推力/比冲曲线

## 弹道曲线显示功能

- 默认显示的曲线: 时间-动压, 时间-高度(速度)双坐标, 时间-轴向过载, 时间-质量，时间-推力等
- 在设计时,可使用 skill 调用 `public/templates/` 中的例子返回详细参数进行测试

## 开发

需 Node.js 18+。

```bash
npm install
npm run server   # Express 后端 http://localhost:3001（登录/方案/模板 + /api 弹道代理）
npm run dev      # Vite 前端 http://localhost:5173
```

联调需同时启动以上两个进程。弹道计算统一走 `/api`（开发由 Vite 代理、生产由 Express 反代到 `astrox.cn:8764`），前端无需感知第三方地址。

## 部署

采用 **Express 单进程托管** 模式：前端静态文件、后端 API、弹道反向代理同源同端口，无需 IIS/Nginx，也不存在 CORS 与 HTTPS 混合内容问题。

```bash
# 1. 构建前端
npm install
npm run build              # 产出 dist/

# 2. 启动服务（自动检测并托管 dist/）
$env:JWT_SECRET="生产密钥"     # PowerShell；Linux/macOS 用 export JWT_SECRET=...
node server/index.js        # 默认监听 :3001，访问 http://服务器IP:3001
```

部署到服务器需带上：`server/`、`public/`（模板与 GLB 模型）、`dist/`、`package.json` 及依赖（可在服务器执行 `npm install --omit=dev`）。

### 进程守护（开机自启 / 崩溃重启）

- **Windows**：用 [NSSM](https://nssm.cc/) 或 PM2 将 `node server/index.js` 注册为服务
  ```powershell
  nssm install RocketSim3D "C:\Program Files\nodejs\node.exe" "E:\RocketSim3D\server\index.js"
  # 在 NSSM 界面设置工作目录为项目根目录，并配置环境变量 JWT_SECRET 等
  ```
- **PM2**（跨平台）：
  ```bash
  npm i -g pm2
  pm2 start server/index.js --name rocketsim
  pm2 save
  ```

### HTTPS（可选）

最省事的方式是在前面挂 [Caddy](https://caddyserver.com/) 自动签发证书并反代到 `:3001`，无需改动代码：

```caddyfile
your-domain.com {
    reverse_proxy localhost:3001
}
```

### 环境变量


| 变量                      | 说明                         | 默认                      |
| ----------------------- | -------------------------- | ----------------------- |
| `PORT`                  | Express 监听端口               | `3001`                  |
| `JWT_SECRET`            | 登录令牌密钥，**生产务必设置**          | 内置开发值                   |
| `ASTROX_TARGET`         | 弹道 API 上游地址                | `http://astrox.cn:8764` |
| `VITE_CESIUM_ION_TOKEN` | Cesium Ion 地形 token（构建期生效） | 未设置则用 OSM 底图            |


> 部署机器需能访问外网弹道 API（`astrox.cn:8764`）与底图瓦片（`tile.openstreetmap.org`）。用户方案存于 `server/data/`，重新部署时注意保留该目录。

