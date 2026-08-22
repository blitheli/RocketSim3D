# RocketSim3D → Windows Server IIS 发布脚本
# 用法示例：
#   .\deploy\iis\publish.ps1 -SitePath "C:\inetpub\RocketSim3D"
#   .\deploy\iis\publish.ps1 -SitePath "\\SERVER\C$\inetpub\RocketSim3D"

param(
    [Parameter(Mandatory = $true)]
    [string]$SitePath,

    [string]$WebApiUrl = "http://astrox.cn:8764"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")

Write-Host "==> 构建前端 ($RepoRoot)" -ForegroundColor Cyan
Push-Location $RepoRoot
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build 失败 (exit $LASTEXITCODE)" }
}
finally {
    Pop-Location
}

$DistPath = Join-Path $RepoRoot "dist"
if (-not (Test-Path (Join-Path $DistPath "index.html"))) {
    throw "未找到 dist/index.html，请确认构建成功"
}

if (-not (Test-Path $SitePath)) {
    Write-Host "==> 创建站点目录: $SitePath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $SitePath -Force | Out-Null
}

Write-Host "==> 同步 dist/ → $SitePath" -ForegroundColor Cyan
robocopy $DistPath $SitePath /MIR /XD node_modules /NFL /NDL /NJH /NJS /NC /NS
if ($LASTEXITCODE -ge 8) { throw "robocopy 失败 (exit $LASTEXITCODE)" }

Write-Host "==> 检查 WebApi: $WebApiUrl/templates" -ForegroundColor Cyan
try {
    $resp = Invoke-WebRequest -Uri "$WebApiUrl/templates" -UseBasicParsing -TimeoutSec 5
    Write-Host "WebApi 正常 (HTTP $($resp.StatusCode))" -ForegroundColor Green
}
catch {
    Write-Warning "WebApi 未响应: $($_.Exception.Message)"
    Write-Warning "请确认 WebApi 已启动（$WebApiUrl）。"
}

Write-Host "==> 发布完成" -ForegroundColor Green
Write-Host "站点目录: $SitePath"
Write-Host "详细 IIS 配置见 deploy/iis/README.md"
