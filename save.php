<?


//print_r($_POST);
$fileName ="json/".$_POST['room'].".json";
$JSON=json_decode(file_get_contents($fileName));

foreach($JSON->targets as $value){

if($value->Name==$_POST['name']){
if($_POST['textType']=="preText"){
    $value->preText[$_POST['phase']]=$_POST['text'];
}else{
  $value->postText[$_POST['phase']]=$_POST['text'];
}

}


}
file_put_contents($fileName,json_encode($JSON));
print_r($fileName);
print_r(json_encode($JSON));



?>
 
