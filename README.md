
# 📊 Dashboard Admin - ISSAT Sousse

A complete admin dashboard built with PHP, MySQL, and JavaScript for user and transaction management.

![PHP Version](https://img.shields.io/badge/PHP-7.4%2B-blue)
![MySQL](https://img.shields.io/badge/MySQL-5.7%2B-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Completed-success)

## 🚀 Quick Installation (2 minutes)

### Prerequisites
- PHP 7.4+
- MySQL 5.7+
- XAMPP/WAMP/MAMP (recommended)

## 📸 Screenshots

### Login 
[!Login](screenshots/login.PNG)

### Dashboard
[!Dashboard](screenshots/dashboard.PNG)
[!Dashboard](screenshots/dashboard2.PNG)

### Users Management
[!Users Management](screenshots/utilisaterus.PNG)

### Ventes
[!Ventes](screenshots/ventes.PNG)
[!Ventes](screenshots/ventes2.PNG)

### Analytics
[!Analytic](screenshots/analytiques.PNG)
[!Analytic](screenshots/analytiques2.PNG)

### Settings
[!Settings](screenshots/parametres.PNG)


### Setup Instructions
```
1. **Copy files to your server folder**
C:\xampp\htdocs\dashboard-admin\ (for XAMPP)
2. **Create the database**
- Open phpMyAdmin (http://localhost/phpmyadmin)
- Click "New Database"
- Name: `dashboard_admin`
- Click "Create"
- Go to "Import" tab
- Select `database_simple.sql` file
- Click "Execute"
3. **Access the application**
http://localhost/dashboard-admin/php/login.php
4. **Login with these credentials**
Username: admin
Password: admin123

```
## ✨ Features
```
✅ **User Management** - Full CRUD operations (Create, Read, Update, Delete)  
✅ **Secure Authentication** - PHP sessions with password hashing  
✅ **Interactive Charts** - Real-time data visualization with Chart.js  
✅ **Advanced Filtering** - Filter users by role, status, and date  
✅ **CSV Export** - Export user and transaction data  
✅ **Responsive Design** - Works on mobile, tablet, and desktop  
✅ **Real-time Search** - Instant search functionality  
✅ **Data Statistics** - Dashboard with key metrics  

```
## 📁 Project Structure
```
dashboard-admin/
├── acceuil.html # Main dashboard page
├── utilisateurs.html # Users management
├── ventes.html # Sales management
├── analytique.html # Analytics page
├── parametres.html # Settings page
├── acceuil.css # Main stylesheet (900+ lines)
├── dashboard.js # Main JavaScript (700+ lines)
├── database_simple.sql # Database structure + sample data
├── php/
│ ├── config.php # Database configuration
│ ├── login.php # Login page
│ ├── logout.php # Logout functionality
│ ├── api_users.php # Users API (CRUD operations)
│ ├── api_stats.php # Statistics API
│ ├── export_csv.php # CSV export functionality
│ └── test.php # Testing script
└── issatso.PNG # Institution logo

```

## 🔧 How to Use
### Managing Users
```
1. Navigate to **Utilisateurs** in sidebar
2. Click **"Nouvel utilisateur"** to add users
3. Use filters to sort by role/status
4. Click edit/delete buttons for user actions
```
### Viewing Analytics
```
1. Go to **Analytique** section
2. View interactive charts and statistics
3. Filter data by time periods

```
### Exporting Data
```
1. Click the **"Exporter CSV"** button
2. Choose between users or transactions export
3. Download the generated CSV file
```
## 🛠️ Technical Details

### Backend (PHP)
```
- Secure session management
- RESTful API design
- Prepared statements for SQL security
- JSON response formatting
```
### Frontend (JavaScript)
```
- Vanilla ES6+ JavaScript
- Chart.js for data visualization
- AJAX for async operations
- Modern CSS with Flexbox/Grid
```
### Database (MySQL)
```
Tables:

admins (administrator accounts)
users (system users)
transactions (user transactions)
Relationships:
transactions.user_id → users.id (CASCADE DELETE)


```
## 🐛 Troubleshooting
```

**Issue:** Can't connect to database
``php
// Check php/config.php
$host = 'localhost';      // Should be 'localhost'
$dbname = 'dashboard_admin'; // Database name
$username = 'root';       // Default XAMPP username
$password = '';           // Default XAMPP password (empty)
Issue: Charts not displaying

Ensure internet connection (Chart.js uses CDN)

Check browser console for JavaScript errors

Issue: Login not working

Verify database was imported correctly

Check php/test.php for errors

📄 Database Schema
sql
-- Main tables
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
📞 Support
```
For questions or issues:

Run php/test.php for debugging

Check browser console (F12) for JavaScript errors

Verify database connection in phpMyAdmin
```
👨‍💻 Author
Mohamed Amin Neji
Student at ISSAT Sousse
Computer Science Department
