<?
header('Content-Type: audio/mpeg');
$file=$_GET["audio"];
 if(!file_exists($file)){$file="silence.mp3";}
print_r(file_get_contents($file));
?>
