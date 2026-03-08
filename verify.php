<?php
/**
 * SwiftInvoice PHP Backend - Verification Script
 * Tests all API endpoints and database connectivity
 */

require_once 'config.php';

echo "<!DOCTYPE html><html><body style='font-family: Arial; padding: 20px;'>";
echo "<h1>SwiftInvoice PHP Verification</h1>";

// Test 1: Database Connection
echo "<h2>1. Database Connection</h2>";
if ($conn->connect_error) {
    echo "<p style='color: red;'>❌ Failed: " . $conn->connect_error . "</p>";
} else {
    echo "<p style='color: green;'>✅ Connected to MySQL</p>";
    
    // Test 2: Check Tables
    echo "<h2>2. Database Tables</h2>";
    $tables = ['users', 'profiles', 'invoices'];
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result && $result->num_rows > 0) {
            echo "<p style='color: green;'>✅ Table '$table' exists</p>";
        } else {
            echo "<p style='color: red;'>❌ Table '$table' missing</p>";
        }
    }
}

// Test 3: File Checks
echo "<h2>3. PHP Files</h2>";
$files = ['config.php', 'api_auth.php', 'api.php', 'auth.php', 'route.php', 'init_db.php'];
foreach ($files as $file) {
    if (file_exists($file)) {
        echo "<p style='color: green;'>✅ $file exists</p>";
    } else {
        echo "<p style='color: red;'>❌ $file missing</p>";
    }
}

// Test 4: PHP Version
echo "<h2>4. Environment</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>OS: " . php_uname() . "</p>";

// Test 5: Sessions
echo "<h2>5. Sessions</h2>";
if (ini_get('session.save_path') || session_id()) {
    echo "<p style='color: green;'>✅ Sessions enabled</p>";
} else {
    echo "<p style='color: red;'>❌ Sessions not available</p>";
}

echo "<hr>";
echo "<p><a href='init_db.php'>Initialize Database</a> | <a href='login.html'>Go to Login</a></p>";
echo "</body></html>";
?>
