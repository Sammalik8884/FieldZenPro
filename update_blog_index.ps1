$blogFile = "frontend/public/blog.html"
$content = Get-Content -Path $blogFile -Raw

# 1. Update the dates of the existing articles
$htmlFiles = Get-ChildItem -Path "frontend/public" -Filter "*.html" | Where-Object { $_.Name -ne "index.html" -and $_.Name -ne "blog.html" -and $_.Name -ne "landing.html" -and $_.Name -ne "privacy.html" -and $_.Name -ne "terms.html" -and $_.Name -ne "about.html" -and $_.Name -ne "careers.html" -and $_.Name -ne "changelog.html" -and $_.Name -ne "gdpr.html" -and $_.Name -ne "security.html" -and $_.Name -ne "roadmap.html" }

foreach ($file in $htmlFiles) {
    $fileContent = Get-Content -Path $file.FullName -Raw
    # Extract the date from the file
    if ($fileContent -match '<span>([^&]+) &middot; 7 min read</span>') {
        $date = $matches[1]
        
        # In blog.html, find the link to this file and replace the date
        $pattern = '(?s)<a href="' + $file.Name + '".*?<span class="post-meta">.*?</span></a>'
        if ($content -match $pattern) {
            $matchedStr = $matches[0]
            $newStr = $matchedStr -replace '<span class="post-meta">.*?</span>', "<span class=`"post-meta`">$date</span>"
            $content = $content.Replace($matchedStr, $newStr)
        }
    }
}

# 2. Add the new "Comparisons & Alternatives" category with the 8 new articles
if ($content -notmatch 'Comparisons &amp; Alternatives') {
    $newCategory = @"
  <div class="category-section">
    <h2>Comparisons &amp; Alternatives</h2>
    <div class="post-grid">
      <a href="jobber-alternative.html" class="post-card"><span class="post-tag">Comparison</span><h3>Jobber Alternative for Field Service Teams</h3><span class="post-meta">May 19, 2026</span></a>
      <a href="servicetitan-too-expensive.html" class="post-card"><span class="post-tag">Pricing</span><h3>Why ServiceTitan Is Too Expensive</h3><span class="post-meta">May 19, 2026</span></a>
      <a href="field-service-software-small-business-not-servicetitan.html" class="post-card"><span class="post-tag">Alternatives</span><h3>Best FSM for Small Businesses (Not ServiceTitan)</h3><span class="post-meta">May 19, 2026</span></a>
      <a href="housecall-pro-alternative.html" class="post-card"><span class="post-tag">Comparison</span><h3>Housecall Pro vs FieldZenPro: Honest Comparison</h3><span class="post-meta">May 19, 2026</span></a>
      <a href="servicetitan-vs-fieldzenpro.html" class="post-card"><span class="post-tag">Comparison</span><h3>ServiceTitan vs FieldZenPro for HVAC Companies</h3><span class="post-meta">May 19, 2026</span></a>
      <a href="jobber-vs-fieldzenpro.html" class="post-card"><span class="post-tag">Comparison</span><h3>Jobber vs FieldZenPro: Which Is Better?</h3><span class="post-meta">May 19, 2026</span></a>
      <a href="free-field-service-software.html" class="post-card"><span class="post-tag">Budget</span><h3>Best Free Field Service Software</h3><span class="post-meta">May 19, 2026</span></a>
      <a href="switch-from-jobber.html" class="post-card"><span class="post-tag">Migration</span><h3>How to Switch from Jobber Without Losing Data</h3><span class="post-meta">May 19, 2026</span></a>
    </div>
  </div>
"@
    
    # Insert before the last </div>
    $insertPos = $content.LastIndexOf('</div>')
    $content = $content.Substring(0, $insertPos) + "`n" + $newCategory + "`n" + $content.Substring($insertPos)
}

Set-Content -Path $blogFile -Value $content -Encoding UTF8
Write-Host "blog.html updated."
