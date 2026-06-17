<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$cfg = lcars_config();
lcars_cors($cfg);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    lcars_json(['error' => 'POST required'], 405);
}

$data = json_decode(file_get_contents('php://input') ?: '', true);

if (!is_array($data)) {
    lcars_json(['error' => 'Invalid JSON body'], 400);
}

$apps = $data['apps'] ?? [];
if (!is_array($apps)) {
    lcars_json(['error' => 'Missing apps array'], 400);
}

$max = (int)($cfg['max_apps'] ?? 1000);
if (count($apps) > $max) {
    lcars_json(['error' => 'Too many apps'], 400);
}

$out = [];
foreach ($apps as $app) {
    if (!is_array($app)) continue;

    $pkg = trim((string)($app['package'] ?? ''));
    if ($pkg === '' || !preg_match('/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)+$/', $pkg)) {
        continue;
    }

    $component = trim((string)($app['component'] ?? ''));
    if ($component !== '' && !preg_match('/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)+\/[^\s]+$/', $component)) {
        $component = '';
    }

    $label = mb_substr(trim((string)($app['label'] ?? '')), 0, 120);
    $category = mb_substr(trim((string)($app['category'] ?? 'unknown')), 0, 40);
    $source = mb_substr(trim((string)($app['source'] ?? 'unknown')), 0, 40);

    $out[] = [
        'label' => $label,
        'package' => $pkg,
        'component' => $component,
        'category' => $category ?: 'unknown',
        'source' => $source ?: 'unknown'
    ];
}

lcars_ensure_jobs_dir();

$record = [
    'submitted_at' => gmdate('c'),
    'source' => 'lcars-icon-generator',
    'count' => count($out),
    'apps' => $out
];

$line = json_encode($record, JSON_UNESCAPED_SLASHES) . "\n";
file_put_contents(lcars_jobs_dir() . '/contributions.jsonl', $line, FILE_APPEND | LOCK_EX);

lcars_json(['ok' => true, 'accepted' => count($out)]);
