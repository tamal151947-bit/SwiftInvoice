<?php
require_once 'config.php';

// Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

$path = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$endpoint = $path[count($path) - 1];
$user_id = getCurrentUserId();

// Route requests
switch ($endpoint) {
    case 'api_invoices.php':
        if ($method === 'GET') {
            getInvoices($user_id, $conn);
        } elseif ($method === 'POST') {
            createInvoice($user_id, $conn);
        }
        break;
    
    case 'dashboard':
        getDashboard($user_id, $conn);
        break;
    
    case 'profile':
        if ($method === 'GET') {
            getProfile($user_id, $conn);
        } elseif ($method === 'PUT') {
            updateProfile($user_id, $conn);
        }
        break;
    
    case 'history':
        getHistory($user_id, $conn);
        break;
    
    default:
        echo json_encode(['success' => false, 'error' => 'Endpoint not found']);
}

function getInvoices($user_id, $conn) {
    $result = $conn->query("SELECT * FROM invoices WHERE user_id = $user_id ORDER BY created_at DESC LIMIT 50");
    $invoices = [];
    
    while ($row = $result->fetch_assoc()) {
        $row['items'] = json_decode($row['items'], true);
        $invoices[] = $row;
    }
    
    echo json_encode(['success' => true, 'invoices' => $invoices]);
}

function createInvoice($user_id, $conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $invoice_number = $data['id'] ?? time();
    $invoice_date = $conn->real_escape_string($data['date'] ?? date('Y-m-d'));
    $customer_name = $conn->real_escape_string($data['customer'] ?? 'Unnamed Customer');
    $customer_email = $conn->real_escape_string($data['customerEmail'] ?? '');
    $customer_phone = $conn->real_escape_string($data['customerPhone'] ?? '');
    $subtotal = $data['subtotal'] ?? 0;
    $gst_rate = $data['gstRate'] ?? 0;
    $gst_amount = $data['gstAmount'] ?? 0;
    $total_amount = $data['amount'] ?? 0;
    $payment_method = $conn->real_escape_string($data['paymentMethod'] ?? 'Cash');
    $items = $conn->real_escape_string(json_encode($data['items'] ?? []));
    
    $sql = "INSERT INTO invoices (
        user_id, invoice_number, invoice_date, customer_name, customer_email, customer_phone,
        subtotal, gst_rate, gst_amount, total_amount, payment_method, items, status
    ) VALUES (
        $user_id, $invoice_number, '$invoice_date', '$customer_name', '$customer_email', '$customer_phone',
        $subtotal, $gst_rate, $gst_amount, $total_amount, '$payment_method', '$items', 'Pending'
    )";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'message' => 'Invoice created', 'invoice_id' => $invoice_number]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getDashboard($user_id, $conn) {
    $result = $conn->query("SELECT SUM(total_amount) as total_sales, COUNT(*) as invoice_count FROM invoices WHERE user_id = $user_id");
    $stats = $result->fetch_assoc();
    
    $invoices_result = $conn->query("SELECT * FROM invoices WHERE user_id = $user_id ORDER BY created_at DESC LIMIT 10");
    $recent_invoices = [];
    while ($row = $invoices_result->fetch_assoc()) {
        $recent_invoices[] = $row;
    }
    
    echo json_encode(['success' => true, 'stats' => $stats, 'recent_invoices' => $recent_invoices]);
}

function getProfile($user_id, $conn) {
    $result = $conn->query("SELECT * FROM profiles WHERE user_id = $user_id");
    
    if ($result->num_rows > 0) {
        $profile = $result->fetch_assoc();
        echo json_encode(['success' => true, 'profile' => $profile]);
    } else {
        echo json_encode(['success' => true, 'profile' => null]);
    }
}

function updateProfile($user_id, $conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $full_name = $conn->real_escape_string($data['fullName'] ?? '');
    $email = $conn->real_escape_string($data['email'] ?? '');
    $phone = $conn->real_escape_string($data['phoneNumber'] ?? '');
    $shop_name = $conn->real_escape_string($data['shopName'] ?? '');
    $gst_number = $conn->real_escape_string($data['gstNumber'] ?? '');
    $location = $conn->real_escape_string($data['location'] ?? '');
    
    // Check if profile exists
    $check = $conn->query("SELECT id FROM profiles WHERE user_id = $user_id");
    
    if ($check->num_rows > 0) {
        // Update
        $sql = "UPDATE profiles SET full_name = '$full_name', email = '$email', phone = '$phone', 
                shop_name = '$shop_name', gst_number = '$gst_number', location = '$location'
                WHERE user_id = $user_id";
    } else {
        // Insert
        $sql = "INSERT INTO profiles (user_id, full_name, email, phone, shop_name, gst_number, location)
                VALUES ($user_id, '$full_name', '$email', '$phone', '$shop_name', '$gst_number', '$location')";
    }
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'message' => 'Profile updated']);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getHistory($user_id, $conn) {
    $result = $conn->query("SELECT * FROM invoices WHERE user_id = $user_id ORDER BY created_at DESC");
    $invoices = [];
    
    while ($row = $result->fetch_assoc()) {
        $row['items'] = json_decode($row['items'], true);
        $invoices[] = $row;
    }
    
    echo json_encode(['success' => true, 'invoices' => $invoices]);
}
?>
