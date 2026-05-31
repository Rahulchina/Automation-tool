Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$assetDir = Join-Path $root "assets"
New-Item -ItemType Directory -Force -Path $assetDir | Out-Null

$width = 1280
$height = 720
$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

$rect = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
$background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
  $rect,
  [System.Drawing.Color]::FromArgb(15, 23, 42),
  [System.Drawing.Color]::FromArgb(13, 148, 136),
  [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
)
$graphics.FillRectangle($background, $rect)

$gridPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(42, 255, 255, 255)), 1
for ($x = 0; $x -lt $width; $x += 80) {
  $graphics.DrawLine($gridPen, $x, 0, $x, $height)
}
for ($y = 0; $y -lt $height; $y += 80) {
  $graphics.DrawLine($gridPen, 0, $y, $width, $y)
}

function New-RoundedRectPath([int]$x, [int]$y, [int]$w, [int]$h, [int]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundedRect($brush, [int]$x, [int]$y, [int]$w, [int]$h, [int]$r) {
  $path = New-RoundedRectPath $x $y $w $h $r
  $graphics.FillPath($brush, $path)
  $path.Dispose()
}

function Draw-RoundedRect($pen, [int]$x, [int]$y, [int]$w, [int]$h, [int]$r) {
  $path = New-RoundedRectPath $x $y $w $h $r
  $graphics.DrawPath($pen, $path)
  $path.Dispose()
}

$shadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(65, 0, 0, 0))
$panel = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(242, 255, 255, 255))
$panelSoft = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(218, 248, 250, 252))
$teal = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(20, 184, 166))
$blue = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(59, 130, 246))
$amber = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 158, 11))
$ink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 23, 42))
$muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(71, 85, 105))
$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$linePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(226, 232, 240)), 2
$flowPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(153, 255, 255, 255)), 4
$flowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$flowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round

Fill-RoundedRect $shadow 160 116 960 500 28
Fill-RoundedRect $panel 145 96 960 500 28
Draw-RoundedRect $linePen 145 96 960 500 28

$titleFont = New-Object System.Drawing.Font "Segoe UI", 34, ([System.Drawing.FontStyle]::Bold)
$labelFont = New-Object System.Drawing.Font "Segoe UI", 16, ([System.Drawing.FontStyle]::Regular)
$smallFont = New-Object System.Drawing.Font "Segoe UI", 12, ([System.Drawing.FontStyle]::Bold)

$graphics.DrawString("AI automation command center", $titleFont, $ink, 205, 150)
$graphics.DrawString("Plan, guardrail, simulate, and ship repeatable workflows.", $labelFont, $muted, 209, 200)

$nodes = @(
  @{ X = 210; Y = 285; W = 190; H = 118; C = $teal; T = "Trigger"; D = "Inbox scan" },
  @{ X = 455; Y = 285; W = 190; H = 118; C = $blue; T = "AI classify"; D = "Intent + urgency" },
  @{ X = 700; Y = 285; W = 190; H = 118; C = $amber; T = "Approval"; D = "Human gate" },
  @{ X = 580; Y = 455; W = 250; H = 92; C = $teal; T = "Digest + actions"; D = "Slack, tasks, audit log" }
)

$graphics.DrawLine($flowPen, 400, 344, 455, 344)
$graphics.DrawLine($flowPen, 645, 344, 700, 344)
$graphics.DrawLine($flowPen, 795, 403, 705, 455)

foreach ($node in $nodes) {
  Fill-RoundedRect $panelSoft $node.X $node.Y $node.W $node.H 18
  Draw-RoundedRect $linePen $node.X $node.Y $node.W $node.H 18
  Fill-RoundedRect $node.C ($node.X + 18) ($node.Y + 20) 42 42 12
  $graphics.DrawString($node.T, $smallFont, $ink, ($node.X + 75), ($node.Y + 24))
  $graphics.DrawString($node.D, $labelFont, $muted, ($node.X + 75), ($node.Y + 52))
}

Fill-RoundedRect $white 908 236 140 255 22
Draw-RoundedRect $linePen 908 236 140 255 22
$graphics.DrawString("Live", $smallFont, $muted, 944, 265)
Fill-RoundedRect $teal 940 304 78 14 7
Fill-RoundedRect $blue 940 344 56 14 7
Fill-RoundedRect $amber 940 384 88 14 7
Fill-RoundedRect $teal 940 424 66 14 7

$outPath = Join-Path $assetDir "automation-dashboard.png"
$bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()
