<?php
// Router for PHP built-in server (works in Docker on Render)
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$fullPath = __DIR__ . $path;

// Serve existing static files directly
if ($path !== '/' && file_exists($fullPath) && !is_dir($fullPath)) {
    return false;
}

// Auth routes
if (preg_match('#^/auth/(login|signup|logout)$#', $path)) {
    require __DIR__ . '/api_auth.php';
    exit;
}

// API routes handled by api.php
$apiRoutes = [
    '/dashboard',
    '/history',
    '/profile',
    '/api_invoices.php',
    '/profile/get',
    '/profile/update',
    '/invoice/create'
];

if (in_array($path, $apiRoutes, true)) {
    require __DIR__ . '/api.php';
    exit;
}

// Utility scripts
if ($path === '/init_db.php') {
    require __DIR__ . '/init_db.php';
    exit;
}
if ($path === '/verify.php') {
    require __DIR__ . '/verify.php';
    exit;
}

// Default fallback for unknown routes
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['success' => false, 'error' => 'Route not found']);
