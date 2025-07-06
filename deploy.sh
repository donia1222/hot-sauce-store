#\!/bin/bash

# Script de despliegue automático para archivos PHP
# Configuración SFTP
HOST="sl1809.web.hostpoint.ch"
USER="owoxogis"
REMOTE_PATH="www/admin.hot-bbq.ch"
LOCAL_PATH="./api"

echo "🚀 Iniciando despliegue de archivos PHP..."

# Verificar que la carpeta api existe
if [ \! -d "$LOCAL_PATH" ]; then
    echo "❌ Error: La carpeta $LOCAL_PATH no existe"
    exit 1
fi

# Subir archivos PHP via SFTP (excluyendo config.php)
echo "📤 Subiendo archivos PHP a $HOST... (excluyendo config.php)"

# Crear lista temporal de archivos a subir
cd api
for file in *.php; do
    if [ "$file" \!= "config.php" ]; then
        sftp -o StrictHostKeyChecking=no "$USER@$HOST" << SFTP_EOF
cd www/admin.hot-bbq.ch
put $file
bye
SFTP_EOF
    fi
done
cd ..

# Subir carpeta uploads si existe
if [ -d "api/uploads" ]; then
    sftp -o StrictHostKeyChecking=no "$USER@$HOST" << 'SFTP_EOF'
cd www/admin.hot-bbq.ch
put -r api/uploads
bye
SFTP_EOF
fi

echo "✅ Despliegue completado exitosamente\!"
echo "🌐 Archivos disponibles en: https://admin.hot-bbq.ch/"
echo "⚠️  config.php NO se actualizó (excluido)"
EOF < /dev/null