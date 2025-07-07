<?php
require_once 'config.php';

// Configurar CORS
setCORSHeaders();
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

try {
    // Obtener conexión a la base de datos
    $pdo = getDBConnection();
    
    // Obtener datos del producto
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? 0;
    $heat_level = $_POST['heat_level'] ?? 1;
    $rating = $_POST['rating'] ?? 0;
    $badge = $_POST['badge'] ?? '';
    $origin = $_POST['origin'] ?? '';
    $category = $_POST['category'] ?? 'hot-sauce'; // Nueva categoría
    
    // Validar datos requeridos
    if (empty($name) || empty($price)) {
        throw new Exception('Nombre y precio son requeridos');
    }
    
    // Auto-detectar categoría si no se especifica
    if (empty($category) || $category === 'auto') {
        if (stripos($name, 'barbecue') !== false || 
            stripos($name, 'bbq') !== false ||
            stripos($badge, 'süß') !== false ||
            stripos($badge, 'gourmet') !== false) {
            $category = 'bbq-sauce';
        } else {
            $category = 'hot-sauce';
        }
    }
    
    // Manejar subida de imagen
    $image_name = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'upload/';
        
        // Crear directorio si no existe
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        
        $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $image_name = uniqid() . '_' . time() . '.' . $file_extension;
        $upload_path = $upload_dir . $image_name;
        
        // Validar tipo de archivo
        $allowed_types = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array(strtolower($file_extension), $allowed_types)) {
            throw new Exception('Tipo de archivo no permitido. Permitidos: ' . implode(', ', $allowed_types));
        }
        
        // Validar tamaño (máximo 5MB)
        if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
            throw new Exception('Archivo demasiado grande. Máximo 5MB');
        }
        
        // Mover archivo
        if (!move_uploaded_file($_FILES['image']['tmp_name'], $upload_path)) {
            throw new Exception('Error al subir la imagen');
        }
    }
    
    // Insertar producto en la base de datos
    $sql = "INSERT INTO products (name, description, price, image, heat_level, rating, badge, origin, category) 
            VALUES (:name, :description, :price, :image, :heat_level, :rating, :badge, :origin, :category)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':name' => trim($name),
        ':description' => trim($description),
        ':price' => floatval($price),
        ':image' => $image_name,
        ':heat_level' => intval($heat_level),
        ':rating' => floatval($rating),
        ':badge' => trim($badge),
        ':origin' => trim($origin),
        ':category' => $category
    ]);
    
    if (!$result) {
        throw new Exception('Error al insertar producto en la base de datos');
    }
    
    $product_id = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Producto añadido exitosamente',
        'product_id' => intval($product_id),
        'category' => $category,
        'image_url' => $image_name ? 'https://admin.hot-bbq.ch/upload/' . $image_name : null
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error de base de datos: ' . $e->getMessage()
    ]);
}
?>
