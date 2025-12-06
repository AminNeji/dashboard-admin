<?php
require_once 'config.php';

if (!isLoggedIn()) {
    die('Non autorisé');
}

$type = $_GET['type'] ?? 'users';

$filename = $type . '_' . date('Y-m-d') . '.csv';

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$output = fopen('php://output', 'w');

fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

if ($type === 'users') {
    fputcsv($output, ['ID', 'Nom', 'Email', 'Rôle', 'Statut', 'Date création']);
    
    $stmt = $conn->query("SELECT * FROM users ORDER BY id DESC");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, [
            $row['id'],
            $row['name'],
            $row['email'],
            $row['role'],
            $row['status'],
            $row['created_at']
        ]);
    }
    
} elseif ($type === 'transactions') {
    fputcsv($output, ['ID', 'Utilisateur', 'Produit', 'Montant', 'Statut', 'Date']);
    
    $stmt = $conn->query("
        SELECT t.*, u.name as user_name 
        FROM transactions t 
        LEFT JOIN users u ON t.user_id = u.id 
        ORDER BY t.id DESC
    ");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, [
            $row['id'],
            $row['user_name'],
            $row['product'],
            $row['amount'] . ' €',
            $row['status'],
            $row['created_at']
        ]);
    }
}

fclose($output);
exit;
?>