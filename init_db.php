<?php
require_once 'config.php';

try {
    // Create users table
    $conn->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Create profiles table
    $conn->exec("
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            shop_name TEXT,
            gst_number TEXT,
            phone TEXT,
            location TEXT,
            email TEXT,
            full_name TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ");
    
    // Create invoices table
    $conn->exec("
        CREATE TABLE IF NOT EXISTS invoices (
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
        )
    ");
    
    echo json_encode(['success' => true, 'message' => 'Database initialized successfully']);
} catch(Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
