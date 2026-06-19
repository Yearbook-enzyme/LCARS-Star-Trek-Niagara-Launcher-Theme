<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$cfg = lcars_config();
lcars_cors($cfg);

$expected = (string)($cfg['callback_token'] ?? '');
$provided = (string)($_GET['token'] ?? '');

$auth = (string)($_SERVER['HTTP_AUTHORIZATION'] ?? '');
if (preg_match('/Bearer\s+(.+)/i', $auth, $m)) {
    $provided = trim($m[1]);
}

if ($expected === '' || !hash_equals($expected, $provided)) {
    lcars_json(['error' => 'Unauthorized'], 401);
}

lcars_ensure_jobs_dir();
$file = lcars_jobs_dir() . '/contributions.jsonl';

header('Content-Type: application/x-ndjson; charset=utf-8');

if (!is_file($file)) {
    exit;
}

readfile($file);
