$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$outRoot=Join-Path (Split-Path -Parent $PSScriptRoot) 'assets\library\free-curated\categories'
$assets=@(
  @{id='rock_moss_set_02';cat='vegetation'},
  @{id='shrub_02';cat='vegetation'},
  @{id='fern_02';cat='vegetation'},
  @{id='chinese_screen_panels';cat='interior'},
  @{id='chinese_tea_table';cat='interior'},
  @{id='hinoki_planks';cat='material'},
  @{id='white_stucco_02';cat='material'},
  @{id='wooden_gate';cat='material'},
  @{id='leaves_forest_ground';cat='material'}
)
function Get-Api($uri){
 for($try=1;$try -le 4;$try++){try{return Invoke-RestMethod -Uri $uri -TimeoutSec 40}catch{Write-Output ("API_RETRY "+$try+" "+$_.Exception.Message);if($try -eq 4){throw};Start-Sleep -Seconds (3*$try)}}
}
function Get-FileVerified($n,$file){
 $u=[uri]$n.url
 if($u.Host -ne 'dl.polyhaven.org'){throw "Wrong origin"}
 New-Item -ItemType Directory -Path (Split-Path $file) -Force | Out-Null
 for($try=1;$try -le 5;$try++){
   if(Test-Path -LiteralPath $file){
    if((Get-Item -LiteralPath $file).Length -eq $n.size -and (Get-FileHash -LiteralPath $file -Algorithm MD5).Hash.ToLower() -eq $n.md5){return}
   }
   $part=$file+'.partial'
   if(Test-Path -LiteralPath $part){Remove-Item -LiteralPath $part -Force}
   try{
     Invoke-WebRequest -Uri $u.AbsoluteUri -OutFile $part -TimeoutSec 240
     if((Get-Item -LiteralPath $part).Length -ne $n.size){throw 'Size mismatch'}
     if((Get-FileHash -LiteralPath $part -Algorithm MD5).Hash.ToLower() -ne $n.md5){throw 'MD5 mismatch'}
     Move-Item -LiteralPath $part -Destination $file -Force
     return
   }catch{
     Remove-Item -LiteralPath $part -Force -ErrorAction SilentlyContinue
     Write-Output ("FILE_RETRY "+$try+" "+(Split-Path $file -Leaf)+" "+$_.Exception.Message)
     if($try -eq 5){throw};Start-Sleep -Seconds (3*$try)
   }
 }
}
$ok=0;$bad=0
foreach($asset in $assets){
 $id=$asset.id;$cat=$asset.cat
 $dest=Join-Path $outRoot ($cat+'\polyhaven\'+$id+'_4k')
 try{
  $api=Get-Api ('https://api.polyhaven.com/files/'+$id)
  $root=$api.gltf.'4k'.gltf
  if($null -eq $root){throw "No official 4k glTF source"}
  $records=@([pscustomobject]@{path=($id+'_4k.gltf');node=$root})
  foreach($p in $root.include.PSObject.Properties){$records+=@([pscustomobject]@{path=$p.Name;node=$p.Value})}
  $manifest=[ordered]@{schema='changan-free-source-v1';id=$id;category=$cat;source=('https://polyhaven.com/a/'+$id);license='Poly Haven CC0-1.0';stage='local_acquired_only';approved=$false;integrated=$false;files=@()}
  foreach($r in $records){
   $rel=$r.path.Replace('\','/')
   if($rel.StartsWith('/') -or $rel.Contains('..')){throw "Unsafe path"}
   $output=Join-Path $dest $rel
   Get-FileVerified $r.node $output
   $sha=(Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash.ToLower()
   $manifest.files+=@{path=$rel;bytes=[long]$r.node.size;md5=$r.node.md5;sha256=$sha;url=$r.node.url}
   Write-Output ("OK_FILE;"+$cat+";"+$id+";"+$rel+";"+$r.node.size)
  }
  ($manifest|ConvertTo-Json -Depth 9)|Set-Content -LiteralPath (Join-Path $dest 'manifest.json') -Encoding utf8
  $attributes=@('*.gltf -text','*.bin -text','*.jpg -text','*.png -text')
  $attributes|Set-Content -LiteralPath (Join-Path $dest '.gitattributes') -Encoding utf8
  $readme=@(
    ('# '+$id+' — official CC0 original 4K'),
    '',
    ('Category: '+$cat),
    ('Source: https://polyhaven.com/a/'+$id),
    'License: Poly Haven CC0-1.0',
    'Original files checked against official API MD5 and length, SHA256 in manifest.json.',
    'NOT historically approved for Tang; NOT aesthetically approved; NOT integrated.',
    'Local acquisition only until remote GitHub files are independently confirmed.'
  )
  $readme|Set-Content -LiteralPath (Join-Path $dest 'README.md') -Encoding utf8
  $bytes=($manifest.files|Measure-Object -Property bytes -Sum).Sum
  Write-Output ("DONE_ASSET;"+$cat+";"+$id+";files="+$manifest.files.Count+";bytes="+$bytes)
  $ok++
 }catch{$bad++;Write-Output ("FAILED_ASSET;"+$cat+";"+$id+";"+$_.Exception.Message)}
}
Write-Output ("BATCH_SUMMARY;complete="+$ok+";failed="+$bad)


