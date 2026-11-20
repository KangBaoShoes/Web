#requires -Version 7.0
param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
    [ValidateRange(100, 4000)][int]$MaxDimension = 1200,
    [ValidateRange(1, 100)][int]$JpegQuality = 88
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
$SourceRoot = Join-Path $ProjectRoot '鞋子图片'
$OutputRoot = Join-Path $ProjectRoot 'public/images/catalog'
$ArtifactsRoot = Join-Path $ProjectRoot 'artifacts'
New-Item -ItemType Directory -Path $OutputRoot, $ArtifactsRoot -Force | Out-Null

$CategoryDefinitions = @(
    @{ Id = 'business'; Folder = '商务鞋'; Prefix = 'BS'; English = 'Business style' },
    @{ Id = 'casual'; Folder = '休闲鞋'; Prefix = 'CS'; English = 'Casual style' },
    @{ Id = 'fashion'; Folder = '时尚鞋'; Prefix = 'FS'; English = 'Fashion style' },
    @{ Id = 'sandals'; Folder = '凉鞋'; Prefix = 'SA'; English = 'Sandal style' },
    @{ Id = 'slippers'; Folder = '拖鞋'; Prefix = 'SL'; English = 'Slipper style' }
)
$JpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
$CatalogItems = [System.Collections.Generic.List[object]]::new()
$ManifestItems = [System.Collections.Generic.List[object]]::new()
$CategorySummaries = [System.Collections.Generic.List[object]]::new()

function Get-NaturalKey([string]$Value) {
    return [regex]::Replace($Value.ToLowerInvariant(), '\d+', {
        param($Match)
        $Match.Value.PadLeft(24, '0')
    })
}

function Test-OriginalCode([string]$BaseName) {
    # Preserve explicit alphanumeric model-like filenames. Messaging exports and
    # generic folder names receive display references, never invented model IDs.
    return $BaseName -match '^(?=.*\d)[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$'
}

function Save-Jpeg([System.Drawing.Image]$Image, [string]$Path, [int]$Quality) {
    $Parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
    try {
        $Parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
            [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
        $Image.Save($Path, $JpegCodec, $Parameters)
    }
    finally { $Parameters.Dispose() }
}

function New-CatalogImage([string]$SourcePath, [string]$DestinationPath) {
    $Source = [System.Drawing.Image]::FromFile($SourcePath)
    try {
        $OriginalWidth = $Source.Width
        $OriginalHeight = $Source.Height
        # Honor EXIF orientation before computing the uncropped output size.
        if ($Source.PropertyIdList -contains 274) {
            $Orientation = [BitConverter]::ToUInt16($Source.GetPropertyItem(274).Value, 0)
            $Rotate = switch ($Orientation) {
                2 { [System.Drawing.RotateFlipType]::RotateNoneFlipX }
                3 { [System.Drawing.RotateFlipType]::Rotate180FlipNone }
                4 { [System.Drawing.RotateFlipType]::Rotate180FlipX }
                5 { [System.Drawing.RotateFlipType]::Rotate90FlipX }
                6 { [System.Drawing.RotateFlipType]::Rotate90FlipNone }
                7 { [System.Drawing.RotateFlipType]::Rotate270FlipX }
                8 { [System.Drawing.RotateFlipType]::Rotate270FlipNone }
                default { [System.Drawing.RotateFlipType]::RotateNoneFlipNone }
            }
            $Source.RotateFlip($Rotate)
        }
        $Scale = [Math]::Min(1.0, $MaxDimension / [double][Math]::Max($Source.Width, $Source.Height))
        $Width = [Math]::Max(1, [int][Math]::Round($Source.Width * $Scale))
        $Height = [Math]::Max(1, [int][Math]::Round($Source.Height * $Scale))
        $Bitmap = [System.Drawing.Bitmap]::new($Width, $Height)
        $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
        try {
            $Graphics.Clear([System.Drawing.Color]::White)
            $Graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $Graphics.DrawImage($Source, 0, 0, $Width, $Height)
            Save-Jpeg $Bitmap $DestinationPath $JpegQuality
        }
        finally { $Graphics.Dispose(); $Bitmap.Dispose() }
        return @{ sourceWidth = $OriginalWidth; sourceHeight = $OriginalHeight; width = $Width; height = $Height }
    }
    finally { $Source.Dispose() }
}

function New-ContactSheet($Category, $Items) {
    $Columns = 4
    $CellWidth = 300
    $CellHeight = 255
    $HeaderHeight = 64
    $Rows = [int][Math]::Ceiling($Items.Count / [double]$Columns)
    $Sheet = [System.Drawing.Bitmap]::new($Columns * $CellWidth, $HeaderHeight + $Rows * $CellHeight)
    $Graphics = [System.Drawing.Graphics]::FromImage($Sheet)
    $TitleFont = [System.Drawing.Font]::new('Microsoft YaHei', 18)
    $LabelFont = [System.Drawing.Font]::new('Microsoft YaHei', 11)
    $FileFont = [System.Drawing.Font]::new('Microsoft YaHei', 8)
    $Ink = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(35, 35, 35))
    $Muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(100, 100, 100))
    $Border = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(220, 220, 220))
    $Format = [System.Drawing.StringFormat]::new()
    $Format.Alignment = [System.Drawing.StringAlignment]::Center
    $Format.Trimming = [System.Drawing.StringTrimming]::EllipsisCharacter
    $Format.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap
    try {
        $Graphics.Clear([System.Drawing.Color]::White)
        $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $Graphics.DrawString("$($Category.Folder) / $($Category.Id) — $($Items.Count) photos", $TitleFont, $Ink, 20, 17)
        for ($Index = 0; $Index -lt $Items.Count; $Index++) {
            $Item = $Items[$Index]
            $X = ($Index % $Columns) * $CellWidth
            $Y = $HeaderHeight + [Math]::Floor($Index / $Columns) * $CellHeight
            $Image = [System.Drawing.Image]::FromFile((Join-Path $ProjectRoot "public/images/$($Item.image)"))
            try {
                $Scale = [Math]::Min(276 / [double]$Image.Width, 202 / [double]$Image.Height)
                $Width = [int][Math]::Round($Image.Width * $Scale)
                $Height = [int][Math]::Round($Image.Height * $Scale)
                $ImageX = [int]($X + ($CellWidth - $Width) / 2)
                $ImageY = [int]($Y + (206 - $Height) / 2)
                $Graphics.DrawImage($Image, $ImageX, $ImageY, $Width, $Height)
            }
            finally { $Image.Dispose() }
            $CodeLabel = $Item.code + $(if ($Item.isOriginalCode) { ' · 原文件编号' } else { ' · 展示编号' })
            $Graphics.DrawString($CodeLabel, $LabelFont, $Ink, [System.Drawing.RectangleF]::new($X + 6, $Y + 208, $CellWidth - 12, 23), $Format)
            $Graphics.DrawString([System.IO.Path]::GetFileName($Item.sourceFile), $FileFont, $Muted, [System.Drawing.RectangleF]::new($X + 6, $Y + 232, $CellWidth - 12, 18), $Format)
            $Graphics.DrawRectangle($Border, [int]$X, [int]$Y, $CellWidth - 1, $CellHeight - 1)
        }
        Save-Jpeg $Sheet (Join-Path $ArtifactsRoot "catalog-contact-$($Category.Id).jpg") 90
    }
    finally {
        $Format.Dispose(); $Border.Dispose(); $Muted.Dispose(); $Ink.Dispose()
        $FileFont.Dispose(); $LabelFont.Dispose(); $TitleFont.Dispose()
        $Graphics.Dispose(); $Sheet.Dispose()
    }
}

foreach ($Category in $CategoryDefinitions) {
    $CategorySource = Join-Path $SourceRoot $Category.Folder
    if (-not (Test-Path -LiteralPath $CategorySource -PathType Container)) { throw "Missing source folder: $CategorySource" }
    $Files = @(Get-ChildItem -LiteralPath $CategorySource -File -Recurse |
        Where-Object { $_.Extension.ToLowerInvariant() -in @('.jpg', '.jpeg', '.png') } |
        Sort-Object @{ Expression = { if (Test-OriginalCode $_.BaseName) { 0 } else { 1 } } },
                    @{ Expression = { Get-NaturalKey $_.BaseName } },
                    @{ Expression = { $_.FullName } })
    $CategoryOutput = Join-Path $OutputRoot $Category.Id
    New-Item -ItemType Directory -Path $CategoryOutput -Force | Out-Null
    $CategoryItems = [System.Collections.Generic.List[object]]::new()
    $DisplayIndex = 0
    $StyleIndex = 0
    $UsedSlugs = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($File in $Files) {
        $StyleIndex++
        $IsOriginalCode = Test-OriginalCode $File.BaseName
        if ($IsOriginalCode) { $Code = $File.BaseName }
        else { $DisplayIndex++; $Code = '{0}-{1:D3}' -f $Category.Prefix, $DisplayIndex }
        $Slug = ($Code.ToLowerInvariant() -replace '[^a-z0-9-]', '-')
        if (-not $UsedSlugs.Add($Slug)) { throw "Duplicate catalogue filename: $($Category.Id)/$Slug" }
        $ImagePath = "catalog/$($Category.Id)/$Slug.jpg"
        $Destination = Join-Path $ProjectRoot "public/images/$ImagePath"
        $Dimensions = New-CatalogImage $File.FullName $Destination
        $SourceRelative = [System.IO.Path]::GetRelativePath($ProjectRoot, $File.FullName).Replace('\', '/')
        $Item = [pscustomobject][ordered]@{
            id = "$($Category.Id)-$Slug"
            category = $Category.Id
            code = $Code
            isOriginalCode = [bool]$IsOriginalCode
            name = [ordered]@{ zh = ('{0} {1:D2}' -f $Category.Folder, $StyleIndex); en = ('{0} {1:D2}' -f $Category.English, $StyleIndex) }
            image = $ImagePath
            sourceFile = $SourceRelative
        }
        $CatalogItems.Add($Item)
        $CategoryItems.Add($Item)
        $ManifestItems.Add([pscustomobject][ordered]@{
            id = $Item.id; category = $Item.category; code = $Code; isOriginalCode = [bool]$IsOriginalCode
            sourceFile = $SourceRelative; sourceBytes = $File.Length
            sourceSha256 = (Get-FileHash -LiteralPath $File.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
            sourceWidth = $Dimensions.sourceWidth; sourceHeight = $Dimensions.sourceHeight
            image = $ImagePath; width = $Dimensions.width; height = $Dimensions.height
            imageBytes = (Get-Item -LiteralPath $Destination).Length
        })
    }
    New-ContactSheet $Category $CategoryItems
    $CategorySummaries.Add([pscustomobject][ordered]@{
        category = $Category.Id; sourceFolder = "鞋子图片/$($Category.Folder)"; count = $Files.Count
        originalCodeCount = @($CategoryItems | Where-Object { $_.isOriginalCode }).Count
        sourceBytes = [long]($Files | Measure-Object Length -Sum).Sum
        imageBytes = [long]($ManifestItems | Where-Object { $_.category -eq $Category.Id } | Measure-Object imageBytes -Sum).Sum
        contactSheet = "artifacts/catalog-contact-$($Category.Id).jpg"
    })
}

$Utf8 = [System.Text.UTF8Encoding]::new($false)
$CatalogHeader = @'
// Generated by scripts/import-catalog.ps1. Source photos remain unchanged.
// Codes flagged isOriginalCode come from source filenames, not verified factory records.
// Other codes are display references only, not factory model numbers.
export type CatalogCategory = "business" | "casual" | "fashion" | "sandals" | "slippers";
export type CatalogItem = {
  id: string;
  category: CatalogCategory;
  code: string;
  isOriginalCode: boolean;
  name: { zh: string; en: string };
  image: string;
  sourceFile: string;
};

export const catalogItems: CatalogItem[] =
'@
$CatalogJson = ConvertTo-Json -InputObject $CatalogItems.ToArray() -Depth 8
[System.IO.File]::WriteAllText((Join-Path $ProjectRoot 'src/catalog.ts'), $CatalogHeader + "`n" + $CatalogJson + ";`n", $Utf8)
$Manifest = [ordered]@{
    generatedAt = [DateTimeOffset]::UtcNow.ToString('o')
    sourceRoot = '鞋子图片'
    processing = [ordered]@{ maxDimension = $MaxDimension; jpegQuality = $JpegQuality; cropped = $false; upscaled = $false; sourceFilesModified = $false }
    codePolicy = 'Explicit alphanumeric source filenames are retained as references; generic filenames receive display IDs, not factory model numbers.'
    totalItems = $CatalogItems.Count
    sourceBytes = [long]($ManifestItems | Measure-Object sourceBytes -Sum).Sum
    imageBytes = [long]($ManifestItems | Measure-Object imageBytes -Sum).Sum
    categories = $CategorySummaries.ToArray()
    items = $ManifestItems.ToArray()
}
[System.IO.File]::WriteAllText((Join-Path $ArtifactsRoot 'catalog-manifest.json'), (ConvertTo-Json -InputObject $Manifest -Depth 10) + "`n", $Utf8)
$CategorySummaries | Format-Table category, count, originalCodeCount, sourceBytes, imageBytes, contactSheet
Write-Output "Imported $($CatalogItems.Count) images. Source bytes: $($Manifest.sourceBytes); website image bytes: $($Manifest.imageBytes)."
