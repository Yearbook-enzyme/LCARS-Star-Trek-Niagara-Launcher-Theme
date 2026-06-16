<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$cfg = lcars_config();
lcars_cors($cfg);

$job_id = (string)($_GET['job_id'] ?? '');
$dir = lcars_job_dir($job_id);
$status = lcars_read_json($dir . '/status.json');

if (($status['status'] ?? '') === 'done' && file_exists($dir . '/lcars-niagara-icon-pack.apk')) {
    $status['download_url'] = lcars_base_url($cfg) . '/download.php?job_id=' . rawurlencode($job_id);
}

lcars_json($status);
