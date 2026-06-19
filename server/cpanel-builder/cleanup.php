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

$days = isset($_GET['days']) ? (int)$_GET['days'] : 7;
$days = max(1, min(90, $days));
$dryRun = isset($_GET['dry_run']) && $_GET['dry_run'] !== '0';

$jobsDir = lcars_jobs_dir();
$cutoff = time() - ($days * 86400);

$protected = [
    'contributions.jsonl' => true,
    '.htaccess' => true,
    'index.php' => true
];

$deleted = [];
$skipped = [];
$errors = [];

function lcars_remove_path(string $path): bool {
    if (is_file($path) || is_link($path)) {
        return @unlink($path);
    }

    if (!is_dir($path)) {
        return true;
    }

    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($items as $item) {
        $itemPath = $item->getPathname();

        if ($item->isDir()) {
            if (!@rmdir($itemPath)) return false;
        } else {
            if (!@unlink($itemPath)) return false;
        }
    }

    return @rmdir($path);
}

foreach (scandir($jobsDir) ?: [] as $name) {
    if ($name === '.' || $name === '..') continue;

    if (isset($protected[$name])) {
        $skipped[] = ['name' => $name, 'reason' => 'protected'];
        continue;
    }

    $path = $jobsDir . '/' . $name;
    $mtime = filemtime($path);

    if ($mtime === false || $mtime >= $cutoff) {
        $skipped[] = [
            'name' => $name,
            'reason' => 'newer_than_cutoff',
            'mtime' => $mtime ? date(DATE_ATOM, $mtime) : null
        ];
        continue;
    }

    $entry = [
        'name' => $name,
        'mtime' => date(DATE_ATOM, $mtime)
    ];

    if ($dryRun) {
        $deleted[] = $entry + ['dry_run' => true];
        continue;
    }

    if (lcars_remove_path($path)) {
        $deleted[] = $entry;
    } else {
        $errors[] = $entry + ['error' => 'delete_failed'];
    }
}

lcars_json([
    'ok' => count($errors) === 0,
    'dry_run' => $dryRun,
    'days' => $days,
    'cutoff' => date(DATE_ATOM, $cutoff),
    'deleted_count' => count($deleted),
    'skipped_count' => count($skipped),
    'error_count' => count($errors),
    'deleted' => $deleted,
    'skipped' => $skipped,
    'errors' => $errors
]);
