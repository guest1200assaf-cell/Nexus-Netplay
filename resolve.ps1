$files = git ls-files
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "<<<<<<< HEAD") {
            $pattern = "(?s)<<<<<<< HEAD\r?\n(.*?)\r?\n=======\r?\n.*?\r?\n>>>>>>> [^\r\n]*(\r?\n)?"
            $resolved = [regex]::Replace($content, $pattern, '$1$2')
            [IO.File]::WriteAllText((Get-Item $file).FullName, $resolved)
            Write-Host "Resolved $file"
        }
    }
}
