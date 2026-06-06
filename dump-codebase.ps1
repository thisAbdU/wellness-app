<#
dump-codebase.ps1
Creates a codebase dump for backend and frontend into a codebase-dump folder.
Run from the project root (where backend/ and front-end or frontend/ live).
#>

param(
  [string]$OutDir = "codebase-dump"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$root = if ($scriptDir -and (Test-Path $scriptDir)) { $scriptDir } else { (Get-Location).Path }
$fullOut = Join-Path $root $OutDir

$includeExt = @('.py','.js','.jsx','.ts','.tsx','.json','.toml','.yaml','.yml','.html','.css','.scss','.md')
$includeNames = @('.env.example')
$excludeDirs = @('.venv','venv','node_modules','.next','dist','build','.git','__pycache__','.pytest_cache','.mypy_cache','.expo','.turbo','.DS_Store')

function IsExcludedPath($path) {
  foreach ($ex in $excludeDirs) {
    if ($path -like "*$([IO.Path]::DirectorySeparatorChar)$ex*") { return $true }
    if ($path -like "*$ex*") { return $true }
  }
  return $false
}

function Collect-Files($targetDir) {
  if (-not (Test-Path $targetDir)) { return @() }
  $files = Get-ChildItem -Path $targetDir -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object {
      # skip if path contains excluded dir
      if (IsExcludedPath($_.FullName)) { return $false }
      $ext = $_.Extension.ToLower()
      if ($includeExt -contains $ext) { return $true }
      if ($includeNames -contains $_.Name) { return $true }
      return $false
    }
  return $files
}

function Write-Dump($files, $outFile) {
  $writeMsg = "Writing dump: $outFile ({0} files)" -f $files.Count
  Write-Host $writeMsg
  "`n---- CODEBASE DUMP: $outFile ----`n" | Out-File -FilePath $outFile -Encoding utf8
  foreach ($f in $files) {
    $rel = $f.FullName.Substring($root.Length + 1)
    "=== FILE: $rel ===" | Out-File -FilePath $outFile -Encoding utf8 -Append
    try {
      Get-Content -Path $f.FullName -Raw -ErrorAction Stop | Out-File -FilePath $outFile -Encoding utf8 -Append
    } catch {
      "<<< Could not read file (binary or access error): $($f.FullName) >>>" | Out-File -FilePath $outFile -Encoding utf8 -Append
    }
    "`n-----`n" | Out-File -FilePath $outFile -Encoding utf8 -Append
  }
}

function Write-ProjectTree($targetDirs, $outFile) {
  Write-Host "Generating project tree: $outFile"
  "PROJECT TREE for $root`n" | Out-File -FilePath $outFile -Encoding utf8
  foreach ($d in $targetDirs) {
    if (-not (Test-Path $d)) { continue }
    $items = Get-ChildItem -Path $d -Recurse -Force -ErrorAction SilentlyContinue |
      Where-Object { -not (IsExcludedPath($_.FullName)) } |
      Sort-Object FullName
    foreach ($it in $items) {
      $rel = $it.FullName.Substring($root.Length + 1)
      if ($it.PSIsContainer) {
        "[D] $rel" | Out-File -FilePath $outFile -Encoding utf8 -Append
      } else {
        "- $rel" | Out-File -FilePath $outFile -Encoding utf8 -Append
      }
    }
    "`n" | Out-File -FilePath $outFile -Encoding utf8 -Append
  }
}

# prepare output folder
if (Test-Path $fullOut) {
  Write-Host "Output folder exists: $fullOut"
} else {
  Write-Host "Creating output folder: $fullOut"
  New-Item -ItemType Directory -Path $fullOut -Force | Out-Null
}

# target folders (handle both possible frontend names)
$backendDir = Join-Path $root 'backend'
$frontendDirs = @()
$frontendDirs += (Join-Path $root 'front-end')
$frontendDirs += (Join-Path $root 'frontend')
$frontendDirs = $frontendDirs | Where-Object { $_ -ne $null }

# collect files
Write-Host "Collecting backend files..."
$backendFiles = Collect-Files $backendDir

Write-Host "Collecting frontend files..."
$frontendFiles = @()
foreach ($fd in $frontendDirs) {
  if (Test-Path $fd) {
    $frontendFiles += Collect-Files $fd
  }
}

# write separate dumps
$backendDump = Join-Path $fullOut 'backend-dump.txt'
$frontendDump = Join-Path $fullOut 'frontend-dump.txt'
$projectTree = Join-Path $fullOut 'project-tree.txt'
$fullDump = Join-Path $fullOut 'full-codebase-dump.txt'

if ($backendFiles.Count -gt 0) {
  Write-Dump -files $backendFiles -outFile $backendDump
} else {
  Write-Host "No backend files found or backend folder missing. Creating empty backend dump."
  "No backend files found." | Out-File -FilePath $backendDump -Encoding utf8
}

if ($frontendFiles.Count -gt 0) {
  Write-Dump -files $frontendFiles -outFile $frontendDump
} else {
  Write-Host "No frontend files found or frontend folder missing. Creating empty frontend dump."
  "No frontend files found." | Out-File -FilePath $frontendDump -Encoding utf8
}

# combined dump (optional)
Write-Host "Generating combined dump..."
"`n---- COMBINED DUMP ----`n" | Out-File -FilePath $fullDump -Encoding utf8
Get-Content $backendDump -ErrorAction SilentlyContinue | Out-File -FilePath $fullDump -Encoding utf8 -Append
Get-Content $frontendDump -ErrorAction SilentlyContinue | Out-File -FilePath $fullDump -Encoding utf8 -Append

# project tree
$targetDirs = @($backendDir) + $frontendDirs
Write-ProjectTree -targetDirs $targetDirs -outFile $projectTree

# final summary
Write-Host "`nDone. Generated files in: $fullOut"
Get-ChildItem -Path $fullOut -File | ForEach-Object { Write-Host (" - " + $_.FullName) }
Write-Host "`nTip: share the files in $OutDir; do NOT include real secrets like .env (script only includes .env.example)."
