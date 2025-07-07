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

// Permitir PUT y DELETE
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'PUT') {
    parse_str(file_get_contents("php://input"), $_PUT);
} elseif ($method === 'DELETE') {
    parse_str(file_get_contents("php://input"), $_DELETE);
}

try {
    // Obtener conexión a la base de datos
    $pdo = getDBConnection();
    
    // ELIMINAR PRODUCTO
    if ($method === 'DELETE') {
        $id = $_DELETE['id'] ?? $_GET['id'] ?? null;
        
        if (!$id || intval($id) <= 0) {
            throw new Exception('ID del producto requerido y válido');
        }
        
        $id = intval($id);
        
        // Obtener información del producto para eliminar imagen
        $sql = "SELECT image FROM products WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $product = $stmt->fetch();
        
        if (!$product) {
            throw new Exception('Producto no encontrado');
        }
        
        // Eliminar producto de la base de datos
        $sql = "DELETE FROM products WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([':id' => $id]);
        
        if (!$result) {
            throw new Exception('Error al eliminar producto de la base de datos');
        }
        
        // Eliminar imagen del servidor si existe
        if ($product['image'] && file_exists('upload/' . $product['image'])) {
            unlink('upload/' . $product['image']);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Producto eliminado exitosamente'
        ]);
    }
    
    // EDITAR PRODUCTO
    elseif ($method === 'POST' || $method === 'PUT') {
        $id = $_POST['id'] ?? $_PUT['id'] ?? null;
        
        if (!$id || intval($id) <= 0) {
            throw new Exception('ID del producto requerido y válido');
        }
        
        $id = intval($id);
        
        // Verificar que el producto existe
        $sql = "SELECT * FROM products WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $existing_product = $stmt->fetch();
        
        if (!$existing_product) {
            throw new Exception('Producto no encontrado');
        }
        
        // Obtener datos del formulario (usar valores existentes como fallback)
        $name = $_POST['name'] ?? $existing_product['name'];
        $description = $_POST['description'] ?? $existing_product['description'];
        $price = $_POST['price'] ?? $existing_product['price'];
        $stock = $_POST['stock'] ?? $existing_product['stock'] ?? 0; // Nuevo campo stock
        $heat_level = $_POST['heat_level'] ?? $existing_product['heat_level'];
        $rating = $_POST['rating'] ?? $existing_product['rating'];
        $badge = $_POST['badge'] ?? $existing_product['badge'];
        $origin = $_POST['origin'] ?? $existing_product['origin'];
        $category = $_POST['category'] ?? $existing_product['category'] ?? 'hot-sauce';
        
        // Auto-detectar categoría si se cambió el nombre
        if (isset($_POST['name']) && $_POST['name'] !== $existing_product['name']) {
            if (stripos($name, 'barbecue') !== false || 
                stripos($name, 'bbq') !== false ||
                stripos($badge, 'süß') !== false ||
                stripos($badge, 'gourmet') !== false) {
                $category = 'bbq-sauce';
            } else {
                $category = 'hot-sauce';
            }
        }
        
        // Validar datos requeridos
        if (empty(trim($name))) {
            throw new Exception('El nombre del producto es requerido');
        }
        
        // Validar stock
        if (!is_numeric($stock) || intval($stock) < 0) {
            throw new Exception('El stock debe ser un número igual o mayor a 0');
        }
        
        $image_name = $existing_product['image']; // Mantener imagen actual por defecto
        
        // Manejar nueva imagen si se subió
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = 'upload/';
            
            // Crear directorio si no existe
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0755, true);
            }
            
            $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $new_image_name = uniqid() . '_' . time() . '.' . $file_extension;
            $upload_path = $upload_dir . $new_image_name;
            
            // Validar tipo de archivo
            $allowed_types = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (!in_array(strtolower($file_extension), $allowed_types)) {
                throw new Exception('Tipo de archivo no permitido. Permitidos: ' . implode(', ', $allowed_types));
            }
            
            // Validar tamaño (máximo 5MB)
            if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
                throw new Exception('Archivo demasiado grande. Máximo 5MB');
            }
            
            // Mover nuevo archivo
            if (move_uploaded_file($_FILES['image']['tmp_name'], $upload_path)) {
                // Eliminar imagen anterior si existe
                if ($existing_product['image'] && file_exists($upload_dir . $existing_product['image'])) {
                    unlink($upload_dir . $existing_product['image']);
                }
                $image_name = $new_image_name;
            } else {
                throw new Exception('Error al subir la nueva imagen');
            }
        }
        
        // Actualizar producto en la base de datos
        $sql = "UPDATE products SET 
                name = :name, 
                description = :description, 
                price = :price, 
                stock = :stock,
                image = :image, 
                heat_level = :heat_level, 
                rating = :rating, 
                badge = :badge, 
                origin = :origin,
                category = :category,
                updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([
            ':id' => $id,
            ':name' => trim($name),
            ':description' => trim($description),
            ':price' => floatval($price),
            ':stock' => intval($stock),
            ':image' => $image_name,
            ':heat_level' => intval($heat_level),
            ':rating' => floatval($rating),
            ':badge' => trim($badge),
            ':origin' => trim($origin),
            ':category' => $category
        ]);
        
        if (!$result) {
            throw new Exception('Error al actualizar producto en la base de datos');
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Producto actualizado exitosamente',
            'category' => $category,
            'stock' => intval($stock),
            'image_url' => $image_name ? 'https://admin.hot-bbq.ch/upload/' . $image_name : null
        ]);
    }
    
    else {
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
    }
    
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