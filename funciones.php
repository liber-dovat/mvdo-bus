<?php

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true);
print_r($data);

echo file_get_contents('php://input');
// echo json_encode($result);

?>
