<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$cfg = lcars_config();
lcars_require_callback_auth($cfg);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') lcars_json(['error' => 'POST required'], 405);

$job_id = (string)($_POST['job_id'] ?? '');
if (!lcars_valid_job_id($job_id)) lcars_json(['error' => 'Invalid job_id'], 400);

$dir = lcars_job_dir($job_id);
if (!is_dir($dir)) lcars_json(['error' => 'Unknown job'], 404);

if (empty($_FILES['apk']) || !is_uploaded_file($_FILES['apk']['tmp_name'])) {
    lcars_json(['error' => 'Missing APK upload'], 400);
}

$dest = $dir . '/lcars-niagara-icon-pack.apk';
if (!move_uploaded_file($_FILES['apk']['tmp_name'], $dest)) lcars_json(['error' => 'Could not store APK'], 500);
chmod($dest, 0644);

$download = lcars_base_url($cfg) . '/download.php?job_id=' . rawurlencode($job_id);
lcars_update_status($job_id, 'done', ['message' => 'APK build complete', 'download_url' => $download, 'apk_size_bytes' => filesize($dest)]);

lcars_json(['ok' => true, 'job_id' => $job_id, 'status' => 'done', 'download_url' => $download]);
