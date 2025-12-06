<?php
require_once 'config.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    http_response_code(401);
    sendJSON(['success' => false, 'message' => 'Non connecté']);
    exit;
}

$action = $_GET['action'] ?? '';

try {
    switch($action) {
        case 'list':
            $role = $_GET['role'] ?? '';
            $status = $_GET['status'] ?? '';
            $sort = $_GET['sort'] ?? 'created_at';
            $order = $_GET['order'] ?? 'DESC';
            
            $allowedSorts = ['id', 'name', 'email', 'role', 'status', 'created_at'];
            if (!in_array($sort, $allowedSorts)) {
                $sort = 'created_at';
            }
            
            $sql = "SELECT * FROM users WHERE 1=1";
            $params = [];
            
            if (!empty($role) && $role !== 'all') {
                $sql .= " AND role = ?";
                $params[] = $role;
            }
            
            if (!empty($status) && $status !== 'all') {
                $sql .= " AND status = ?";
                $params[] = $status;
            }
            
            $sql .= " ORDER BY $sort $order";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            sendJSON(['success' => true, 'users' => $users]);
            break;
            
        case 'add':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['name']) || empty($data['email'])) {
                sendJSON(['success' => false, 'message' => 'Nom et email requis']);
                exit;
            }
            
            $stmt = $conn->prepare("INSERT INTO users (name, email, role, status) VALUES (?, ?, ?, ?)");
            $success = $stmt->execute([
                $data['name'],
                $data['email'],
                $data['role'] ?? 'user',
                $data['status'] ?? 'active'
            ]);
            
            if ($success) {
                sendJSON(['success' => true, 'message' => 'Utilisateur ajouté', 'id' => $conn->lastInsertId()]);
            } else {
                sendJSON(['success' => false, 'message' => 'Erreur lors de l\'ajout']);
            }
            break;
            
        case 'update':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id'])) {
                sendJSON(['success' => false, 'message' => 'ID requis']);
                exit;
            }
            
            $stmt = $conn->prepare("UPDATE users SET name=?, email=?, role=?, status=? WHERE id=?");
            $success = $stmt->execute([
                $data['name'],
                $data['email'],
                $data['role'],
                $data['status'],
                $data['id']
            ]);
            
            if ($success) {
                sendJSON(['success' => true, 'message' => 'Utilisateur modifié']);
            } else {
                sendJSON(['success' => false, 'message' => 'Erreur lors de la modification']);
            }
            break;
            
        case 'delete':
            $id = $_GET['id'] ?? 0;
            
            if ($id <= 0) {
                sendJSON(['success' => false, 'message' => 'ID invalide']);
                exit;
            }
            
            // First, check if the user exists
            $checkStmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
            $checkStmt->execute([$id]);
            $userExists = $checkStmt->fetch();
            
            if (!$userExists) {
                sendJSON(['success' => false, 'message' => 'Utilisateur non trouvé']);
                exit;
            }
            
            // Delete the user
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $success = $stmt->execute([$id]);
            
            if ($success) {
                sendJSON(['success' => true, 'message' => 'Utilisateur supprimé']);
            } else {
                sendJSON(['success' => false, 'message' => 'Erreur lors de la suppression']);
            }
            break;
            
        case 'search':
            $query = $_GET['q'] ?? '';
            
            $stmt = $conn->prepare("SELECT * FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY created_at DESC");
            $stmt->execute(["%$query%", "%$query%"]);
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            sendJSON(['success' => true, 'users' => $users]);
            break;
            
        case 'get':
            $id = $_GET['id'] ?? 0;
            
            if ($id <= 0) {
                sendJSON(['success' => false, 'message' => 'ID invalide']);
                exit;
            }
            
            $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                sendJSON(['success' => true, 'user' => $user]);
            } else {
                sendJSON(['success' => false, 'message' => 'Utilisateur non trouvé']);
            }
            break;
            
        default:
            sendJSON(['success' => false, 'message' => 'Action inconnue']);
    }
} catch (Exception $e) {
    // Log the error for debugging
    error_log("API Error: " . $e->getMessage());
    
    // Send a generic error message to the client
    sendJSON(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>