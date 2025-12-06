const API_BASE = 'php/';

async function fetchAPI(endpoint, options = {}) {
    try {
        const url = API_BASE + endpoint;
        console.log('Fetching:', url, options);
        
        const response = await fetch(url, options);
                if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
                const responseText = await response.text();
        console.log('Raw response:', responseText.substring(0, 200) + '...');
    
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Response was:', responseText);
            throw new Error('Invalid JSON response from server');
        }
        
        return data;
    } catch (error) {
        console.error('Erreur API:', error);
        showNotification('Erreur de connexion au serveur: ' + error.message, 'error');
        return { success: false, message: error.message };
    }
}
function updateChartPeriod(period) {
    showNotification(`Période mise à jour: ${period}`, 'info');
    
    // Update chart data based on period
    const salesChart = Chart.getChart('salesChart');
    if (salesChart) {
        if (period.includes('7')) {
            salesChart.data.labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
            salesChart.data.datasets[0].data = [3200, 4100, 2800, 5200, 3900, 4800, 3500];
        } else if (period.includes('30')) {
            salesChart.data.labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
            salesChart.data.datasets[0].data = [18500, 22400, 19800, 24500];
        } else if (period.includes('90')) {
            salesChart.data.labels = ['Mois 1', 'Mois 2', 'Mois 3'];
            salesChart.data.datasets[0].data = [65200, 73400, 81800];
        }
        salesChart.update();
    }
}

function exportChartData() {
    const chart = Chart.getChart('revenueChart');
    if (chart) {
        const data = {
            labels: chart.data.labels,
            datasets: chart.data.datasets.map(dataset => ({
                label: dataset.label,
                data: dataset.data
            }))
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'chart-data.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('Données du graphique exportées', 'success');
    }
}
class UsersTablePHP {
    constructor() {
        this.container = document.getElementById('users-table');
        this.currentFilters = { role: 'all', status: 'all', sort: 'created_at', order: 'DESC' };
        this.loadUsers();
        this.attachFilterListeners();
    }
    
    async loadUsers(filters = {}) {
        let url = 'api_users.php?action=list';
        
        if (filters.role && filters.role !== 'all') {
            url += `&role=${filters.role}`;
        }
        if (filters.status && filters.status !== 'all') {
            url += `&status=${filters.status}`;
        }
        if (filters.sort) {
            url += `&sort=${filters.sort}&order=${filters.order || 'DESC'}`;
        }
        
        const result = await fetchAPI(url);
        
        if (result.success) {
            this.users = result.users;
            this.render();
        } else {
            showNotification('Erreur de chargement des utilisateurs', 'error');
        }
    }
    
    attachFilterListeners() {
        const roleFilter = document.getElementById('role-filter');
        if (roleFilter) {
            roleFilter.addEventListener('change', (e) => {
                this.currentFilters.role = e.target.value;
                this.loadUsers(this.currentFilters);
            });
        }
        
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.loadUsers(this.currentFilters);
            });
        }
        
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.loadUsers(this.currentFilters);
            });
        }
    }
    
    render() {
        if (!this.container) return;
        
        const tbody = this.container.querySelector('tbody');
        if (!tbody) return;
        
        if (!this.users || this.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem;">Aucun utilisateur trouvé</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.users.map(user => `
            <tr data-id="${user.id}">
                <td><input type="checkbox" class="row-checkbox"></td>
                <td>
                    <div class="user-cell">
                        <div class="avatar small">${this.getInitials(user.name)}</div>
                        <div>
                            <p class="user-name-table">${user.name}</p>
                            <p class="user-id">#USR-${user.id}</p>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td><span class="status-badge ${this.getStatusClass(user.status)}">${this.getStatusLabel(user.status)}</span></td>
                <td>${this.formatDate(user.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="editUser(${user.id})" title="Modifier">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="action-btn danger delete-btn" onclick="deleteUser(${user.id})" title="Supprimer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    
    getStatusClass(status) {
        const classes = {
            'active': 'success',
            'inactive': 'warning',
            'suspended': 'danger'
        };
        return classes[status] || 'warning';
    }
    
    getStatusLabel(status) {
        const labels = {
            'active': 'Actif',
            'inactive': 'Inactif',
            'suspended': 'Suspendu'
        };
        return labels[status] || status;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

async function deleteUser(id) {
    if (!id || id <= 0) {
        showNotification('ID utilisateur invalide', 'error');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
        return;
    }
    
    try {
        showNotification('Suppression en cours...', 'info');
        
        const result = await fetchAPI(`api_users.php?action=delete&id=${id}`);
        
        if (result.success) {
            showNotification('Utilisateur supprimé avec succès', 'success');
            if (window.usersTablePHP) {
                setTimeout(() => {
                    window.usersTablePHP.loadUsers(window.usersTablePHP.currentFilters);
                }, 300);
            }
        } else {
            showNotification(result.message || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Erreur de connexion lors de la suppression', 'error');
    }
}

async function editUser(id) {
    const result = await fetchAPI(`api_users.php?action=get&id=${id}`);
    
    if (result.success) {
        const user = result.user;
        
        const modalHTML = `
            <div id="editUserModal" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                ">
                    <h3 style="margin-bottom: 1.5rem; color: #1f2937;">Modifier l'utilisateur</h3>
                    
                    <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Nom complet</label>
                            <input type="text" id="editUserName" value="${user.name}" style="
                                width: 100%;
                                padding: 0.75rem;
                                border: 2px solid #e5e7eb;
                                border-radius: 8px;
                                font-size: 1rem;
                            ">
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Email</label>
                            <input type="email" id="editUserEmail" value="${user.email}" style="
                                width: 100%;
                                padding: 0.75rem;
                                border: 2px solid #e5e7eb;
                                border-radius: 8px;
                                font-size: 1rem;
                            ">
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Rôle</label>
                            <select id="editUserRole" style="
                                width: 100%;
                                padding: 0.75rem;
                                border: 2px solid #e5e7eb;
                                border-radius: 8px;
                                font-size: 1rem;
                                background: white;
                            ">
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>Utilisateur</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrateur</option>
                                <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Modérateur</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Statut</label>
                            <select id="editUserStatus" style="
                                width: 100%;
                                padding: 0.75rem;
                                border: 2px solid #e5e7eb;
                                border-radius: 8px;
                                font-size: 1rem;
                                background: white;
                            ">
                                <option value="active" ${user.status === 'active' ? 'selected' : ''}>Actif</option>
                                <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactif</option>
                                <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>Suspendu</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button onclick="document.getElementById('editUserModal').remove()" style="
                            padding: 0.75rem 1.5rem;
                            border: 2px solid #e5e7eb;
                            background: white;
                            border-radius: 8px;
                            color: #374151;
                            font-weight: 600;
                            cursor: pointer;
                        ">Annuler</button>
                        <button onclick="submitEditUser(${id})" style="
                            padding: 0.75rem 1.5rem;
                            border: none;
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            color: white;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

async function submitEditUser(id) {
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;
    const role = document.getElementById('editUserRole').value;
    const status = document.getElementById('editUserStatus').value;
    
    if (!name || !email) {
        showNotification('Veuillez remplir le nom et l\'email', 'error');
        return;
    }
    
    const result = await fetchAPI('api_users.php?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            name: name,
            email: email,
            role: role,
            status: status
        })
    });
    
    if (result.success) {
        showNotification('Utilisateur modifié avec succès', 'success');
        document.getElementById('editUserModal').remove();
        if (window.usersTablePHP) {
            window.usersTablePHP.loadUsers(window.usersTablePHP.currentFilters);
        }
    } else {
        showNotification('Erreur lors de la modification', 'error');
    }
}

async function addUser() {
    const modalHTML = `
        <div id="addUserModal" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <h3 style="margin-bottom: 1.5rem; color: #1f2937;">Ajouter un utilisateur</h3>
                
                <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Nom complet</label>
                        <input type="text" id="newUserName" style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 1rem;
                        " placeholder="Marie Leblanc">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Email</label>
                        <input type="email" id="newUserEmail" style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 1rem;
                        " placeholder="marie@email.com">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Rôle</label>
                        <select id="newUserRole" style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 1rem;
                            background: white;
                        ">
                            <option value="user">Utilisateur</option>
                            <option value="admin">Administrateur</option>
                            <option value="moderator">Modérateur</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Statut</label>
                        <select id="newUserStatus" style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 1rem;
                            background: white;
                        ">
                            <option value="active">Actif</option>
                            <option value="inactive">Inactif</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="document.getElementById('addUserModal').remove()" style="
                        padding: 0.75rem 1.5rem;
                        border: 2px solid #e5e7eb;
                        background: white;
                        border-radius: 8px;
                        color: #374151;
                        font-weight: 600;
                        cursor: pointer;
                    ">Annuler</button>
                    <button onclick="submitNewUser()" style="
                        padding: 0.75rem 1.5rem;
                        border: none;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Ajouter</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

async function submitNewUser() {
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const role = document.getElementById('newUserRole').value;
    const status = document.getElementById('newUserStatus').value;
    
    if (!name || !email) {
        showNotification('Veuillez remplir le nom et l\'email', 'error');
        return;
    }
    
    const result = await fetchAPI('api_users.php?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            email: email,
            role: role,
            status: status
        })
    });
    
    if (result.success) {
        showNotification('Utilisateur ajouté avec succès', 'success');
        document.getElementById('addUserModal').remove();
        if (window.usersTablePHP) {
            window.usersTablePHP.loadUsers(window.usersTablePHP.currentFilters);
        }
    } else {
        showNotification(result.message || 'Erreur lors de l\'ajout', 'error');
    }
}

let searchTimeout;
async function searchUsers(query) {
    clearTimeout(searchTimeout);
    
    if (query.trim() === '') {
        if (window.usersTablePHP) {
            window.usersTablePHP.loadUsers(window.usersTablePHP.currentFilters);
        }
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        const result = await fetchAPI(`api_users.php?action=search&q=${encodeURIComponent(query)}`);
        
        if (result.success && window.usersTablePHP) {
            window.usersTablePHP.users = result.users;
            window.usersTablePHP.render();
        }
    }, 300);
}

async function loadDashboardStats() {
    const result = await fetchAPI('api_stats.php?action=dashboard');
    
    if (result.success) {
        updateStatDisplay('total-users', result.stats.total_users);
        updateStatDisplay('active-users', result.stats.active_users);
        updateStatDisplay('total-revenue', result.stats.total_revenue + ' €');
        updateStatDisplay('total-transactions', result.stats.total_transactions);
        
        if (result.recent_transactions) {
            displayRecentTransactions(result.recent_transactions);
        }
    }
}

function updateStatDisplay(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function displayRecentTransactions(transactions) {
    const tbody = document.querySelector('#transactions-table tbody');
    if (!tbody || !transactions) return;
    
    tbody.innerHTML = transactions.map(t => `
        <tr>
            <td><strong>#${t.id}</strong></td>
            <td>${t.user_name || 'N/A'}</td>
            <td>${t.product}</td>
            <td>${new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
            <td><strong>${t.amount} €</strong></td>
            <td><span class="status-badge ${t.status === 'completed' ? 'success' : 'warning'}">${t.status}</span></td>
        </tr>
    `).join('');
}

function exportUsers() {
    window.location.href = 'php/export_csv.php?type=users';
    showNotification('Export CSV en cours...', 'info');
}

function exportTransactions() {
    window.location.href = 'php/export_csv.php?type=transactions';
    showNotification('Export CSV en cours...', 'info');
}

function showNotification(message, type = 'info') {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    notification.style.cssText = `
        background: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        border-left: 4px solid ${colors[type]};
        min-width: 300px;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    const icon = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <span style="font-size: 20px; color: ${colors[type]};">${icon[type]}</span>
        <span style="color: #1f2937; font-weight: 500;">${message}</span>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard JavaScript avec PHP initialized');
    
    if (document.getElementById('total-users')) {
        loadDashboardStats();
        setInterval(loadDashboardStats, 30000);
    }
    
    if (document.getElementById('users-table')) {
        window.usersTablePHP = new UsersTablePHP();
        
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchUsers(e.target.value);
            });
        }
        
        const selectAllCheckbox = document.getElementById('select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.row-checkbox');
                checkboxes.forEach(cb => cb.checked = this.checked);
            });
        }
    }
    
    const exportUsersBtn = document.querySelector('[data-export="users"]');
    if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', exportUsers);
    }
    
    const exportTransactionsBtn = document.querySelector('[data-export="transactions"]');
    if (exportTransactionsBtn) {
        exportTransactionsBtn.addEventListener('click', exportTransactions);
    }
    
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('active');
            }
        });
    }
    
    initCharts();
    
    setTimeout(() => {
        showNotification('Dashboard chargé avec succès!', 'success');
    }, 500);
});

function initCharts() {
    // Sales Chart (Bar Chart)
    const salesChartCanvas = document.getElementById('salesChart');
    if (salesChartCanvas) {
        const ctx = salesChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    label: 'Ventes (€)',
                    data: [5200, 6400, 4400, 7200, 6000, 7600, 5600],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(99, 102, 241, 0.8)'
                    ],
                    borderColor: [
                        'rgba(99, 102, 241, 1)',
                        'rgba(99, 102, 241, 1)',
                        'rgba(99, 102, 241, 1)',
                        'rgba(99, 102, 241, 1)',
                        'rgba(99, 102, 241, 1)',
                        'rgba(99, 102, 241, 1)',
                        'rgba(99, 102, 241, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `Ventes: ${context.parsed.y} €`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + ' €';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // Donut Chart for Categories
    const donutChartCanvas = document.getElementById('donutChart');
    if (donutChartCanvas) {
        const ctx = donutChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Électronique', 'Vêtements', 'Alimentation'],
                datasets: [{
                    data: [45, 30, 25],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: [
                        'rgba(99, 102, 241, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    // Revenue Chart (Line Chart)
    const revenueChartCanvas = document.getElementById('revenueChart');
    if (revenueChartCanvas) {
        const ctx = revenueChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
                datasets: [{
                    label: 'Revenus mensuels',
                    data: [32000, 38000, 42000, 48000, 52000, 61000, 68000, 72000, 65000, 70000, 75000, 80000],
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + ' €';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
}