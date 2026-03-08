<?php
// SQLite Database Configuration
define('DB_PATH', __DIR__ . '/swiftinvoice.db');

// Create connection to SQLite
try {
    $conn = new PDO('sqlite:' . DB_PATH);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Auto-create required tables so first request works without manual init.
    $conn->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    $conn->exec("CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        shop_name TEXT,
        gst_number TEXT,
        phone TEXT,
        location TEXT,
        email TEXT,
        full_name TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )");

    $conn->exec("CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        invoice_number INTEGER NOT NULL,
        invoice_date DATE NOT NULL,
        customer_name TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        items TEXT,
        subtotal DECIMAL(10,2),
        gst_rate DECIMAL(5,2),
        gst_amount DECIMAL(10,2),
        total_amount DECIMAL(10,2),
        status TEXT DEFAULT 'Paid',
        payment_method TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )");
} catch(Exception $e) {
    die(json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]));
}

// Session configuration
session_start();
define('SESSION_TIMEOUT', 3600); // 1 hour

// Headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Get request method
$method = $_SERVER['REQUEST_METHOD'];
?>
