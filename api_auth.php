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
    $full_name = $data['fullName'] ?? '';
    $email = $data['email'] ?? '';
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
    
    try {
        // Check if email exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'error' => 'Email already registered']);
            return;
        }
        
        // Hash password
        $hashed_password = password_hash($password, PASSWORD_BCRYPT);
        
        // Insert user
        $stmt = $conn->prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
        $stmt->execute([$email, $hashed_password, $full_name]);
        $user_id = $conn->lastInsertId();
        
        $_SESSION['user_id'] = $user_id;
        $_SESSION['email'] = $email;
        $_SESSION['name'] = $full_name;
        
        echo json_encode(['success' => true, 'message' => 'Account created successfully', 'user' => ['id' => $user_id, 'email' => $email, 'name' => $full_name]]);
    } catch(Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Registration failed: ' . $e->getMessage()]);
    }
}

function handleLogin($data, $conn) {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    if (!$email || !$password) {
        echo json_encode(['success' => false, 'error' => 'Email and password required']);
        return;
    }
    
    try {
        // Get user
        $stmt = $conn->prepare("SELECT id, password, name FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
            return;
        }
        
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
    } catch(Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Login failed: ' . $e->getMessage()]);
    }
}

function handleLogout() {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out']);
}
?>
