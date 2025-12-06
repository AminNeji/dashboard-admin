<?php
require_once 'config.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    sendJSON(['success' => false, 'message' => 'Non connecté']);
}

$action = $_GET['action'] ?? 'dashboard';

if ($action === 'dashboard') {
    $stmt = $conn->query("SELECT COUNT(*) as total FROM users");
    $totalUsers = $stmt->fetch()['total'];
    
    $stmt = $conn->query("SELECT COUNT(*) as total FROM users WHERE status='active'");
    $activeUsers = $stmt->fetch()['total'];
    
    $stmt = $conn->query("SELECT SUM(amount) as total FROM transactions WHERE status='completed'");
    $totalRevenue = $stmt->fetch()['total'] ?? 0;
    
    $stmt = $conn->query("SELECT COUNT(*) as total FROM transactions");
    $totalTransactions = $stmt->fetch()['total'];
    
    $stmt = $conn->query("SELECT COUNT(*) as total FROM transactions WHERE status='pending'");
    $pendingTransactions = $stmt->fetch()['total'];
    
    $stmt = $conn->query("
        SELECT t.*, u.name as user_name 
        FROM transactions t 
        LEFT JOIN users u ON t.user_id = u.id 
        ORDER BY t.created_at DESC 
        LIMIT 5
    ");
    $recentTransactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendJSON([
        'success' => true,
        'stats' => [
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'total_revenue' => number_format($totalRevenue, 2),
            'total_transactions' => $totalTransactions,
            'pending_transactions' => $pendingTransactions
        ],
        'recent_transactions' => $recentTransactions
    ]);
    
} elseif ($action === 'chart_data') {
    $stmt = $conn->query("
        SELECT DATE(created_at) as date, SUM(amount) as total 
        FROM transactions 
        WHERE status='completed' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date
    ");
    $dailyRevenue = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $conn->query("
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
    ");
    $usersByRole = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendJSON([
        'success' => true,
        'daily_revenue' => $dailyRevenue,
        'users_by_role' => $usersByRole
    ]);
}
?>