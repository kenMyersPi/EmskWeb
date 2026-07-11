// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
    // IDs de Discord autorizados (¡CAMBIAR ESTOS!)
    staffIds: ['123456789012345678', '876543210987654321'],
    
    // Token de acceso alternativo
    staffToken: 'LosEnmascarados2024_Secure',
    
    // Claves de almacenamiento
    storageKey: 'enmascarados_applications',
    authKey: 'enmascarados_admin_auth'
};

// ============================================
// ESTADO
// ============================================
const state = {
    isAuthenticated: false,
    currentUser: null,
    applications: [],
    currentView: 'dashboard',
    currentApplicationId: null,
    searchTerm: '',
    filterStatus: 'all',
    sortBy: 'date-desc'
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Panel de Administración iniciado');
    checkAuthentication();
    loadApplications();
    setupEventListeners();
    
    // Verificar nuevas postulaciones cada 10 segundos
    setInterval(checkForNewApplications, 10000);
});

// ============================================
// AUTENTICACIÓN
// ============================================
function checkAuthentication() {
    const savedAuth = localStorage.getItem(CONFIG.authKey);
    
    if (savedAuth) {
        try {
            const authData = JSON.parse(savedAuth);
            const now = Date.now();
            const hoursPassed = (now - authData.timestamp) / 3600000;
            
            if (authData.authenticated && hoursPassed < 24) {
                state.isAuthenticated = true;
                state.currentUser = authData.user;
                showAdminPanel();
                return;
            }
        } catch (error) {
            console.error('Error de autenticación:', error);
        }
    }
    
    showLoginScreen();
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
}

function showAdminPanel() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    updateUserInfo();
    refreshDashboard();
}

function loginWithToken() {
    const token = document.getElementById('staffToken').value;
    
    if (!token) {
        showLoginMessage('Ingresa el token de acceso', 'error');
        return;
    }
    
    if (token === CONFIG.staffToken) {
        authenticateUser({
            id: 'staff_token',
            username: 'Administrador',
            avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
            role: 'Staff'
        });
    } else {
        showLoginMessage('Token inválido', 'error');
    }
}

function loginWithId() {
    const id = document.getElementById('staffId').value.trim();
    
    if (!id) {
        showLoginMessage('Ingresa tu ID de Discord', 'error');
        return;
    }
    
    if (CONFIG.staffIds.includes(id)) {
        authenticateUser({
            id: id,
            username: 'Staff #' + id.substring(0, 4),
            avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
            role: 'Moderador'
        });
    } else {
        showLoginMessage('ID no autorizado', 'error');
    }
}

function authenticateUser(user) {
    state.isAuthenticated = true;
    state.currentUser = user;
    
    const authData = {
        authenticated: true,
        user: user,
        timestamp: Date.now()
    };
    
    localStorage.setItem(CONFIG.authKey, JSON.stringify(authData));
    showLoginMessage('✅ Acceso concedido', 'success');
    
    setTimeout(() => {
        showAdminPanel();
    }, 1000);
}

function logout() {
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem(CONFIG.authKey);
        state.isAuthenticated = false;
        state.currentUser = null;
        document.getElementById('staffToken').value = '';
        document.getElementById('staffId').value = '';
        showLoginScreen();
    }
}

function showLoginMessage(message, type) {
    const el = document.getElementById('loginMessage');
    el.textContent = message;
    el.className = `login-message ${type}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
}

// ============================================
// GESTIÓN DE DATOS
// ============================================
function loadApplications() {
    console.log('📂 Cargando postulaciones...');
    
    const saved = localStorage.getItem(CONFIG.storageKey);
    state.applications = saved ? JSON.parse(saved) : [];
    
    console.log(`✅ ${state.applications.length} postulaciones cargadas`);
    
    // Si no hay, crear demo
    if (state.applications.length === 0 && !localStorage.getItem('demo_created')) {
        createDemoApplications();
        localStorage.setItem('demo_created', 'true');
    }
    
    updateCounters();
}

function createDemoApplications() {
    console.log('🎨 Creando postulaciones demo...');
    
    state.applications = [
        {
            id: 'demo_1',
            discordNick: 'UsuarioDemo#1234',
            discordId: '123456789012345678',
            age: '20',
            timezone: 'GMT-5',
            languages: 'Español (nativo), Inglés (intermedio)',
            hasExperience: 'si',
            experienceDescription: 'Fui moderador en un servidor de gaming con 5000 miembros durante 8 meses.',
            tools: ['discord_builtin', 'mee6', 'dyno'],
            availability: '4-6 horas',
            scenario1: 'Eliminar el mensaje ofensivo, contactar al miembro en privado y aplicar advertencia.',
            scenario2: 'Activar modo lento, verificar permisos, banear spammers y notificar al equipo.',
            discordRules: 'si_detallado',
            motivation: 'Quiero ayudar a mantener una comunidad segura y acogedora.',
            strengths: 'Paciencia, comunicación efectiva, resolución de conflictos.',
            weaknesses: 'A veces soy muy perfeccionista.',
            additionalInfo: 'Disponible fines de semana.',
            status: 'new',
            reviewNotes: '',
            reviewedBy: '',
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            reviewedAt: null,
            timestamp: new Date(Date.now() - 86400000).toLocaleString('es-ES')
        }
    ];
    
    saveApplications();
}

function saveApplications() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.applications));
    console.log('💾 Postulaciones guardadas');
}

function checkForNewApplications() {
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (saved) {
        const currentApps = JSON.parse(saved);
        if (currentApps.length !== state.applications.length) {
            console.log('🔔 Nuevas postulaciones detectadas');
            loadApplications();
            refreshDashboard();
        }
    }
}

// ============================================
// ACTUALIZACIÓN DE UI
// ============================================
function updateUserInfo() {
    if (!state.currentUser) return;
    
    document.querySelector('.user-name').textContent = state.currentUser.username;
    document.querySelector('.user-role').textContent = state.currentUser.role || 'Staff';
    document.querySelector('.user-avatar').src = state.currentUser.avatar;
}

function updateCounters() {
    const newApps = state.applications.filter(a => a.status === 'new').length;
    const accepted = state.applications.filter(a => a.status === 'accepted').length;
    const rejected = state.applications.filter(a => a.status === 'rejected').length;
    
    document.getElementById('totalNew').textContent = newApps;
    document.getElementById('totalAccepted').textContent = accepted;
    document.getElementById('totalRejected').textContent = rejected;
    document.getElementById('totalAll').textContent = state.applications.length;
    
    // Badge
    const badge = document.getElementById('newAppsBadge');
    badge.textContent = newApps;
    badge.style.display = newApps > 0 ? 'inline' : 'none';
    
    // Info en settings
    const infoTotal = document.getElementById('infoTotal');
    if (infoTotal) infoTotal.textContent = state.applications.length;
    
    const infoUpdate = document.getElementById('infoLastUpdate');
    if (infoUpdate) infoUpdate.textContent = new Date().toLocaleTimeString('es-ES');
}

function refreshDashboard() {
    updateCounters();
    displayApplications('recentAppsList', state.applications.slice(-5).reverse());
    displayApplications('allAppsList', getFilteredApplications());
    displayApplications('reviewedAppsList', state.applications.filter(a => a.status !== 'new'));
}

function getFilteredApplications() {
    let apps = [...state.applications];
    
    // Filtrar por estado
    if (state.filterStatus !== 'all') {
        apps = apps.filter(a => a.status === state.filterStatus);
    }
    
    // Buscar
    if (state.searchTerm) {
        const term = state.searchTerm.toLowerCase();
        apps = apps.filter(a => 
            a.discordNick?.toLowerCase().includes(term) ||
            a.discordId?.includes(term) ||
            a.motivation?.toLowerCase().includes(term)
        );
    }
    
    // Ordenar
    apps.sort((a, b) => {
        if (state.sortBy === 'date-desc') {
            return new Date(b.submittedAt) - new Date(a.submittedAt);
        }
        return new Date(a.submittedAt) - new Date(b.submittedAt);
    });
    
    return apps;
}

function displayApplications(containerId, applications) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (applications.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay postulaciones</p>';
        return;
    }
    
    container.innerHTML = applications.map(app => `
        <div class="application-card" onclick="openApplicationDetail('${app.id}')">
            <div class="app-header">
                <div class="app-user">
                    <div class="app-avatar">${(app.discordNick || '?')[0].toUpperCase()}</div>
                    <div class="app-info">
                        <h4>${app.discordNick || 'Sin nombre'}</h4>
                        <span>${app.timezone || ''} • ${app.languages || ''}</span>
                    </div>
                </div>
                <span class="app-status status-${app.status}">${getStatusText(app.status)}</span>
            </div>
            <div class="app-preview">${app.motivation || 'Sin motivación'}</div>
            <div class="app-footer">
                <span>📅 ${formatDate(app.submittedAt)}</span>
                <span>⭐ ${app.hasExperience === 'si' ? 'Con experiencia' : 'Sin experiencia'}</span>
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    const map = {
        'new': 'Nueva',
        'accepted': 'Aceptada',
        'rejected': 'Rechazada'
    };
    return map[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// ============================================
// DETALLE DE APLICACIÓN
// ============================================
function openApplicationDetail(appId) {
    const app = state.applications.find(a => a.id === appId);
    if (!app) return;
    
    state.currentApplicationId = appId;
    
    document.getElementById('modalTitle').textContent = `Postulación de ${app.discordNick}`;
    
    document.getElementById('modalBody').innerHTML = `
        <div class="detail-section">
            <div class="detail-label">👤 Información Personal</div>
            <div class="detail-value"><strong>Nick:</strong> ${app.discordNick}</div>
            <div class="detail-value"><strong>ID:</strong> ${app.discordId}</div>
            <div class="detail-value"><strong>Edad:</strong> ${app.age} años</div>
            <div class="detail-value"><strong>Zona Horaria:</strong> ${app.timezone}</div>
            <div class="detail-value"><strong>Idiomas:</strong> ${app.languages}</div>
            <div class="detail-value"><strong>Disponibilidad:</strong> ${app.availability}</div>
        </div>
        
        <div class="detail-section">
            <div class="detail-label">🛡️ Experiencia</div>
            <div class="detail-value"><strong>¿Tiene experiencia?:</strong> ${app.hasExperience === 'si' ? 'Sí ✅' : 'No ❌'}</div>
            ${app.experienceDescription ? `<div class="detail-value"><strong>Descripción:</strong><br>${app.experienceDescription}</div>` : ''}
            ${app.tools?.length > 0 ? `<div class="detail-value"><strong>Herramientas:</strong> ${Array.isArray(app.tools) ? app.tools.join(', ') : app.tools}</div>` : ''}
        </div>
        
        <div class="detail-section">
            <div class="detail-label">💭 Escenarios</div>
            <div class="detail-value"><strong>Escenario 1 (Insultos):</strong><br>${app.scenario1 || 'No respondido'}</div>
            <div class="detail-value"><strong>Escenario 2 (Raid):</strong><br>${app.scenario2 || 'No respondido'}</div>
            <div class="detail-value"><strong>Conoce ToS:</strong> ${app.discordRules || 'No especificado'}</div>
        </div>
        
        <div class="detail-section">
            <div class="detail-label">💪 Motivación y Cualidades</div>
            <div class="detail-value"><strong>Motivación:</strong><br>${app.motivation || 'No especificada'}</div>
            <div class="detail-value"><strong>Fortalezas:</strong><br>${app.strengths || 'No especificadas'}</div>
            ${app.weaknesses ? `<div class="detail-value"><strong>Áreas de mejora:</strong><br>${app.weaknesses}</div>` : ''}
            ${app.additionalInfo ? `<div class="detail-value"><strong>Info adicional:</strong><br>${app.additionalInfo}</div>` : ''}
        </div>
        
        ${app.reviewNotes ? `
        <div class="detail-section">
            <div class="detail-label">📝 Notas de Revisión</div>
            <div class="detail-value">${app.reviewNotes}</div>
        </div>` : ''}
        
        <div class="detail-section">
            <div class="detail-label">📅 Metadatos</div>
            <div class="detail-value"><strong>Enviado:</strong> ${formatDate(app.submittedAt)}</div>
            <div class="detail-value"><strong>Estado:</strong> ${getStatusText(app.status)}</div>
            ${app.reviewedAt ? `<div class="detail-value"><strong>Revisado:</strong> ${formatDate(app.reviewedAt)}</div>` : ''}
        </div>
    `;
    
    document.getElementById('reviewNotes').value = app.reviewNotes || '';
    
    document.getElementById('applicationModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('applicationModal').classList.add('hidden');
}

function reviewApplication(status) {
    if (!state.currentApplicationId) return;
    
    const app = state.applications.find(a => a.id === state.currentApplicationId);
    if (!app) return;
    
    app.status = status;
    app.reviewNotes = document.getElementById('reviewNotes').value;
    app.reviewedBy = state.currentUser?.username || 'Staff';
    app.reviewedAt = new Date().toISOString();
    
    saveApplications();
    closeModal();
    refreshDashboard();
    
    alert(`Postulación ${status === 'accepted' ? 'aceptada ✅' : 'rechazada ❌'}`);
}

// ============================================
// EXPORTAR CSV
// ============================================
function exportToCSV() {
    if (state.applications.length === 0) {
        alert('No hay postulaciones para exportar');
        return;
    }
    
    const headers = ['Nick', 'ID Discord', 'Edad', 'Zona Horaria', 'Idiomas', 'Experiencia', 'Disponibilidad', 'Motivación', 'Estado', 'Fecha'];
    
    const rows = state.applications.map(app => [
        app.discordNick, app.discordId, app.age, app.timezone,
        app.languages, app.hasExperience, app.availability,
        app.motivation, getStatusText(app.status), formatDate(app.submittedAt)
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `postulaciones_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function clearAllData() {
    if (confirm('¿ELIMINAR TODAS las postulaciones? Esta acción no se puede deshacer.')) {
        localStorage.removeItem(CONFIG.storageKey);
        localStorage.removeItem('demo_created');
        state.applications = [];
        refreshDashboard();
        alert('Todas las postulaciones han sido eliminadas');
    }
}

// ============================================
// NAVEGACIÓN
// ============================================
function switchView(viewName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) item.classList.add('active');
    });
    
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    
    const viewMap = {
        'dashboard': 'dashboardView',
        'applications': 'applicationsView',
        'reviewed': 'reviewedView',
        'settings': 'settingsView'
    };
    
    const viewId = viewMap[viewName];
    if (viewId) {
        document.getElementById(viewId).classList.add('active');
    }
    
    state.currentView = viewName;
    document.getElementById('currentView').textContent = 
        viewName.charAt(0).toUpperCase() + viewName.slice(1);
    
    refreshDashboard();
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    console.log('🔧 Configurando eventos...');
    
    // Login
    document.getElementById('tokenLoginBtn').addEventListener('click', loginWithToken);
    document.getElementById('idLoginBtn').addEventListener('click', loginWithId);
    
    // Enter en inputs de login
    document.getElementById('staffToken').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginWithToken();
    });
    document.getElementById('staffId').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginWithId();
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(item.dataset.view);
        });
    });
    
    // Modal
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.getElementById('applicationModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    
    // Acciones
    document.getElementById('acceptAppBtn').addEventListener('click', () => reviewApplication('accepted'));
    document.getElementById('rejectAppBtn').addEventListener('click', () => reviewApplication('rejected'));
    document.getElementById('saveReviewBtn').addEventListener('click', () => {
        const app = state.applications.find(a => a.id === state.currentApplicationId);
        if (app) {
            app.reviewNotes = document.getElementById('reviewNotes').value;
            saveApplications();
            alert('Notas guardadas ✅');
        }
    });
    
    // Búsqueda y filtros
    document.getElementById('searchApps').addEventListener('input', (e) => {
        state.searchTerm = e.target.value;
        displayApplications('allAppsList', getFilteredApplications());
    });
    
    document.getElementById('filterStatus').addEventListener('change', (e) => {
        state.filterStatus = e.target.value;
        displayApplications('allAppsList', getFilteredApplications());
    });
    
    document.getElementById('sortBy').addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        displayApplications('allAppsList', getFilteredApplications());
    });
    
    // Botones
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadApplications();
        refreshDashboard();
    });
    
    document.getElementById('exportDataBtn').addEventListener('click', exportToCSV);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllData);
    
    // Menú móvil
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    
    // ESC para cerrar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    console.log('✅ Eventos configurados');
}

console.log('✅ Panel de administración listo');
console.log('🔑 Token:', CONFIG.staffToken);
console.log('👥 IDs autorizados:', CONFIG.staffIds);