<?php
require_once 'config.php';

// Create tables
$tables_sql = "
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    shop_name VARCHAR(100),
    gst_number VARCHAR(50),
    location VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    invoice_number INT UNIQUE NOT NULL,
    invoice_date DATE,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20),
    subtotal DECIMAL(12,2),
    gst_rate DECIMAL(5,2),
    gst_amount DECIMAL(12,2),
    total_amount DECIMAL(12,2),
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Pending',
    items JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
";

// Execute table creation
$sql_array = explode(';', $tables_sql);
foreach ($sql_array as $sql) {
    $sql = trim($sql);
    if ($sql) {
        $conn->query($sql);
    }
}

echo json_encode(['success' => true, 'message' => 'Database initialized']);
?>
