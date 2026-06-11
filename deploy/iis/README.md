# Windows Server + IIS 部署 RocketSim3D

RocketSim3D 生产环境为**静态站点**（`dist/`）。认证、模板、方案、弹道计算均由同机或内网的 **ASTROX.Rocket WebApi**（默认 `:8764`）提供。IIS 负责：

> **阿里云 Windows Server（远程）**：IIS 已装好只够托管静态页；还需安装 **URL Rewrite + ARR** 做 API 反代，并在**同一台云服务器**上运行 WebApi（`:8764` 仅本机，**不要**在安全组对外开放）。前端从本机构建后打包上传即可，见下文「阿里云远程服务器」。

1. 托管 `dist/` 静态文件
2. 将 `/api`、`/auth`、`/templates`、`/schemes` 反代到 WebApi
3. SPA 回退（未知路径 → `index.html`）

`public/web.config` 会在 `npm run build` 时自动复制到 `dist/`，无需手工拷贝。

---

## 一、服务器前置条件

### 1. 安装 IIS 组件

「服务器管理器 → 添加角色和功能」中启用：

- Web 服务器 (IIS)
- 静态内容、默认文档、HTTP 压缩（建议）

### 2. 安装 IIS 扩展（反向代理必需）


| 组件              | 下载                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------- |
| URL Rewrite 2.x | [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)                             |
| ARR 3.x         | [Application Request Routing](https://www.iis.net/downloads/microsoft/application-request-routing) |


安装 ARR 后，在 **IIS 管理器 → 服务器节点 → Application Request Routing Cache → Server Proxy Settings** 中勾选 **Enable proxy**，然后 Apply。

### 3. 部署 WebApi

在同一台 Windows Server 上先部署并启动 WebApi（默认监听 `8764`）：

```powershell
dotnet publish ASTROX.RocketWebApi\ASTROX.Rocket.WebApi.csproj -c Release -o C:\Apps\ASTROX.RocketWebApi
# 生产 JWT 密钥见 ASTROX.Rocket WebApi README
cd C:\Apps\ASTROX.RocketWebApi
$env:Jwt__Secret="你的生产密钥"
dotnet ASTROX.Rocket.WebApi.dll --urls http://astrox.cn:8764
```

建议用 **NSSM** 或 **Windows 服务** 将 WebApi 注册为开机自启。  
保留 `Data/rocketsim.db` 与 `Templates/` 目录。

验证：

```powershell
Invoke-WebRequest http://astrox.cn:8764/templates -UseBasicParsing
```

若 WebApi 地址不同，需修改 `public/web.config` 中四处 `http://astrox.cn:8764` 后再执行 `npm run build`。

---

## 二、创建 IIS 站点

1. 在服务器上创建目录，例如 `C:\inetpub\RocketSim3D`
2. **IIS 管理器 → 网站 → 添加网站**
  - 网站名称：`RocketSim3D`
  - 物理路径：`C:\inetpub\RocketSim3D`
  - 绑定：HTTP/HTTPS + 域名或 IP + 端口（如 80 / 443）
3. 选中站点 → **基本设置 → 应用程序池**
  - .NET CLR 版本：**无托管代码**
  - 托管管道模式：集成

---

## 三、发布前端

### 阿里云远程服务器（推荐）

云服务器与开发机不在同一台机器时，**不要依赖 UNC 路径**；在本机构建、打包、上传最稳妥。

**本机（开发电脑）：**

```powershell
cd D:\RocketSim3D
.\deploy\iis\pack.ps1
# 生成 deploy/iis/RocketSim3D-dist.zip
```

**上传到阿里云服务器**（任选其一）：

- **远程桌面 (RDP)**：复制 zip 到服务器，解压到 `C:\inetpub\RocketSim3D`
- **WinSCP / FileZilla (SFTP)**：连公网 IP，上传到站点目录后解压
- 若已配置 **PowerShell 远程 (WinRM)** 且 5985/5986 已放行，可用 `publish.ps1 -SitePath` 指向共享路径（多数云环境默认未开，一般不用）

**在阿里云服务器上解压（示例：站点 `D:\IIS\RocketSim3D`，端口 8088）：**

```powershell
$site = "D:\IIS\RocketSim3D"
New-Item -ItemType Directory -Path $site -Force | Out-Null
Expand-Archive -Path "C:\Users\Administrator\Downloads\RocketSim3D-dist.zip" -DestinationPath $site -Force
```

解压后 `D:\IIS\RocketSim3D` 根目录下应有 `index.html`、`assets/`、`web.config`（勿多嵌套一层 `dist` 文件夹）。

**阿里云安全组 / 防火墙：**


| 端口                  | 是否对外开放 | 说明                                     |
| ------------------- | ------ | -------------------------------------- |
| **8088**（或你绑定的站点端口） | **是**  | IIS 站点 `RocketSim3D` 对外访问              |
| 80 / 443            | 按需     | 若改用默认 Web 端口                           |
| 3389                | 按需     | 远程桌面                                   |
| 8764                | 按需 | WebApi 对外地址 `astrox.cn:8764`；IIS 经 ARR 反代，浏览器仍访问 `:8088` |


Windows 防火墙：为 **8088** 添加入站规则（或允许对应 IIS 站点绑定）。WebApi 8764 无需公网规则。

**对外访问：** `http://公网IP:8088`（或域名 `:8088`）；API 走同域 `/api`、`/auth` 等，无需改前端构建参数。

---

### 方式 A：本机 IIS 或内网 UNC

在开发机（本仓库根目录）：

```powershell
# 内网 Windows 服务器且已开管理员共享时
.\deploy\iis\publish.ps1 -SitePath "\\YOUR-SERVER\C$\inetpub\RocketSim3D"

# 本机 IIS 目录
.\deploy\iis\publish.ps1 -SitePath "C:\inetpub\RocketSim3D"
```

脚本会执行 `npm run build`，再用 `robocopy /MIR` 同步 `dist/`（含 `web.config`）。

### 方式 B：在服务器上构建

服务器需安装 Node.js 18+，克隆仓库后：

```powershell
cd D:\src\RocketSim3D
npm install
npm run build
robocopy .\dist C:\inetpub\RocketSim3D /MIR
```

---

## 示例：阿里云同机部署（WebApi :8764 + IIS :8088）

与当前常见配置一致：


| 项        | 值                                                |
| -------- | ------------------------------------------------ |
| IIS 站点名称 | `RocketSim3D`                                    |
| 物理路径     | `D:\IIS\RocketSim3D`                             |
| 对外端口     | **8088**                                         |
| WebApi   | `http://astrox.cn:8764`（`web.config` 已默认指向此处） |


### 服务器检查清单

在**阿里云服务器** PowerShell 中依次执行：

```powershell
# 1. WebApi 是否在跑
Invoke-WebRequest http://astrox.cn:8764/templates -UseBasicParsing

# 2. 站点目录是否已有前端文件（首次发布前可能为空）
Get-ChildItem D:\IIS\RocketSim3D

# 3. IIS 站点绑定（应含 *:8088）
Import-Module WebAdministration
Get-WebBinding -Name RocketSim3D

# 4. 经 IIS 反代测 API（需已上传 dist 且 URL Rewrite+ARR 已启用）
Invoke-WebRequest http://127.0.0.1:8088/templates -UseBasicParsing
```

### 发布步骤

**开发电脑：**

```powershell
cd D:\RocketSim3D
.\deploy\iis\pack.ps1
# 上传 deploy\iis\RocketSim3D-dist.zip 到服务器
```

**服务器解压：**

```powershell
Expand-Archive -Path "C:\Users\Administrator\Downloads\RocketSim3D-dist.zip" `
  -DestinationPath "D:\IIS\RocketSim3D" -Force
```

**浏览器访问：** `http://<公网IP>:8088`

### 仍须确认的两项

1. **URL Rewrite + ARR**，且 ARR 已 **Enable proxy**（仅装 IIS 不够）
2. **阿里云安全组** 入方向放行 **TCP 8088**（源：`0.0.0.0/0` 或你的办公网 IP）

---

## 五、web.config 说明

构建产物中的 `web.config` 规则顺序如下：


| 规则                    | 请求示例                               | 转发目标                                           |
| --------------------- | ---------------------------------- | ---------------------------------------------- |
| ReverseProxyApi       | `/api/Rocket/TrajectoryOptim`      | `http://astrox.cn:8764/Rocket/TrajectoryOptim` |
| ReverseProxyAuth      | `/auth/login`                      | `http://astrox.cn:8764/auth/login`             |
| ReverseProxyTemplates | `/templates`、`/templates/xxx.json` | WebApi `/templates...`                         |
| ReverseProxySchemes   | `/schemes`、`/schemes/{id}`         | WebApi `/schemes...`                           |
| SpaFallback           | 其他非文件路径                            | `/index.html`                                  |


前端代码使用相对路径（`/api`、`/auth` 等），与开发环境 Vite 代理一致，**生产无需设置 `VITE_WEBAPI_TARGET`**（仅开发代理用）。

---

## 六、HTTPS（可选）

1. 在 IIS 站点绑定中导入证书，启用 HTTPS
2. WebApi 监听 `astrox.cn:8764`（由 IIS 反代，前端仍走同域 `/api` 等路径）
3. 若需强制 HTTPS，可在 `web.config` 的 `<rewrite>` 内增加 HTTP→HTTPS 重定向规则

---

## 七、验证清单

```powershell
# 1. 静态页（端口按实际绑定，示例 8088）
Invoke-WebRequest http://127.0.0.1:8088/ -UseBasicParsing

# 2. 模板 API（经 IIS 反代）
Invoke-WebRequest http://127.0.0.1:8088/templates -UseBasicParsing

# 3. 弹道 API
curl -X POST "http://127.0.0.1:8088/api/Rocket/TrajectoryOptim" `
  -H "Content-Type: application/json" `
  -d "@public/templates/CZ2D_SSO_260601.json"
```

浏览器打开站点 →「打开方案」选模板 →「计算」，应出现曲线与 Cesium 轨迹。

---

## 八、常见问题


| 现象                    | 处理                                                      |
| --------------------- | ------------------------------------------------------- |
| 502.3 / Bad Gateway   | WebApi 未启动；或 `web.config` 中后端地址/端口错误                    |
| 404 on `/auth/login`  | 未安装 URL Rewrite / ARR，或未 Enable proxy                   |
| 页面刷新 404              | SpaFallback 规则未生效；确认 `web.config` 在站点根目录                |
| 解压后整站 404             | zip 多了一层 `dist` 子目录；应把 `index.html` 放在站点根目录             |
| 外网能开首页但计算失败           | WebApi 未在本机运行；或安全组误拦了本机回环（少见，先查 WebApi 进程）              |
| `.glb` / `.wasm` 无法加载 | 检查 `staticContent` mimeMap；IIS 是否已存在同名映射（需先 `<remove>`） |
| 登录成功但方案失败             | 检查 WebApi `Data/rocketsim.db` 权限；JWT 密钥是否在生产环境正确配置      |


---

## 相关文档

- [README.md](../../README.md) — 项目概述与 Caddy 反代示例  
- [迁移.md](../../迁移.md) — 架构说明  
- [ASTROX.Rocket WebApi README](../../../ASTROX.Rocket/ASTROX.RocketWebApi/README.md) — WebApi 部署与 JWT

