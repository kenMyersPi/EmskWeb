// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
    staffIds: ['TU_ID_DE_DISCORD'],  // <-- PON TU ID AQUÍ
    staffToken: 'LosEnmascarados2024_Secure',
    authKey: 'enmascarados_admin_auth'
};

const state = {
    isAuthenticated: false,
    currentUser: null,
    applications: [],
    currentApplicationId: null
};

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Panel Admin iniciado');
    checkAuthentication();
    setupEventListeners();
});

// ============================================
// AUTENTICACIÓN
// ============================================
function checkAuthentication() {
    const saved = localStorage.getItem(CONFIG.authKey);
    if (saved) {
        try {
            const auth = JSON.parse(saved);
            if (auth.authenticated && (Date.now() - auth.timestamp) < 86400000) {
                state.isAuthenticated = true;
                state.currentUser = auth.user;
                showAdminPanel();
                return;
            }
        } catch (e) {}
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
    loadApplications();
}

function loginWithToken() {
    const token = document.getElementById('staffToken').value;
    if (token === CONFIG.staffToken) {
        authenticateUser({ username: 'Admin', role: 'Administrador' });
    } else {
        showLoginMessage('Token inválido', 'error');
    }
}

function loginWithId() {
    const id = document.getElementById('staffId').value.trim();
    if (CONFIG.staffIds.includes(id)) {
        authenticateUser({ username: 'Staff #' + id.substring(0,4), role: 'Moderador' });
    } else {
        showLoginMessage('ID no autorizado', 'error');
    }
}

function authenticateUser(user) {
    state.isAuthenticated = true;
    state.currentUser = user;
    localStorage.setItem(CONFIG.authKey, JSON.stringify({
        authenticated: true,
        user: user,
        timestamp: Date.now()
    }));
    showAdminPanel();
}

function logout() {
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem(CONFIG.authKey);
        location.reload();
    }
}

function showLoginMessage(msg, type) {
    const el = document.getElementById('loginMessage');
    el.textContent = msg;
    el.className = `login-message ${type}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
}

// ============================================
// CARGAR POSTULACIONES
// ============================================
function loadApplications() {
    console.log('🟢 Cargando postulaciones...');
    fetchApplications();
}

async function fetchApplications() {
    try {
        const client = window.supabase;
        if (!client) {
            console.error('❌ Supabase no disponible');
            return;
        }
        
        const { data, error } = await client
            .from('postulaciones')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error:', error);
            return;
        }
        
        state.applications = data || [];
        console.log('✅ Cargadas:', state.applications.length);
        refreshDashboard();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// ============================================
// ACTUALIZAR UI
// ============================================
function updateUserInfo() {
    if (!state.currentUser) return;
    document.querySelector('.user-name').textContent = state.currentUser.username;
    document.querySelector('.user-role').textContent = state.currentUser.role || 'Staff';
}

function refreshDashboard() {
    updateCounters();
    displayApplications('recentAppsList', state.applications.slice(0, 10));
    displayApplications('allAppsList', state.applications);
    displayApplications('reviewedAppsList', state.applications.filter(a => a.status !== 'new'));
    document.getElementById('infoTotal').textContent = state.applications.length;
    document.getElementById('infoLastUpdate').textContent = new Date().toLocaleString();
}

function updateCounters() {
    document.getElementById('totalNew').textContent = state.applications.filter(a => a.status === 'new').length;
    document.getElementById('totalAccepted').textContent = state.applications.filter(a => a.status === 'accepted').length;
    document.getElementById('totalRejected').textContent = state.applications.filter(a => a.status === 'rejected').length;
    document.getElementById('totalAll').textContent = state.applications.length;
    
    const badge = document.getElementById('newAppsBadge');
    const newCount = state.applications.filter(a => a.status === 'new').length;
    badge.textContent = newCount;
    badge.style.display = newCount > 0 ? 'inline' : 'none';
}

function displayApplications(containerId, apps) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!apps || apps.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay postulaciones</p>';
        return;
    }
    
    container.innerHTML = apps.map(app => `
        <div class="application-card" onclick="openApplicationDetail('${app.id}')">
            <div class="app-header">
                <div class="app-user">
                    <div class="app-avatar">${(app.discord_nick || '?')[0]}</div>
                    <div class="app-info">
                        <h4>${app.discord_nick || 'Sin nombre'}</h4>
                        <span>${app.timezone || ''} • ${app.languages || ''}</span>
                    </div>
                </div>
                <span class="app-status status-${app.status}">${getStatusText(app.status)}</span>
            </div>
            <div class="app-preview">${app.motivation || 'Sin motivación'}</div>
            <div class="app-footer">
                <span>📅 ${formatDate(app.created_at)}</span>
                <span>⭐ ${app.has_experience === 'si' ? 'Con experiencia' : 'Sin experiencia'}</span>
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    return { 'new': 'Nueva', 'accepted': 'Aceptada', 'rejected': 'Rechazada' }[status] || status;
}

function formatDate(date) {
    if (!date) return 'Sin fecha';
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

// ============================================
// DETALLE Y REVISIÓN
// ============================================
function openApplicationDetail(appId) {
    const app = state.applications.find(a => a.id === appId);
    if (!app) return;
    
    state.currentApplicationId = appId;
    document.getElementById('modalTitle').textContent = `Postulación de ${app.discord_nick}`;
    
    document.getElementById('modalBody').innerHTML = `
        <div class="detail-section">
            <div class="detail-label">👤 Información Personal</div>
            <p><strong>Nick:</strong> ${app.discord_nick}</p>
            <p><strong>ID:</strong> ${app.discord_id}</p>
            <p><strong>Edad:</strong> ${app.age} años</p>
            <p><strong>Zona:</strong> ${app.timezone}</p>
            <p><strong>Idiomas:</strong> ${app.languages}</p>
            <p><strong>Disponibilidad:</strong> ${app.availability}</p>
        </div>
        <div class="detail-section">
            <div class="detail-label">🛡️ Experiencia</div>
            <p><strong>¿Tiene experiencia?:</strong> ${app.has_experience === 'si' ? 'Sí ✅' : 'No ❌'}</p>
            ${app.experience_description ? `<p><strong>Descripción:</strong> ${app.experience_description}</p>` : ''}
        </div>
        <div class="detail-section">
            <div class="detail-label">💭 Escenarios</div>
            <p><strong>Escenario 1:</strong> ${app.scenario1 || 'No respondido'}</p>
            <p><strong>Escenario 2:</strong> ${app.scenario2 || 'No respondido'}</p>
        </div>
        <div class="detail-section">
            <div class="detail-label">💪 Motivación</div>
            <p>${app.motivation || 'No especificada'}</p>
            <p><strong>Fortalezas:</strong> ${app.strengths || 'No especificadas'}</p>
            ${app.weaknesses ? `<p><strong>Áreas de mejora:</strong> ${app.weaknesses}</p>` : ''}
        </div>
        ${app.review_notes ? `<div class="detail-section"><div class="detail-label">📝 Notas</div><p>${app.review_notes}</p></div>` : ''}
    `;
    
    document.getElementById('reviewNotes').value = app.review_notes || '';
    document.getElementById('applicationModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('applicationModal').classList.add('hidden');
}

async function reviewApplication(status) {
    if (!state.currentApplicationId) return;
    
    const notes = document.getElementById('reviewNotes').value;
    const client = window.supabase;
    
    try {
        const { error } = await client
            .from('postulaciones')
            .update({
                status: status,
                review_notes: notes,
                reviewed_by: state.currentUser?.username || 'Staff',
                reviewed_at: new Date().toISOString()
            })
            .eq('id', state.currentApplicationId);
        
        if (error) {
            alert('Error: ' + error.message);
            return;
        }
        
        closeModal();
        alert(`Postulación ${status === 'accepted' ? 'aceptada ✅' : 'rechazada ❌'}`);
        fetchApplications();
    } catch (error) {
        alert('Error al guardar la revisión');
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
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const views = {
        'dashboard': 'dashboardView',
        'applications': 'applicationsView',
        'reviewed': 'reviewedView',
        'settings': 'settingsView'
    };
    if (views[viewName]) document.getElementById(views[viewName]).classList.add('active');
    document.getElementById('currentView').textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1);
}

// ============================================
// EXPORTAR CSV
// ============================================
function exportToCSV() {
    if (state.applications.length === 0) {
        alert('No hay postulaciones');
        return;
    }
    
    const headers = ['Nick', 'ID Discord', 'Edad', 'Zona', 'Idiomas', 'Exp', 'Motivación', 'Estado', 'Fecha'];
    const rows = state.applications.map(app => [
        app.discord_nick, app.discord_id, app.age, app.timezone,
        app.languages, app.has_experience, app.motivation?.substring(0, 100),
        getStatusText(app.status), formatDate(app.created_at)
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c || ''}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `postulaciones_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// ============================================
// EVENTOS
// ============================================
function setupEventListeners() {
    document.getElementById('tokenLoginBtn').addEventListener('click', loginWithToken);
    document.getElementById('idLoginBtn').addEventListener('click', loginWithId);
    document.getElementById('staffToken').addEventListener('keypress', e => { if (e.key === 'Enter') loginWithToken(); });
    document.getElementById('staffId').addEventListener('keypress', e => { if (e.key === 'Enter') loginWithId(); });
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            switchView(item.dataset.view);
        });
    });
    
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.getElementById('applicationModal').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeModal();
    });
    document.getElementById('acceptAppBtn').addEventListener('click', () => reviewApplication('accepted'));
    document.getElementById('rejectAppBtn').addEventListener('click', () => reviewApplication('rejected'));
    
    document.getElementById('searchApps').addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        const filtered = state.applications.filter(app => 
            app.discord_nick?.toLowerCase().includes(term) ||
            app.discord_id?.includes(term)
        );
        displayApplications('allAppsList', filtered);
    });
    
    document.getElementById('filterStatus').addEventListener('change', e => {
        const status = e.target.value;
        const filtered = status === 'all' 
            ? state.applications 
            : state.applications.filter(app => app.status === status);
        displayApplications('allAppsList', filtered);
    });
    
    document.getElementById('refreshBtn').addEventListener('click', fetchApplications);
    document.getElementById('exportDataBtn').addEventListener('click', exportToCSV);
    
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
}
