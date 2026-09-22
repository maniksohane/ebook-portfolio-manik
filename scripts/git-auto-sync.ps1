param([ValidateSet('Start','Stop','Status','Install','Uninstall')][string]$Action = 'Status')
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$watcher = Join-Path $PSScriptRoot 'git-auto-sync.cjs'
$nodePath = (Get-Command node -CommandType Application).Source
$gitDirText = & git -C $repoRoot rev-parse --git-dir
if ($LASTEXITCODE -ne 0) { throw 'The project must be a Git repository.' }
$gitDir = [IO.Path]::GetFullPath((Join-Path $repoRoot $gitDirText))
$pidFile = Join-Path $gitDir 'auto-sync.pid'
$startupLink = Join-Path ([Environment]::GetFolderPath('Startup')) 'Ebook portfolio GitHub sync.lnk'

function Get-Watcher {
    if (-not (Test-Path -LiteralPath $pidFile)) { return $null }
    $watcherId = 0
    if (-not [int]::TryParse((Get-Content -LiteralPath $pidFile -Raw).Trim(), [ref]$watcherId)) { return $null }
    $candidate = Get-CimInstance Win32_Process -Filter "ProcessId=$watcherId" -ErrorAction SilentlyContinue
    if ($candidate -and $candidate.Name -eq 'node.exe' -and $candidate.CommandLine.Contains($watcher)) { return $candidate }
    return $null
}

function Start-Watcher {
    $running = Get-Watcher
    if ($running) { Write-Output "Auto-sync is already running (PID $($running.ProcessId))."; return }
    & $nodePath $watcher --check
    if ($LASTEXITCODE -ne 0) { throw 'Safety check failed; auto-sync was not started.' }
    Start-Process -FilePath $nodePath -ArgumentList ('"' + $watcher + '"') -WorkingDirectory $repoRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $gitDir 'auto-sync.log') -RedirectStandardError (Join-Path $gitDir 'auto-sync-error.log') | Out-Null
    Write-Output 'Auto-sync started. Saved changes will be pushed after 15 quiet seconds.'
}

function Stop-Watcher {
    $running = Get-Watcher
    if (-not $running) { Write-Output 'Auto-sync is not running.'; return }
    [IO.File]::WriteAllText((Join-Path $gitDir 'auto-sync.stop'), 'stop')
    # Let any in-progress commit/push finish before reporting that sync is paused.
    $deadline = (Get-Date).AddSeconds(30)
    while ((Get-Watcher) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 500 }
    if (Get-Watcher) { throw 'Stop requested; a Git operation is still finishing. Check Status shortly.' }
    Write-Output 'Auto-sync stopped.'
}

switch ($Action) {
    'Start' { Start-Watcher }
    'Stop' { Stop-Watcher }
    'Status' {
        $running = Get-Watcher
        if ($running) { Write-Output "Auto-sync is running (PID $($running.ProcessId))." }
        else { Write-Output 'Auto-sync is stopped.' }
        Write-Output "Starts at Windows sign-in: $(Test-Path -LiteralPath $startupLink)"
        $stateFile = Join-Path $gitDir 'auto-sync-state.json'
        if (Test-Path -LiteralPath $stateFile) {
            $state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
            Write-Output "Last check: $($state.at) - $($state.message)"
        }
    }
    'Install' {
        Start-Watcher
        $shell = New-Object -ComObject WScript.Shell
        $shortcut = $shell.CreateShortcut($startupLink)
        $shortcut.TargetPath = Join-Path $PSHOME 'powershell.exe'
        $shortcut.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $PSCommandPath + '" -Action Start'
        $shortcut.WorkingDirectory = $repoRoot
        $shortcut.WindowStyle = 7
        $shortcut.Description = 'Commit and push saved ebook portfolio source files to GitHub.'
        $shortcut.Save()
        Write-Output 'Enabled automatic sync at Windows sign-in for this user.'
    }
    'Uninstall' {
        Stop-Watcher
        if (Test-Path -LiteralPath $startupLink) { Remove-Item -LiteralPath $startupLink }
        Write-Output 'Auto-sync stopped and Windows startup entry removed.'
    }
}
