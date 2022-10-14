<?php
$server = "112.153.143.250:3306";
$username = "root";
$password = "root";
$db = "project";

$connect = new mysqli($server, $username, $password, $db);

$name = $_POST['addname'];
$data = $_POST['adddata'];

$sql = "insert into json (name, data) values ('".$name."','".$data."')";
$result = mysqli_query($connect, $sql);

?>
