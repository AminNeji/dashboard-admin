<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🧪 Test du Dashboard Admin</h1>";
echo "<hr>";

echo "<h2>1. Test de connexion à la base de données</h2>";
$host = 'localhost';
$dbname = 'dashboard_admin';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connexion réussie à la base de données<br>";
} catch(PDOException $e) {
    echo "❌ Erreur de connexion: " . $e->getMessage() . "<br>";
    die();
}

echo "<h2>2. Test de la table admins</h2>";
$stmt = $conn->query("SELECT * FROM admins");
$admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "✅ Nombre d'admins trouvés : " . count($admins) . "<br>";
foreach($admins as $admin) {
    echo "- Username: {$admin['username']}, Nom: {$admin['nom']}<br>";
}

echo "<h2>3. Test du mot de passe</h2>";
$password_to_test = 'admin123';
$stmt = $conn->prepare("SELECT * FROM admins WHERE username = ?");
$stmt->execute(['admin']);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if ($admin) {
    echo "Admin trouvé : {$admin['username']}<br>";
    echo "Hash dans BDD : {$admin['password']}<br>";
    
    if (password_verify($password_to_test, $admin['password'])) {
        echo "✅ Le mot de passe 'admin123' fonctionne !<br>";
    } else {
        echo "❌ Le mot de passe 'admin123' ne fonctionne PAS<br>";
        echo "<strong>SOLUTION :</strong> Exécutez cette requête dans PHPMyAdmin :<br>";
        $new_hash = password_hash('admin123', PASSWORD_DEFAULT);
        echo "<code>UPDATE admins SET password = '$new_hash' WHERE username = 'admin';</code><br>";
    }
} else {
    echo "❌ Aucun admin trouvé avec le username 'admin'<br>";
}

echo "<h2>4. Test de la table users</h2>";
$stmt = $conn->query("SELECT COUNT(*) as total FROM users");
$count = $stmt->fetch()['total'];
echo "✅ Nombre d'utilisateurs : $count<br>";

echo "<h2>5. Test de la table transactions</h2>";
$stmt = $conn->query("SELECT COUNT(*) as total FROM transactions");
$count = $stmt->fetch()['total'];
echo "✅ Nombre de transactions : $count<br>";

echo "<h2>6. Test des fichiers</h2>";
$files = [
    '../acceuil.html',
    '../utilisateurs.html',
    '../acceuil.css',
    '../dashboard.js',
    'config.php',
    'login.php',
    'logout.php',
    'api_users.php',
    'api_stats.php',
    'export_csv.php'
];

foreach($files as $file) {
    if (file_exists($file)) {
        echo "✅ $file existe<br>";
    } else {
        echo "❌ $file MANQUANT<br>";
    }
}

echo "<hr>";
echo "<h2>✅ RÉSUMÉ</h2>";
echo "<p>Si tous les tests sont verts (✅), votre projet est prêt !</p>";
echo "<p><a href='login.php'>→ Aller à la page de connexion</a></p>";
?>