<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$cfg = lcars_config();
lcars_cors($cfg);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') lcars_json(['error' => 'POST required'], 405);

$job = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($job)) lcars_json(['error' => 'Invalid JSON body'], 400);

lcars_validate_job($job, $cfg);
lcars_ensure_jobs_dir();

$job_id = bin2hex(random_bytes(16));
$job_token = bin2hex(random_bytes(24));
$dir = lcars_job_dir($job_id);
mkdir($dir, 0755, true);

$now = gmdate('c');
$base = lcars_base_url($cfg);

lcars_write_json($dir . '/job.json', $job);
lcars_write_json($dir . '/meta.json', ['job_id' => $job_id, 'job_token' => $job_token, 'created_at' => $now]);
lcars_write_json($dir . '/status.json', ['job_id' => $job_id, 'status' => 'queued', 'message' => 'Build queued', 'created_at' => $now, 'updated_at' => $now]);

$job_url = $base . '/job.php?job_id=' . rawurlencode($job_id) . '&token=' . rawurlencode($job_token);

$api = 'https://api.github.com/repos/' . rawurlencode($cfg['github_owner']) . '/' . rawurlencode($cfg['github_repo']) . '/actions/workflows/' . rawurlencode($cfg['github_workflow']) . '/dispatches';

$payload = [
    'ref' => $cfg['github_branch'] ?? 'main',
    'inputs' => [
        'job_source' => 'cpanel',
        'job_url' => $job_url,
        'job_id' => $job_id,
        'status_url' => $base . '/status-update.php',
        'upload_url' => $base . '/upload.php'
    ]
];

$ch = curl_init($api);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Accept: application/vnd.github+json',
        'Authorization: Bearer ' . $cfg['github_token'],
        'Content-Type: application/json',
        'User-Agent: LCARS-Niagara-Builder'
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
    CURLOPT_TIMEOUT => 25
]);

$response = curl_exec($ch);
$code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($response === false || $code < 200 || $code >= 300) {
    lcars_update_status($job_id, 'failed', ['message' => 'Could not trigger GitHub Actions', 'github_http_code' => $code, 'github_response' => $response, 'curl_error' => $error]);
    lcars_json(['error' => 'Could not trigger GitHub Actions', 'job_id' => $job_id, 'github_http_code' => $code, 'github_response' => $response, 'curl_error' => $error], 502);
}

lcars_json(['job_id' => $job_id, 'status' => 'queued', 'status_url' => $base . '/status.php?job_id=' . rawurlencode($job_id)], 202);
