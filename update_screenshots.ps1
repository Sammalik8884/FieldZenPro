$htmlFiles = Get-ChildItem -Path "frontend/public" -Filter "*.html" | Where-Object { $_.Name -ne "index.html" -and $_.Name -ne "blog.html" -and $_.Name -ne "landing.html" -and $_.Name -ne "privacy.html" -and $_.Name -ne "terms.html" -and $_.Name -ne "about.html" -and $_.Name -ne "careers.html" -and $_.Name -ne "changelog.html" -and $_.Name -ne "gdpr.html" -and $_.Name -ne "security.html" -and $_.Name -ne "roadmap.html" }

$images = Get-ChildItem -Path "frontend/public/products" -Filter "*.PNG" | Select-Object -ExpandProperty Name
$random = New-Object System.Random

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Pick a random image
    $randIdx = $random.Next(0, $images.Count)
    $imageName = $images[$randIdx]
    
    # URL encode the image name for the src attribute
    $encodedImageName = [uri]::EscapeDataString($imageName)
    
    # Replace the placeholder src
    if ($content -match 'src="/products/dashboard-preview.png"') {
        $content = $content -replace 'src="/products/dashboard-preview.png"', "src=`"/products/$encodedImageName`""
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Updated $($file.Name) with image $imageName"
    }
}
