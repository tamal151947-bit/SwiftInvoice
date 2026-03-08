<?php
require_once 'config.php';

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$action = basename($request_uri);

if ($action === 'api_auth.php' || strpos($request_uri, 'auth') !== false) {
    $path = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
    $endpoint = end($path);
    
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if ($endpoint === 'signup') {
            handleSignup($data, $conn);
        } elseif ($endpoint === 'login') {
            handleLogin($data, $conn);
        } elseif ($endpoint === 'logout') {
            handleLogout();
        }
    }
}

function handleSignup($data, $conn) {
    $full_name = $conn->real_escape_string($data['fullName'] ?? '');
    $email = $conn->real_escape_string($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $confirm_password = $data['confirmPassword'] ?? '';
    
    // Validation
    if (!$full_name || !$email || !$password || !$confirm_password) {
        echo json_encode(['success' => false, 'error' => 'All fields required']);
        return;
    }
    
    if ($password !== $confirm_password) {
        echo json_encode(['success' => false, 'error' => 'Passwords do not match']);
        return;
    }
    
    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
        return;
    }
    
    // Check if email exists
    $check = $conn->query("SELECT id FROM users WHERE email = '$email'");
    if ($check->num_rows > 0) {
        echo json_encode(['success' => false, 'error' => 'Email already registered']);
        return;
    }
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    
    // Insert user
    $sql = "INSERT INTO users (email, password, name) VALUES ('$email', '$hashed_password', '$full_name')";
    if ($conn->query($sql)) {
        $user_id = $conn->insert_id;
        $_SESSION['user_id'] = $user_id;
        $_SESSION['email'] = $email;
        $_SESSION['name'] = $full_name;
        
        echo json_encode(['success' => true, 'message' => 'Account created successfully', 'user' => ['id' => $user_id, 'email' => $email, 'name' => $full_name]]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Registration failed: ' . $conn->error]);
    }
}

function handleLogin($data, $conn) {
    $email = $conn->real_escape_string($data['email'] ?? '');
    $password = $data['password'] ?? '';
    
    if (!$email || !$password) {
        echo json_encode(['success' => false, 'error' => 'Email and password required']);
        return;
    }
    
    // Get user
    $result = $conn->query("SELECT id, password, name FROM users WHERE email = '$email'");
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
        return;
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
        return;
    }
    
    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $email;
    $_SESSION['name'] = $user['name'];
    $_SESSION['login_time'] = time();
    
    echo json_encode(['success' => true, 'message' => 'Login successful', 'user' => ['id' => $user['id'], 'email' => $email, 'name' => $user['name']]]);
}

function handleLogout() {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out']);
}
?>
