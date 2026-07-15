// ============================================
// CARGAR POSTULACIONES DESDE SUPABASE (SIN TIEMPO REAL)
// ============================================
function loadApplications() {
    console.log('🟢 Cargando postulaciones desde Supabase...');
    
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase no inicializado');
        document.getElementById('allAppsList').innerHTML = 
            '<p class="empty-state">❌ Error: Supabase no está conectado</p>';
        return;
    }
    
    fetchApplications();
    
    // Recargar cada 10 segundos (en lugar de tiempo real)
    if (window._refreshInterval) {
        clearInterval(window._refreshInterval);
    }
    window._refreshInterval = setInterval(fetchApplications, 10000);
}

async function fetchApplications() {
    console.log('🔄 Cargando datos...');
    try {
        const { data, error } = await supabase
            .from('postulaciones')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error al cargar:', error);
            document.getElementById('allAppsList').innerHTML = 
                `<p class="empty-state">❌ Error: ${error.message}</p>`;
            return;
        }
        
        state.applications = data || [];
        console.log('✅ Cargadas:', state.applications.length, 'postulaciones');
        refreshDashboard();
        
    } catch (error) {
        console.error('❌ Error:', error);
        document.getElementById('allAppsList').innerHTML = 
            `<p class="empty-state">❌ Error: ${error.message}</p>`;
    }
}
