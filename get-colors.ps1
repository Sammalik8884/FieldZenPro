Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile("backend/MytechERP.API/wwwroot/images/mark_logo.png")

$colors = @{}
for ($x = 0; $x -lt $img.Width; $x += 5) {
    for ($y = 0; $y -lt $img.Height; $y += 5) {
        $c = $img.GetPixel($x, $y)
        if ($c.A -gt 128) {
            $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
            if (-not $colors.ContainsKey($hex)) {
                $colors[$hex] = 0
            }
            $colors[$hex]++
        }
    }
}

$colors.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 10 | Format-Table -AutoSize
