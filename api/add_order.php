<?php
// Incluir configuración
require_once 'config.php';

// Configurar headers CORS y content type
header('Content-Type: application/json');
setCORSHeaders(); // Usar la función del config.php

// Log de debugging (opcional - comentar en producción)
error_log("=== ADD ORDER REQUEST ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Headers: " . json_encode(getallheaders()));

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitir POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed. Only POST is accepted.',
        'received_method' => $_SERVER['REQUEST_METHOD']
    ]);
    exit();
}

try {
    // Obtener datos JSON del request
    $input = file_get_contents('php://input');
    error_log("Raw input: " . $input);
    
    if (empty($input)) {
        throw new Exception('No data received');
    }
    
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data: ' . json_last_error_msg());
    }
    
    error_log("Decoded data: " . json_encode($data));
    
    // Validar datos requeridos
    $required_fields = ['customerInfo', 'cart', 'totalAmount'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    $customerInfo = $data['customerInfo'];
    $cart = $data['cart'];
    $totalAmount = $data['totalAmount'];
    $shippingCost = $data['shippingCost'] ?? 0;
    $paypalPayerID = $data['paypalPayerID'] ?? null;
    
    // Validar información del cliente
    $required_customer_fields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'canton'];
    foreach ($required_customer_fields as $field) {
        if (empty($customerInfo[$field])) {
            throw new Exception("Missing required customer field: $field");
        }
    }
    
    // Validar que el carrito no esté vacío
    if (empty($cart) || !is_array($cart)) {
        throw new Exception("Cart is empty or invalid");
    }
    
    // Conectar a la base de datos usando config.php
    error_log("Attempting database connection...");
    $pdo = getDBConnection();
    error_log("Database connected successfully");
    
    // Verificar que las tablas existen
    $tables_check = $pdo->query("SHOW TABLES LIKE 'orders'")->rowCount();
    if ($tables_check == 0) {
        throw new Exception("Database table 'orders' does not exist. Please run the SQL setup script first.");
    }
    
    // Generar número de pedido único
    $orderNumber = 'ORDER_' . date('Ymd') . '_' . strtoupper(substr(uniqid(), -6));
    error_log("Generated order number: $orderNumber");
    
    // Iniciar transacción
    $pdo->beginTransaction();
    error_log("Transaction started");
    
    // Preparar notas del pedido
    $notes = $customerInfo['notes'] ?? '';
    if ($paypalPayerID) {
        $notes .= ($notes ? "\n" : "") . "PayPal Payer ID: " . $paypalPayerID;
    }
    
    // Insertar pedido principal
    $orderSql = "INSERT INTO orders (
        order_number, customer_first_name, customer_last_name, customer_email, 
        customer_phone, customer_address, customer_city, customer_postal_code, 
        customer_canton, customer_notes, total_amount, shipping_cost, 
        status, payment_method, payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'paypal', 'completed')";
    
    $orderStmt = $pdo->prepare($orderSql);
    $orderResult = $orderStmt->execute([
        $orderNumber,
        $customerInfo['firstName'],
        $customerInfo['lastName'],
        $customerInfo['email'],
        $customerInfo['phone'],
        $customerInfo['address'],
        $customerInfo['city'],
        $customerInfo['postalCode'],
        $customerInfo['canton'],
        $notes,
        $totalAmount,
        $shippingCost
    ]);
    
    if (!$orderResult) {
        throw new Exception("Failed to insert order");
    }
    
    $orderId = $pdo->lastInsertId();
    error_log("Order inserted with ID: $orderId");
    
    // Insertar items del pedido
    $itemSql = "INSERT INTO order_items (
        order_id, product_id, product_name, product_description, product_image,
        price, quantity, subtotal, heat_level, rating, badge, origin
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $itemStmt = $pdo->prepare($itemSql);
    
    foreach ($cart as $index => $item) {
        $subtotal = $item['price'] * $item['quantity'];
        $itemResult = $itemStmt->execute([
            $orderId,
            $item['id'] ?? 0,
            $item['name'] ?? 'Unknown Product',
            $item['description'] ?? '',
            $item['image'] ?? '',
            $item['price'] ?? 0,
            $item['quantity'] ?? 1,
            $subtotal,
            $item['heatLevel'] ?? 0,
            $item['rating'] ?? 0,
            $item['badge'] ?? '',
            $item['origin'] ?? ''
        ]);
        
        if (!$itemResult) {
            throw new Exception("Failed to insert item $index");
        }
        
        error_log("Item $index inserted successfully");
    }
    
    // Confirmar transacción
    $pdo->commit();
    error_log("Transaction committed successfully");
    
    // Respuesta exitosa
    $response = [
        'success' => true,
        'message' => 'Order saved successfully',
        'orderId' => $orderId,
        'orderNumber' => $orderNumber,
        'data' => [
            'id' => $orderId,
            'orderNumber' => $orderNumber,
            'status' => 'completed',
            'totalAmount' => $totalAmount,
            'paypalPayerID' => $paypalPayerID,
            'createdAt' => date('Y-m-d H:i:s')
        ]
    ];
    
    error_log("Success response: " . json_encode($response));
    echo json_encode($response);
    
} catch (PDOException $e) {
    // Error de base de datos
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollback();
    }
    
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage(),
        'error_type' => 'database'
    ]);
    
} catch (Exception $e) {
    // Error general
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollback();
    }
    
    error_log("General error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'error_type' => 'general'
    ]);
}
?>