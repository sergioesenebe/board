<?php
// Obtener las variables de entorno
$host = getenv('DB_HOST');
$dbname = getenv('DB_NAME');
$dbname = "boardDB";
$user = getenv('DB_USER');
$password = getenv('DB_PASSWORD');
$port = getenv('DB_PORT');

// Mostrar las variables de entorno
echo "<h1>Conexión a la base de datos</h1>";
echo "<p><strong>Host:</strong> $host</p>";
echo "<p><strong>Nombre de la base de datos:</strong> $dbname</p>";
echo "<p><strong>Usuario:</strong> $user</p>";
echo "<p><strong>Contraseña:</strong> $password</p>";
echo "<p><strong>Puerto:</strong> $port</p>";

try {
    // Intentar conectar a la base de datos usando las variables de entorno
    $conexion = mysqli_connect($host,$user,$password,$dbname);
} catch (PDOException $e) {
    echo "<p><strong>Error al conectar:</strong> " . $e->getMessage() . "</p>";
}

?>
