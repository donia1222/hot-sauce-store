<?php
// Configurar headers CORS DINÁMICOS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

// Lista de orígenes permitidos
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'https://hot-sauce-store-pink.vercel.app', // Agregar tu dominio aquí
    'https://www.your-domain.com'
];

// Si el origen está en la lista permitida, usarlo; sino usar *
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
header('Access-Control-Allow-Credentials: false');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_log("=== UPDATE USER REQUEST START ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Origin: " . ($origin ?? 'not set'));

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

try {
    $pdo = getDBConnection();
    
    // Obtener datos del request
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    error_log("Update user input: " . $input);
    
    if (!$data) {
        throw new Exception('Invalid JSON data');
    }
    
    // Obtener token del body (método más confiable)
    $sessionToken = '';
    if (isset($data['sessionToken'])) {
        $sessionToken = $data['sessionToken'];
        error_log("Token found in request body: " . substr($sessionToken, 0, 10) . "...");
    }
    
    // Fallback: buscar en headers
    if (empty($sessionToken)) {
        $authHeader = '';
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            foreach ($headers as $key => $value) {
                if (strtolower($key) === 'authorization') {
                    $authHeader = $value;
                    break;
                }
            }
        }
        
        if (!empty($authHeader) && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $sessionToken = trim($matches[1]);
            error_log("Token found in Authorization header: " . substr($sessionToken, 0, 10) . "...");
        }
    }
    
    if (empty($sessionToken)) {
        throw new Exception('Authorization token required');
    }
    
    // Verificar sesión y obtener user_id
    $sessionSql = "SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > NOW()";
    $sessionStmt = $pdo->prepare($sessionSql);
    $sessionStmt->execute([$sessionToken]);
    $session = $sessionStmt->fetch();
    
    if (!$session) {
        throw new Exception('Invalid or expired session');
    }
    
    $userId = $session['user_id'];
    
    // Campos actualizables
    $updateFields = [];
    $updateValues = [];
    
    $fieldMapping = [
        'firstName' => 'first_name',
        'lastName' => 'last_name',
        'phone' => 'phone',
        'address' => 'address',
        'city' => 'city',
        'postalCode' => 'postal_code',
        'canton' => 'canton',
        'notes' => 'notes'
    ];
    
    foreach ($fieldMapping as $requestField => $dbField) {
        if (isset($data[$requestField])) {
            $updateFields[] = "$dbField = ?";
            $updateValues[] = trim($data[$requestField]);
        }
    }
    
    if (empty($updateFields)) {
        throw new Exception('No fields to update');
    }
    
    // Actualizar usuario
    $updateValues[] = $userId;
    $updateSql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $updateStmt = $pdo->prepare($updateSql);
    $result = $updateStmt->execute($updateValues);
    
    if (!$result) {
        throw new Exception('Failed to update user');
    }
    
    // Obtener datos actualizados
    $getUserSql = "SELECT email, first_name, last_name, phone, address, city, postal_code, canton, notes 
                   FROM users WHERE id = ?";
    $getUserStmt = $pdo->prepare($getUserSql);
    $getUserStmt->execute([$userId]);
    $updatedUser = $getUserStmt->fetch(PDO::FETCH_ASSOC);
    
    error_log("User updated successfully");
    
    echo json_encode([
        'success' => true,
        'message' => 'User updated successfully',
        'user' => $updatedUser
    ]);
    
} catch (Exception $e) {
    error_log("Error in update_user.php: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

error_log("=== UPDATE USER REQUEST END ===");
?>
