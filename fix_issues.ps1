$htmlFiles = Get-ChildItem -Path "frontend/public" -Filter "*.html" | Where-Object { $_.Name -ne "index.html" -and $_.Name -ne "blog.html" -and $_.Name -ne "landing.html" -and $_.Name -ne "privacy.html" -and $_.Name -ne "terms.html" -and $_.Name -ne "about.html" -and $_.Name -ne "careers.html" -and $_.Name -ne "changelog.html" -and $_.Name -ne "gdpr.html" -and $_.Name -ne "security.html" -and $_.Name -ne "roadmap.html" }

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $modified = $false
    
    # 1. Fix image paths to be relative so they work when opening files locally
    if ($content -match 'src="/products/') {
        $content = $content -replace 'src="/products/', 'src="products/'
        $modified = $true
    }
    
    # 2. Fix the "May 2026" issue in the 8 new files
    if ($content -match '<span>May 2026 &middot;') {
        $content = $content -replace '<span>May 2026 &middot;', '<span>May 19, 2026 &middot;'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Fixed $($file.Name)"
    }
}
