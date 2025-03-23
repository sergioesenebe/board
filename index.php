<?php
// Obtener las variables de entorno
$host = getenv('DB_HOST');
$dbname = getenv('DB_NAME');
$user = getenv('DB_USER');
$password = getenv('DB_PASSWORD');
$port = getenv('DB_PORT');

try {
    // Intentar conectar a la base de datos usando las variables de entorno
    $conexion = mysqli_connect($host,$user,$password,$dbname);
} catch (PDOException $e) {
    echo "<p><strong>Error al conectar:</strong> " . $e->getMessage() . "</p>";
}

?>
