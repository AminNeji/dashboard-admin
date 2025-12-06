CREATE DATABASE IF NOT EXISTS dashboard_admin;
USE dashboard_admin;

CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    product VARCHAR(100),
    amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO admins (username, password, nom) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mohamed Amin Neji');

INSERT INTO users (name, email, role, status, created_at) VALUES
('Marie Leblanc', 'marie@email.com', 'admin', 'active', '2024-01-15 10:30:00'),
('Pierre Martin', 'pierre@email.com', 'user', 'active', '2024-01-12 14:20:00'),
('Sophie Dubois', 'sophie@email.com', 'moderator', 'inactive', '2024-01-08 09:15:00'),
('Luc Richard', 'luc@email.com', 'user', 'active', '2024-01-05 16:45:00'),
('Anne Bernard', 'anne@email.com', 'user', 'suspended', '2024-01-02 11:00:00'),
('Jean Dupont', 'jean@email.com', 'user', 'active', '2023-12-28 13:30:00'),
('Claire Blanc', 'claire@email.com', 'moderator', 'active', '2023-12-25 15:00:00'),
('Marc Noir', 'marc@email.com', 'user', 'inactive', '2023-12-20 08:45:00');

INSERT INTO transactions (user_id, product, amount, status) VALUES
(1, 'MacBook Pro', 2499.00, 'completed'),
(2, 'iPhone 15', 1299.00, 'completed'),
(3, 'AirPods Pro', 279.00, 'pending'),
(4, 'iPad Air', 699.00, 'completed'),
(5, 'Apple Watch', 449.00, 'completed');