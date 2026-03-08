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
    try {
        $stmt = $conn->prepare("SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
        $stmt->execute([$user_id]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $invoices = [];
        
        foreach ($result as $row) {
            $row['items'] = json_decode($row['items'], true);
            $invoices[] = $row;
        }
        
        echo json_encode(['success' => true, 'invoices' => $invoices]);
    } catch(Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function createInvoice($user_id, $conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $invoice_number = $data['id'] ?? time();
        $invoice_date = $data['date'] ?? date('Y-m-d');
        $customer_name = $data['customer'] ?? 'Unnamed Customer';
        $customer_email = $data['customerEmail'] ?? '';
        $customer_phone = $data['customerPhone'] ?? '';
        $subtotal = $data['subtotal'] ?? 0;
        $gst_rate = $data['gstRate'] ?? 0;
        $gst_amount = $data['gstAmount'] ?? 0;
        $total_amount = $data['amount'] ?? 0;
        $payment_method = $data['paymentMethod'] ?? 'Cash';
        $items = json_encode($data['items'] ?? []);
        
        $stmt = $conn->prepare("INSERT INTO invoices (
            user_id, invoice_number, invoice_date, customer_name, customer_email, customer_phone,
            subtotal, gst_rate, gst_amount, total_amount, payment_method, items, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([$user_id, $invoice_number, $invoice_date, $customer_name, $customer_email, $customer_phone,
                       $subtotal, $gst_rate, $gst_amount, $total_amount, $payment_method, $items, 'Paid']);
        
        echo json_encode(['success' => true, 'message' => 'Invoice created', 'invoice_id' => $invoice_number]);
    } catch(Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function getDashboard($user_id, $conn) {
    try {
        $stmt = $conn->prepare("SELECT SUM(total_amount) as total_sales, COUNT(*) as invoice_count FROM invoices WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $stmt = $conn->prepare("SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC LIMIT 10");
        $stmt->execute([$user_id]);
        $recent_invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'stats' => $stats, 'recent_invoices' => $recent_invoices]);
    } catch(Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function getProfile($user_id, $conn) {
    try {
        $stmt = $conn->prepare("SELECT * FROM profiles WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'profile' => $profile ?: null]);
    } catch(Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function updateProfile($user_id, $conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $full_name = $data['fullName'] ?? '';
        $email = $data['email'] ?? '';
        $phone = $data['phoneNumber'] ?? '';
        $shop_name = $data['shopName'] ?? '';
        $gst_number = $data['gstNumber'] ?? '';
        $location = $data['location'] ?? '';
        
        // Check if profile exists
        $stmt = $conn->prepare("SELECT id FROM profiles WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $exists = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($exists) {
            // Update
            $stmt = $conn->prepare("UPDATE profiles SET full_name = ?, email = ?, phone = ?, shop_name = ?, gst_number = ?, location = ? WHERE user_id = ?");
            $stmt->execute([$full_name, $email, $phone, $shop_name, $gst_number, $location, $user_id]);
        } else {
            // Insert
            $stmt = $conn->prepare("INSERT INTO profiles (user_id, full_name, email, phone, shop_name, gst_number, location) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$user_id, $full_name, $email, $phone, $shop_name, $gst_number, $location]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Profile updated']);
    } catch(Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function getHistory($user_id, $conn) {
    try {
        $stmt = $conn->prepare("SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $invoices = [];
        
        foreach ($result as $row) {
            $row['items'] = json_decode($row['items'], true);
            $invoices[] = $row;
        }
        
        echo json_encode(['success' => true, 'invoices' => $invoices]);
    } catch(Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>
