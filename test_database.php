<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Test de la Base de Données</h1>";

try {
    $host = 'localhost';
    $dbname = 'dashboard_admin';
    $username = 'root';
    $password = '';
    
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p style='color: green;'>✅ Connexion à la base de données réussie</p>";
    
    // Test table users
    $stmt = $conn->query("SELECT * FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h3>Utilisateurs dans la base de données:</h3>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th></tr>";
    
    foreach ($users as $user) {
        echo "<tr>";
        echo "<td>{$user['id']}</td>";
        echo "<td>{$user['name']}</td>";
        echo "<td>{$user['email']}</td>";
        echo "<td>{$user['role']}</td>";
        echo "<td>{$user['status']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<p>Total: " . count($users) . " utilisateurs</p>";
    
    // Test API endpoint
    echo "<h3>Test de l'API:</h3>";
    echo "<a href='api_users.php?action=list' target='_blank'>Tester api_users.php?action=list</a><br>";
    echo "<a href='api_users.php?action=get&id=1' target='_blank'>Tester api_users.php?action=get&id=1</a>";
    
} catch(PDOException $e) {
    echo "<p style='color: red;'>❌ Erreur de connexion: " . $e->getMessage() . "</p>";
    echo "<p>Vérifiez que:</p>";
    echo "<ul>";
    echo "<li>MySQL est démarré</li>";
    echo "<li>La base 'dashboard_admin' existe</li>";
    echo "<li>La table 'users' existe</li>";
    echo "<li>Les identifiants sont corrects (root / mot de passe vide)</li>";
    echo "</ul>";
}
?>