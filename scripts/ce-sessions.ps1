#Requires -Version 5.1
<#
.SYNOPSIS
  Windows wrapper for Compound Engineering ce-sessions (Cursor-first).

.DESCRIPTION
  Discovers recent Cursor agent transcripts for this repo and runs the plugin's
  extract-metadata.py. Use when bash on PATH is the WSL stub or unavailable.

  Examples:
    pwsh -File scripts/ce-sessions.ps1
    pwsh -File scripts/ce-sessions.ps1 -Days 14 -Keyword "RLS,set_logs"
    pwsh -File scripts/ce-sessions.ps1 -Platform all
#>
[CmdletBinding()]
param(
    [string] $RepoName = 'nexus',
    [int] $Days = 7,
    [ValidateSet('cursor', 'claude', 'codex', 'all')]
    [string] $Platform = 'cursor',
    [string] $Keyword = '',
    [string] $ScriptsDir = ''
)

$ErrorActionPreference = 'Stop'
$env:PYTHONUTF8 = '1'

function Get-RepoFolderName {
    try {
        $root = git rev-parse --show-toplevel 2>$null
        if ($root) { return (Split-Path -Leaf $root) }
    } catch { }
    return $null
}

function Get-CeSessionsScriptsDir {
    if ($ScriptsDir -and (Test-Path (Join-Path $ScriptsDir 'extract-metadata.py'))) {
        return (Resolve-Path $ScriptsDir).Path
    }
    if ($env:CE_SESSIONS_SCRIPTS -and (Test-Path (Join-Path $env:CE_SESSIONS_SCRIPTS 'extract-metadata.py'))) {
        return (Resolve-Path $env:CE_SESSIONS_SCRIPTS).Path
    }
    $pluginBase = Join-Path $env:USERPROFILE '.cursor\plugins\cache\cursor-public\compound-engineering'
    if (Test-Path $pluginBase) {
        $candidates = Get-ChildItem -Path $pluginBase -Directory -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending
        foreach ($dir in $candidates) {
            $scripts = Join-Path $dir.FullName 'skills\ce-sessions\scripts'
            if (Test-Path (Join-Path $scripts 'extract-metadata.py')) {
                return $scripts
            }
        }
    }
    throw @"
ce-sessions scripts not found. Install the Compound Engineering Cursor plugin, or set:
  `$env:CE_SESSIONS_SCRIPTS = '<path-to>/skills/ce-sessions/scripts'
"@
}

function Get-GitBashExe {
    $candidates = @(
        "${env:ProgramFiles}\Git\bin\bash.exe",
        "${env:ProgramFiles(x86)}\Git\bin\bash.exe"
    )
    foreach ($path in $candidates) {
        if (Test-Path $path) { return $path }
    }
    return $null
}

function Get-CursorTranscriptPaths {
    param([string] $Name, [int] $WindowDays)
    $cutoff = (Get-Date).AddDays(-$WindowDays)
    $base = Join-Path $env:USERPROFILE '.cursor\projects'
    if (-not (Test-Path $base)) { return @() }

    Get-ChildItem -Path $base -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like "*$Name*" } |
        ForEach-Object {
            $transcripts = Join-Path $_.FullName 'agent-transcripts'
            if (-not (Test-Path $transcripts)) { return }
            Get-ChildItem -Path $transcripts -Recurse -Filter '*.jsonl' -File -ErrorAction SilentlyContinue |
                Where-Object { $_.LastWriteTime -ge $cutoff }
        } |
        Select-Object -ExpandProperty FullName
}

function Get-PathsViaDiscoverScript {
    param(
        [string] $BashExe,
        [string] $Scripts,
        [string] $Name,
        [int] $WindowDays,
        [string] $Plat
    )
    $unixScripts = ($Scripts -replace '\\', '/')
    $argPlatform = if ($Plat -eq 'all') { 'all' } else { $Plat }
    $cmd = "bash '$unixScripts/discover-sessions.sh' '$Name' $WindowDays --platform $argPlatform"
    $raw = & $BashExe -c $cmd 2>$null
    if (-not $raw) { return @() }
    @($raw) | Where-Object { $_ -and (Test-Path $_) }
}

$folder = Get-RepoFolderName
if ($folder) { $RepoName = $folder }

$scriptsPath = Get-CeSessionsScriptsDir
$extractMeta = Join-Path $scriptsPath 'extract-metadata.py'
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    throw 'python not found on PATH (required for extract-metadata.py).'
}

$paths = [System.Collections.Generic.List[string]]::new()

if ($Platform -eq 'cursor' -or $Platform -eq 'all') {
    foreach ($p in (Get-CursorTranscriptPaths -Name $RepoName -WindowDays $Days)) {
        [void]$paths.Add($p)
    }
}

if ($Platform -in @('claude', 'codex', 'all')) {
    $bash = Get-GitBashExe
    if ($bash) {
        $plat = if ($Platform -eq 'all') { 'all' } else { $Platform }
        foreach ($p in (Get-PathsViaDiscoverScript -BashExe $bash -Scripts $scriptsPath -Name $RepoName -WindowDays $Days -Plat $plat)) {
            if ($paths -notcontains $p) { [void]$paths.Add($p) }
        }
    } elseif ($Platform -ne 'cursor') {
        Write-Warning "Git Bash not found; skipping platform '$Platform'. Install Git for Windows or use -Platform cursor."
    }
}

if ($paths.Count -eq 0) {
    & $python.Source $extractMeta '--cwd-filter' $RepoName
    exit $LASTEXITCODE
}

$metaArgs = @($extractMeta, '--cwd-filter', $RepoName)
if ($Keyword) {
    $metaArgs += @('--keyword', $Keyword)
}
$metaArgs += $paths.ToArray()

& $python.Source @metaArgs
exit $LASTEXITCODE
