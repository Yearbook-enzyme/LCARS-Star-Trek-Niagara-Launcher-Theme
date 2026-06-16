<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$job_id = (string)($_GET['job_id'] ?? '');
$token = (string)($_GET['token'] ?? '');
$dir = lcars_job_dir($job_id);
$meta = lcars_read_json($dir . '/meta.json');

$expected = (string)($meta['job_token'] ?? '');
if (!$expected || !$token || !hash_equals($expected, $token)) lcars_json(['error' => 'Unauthorized'], 401);

header('Content-Type: application/json; charset=utf-8');
readfile($dir . '/job.json');
