param(
  [string]$RepoName = "event-photo-rank",
  [ValidateSet("public", "private")]
  [string]$Visibility = "public"
)

$ErrorActionPreference = "Stop"

Write-Host "Preparando repositorio GitHub: $RepoName" -ForegroundColor Cyan
$ProjectPath = (Get-Location).Path

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "GitHub CLI no esta disponible. Instala con: winget install --id GitHub.cli"
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git no esta disponible. Instala Git para Windows antes de continuar."
}

gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Iniciando login de GitHub..." -ForegroundColor Yellow
  gh auth login --hostname github.com --git-protocol https --web
}

if (Test-Path ".git") {
  Write-Host "Usando repositorio Git local existente." -ForegroundColor DarkGray
} else {
  git init
}

git config --global --add safe.directory $ProjectPath
git branch -M main
git add .

$hasChanges = git status --porcelain
if ($hasChanges) {
  git commit -m "Initial event photo app"
} else {
  Write-Host "No hay cambios pendientes para commitear." -ForegroundColor DarkGray
}

$existingRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0 -and $existingRemote) {
  Write-Host "Remote origin ya existe: $existingRemote" -ForegroundColor DarkGray
  git push -u origin main
} else {
  gh repo create $RepoName --$Visibility --source=. --remote=origin --push
}

Write-Host "Listo. Repositorio subido a GitHub." -ForegroundColor Green
