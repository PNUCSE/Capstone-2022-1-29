<?php
$server = "112.153.143.250:3306";
$username = "root";
$password = "root";
$db = "project";

$connect = new mysqli($server, $username, $password, $db);

if(!connect){
	die("Connection Failed.". mysqli_connect_error());
}
$sql = "select name, data from json";;
$result = mysqli_query($connect, $sql);

if(mysqli_num_rows($result)>0){
    while($row = mysqli_fetch_assoc($result)) {
        echo "name:".$row['name']."|data:".$row['data'].";";
    }
}
?>
