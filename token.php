<?php
$token = uniqid(); // base64_encode(date("Ymdh"));
$out = new stdClass();
$out->token = $token;

file_put_contents(".tokens/{$token}", json_encode($_SERVER));

header("Content-Type: application/json");
print json_encode($out);

?>
