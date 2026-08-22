# 本地构建并打包 dist/，便于上传到阿里云 Windows Server
# 用法：.\deploy\iis\pack.ps1
# 产出：deploy/iis/RocketSim3D-dist.zip

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$OutZip = Join-Path $PSScriptRoot "RocketSim3D-dist.zip"

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

if (Test-Path $OutZip) { Remove-Item $OutZip -Force }

Write-Host "==> 打包 dist/ → $OutZip" -ForegroundColor Cyan
Compress-Archive -Path (Join-Path $DistPath "*") -DestinationPath $OutZip -Force

Write-Host "==> 完成" -ForegroundColor Green
Write-Host "请将 $OutZip 上传并解压到 IIS 站点目录（如 C:\inetpub\RocketSim3D）"
Write-Host "说明见 deploy/iis/README.md"
