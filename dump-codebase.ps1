<#
.SYNOPSIS
Creates safe, readable text dumps of the Wellness backend and frontend.

.EXAMPLE
.\dump-codebase.ps1

.EXAMPLE
.\dump-codebase.ps1 -OutDir codebase-dump -MaxFileSizeKB 500
#>

[CmdletBinding()]
param(
    [string]$OutDir = "codebase-dump",
    [ValidateRange(1, 10240)]
    [int]$MaxFileSizeKB = 300,
    [switch]$NoMetadata
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$OutputDir = [IO.Path]::GetFullPath((Join-Path $Root $OutDir))
$Targets = @(
    [ordered]@{ Name = "backend"; Path = Join-Path $Root "backend" },
    [ordered]@{ Name = "frontend"; Path = Join-Path $Root "front-end/wellness-app" }
)

$AllowedExtensions = [Collections.Generic.HashSet[string]]::new(
    [string[]]@(
        ".py", ".js", ".jsx", ".ts", ".tsx", ".json", ".html", ".css", ".scss",
        ".md", ".txt", ".yml", ".yaml", ".toml", ".ini", ".cfg", ".sql"
    ),
    [StringComparer]::OrdinalIgnoreCase
)
$AllowedNames = [Collections.Generic.HashSet[string]]::new(
    [string[]]@(".env.example", ".gitignore", ".dockerignore"),
    [StringComparer]::OrdinalIgnoreCase
)
$ExcludedDirectoryNames = [Collections.Generic.HashSet[string]]::new(
    [string[]]@(
        ".git", ".github", ".venv", ".venv-1", "venv", "env", "__pycache__",
        ".pytest_cache", ".mypy_cache", ".ruff_cache", ".expo", ".next", ".turbo",
        "node_modules", "dist", "build", "coverage", "codebase-dump"
    ),
    [StringComparer]::OrdinalIgnoreCase
)
$ExcludedFileNames = [Collections.Generic.HashSet[string]]::new(
    [string[]]@(
        ".env", ".env.local", ".env.development", ".env.production", ".env.test",
        "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb",
        "cover.out", "coverage.xml"
    ),
    [StringComparer]::OrdinalIgnoreCase
)
$SensitiveNameFragments = @("secret", "private_key", "service_role", "firebase_private")
$MaxBytes = $MaxFileSizeKB * 1KB

function Get-RelativePath([string]$Path) {
    $rootUri = [Uri]($Root.TrimEnd("\") + "\")
    $pathUri = [Uri]$Path
    return [Uri]::UnescapeDataString($rootUri.MakeRelativeUri($pathUri).ToString()).Replace("/", "\")
}

function Test-IsExcludedDirectory([IO.DirectoryInfo]$Directory) {
    if ($ExcludedDirectoryNames.Contains($Directory.Name)) {
        return $true
    }

    $relative = (Get-RelativePath $Directory.FullName).Replace("\", "/").ToLowerInvariant()
    return (
        $relative -match "(^|/)android/\.gradle($|/)" -or
        $relative -match "(^|/)android/build($|/)" -or
        $relative -match "(^|/)android/app/build($|/)" -or
        $relative -match "(^|/)ios/build($|/)"
    )
}

function Test-IsBinary([string]$Path) {
    $stream = [IO.File]::OpenRead($Path)
    try {
        $buffer = New-Object byte[] 4096
        $read = $stream.Read($buffer, 0, $buffer.Length)
        for ($index = 0; $index -lt $read; $index++) {
            if ($buffer[$index] -eq 0) {
                return $true
            }
        }
        return $false
    }
    finally {
        $stream.Dispose()
    }
}

function Test-IncludeFile([IO.FileInfo]$File) {
    if ($ExcludedFileNames.Contains($File.Name)) {
        return $false
    }

    $lowerName = $File.Name.ToLowerInvariant()
    foreach ($fragment in $SensitiveNameFragments) {
        if ($lowerName.Contains($fragment)) {
            return $false
        }
    }

    if (-not ($AllowedNames.Contains($File.Name) -or $AllowedExtensions.Contains($File.Extension))) {
        return $false
    }

    if ($File.Length -gt $MaxBytes) {
        return $false
    }

    return -not (Test-IsBinary $File.FullName)
}

function Get-IncludedFiles([string]$TargetPath) {
    if (-not (Test-Path -LiteralPath $TargetPath -PathType Container)) {
        Write-Warning "Target folder does not exist: $TargetPath"
        return @()
    }

    $pending = [Collections.Generic.Stack[IO.DirectoryInfo]]::new()
    $pending.Push([IO.DirectoryInfo]$TargetPath)
    $files = [Collections.Generic.List[IO.FileInfo]]::new()

    while ($pending.Count -gt 0) {
        $directory = $pending.Pop()

        foreach ($childDirectory in $directory.EnumerateDirectories()) {
            if (-not (Test-IsExcludedDirectory $childDirectory)) {
                $pending.Push($childDirectory)
            }
        }

        foreach ($file in $directory.EnumerateFiles()) {
            if (Test-IncludeFile $file) {
                $files.Add($file)
            }
        }
    }

    return @($files | Sort-Object FullName)
}

function Get-ShortHash([string]$Path) {
    $hash = Get-FileHash -LiteralPath $Path -Algorithm SHA256
    return $hash.Hash.Substring(0, 12).ToLowerInvariant()
}

function Format-Bytes([long]$Bytes) {
    if ($Bytes -ge 1MB) { return "{0:N2} MB" -f ($Bytes / 1MB) }
    if ($Bytes -ge 1KB) { return "{0:N2} KB" -f ($Bytes / 1KB) }
    return "$Bytes bytes"
}

function Write-Dump([IO.FileInfo[]]$Files, [string]$OutputPath, [string[]]$IncludedFolders) {
    $generatedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
    $totalBytes = [long](($Files | Measure-Object Length -Sum).Sum)
    $builder = [Text.StringBuilder]::new()

    if (-not $NoMetadata) {
        [void]$builder.AppendLine("=" * 80)
        [void]$builder.AppendLine("WELLNESS CODEBASE DUMP")
        [void]$builder.AppendLine("=" * 80)
        [void]$builder.AppendLine("Generated: $generatedAt")
        [void]$builder.AppendLine("Root: $Root")
        [void]$builder.AppendLine("Included folders: $($IncludedFolders -join ', ')")
        [void]$builder.AppendLine("Maximum file size: $MaxFileSizeKB KB")
        [void]$builder.AppendLine()
    }

    [void]$builder.AppendLine("DIRECTORY TREE")
    [void]$builder.AppendLine("-" * 80)
    foreach ($file in $Files) {
        $relative = Get-RelativePath $file.FullName
        [void]$builder.AppendLine($relative)
    }
    [void]$builder.AppendLine()
    [void]$builder.AppendLine("FILE CONTENTS")

    foreach ($file in $Files) {
        $relative = Get-RelativePath $file.FullName
        [void]$builder.AppendLine()
        [void]$builder.AppendLine("=" * 80)
        [void]$builder.AppendLine("FILE: $relative")
        [void]$builder.AppendLine("SIZE: $(Format-Bytes $file.Length)")
        [void]$builder.AppendLine("SHA256: $(Get-ShortHash $file.FullName)")
        [void]$builder.AppendLine("-" * 80)
        [void]$builder.AppendLine([IO.File]::ReadAllText($file.FullName))
    }

    [void]$builder.AppendLine()
    [void]$builder.AppendLine("=" * 80)
    [void]$builder.AppendLine("SUMMARY")
    [void]$builder.AppendLine("=" * 80)
    [void]$builder.AppendLine("Files included: $($Files.Count)")
    [void]$builder.AppendLine("Total source size: $(Format-Bytes $totalBytes)")
    [void]$builder.AppendLine("Rough token estimate: $([Math]::Ceiling($totalBytes / 4))")

    [IO.File]::WriteAllText($OutputPath, $builder.ToString(), [Text.UTF8Encoding]::new($false))
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$BackendFiles = @(Get-IncludedFiles $Targets[0].Path)
$FrontendFiles = @(Get-IncludedFiles $Targets[1].Path)
$AllFiles = @($BackendFiles + $FrontendFiles | Sort-Object FullName)

$BackendDump = Join-Path $OutputDir "backend-dump.txt"
$FrontendDump = Join-Path $OutputDir "frontend-dump.txt"
$FullDump = Join-Path $OutputDir "full-codebase-dump.txt"
$ProjectTree = Join-Path $OutputDir "project-tree.txt"

Write-Dump $BackendFiles $BackendDump @("backend")
Write-Dump $FrontendFiles $FrontendDump @("front-end/wellness-app")
Write-Dump $AllFiles $FullDump @("backend", "front-end/wellness-app")

$treeLines = @(
    "PROJECT TREE"
    "Root: $Root"
    "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
    ""
) + @($AllFiles | ForEach-Object { Get-RelativePath $_.FullName })
[IO.File]::WriteAllLines($ProjectTree, $treeLines, [Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "Codebase dump generated successfully."
Write-Host "Output: $OutputDir"
Write-Host "Backend files: $($BackendFiles.Count)"
Write-Host "Frontend files: $($FrontendFiles.Count)"
Write-Host "Total files: $($AllFiles.Count)"
Write-Host "Full dump: $FullDump"
