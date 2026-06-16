<?php
declare(strict_types=1);

function lcars_json(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

function lcars_config(): array {
    $path = __DIR__ . '/config.php';
    if (!file_exists($path)) lcars_json(['error' => 'Missing config.php'], 500);
    $cfg = require $path;
    if (!is_array($cfg)) lcars_json(['error' => 'Invalid config.php'], 500);
    return $cfg;
}

function lcars_cors(array $cfg): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = $cfg['allowed_origins'] ?? [];
    if ($origin && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function lcars_jobs_dir(): string {
    return __DIR__ . '/jobs';
}

function lcars_ensure_jobs_dir(): void {
    $dir = lcars_jobs_dir();
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $deny = $dir . '/.htaccess';
    if (!file_exists($deny)) file_put_contents($deny, "Options -Indexes\nRequire all denied\n");
}

function lcars_valid_job_id(string $job_id): bool {
    return (bool) preg_match('/^[a-f0-9]{32}$/', $job_id);
}

function lcars_job_dir(string $job_id): string {
    if (!lcars_valid_job_id($job_id)) lcars_json(['error' => 'Invalid job_id'], 400);
    return lcars_jobs_dir() . '/' . $job_id;
}

function lcars_write_json(string $path, array $data): void {
    $tmp = $path . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    rename($tmp, $path);
}

function lcars_read_json(string $path): array {
    if (!file_exists($path)) lcars_json(['error' => 'Not found'], 404);
    $data = json_decode(file_get_contents($path), true);
    if (!is_array($data)) lcars_json(['error' => 'Corrupt JSON'], 500);
    return $data;
}

function lcars_base_url(array $cfg): string {
    $set = trim((string)($cfg['public_base_url'] ?? ''));
    if ($set !== '') return rtrim($set, '/');
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $scheme = $https ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $dir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
    return $scheme . '://' . $host . $dir;
}

function lcars_bearer_token(): string {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!$header && function_exists('apache_request_headers')) {
        $h = apache_request_headers();
        $header = $h['Authorization'] ?? $h['authorization'] ?? '';
    }
    if (preg_match('/Bearer\s+(.+)/i', $header, $m)) return trim($m[1]);
    return '';
}

function lcars_require_callback_auth(array $cfg): void {
    $expected = (string)($cfg['callback_token'] ?? '');
    $actual = lcars_bearer_token();
    if (!$expected || !$actual || !hash_equals($expected, $actual)) {
        lcars_json(['error' => 'Unauthorized'], 401);
    }
}

function lcars_update_status(string $job_id, string $status, array $extra = []): void {
    $dir = lcars_job_dir($job_id);
    if (!is_dir($dir)) lcars_json(['error' => 'Unknown job'], 404);
    $path = $dir . '/status.json';
    $old = file_exists($path) ? (json_decode(file_get_contents($path), true) ?: []) : [];
    $data = array_merge($old, $extra, [
        'job_id' => $job_id,
        'status' => $status,
        'updated_at' => gmdate('c')
    ]);
    lcars_write_json($path, $data);
}

function lcars_validate_job(array $job, array $cfg): void {
    if (!isset($job['apps']) || !is_array($job['apps'])) lcars_json(['error' => 'Missing apps array'], 400);
    $max = (int)($cfg['max_apps'] ?? 1000);
    if (count($job['apps']) < 1) lcars_json(['error' => 'No apps provided'], 400);
    if (count($job['apps']) > $max) lcars_json(['error' => 'Too many apps'], 400);
    foreach ($job['apps'] as $i => $app) {
        if (!is_array($app) || empty($app['package']) || !is_string($app['package'])) {
            lcars_json(['error' => "App $i missing package"], 400);
        }
    }
}
