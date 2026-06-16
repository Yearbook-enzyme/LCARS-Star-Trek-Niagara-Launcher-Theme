<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$job_id = (string)($_GET['job_id'] ?? '');
$dir = lcars_job_dir($job_id);
$apk = $dir . '/lcars-niagara-icon-pack.apk';

if (!file_exists($apk)) lcars_json(['error' => 'APK not ready'], 404);

header('Content-Type: application/vnd.android.package-archive');
header('Content-Length: ' . filesize($apk));
header('Content-Disposition: attachment; filename="lcars-niagara-icon-pack.apk"');
readfile($apk);
