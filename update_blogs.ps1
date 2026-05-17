$ErrorActionPreference = "Stop"
$htmlFiles = Get-ChildItem -Path "frontend/public" -Filter "*.html" | Where-Object { $_.Name -ne "index.html" -and $_.Name -ne "blog.html" -and $_.Name -ne "landing.html" -and $_.Name -ne "privacy.html" -and $_.Name -ne "terms.html" -and $_.Name -ne "about.html" -and $_.Name -ne "careers.html" -and $_.Name -ne "changelog.html" -and $_.Name -ne "gdpr.html" -and $_.Name -ne "security.html" -and $_.Name -ne "roadmap.html" }

$dates = @()
$startDate = [datetime]"2025-09-01"
for ($i = 0; $i -lt $htmlFiles.Count; $i++) {
    # Distribute dates evenly over 270 days (approx 9 months)
    $daysToAdd = [math]::Round(($i / $htmlFiles.Count) * 270)
    $dateStr = $startDate.AddDays($daysToAdd).ToString("MMMM d, yyyy")
    $dates += $dateStr
}

$externalLinks = @(
    '<a href="https://www.ibisworld.com" target="_blank" rel="noopener noreferrer">IBISWorld Industry Reports</a>',
    '<a href="https://www.bls.gov" target="_blank" rel="noopener noreferrer">Bureau of Labor Statistics</a>',
    '<a href="https://www.gartner.com" target="_blank" rel="noopener noreferrer">Gartner Software Research</a>',
    '<a href="https://www.statista.com" target="_blank" rel="noopener noreferrer">Statista Market Data</a>',
    '<a href="https://www.forbes.com/advisor/business/" target="_blank" rel="noopener noreferrer">Forbes Advisor for Business</a>',
    '<a href="https://www.sba.gov" target="_blank" rel="noopener noreferrer">Small Business Administration</a>'
)

$fileNames = $htmlFiles | Select-Object -ExpandProperty Name
$fileTitles = @{}

# First pass: extract titles for internal linking
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match '<title>(.*?)</title>') {
        $fileTitles[$file.Name] = $matches[1].Replace("FieldZenPro: ", "").Replace(" | FieldZenPro", "")
    } else {
        $fileTitles[$file.Name] = $file.Name.Replace("-", " ").Replace(".html", "")
    }
}

$random = New-Object System.Random

$i = 0
foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.Name)..."
    $content = Get-Content $file.FullName -Raw

    # 1. Author replacement
    $content = $content -replace '<div class="author-avatar">FZ</div>', '<div class="author-avatar">MU</div>'
    $content = $content -replace 'FieldZenPro Editorial Team', 'Muhammad Usama'

    # 2. Date replacement (replace any existing date span in author-info)
    $newDate = $dates[$i]
    $content = $content -replace '<span>(May 2026|[^<]+) · \d+ min read</span>', "<span>$newDate &middot; 7 min read</span>"

    # 3. Add screenshots (after first H2)
    $imgHtml = "`n  <img src=`"/products/dashboard-preview.png`" alt=`"FieldZenPro Dashboard showing schedule and work orders`" style=`"max-width:100%; border-radius:12px; margin: 2rem 0; box-shadow: 0 10px 30px rgba(0,0,0,0.1);`" />`n"
    if ($content -notmatch 'dashboard-preview.png') {
        # Find first </h2> and insert after it
        $h2Pos = $content.IndexOf("</h2>")
        if ($h2Pos -gt 0) {
            $insertPos = $h2Pos + 5
            $content = $content.Substring(0, $insertPos) + $imgHtml + $content.Substring($insertPos)
        }
    }

    # 4. Add Internal and External Links section before CTA box
    if ($content -notmatch '<h3>Related Articles &amp; Resources</h3>') {
        # Pick 3 random internal links
        $internalHtml = "<ul>`n"
        $usedIndexes = @($i) # Don't link to self
        for ($j = 0; $j -lt 3; $j++) {
            $randIdx = $random.Next(0, $htmlFiles.Count)
            while ($usedIndexes -contains $randIdx) {
                $randIdx = $random.Next(0, $htmlFiles.Count)
            }
            $usedIndexes += $randIdx
            
            $targetFile = $htmlFiles[$randIdx].Name
            $targetTitle = $fileTitles[$targetFile]
            $internalHtml += "    <li><a href=`"/$($targetFile.Replace('.html',''))`">$targetTitle</a></li>`n"
        }
        
        # Pick 2 random external links
        $extIdx1 = $random.Next(0, $externalLinks.Count)
        $extIdx2 = $random.Next(0, $externalLinks.Count)
        while ($extIdx1 -eq $extIdx2) { $extIdx2 = $random.Next(0, $externalLinks.Count) }
        
        $internalHtml += "    <li>Industry Data: $($externalLinks[$extIdx1])</li>`n"
        $internalHtml += "    <li>Business Resource: $($externalLinks[$extIdx2])</li>`n"
        $internalHtml += "  </ul>`n"

        $resourcesSection = "`n  <div class=`"resources-section`" style=`"margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border);`">`n    <h3>Related Articles &amp; Resources</h3>`n    $internalHtml  </div>`n"
        
        $ctaPos = $content.IndexOf('<div class="cta-box">')
        if ($ctaPos -gt 0) {
            $content = $content.Substring(0, $ctaPos) + $resourcesSection + $content.Substring($ctaPos)
        }
    }

    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    $i++
}
Write-Host "Done processing $($htmlFiles.Count) articles."
