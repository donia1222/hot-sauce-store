<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Obtener datos del POST
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}

// Extraer información del pedido
$payerID = $data['payerID'] ?? '';
$customerInfo = $data['customerInfo'] ?? [];
$cart = $data['cart'] ?? [];
$total = $data['total'] ?? 0;
$timestamp = $data['timestamp'] ?? date('Y-m-d H:i:s');

// Validar datos requeridos
if (empty($payerID) || empty($customerInfo) || empty($cart)) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos requeridos']);
    exit;
}

// Configuración de emails
$toStore = 'info@lweb.ch';
$toCustomer = $customerInfo['email'] ?? '';
$fromEmail = 'info@cantinatexmex.ch';

if (empty($toCustomer)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email del cliente requerido']);
    exit;
}

// ===== EMAIL PARA LA TIENDA (en alemán) =====
$storeSubject = '🌶️ NEUE BESTELLUNG - FEUER KÖNIGREICH - PayPal ID: ' . $payerID;
$storeEmailContent = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .urgent { background-color: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #ffc107; }
        .order-details { background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .customer-info { background-color: #e7f3ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .product-item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #dc3545; }
        .next-steps { background-color: #d4edda; padding: 15px; margin: 15px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>🔥 NEUE BESTELLUNG - FEUER KÖNIGREICH</h1>
        <p>Zahlung erfolgreich über PayPal verarbeitet!</p>
    </div>
    
    <div class='content'>
        <div class='urgent'>
            <h2>⚡ SOFORTIGE BEARBEITUNG ERFORDERLICH</h2>
            <p><strong>Neue Bestellung eingegangen - Sofort bearbeiten</strong></p>
            <p>PayPal ID: <strong>{$payerID}</strong></p>
        </div>

        <div class='order-details'>
            <h2>💳 Zahlungsdetails</h2>
            <p><strong>PayPal Payer ID:</strong> {$payerID}</p>
            <p><strong>Datum und Zeit:</strong> {$timestamp}</p>
            <p><strong>Status:</strong> ✅ BEZAHLT UND BESTÄTIGT</p>
            <p><strong>Bezahlter Betrag:</strong> <span class='total'>{$total} CHF</span></p>
        </div>

        <div class='customer-info'>
            <h2>👤 Kundeninformationen</h2>
            <p><strong>Name:</strong> {$customerInfo['firstName']} {$customerInfo['lastName']}</p>
            <p><strong>E-Mail:</strong> {$customerInfo['email']}</p>
            <p><strong>Telefon:</strong> {$customerInfo['phone']}</p>
            <h3>📮 Lieferadresse:</h3>
            <p>{$customerInfo['address']}</p>
            <p>{$customerInfo['postalCode']} {$customerInfo['city']}</p>
            <p><strong>Kanton:</strong> {$customerInfo['canton']}</p>";

if (!empty($customerInfo['notes'])) {
    $storeEmailContent .= "<p><strong>⚠️ Besondere Hinweise:</strong> {$customerInfo['notes']}</p>";
}

$storeEmailContent .= "
        </div>

        <div class='order-details'>
            <h2>🛒 Zu versendende Produkte</h2>";

$subtotal = 0;
foreach ($cart as $item) {
    $itemTotal = $item['price'] * $item['quantity'];
    $subtotal += $itemTotal;
    
    $storeEmailContent .= "
            <div class='product-item'>
                <p><strong>{$item['name']}</strong></p>
                <p>Menge: <strong>{$item['quantity']}</strong> x {$item['price']} CHF = <strong>{$itemTotal} CHF</strong></p>
                <p><em>{$item['description']}</em></p>
            </div>";
}

$storeEmailContent .= "
            <div style='margin-top: 20px; padding-top: 15px; border-top: 2px solid #dc3545;'>
                <p><strong>Zwischensumme:</strong> {$subtotal} CHF</p>
                <p><strong>Versand:</strong> Kostenlos</p>
                <p class='total'>GESAMT BEZAHLT: {$total} CHF</p>
            </div>
        </div>

        <div class='next-steps'>
            <h3>📦 Nächste Schritte</h3>
            <p>✅ Zahlung von PayPal bestätigt</p>
            <p>📋 Bestellung bearbeiten und Versand vorbereiten</p>
            <p>📮 Versand in 2-3 Werktagen an:</p>
            <p><strong>{$customerInfo['address']}, {$customerInfo['postalCode']} {$customerInfo['city']}</strong></p>
            <p>📧 Tracking-Nummer an Kunde senden: {$customerInfo['email']}</p>
        </div>
    </div>
</body>
</html>";

// ===== EMAIL PARA EL CLIENTE (en alemán) =====
$customerSubject = '🔥 Bestellbestätigung - FEUER KÖNIGREICH';
$customerEmailContent = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .thank-you { background-color: #d4edda; padding: 20px; margin: 15px 0; border-radius: 5px; text-align: center; }
        .order-details { background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .product-item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #dc3545; }
        .shipping-info { background-color: #e7f3ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>🔥 FEUER KÖNIGREICH</h1>
        <p>Vielen Dank für Ihre Bestellung!</p>
    </div>
    
    <div class='content'>
        <div class='thank-you'>
            <h2>✅ Bestellung bestätigt!</h2>
            <p>Liebe/r {$customerInfo['firstName']},</p>
            <p>Vielen Dank für Ihre Bestellung bei FEUER KÖNIGREICH! Ihre Zahlung wurde erfolgreich verarbeitet.</p>
        </div>

        <div class='order-details'>
            <h2>📋 Ihre Bestelldetails</h2>
            <p><strong>Bestellnummer:</strong> {$payerID}</p>
            <p><strong>Datum:</strong> " . date('d.m.Y H:i', strtotime($timestamp)) . "</p>
            <p><strong>Status:</strong> ✅ Bezahlt</p>
        </div>

        <div class='order-details'>
            <h2>🛒 Bestellte Produkte</h2>";

foreach ($cart as $item) {
    $itemTotal = $item['price'] * $item['quantity'];
    
    $customerEmailContent .= "
            <div class='product-item'>
                <p><strong>{$item['name']}</strong></p>
                <p>Menge: {$item['quantity']} x {$item['price']} CHF = {$itemTotal} CHF</p>
                <p><em>{$item['description']}</em></p>
            </div>";
}

$customerEmailContent .= "
            <div style='margin-top: 20px; padding-top: 15px; border-top: 2px solid #dc3545;'>
                <p><strong>Zwischensumme:</strong> {$subtotal} CHF</p>
                <p><strong>Versand:</strong> Kostenlos</p>
                <p class='total'>GESAMT: {$total} CHF</p>
            </div>
        </div>

        <div class='order-details'>
            <h2>📮 Lieferadresse</h2>
            <p><strong>{$customerInfo['firstName']} {$customerInfo['lastName']}</strong></p>
            <p>{$customerInfo['address']}</p>
            <p>{$customerInfo['postalCode']} {$customerInfo['city']}</p>
            <p>{$customerInfo['canton']}</p>
        </div>

        <div class='shipping-info'>
            <h3>📦 Was passiert als nächstes?</h3>
            <p>✅ Ihre Zahlung wurde bestätigt</p>
            <p>📦 Wir bereiten Ihre Bestellung vor</p>
            <p>🚚 Versand in 2-3 Werktagen</p>
            <p>📧 Sie erhalten eine Tracking-Nummer per E-Mail</p>
            <p>📞 Bei Fragen: info@cantinatexmex.ch</p>
        </div>

        <div class='footer'>
            <p><strong>Vielen Dank für Ihr Vertrauen!</strong></p>
            <p>🔥 FEUER KÖNIGREICH Team</p>
            <p>info@cantinatexmex.ch</p>
        </div>
    </div>
</body>
</html>";

// Headers para emails HTML
$storeHeaders = "MIME-Version: 1.0\r\n";
$storeHeaders .= "Content-type: text/html; charset=UTF-8\r\n";
$storeHeaders .= "From: {$fromEmail}\r\n";
$storeHeaders .= "Reply-To: {$customerInfo['email']}\r\n";

$customerHeaders = "MIME-Version: 1.0\r\n";
$customerHeaders .= "Content-type: text/html; charset=UTF-8\r\n";
$customerHeaders .= "From: {$fromEmail}\r\n";
$customerHeaders .= "Reply-To: {$fromEmail}\r\n";

// Enviar emails
$storeEmailSent = mail($toStore, $storeSubject, $storeEmailContent, $storeHeaders);
$customerEmailSent = mail($toCustomer, $customerSubject, $customerEmailContent, $customerHeaders);

// Respuesta
echo json_encode([
    'success' => ($storeEmailSent && $customerEmailSent),
    'message' => 'E-Mails zur Bestellbestätigung gesendet',
    'details' => [
        'payerID' => $payerID,
        'storeEmailSent' => $storeEmailSent,
        'customerEmailSent' => $customerEmailSent,
        'toStore' => $toStore,
        'toCustomer' => $toCustomer,
        'timestamp' => date('Y-m-d H:i:s')
    ]
]);
?>

// Función para enviar email de confirmación de Stripe
function sendStripeConfirmationEmail($data) {
    $customerInfo = $data['customerInfo'];
    $billingAddress = $data['billingAddress'] ?? null;
    $cart = $data['cart'];
    $total = $data['total'];
    $orderNumber = $data['orderNumber'];
    
    // Configuración de emails
    $toStore = 'info@lweb.ch';
    $toCustomer = $customerInfo['email'];
    $fromEmail = 'info@cantinatexmex.ch';
    
    // ===== EMAIL PARA LA TIENDA (Stripe) =====
    $storeSubject = '💳 NUEVA ORDEN STRIPE - Salsas.ch - ' . $orderNumber;
    $storeEmailContent = generateStoreStripeEmail($customerInfo, $billingAddress, $cart, $total, $orderNumber);
    
    // ===== EMAIL PARA EL CLIENTE (Stripe) =====
    $customerSubject = '💳 Bestellbestätigung - Salsas.ch';
    $customerEmailContent = generateCustomerStripeEmail($customerInfo, $billingAddress, $cart, $total, $orderNumber);
    
    // Headers para emails HTML
    $storeHeaders = "MIME-Version: 1.0\r\n";
    $storeHeaders .= "Content-type: text/html; charset=UTF-8\r\n";
    $storeHeaders .= "From: {$fromEmail}\r\n";
    $storeHeaders .= "Reply-To: {$customerInfo['email']}\r\n";
    
    $customerHeaders = "MIME-Version: 1.0\r\n";
    $customerHeaders .= "Content-type: text/html; charset=UTF-8\r\n";
    $customerHeaders .= "From: {$fromEmail}\r\n";
    $customerHeaders .= "Reply-To: {$fromEmail}\r\n";
    
    // Enviar emails
    $storeEmailSent = mail($toStore, $storeSubject, $storeEmailContent, $storeHeaders);
    $customerEmailSent = mail($toCustomer, $customerSubject, $customerEmailContent, $customerHeaders);
    
    return [
        'success' => ($storeEmailSent && $customerEmailSent),
        'storeEmailSent' => $storeEmailSent,
        'customerEmailSent' => $customerEmailSent
    ];
}

function generateStoreStripeEmail($customerInfo, $billingAddress, $cart, $total, $orderNumber) {
    $subtotal = 0;
    foreach ($cart as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }
    
    $content = "
    <\!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .urgent { background-color: #dbeafe; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2563eb; }
            .order-details { background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .customer-info { background-color: #e7f3ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .product-item { border-bottom: 1px solid #eee; padding: 10px 0; }
            .total { font-weight: bold; font-size: 18px; color: #2563eb; }
            .next-steps { background-color: #dcfce7; padding: 15px; margin: 15px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>💳 NUEVA ORDEN STRIPE - Salsas.ch</h1>
            <p>Pago con tarjeta de crédito completado\!</p>
        </div>
        
        <div class='content'>
            <div class='urgent'>
                <h2>💳 PAGO CON TARJETA COMPLETADO</h2>
                <p><strong>Nueva bestellung con pago Stripe</strong></p>
                <p>Bestellnummer: <strong>{$orderNumber}</strong></p>
                <p><strong>✅ PAGO COMPLETADO - Listo para envío\!</strong></p>
            </div>

            <div class='order-details'>
                <h2>💳 Detalles del pago</h2>
                <p><strong>Método de pago:</strong> Tarjeta de crédito (Stripe)</p>
                <p><strong>Bestellnummer:</strong> {$orderNumber}</p>
                <p><strong>Datum:</strong> " . date('d.m.Y H:i') . "</p>
                <p><strong>Status:</strong> ✅ PAGADO Y CONFIRMADO</p>
                <p><strong>Betrag:</strong> <span class='total'>{$total} CHF</span></p>
            </div>

            <div class='customer-info'>
                <h2>👤 Kundeninformationen</h2>
                <p><strong>Name:</strong> {$customerInfo['firstName']} {$customerInfo['lastName']}</p>
                <p><strong>E-Mail:</strong> {$customerInfo['email']}</p>
                <p><strong>Telefon:</strong> {$customerInfo['phone']}</p>
                <h3>📮 Lieferadresse:</h3>
                <p><strong>{$customerInfo['firstName']} {$customerInfo['lastName']}</strong></p>
                <p>{$customerInfo['address']}</p>
                <p>{$customerInfo['postalCode']} {$customerInfo['city']}</p>
                <p><strong>Kanton:</strong> {$customerInfo['canton']}</p>";
    
    // Agregar dirección de facturación si es diferente
    if ($billingAddress) {
        $content .= "
                <h3>💳 Rechnungsadresse (ANDERS ALS LIEFERADRESSE):</h3>
                <p style='background-color: #fef3c7; padding: 10px; border-radius: 5px; border-left: 4px solid #f59e0b;'>
                    <strong>⚠️ WICHTIG: Rechnung an andere Adresse senden\!</strong>
                </p>
                <p><strong>{$billingAddress['firstName']} {$billingAddress['lastName']}</strong></p>
                <p>{$billingAddress['address']}</p>
                <p>{$billingAddress['postalCode']} {$billingAddress['city']}</p>
                <p><strong>Kanton:</strong> {$billingAddress['canton']}</p>";
    } else {
        $content .= "
                <h3>💳 Rechnungsadresse:</h3>
                <p><em>Gleich wie Lieferadresse</em></p>";
    }
    
    if (\!empty($customerInfo['notes'])) {
        $content .= "<p><strong>⚠️ Besondere Hinweise:</strong> {$customerInfo['notes']}</p>";
    }
    
    $content .= "
            </div>

            <div class='order-details'>
                <h2>🛒 Zu versendende Produkte</h2>";
    
    foreach ($cart as $item) {
        $itemTotal = $item['price'] * $item['quantity'];
        $content .= "
                <div class='product-item'>
                    <p><strong>{$item['name']}</strong></p>
                    <p>Menge: <strong>{$item['quantity']}</strong> x {$item['price']} CHF = <strong>{$itemTotal} CHF</strong></p>
                    <p><em>{$item['description']}</em></p>
                </div>";
    }
    
    $content .= "
                <div style='margin-top: 20px; padding-top: 15px; border-top: 2px solid #2563eb;'>
                    <p><strong>Zwischensumme:</strong> {$subtotal} CHF</p>
                    <p><strong>Versand:</strong> Kostenlos</p>
                    <p class='total'>GESAMT BEZAHLT: {$total} CHF</p>
                </div>
            </div>

            <div class='next-steps'>
                <h3>📦 Nächste Schritte - STRIPE</h3>
                <p>✅ Zahlung über Stripe bestätigt</p>
                <p>📋 Bestellung bearbeiten und Versand vorbereiten</p>
                <p>📦 Ware sofort versenden - Zahlung ist abgeschlossen</p>
                <p>📮 Versand an:</p>
                <p style='margin-left: 20px;'><strong>{$customerInfo['firstName']} {$customerInfo['lastName']}</strong><br>
                   {$customerInfo['address']}<br>
                   {$customerInfo['postalCode']} {$customerInfo['city']}</p>
                <p>📧 Tracking-Nummer an Kunde senden: {$customerInfo['email']}</p>
            </div>
        </div>
    </body>
    </html>";
    
    return $content;
}

function generateCustomerStripeEmail($customerInfo, $billingAddress, $cart, $total, $orderNumber) {
    $subtotal = 0;
    foreach ($cart as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }
    
    $content = "
    <\!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .thank-you { background-color: #dbeafe; padding: 20px; margin: 15px 0; border-radius: 5px; text-align: center; }
            .order-details { background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .product-item { border-bottom: 1px solid #eee; padding: 10px 0; }
            .total { font-weight: bold; font-size: 18px; color: #2563eb; }
            .payment-info { background-color: #dcfce7; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #16a34a; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>💳 Salsas.ch</h1>
            <p>Bestellbestätigung - Zahlung erfolgreich\!</p>
        </div>
        
        <div class='content'>
            <div class='thank-you'>
                <h2>✅ Bestellung bestätigt\!</h2>
                <p>Liebe/r {$customerInfo['firstName']},</p>
                <p>Vielen Dank für Ihre Bestellung bei Salsas.ch\! Ihre Zahlung wurde erfolgreich verarbeitet.</p>
            </div>

            <div class='payment-info'>
                <h3>💳 Zahlung erfolgreich abgeschlossen</h3>
                <p>✅ <strong>Ihre Kreditkartenzahlung wurde erfolgreich verarbeitet</strong></p>
                <p>📧 Sie erhalten keine separate Rechnung</p>
                <p>📦 Ihre Bestellung wird sofort bearbeitet und versendet</p>
            </div>

            <div class='order-details'>
                <h2>📋 Ihre Bestelldetails</h2>
                <p><strong>Bestellnummer:</strong> {$orderNumber}</p>
                <p><strong>Datum:</strong> " . date('d.m.Y H:i') . "</p>
                <p><strong>Zahlungsart:</strong> 💳 Kreditkarte (Stripe)</p>
                <p><strong>Status:</strong> ✅ Bezahlt und bestätigt</p>
            </div>

            <div class='order-details'>
                <h2>🛒 Bestellte Produkte</h2>";
    
    foreach ($cart as $item) {
        $itemTotal = $item['price'] * $item['quantity'];
        $content .= "
                <div class='product-item'>
                    <p><strong>{$item['name']}</strong></p>
                    <p>Menge: {$item['quantity']} x {$item['price']} CHF = {$itemTotal} CHF</p>
                    <p><em>{$item['description']}</em></p>
                </div>";
    }
    
    $content .= "
                <div style='margin-top: 20px; padding-top: 15px; border-top: 2px solid #2563eb;'>
                    <p><strong>Zwischensumme:</strong> {$subtotal} CHF</p>
                    <p><strong>Versand:</strong> Kostenlos</p>
                    <p class='total'>GESAMT BEZAHLT: {$total} CHF</p>
                </div>
            </div>

            <div class='order-details'>
                <h2>📮 Lieferadresse</h2>
                <p><strong>{$customerInfo['firstName']} {$customerInfo['lastName']}</strong></p>
                <p>{$customerInfo['address']}</p>
                <p>{$customerInfo['postalCode']} {$customerInfo['city']}</p>
                <p>{$customerInfo['canton']}</p>
            </div>";
    
    // Agregar dirección de facturación si es diferente
    if ($billingAddress) {
        $content .= "
            <div class='order-details'>
                <h2>💳 Rechnungsadresse</h2>
                <p><strong>{$billingAddress['firstName']} {$billingAddress['lastName']}</strong></p>
                <p>{$billingAddress['address']}</p>
                <p>{$billingAddress['postalCode']} {$billingAddress['city']}</p>
                <p>{$billingAddress['canton']}</p>
            </div>";
    }
    
    $content .= "

            <div class='payment-info'>
                <h3>📦 Was passiert als nächstes?</h3>
                <p>✅ Ihre Zahlung wurde bestätigt</p>
                <p>📦 Wir bereiten Ihre Bestellung vor</p>
                <p>🚚 Versand in 2-3 Werktagen</p>
                <p>📧 Sie erhalten eine Tracking-Nummer per E-Mail</p>
                <p>📞 Bei Fragen: info@cantinatexmex.ch</p>
            </div>

            <div class='footer'>
                <p><strong>Vielen Dank für Ihr Vertrauen\!</strong></p>
                <p>💳 Salsas.ch Team</p>
                <p>info@cantinatexmex.ch</p>
            </div>
        </div>
    </body>
    </html>";
    
    return $content;
}
EOF < /dev/null