<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$cfg = lcars_config();
lcars_require_callback_auth($cfg);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') lcars_json(['error' => 'POST required'], 405);

$data = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($data)) lcars_json(['error' => 'Invalid JSON body'], 400);

$job_id = (string)($data['job_id'] ?? '');
$status = (string)($data['status'] ?? '');
if (!lcars_valid_job_id($job_id)) lcars_json(['error' => 'Invalid job_id'], 400);
if (!in_array($status, ['queued', 'building', 'done', 'failed'], true)) lcars_json(['error' => 'Invalid status'], 400);

$extra = [];
if (isset($data['message'])) $extra['message'] = (string)$data['message'];

lcars_update_status($job_id, $status, $extra);
lcars_json(['ok' => true, 'job_id' => $job_id, 'status' => $status]);
