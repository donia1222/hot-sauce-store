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
    
    // Manejar subida de múltiples imágenes
    $image_names = [null, null, null, null];
    $upload_dir = 'upload/';
    
    // Crear directorio si no existe
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Procesar hasta 4 imágenes
    for ($i = 0; $i < 4; $i++) {
        $file_key = $i === 0 ? 'image_0' : "image_$i";
        
        if (isset($_FILES[$file_key]) && $_FILES[$file_key]['error'] === UPLOAD_ERR_OK) {
            $file_extension = pathinfo($_FILES[$file_key]['name'], PATHINFO_EXTENSION);
            $image_name = uniqid() . '_' . time() . '_' . $i . '.' . $file_extension;
            $upload_path = $upload_dir . $image_name;
            
            // Validar tipo de archivo
            $allowed_types = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (!in_array(strtolower($file_extension), $allowed_types)) {
                throw new Exception("Tipo de archivo no permitido para imagen " . ($i + 1) . ". Permitidos: " . implode(', ', $allowed_types));
            }
            
            // Validar tamaño (máximo 5MB)
            if ($_FILES[$file_key]['size'] > 5 * 1024 * 1024) {
                throw new Exception("Archivo demasiado grande para imagen " . ($i + 1) . ". Máximo 5MB");
            }
            
            // Mover archivo
            if (!move_uploaded_file($_FILES[$file_key]['tmp_name'], $upload_path)) {
                throw new Exception("Error al subir la imagen " . ($i + 1));
            }
            
            $image_names[$i] = $image_name;
        }
    }
    
    // Insertar producto en la base de datos
    $sql = "INSERT INTO products (name, description, price, image, image2, image3, image4, heat_level, rating, badge, origin, category) 
            VALUES (:name, :description, :price, :image, :image2, :image3, :image4, :heat_level, :rating, :badge, :origin, :category)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':name' => trim($name),
        ':description' => trim($description),
        ':price' => floatval($price),
        ':image' => $image_names[0],
        ':image2' => $image_names[1],
        ':image3' => $image_names[2],
        ':image4' => $image_names[3],
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
    
    // Construir URLs de imágenes
    $image_urls = [];
    for ($i = 0; $i < 4; $i++) {
        $image_urls[] = $image_names[$i] ? 'https://admin.hot-bbq.ch/upload/' . $image_names[$i] : null;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Producto añadido exitosamente',
        'product_id' => intval($product_id),
        'category' => $category,
        'image_urls' => $image_urls,
        'image_url' => $image_urls[0] // Mantener compatibilidad con imagen principal
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
