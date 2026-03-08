<?php
require_once 'config.php';

// This file handles authentication routes

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Simple routing based on the request
if (strpos($request_uri, 'signup') !== false) {
    handleSignup();
} elseif (strpos($request_uri, 'login') !== false) {
    handleLogin();
} elseif (strpos($request_uri, 'logout') !== false) {
    handleLogout();
} else {
    echo json_encode(['error' => 'Invalid endpoint']);
}

function handleSignup() {
    global $conn;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $fullName = $conn->real_escape_string(trim($data['fullName'] ?? ''));
    $email = $conn->real_escape_string(trim($data['email'] ?? ''));
    $password = $data['password'] ?? '';
    $confirmPassword = $data['confirmPassword'] ?? '';
    
    // Validation
    if (!$fullName || !$email || !$password || !$confirmPassword) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'All fields required']);
        return;
    }
    
    if ($password !== $confirmPassword) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Passwords do not match']);
        return;
    }
    
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
        return;
    }
    
    // Check if email exists
    $check = $conn->query("SELECT id FROM users WHERE email = '$email'");
    if ($check && $check->num_rows > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email already registered']);
        return;
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    // Insert user
    $sql = "INSERT INTO users (email, password, name) VALUES ('$email', '$hashedPassword', '$fullName')";
    
    if ($conn->query($sql)) {
        $userId = $conn->insert_id;
        $_SESSION['user_id'] = $userId;
        $_SESSION['email'] = $email;
        $_SESSION['name'] = $fullName;
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Account created successfully',
            'user' => ['id' => $userId, 'email' => $email, 'name' => $fullName]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Registration failed']);
    }
}

function handleLogin() {
    global $conn;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $email = $conn->real_escape_string(trim($data['email'] ?? ''));
    $password = $data['password'] ?? '';
    
    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email and password required']);
        return;
    }
    
    // Get user
    $result = $conn->query("SELECT id, password, name FROM users WHERE email = '$email'");
    
    if (!$result || $result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
        return;
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
        return;
    }
    
    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $email;
    $_SESSION['name'] = $user['name'];
    $_SESSION['login_time'] = time();
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => ['id' => $user['id'], 'email' => $email, 'name' => $user['name']]
    ]);
}

function handleLogout() {
    session_destroy();
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Logged out']);
}
?>
