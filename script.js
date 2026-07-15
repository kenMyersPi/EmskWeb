// Variables
let currentSection = 1;
const totalSections = 4;
let isSubmitting = false;
let lastSubmissionTime = 0;

// Esperar a que la página cargue
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos
    const form = document.getElementById('postulacionForm');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressBar = document.getElementById('progressBar');
    const messageBox = document.getElementById('messageContainer');
    
    // Actualizar navegación
    function updateNav() {
        prevBtn.style.display = currentSection === 1 ? 'none' : 'inline-flex';
        
        if (currentSection === 4) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
        
        let progress = ((currentSection - 1) / 3) * 100;
        progressBar.style.width = progress + '%';
        
        document.querySelectorAll('.step').forEach((step, i) => {
            step.classList.remove('active', 'completed');
            if (i + 1 === currentSection) step.classList.add('active');
            if (i + 1 < currentSection) step.classList.add('completed');
        });
    }
    
    // Mostrar sección
    function showSection(num) {
        document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
        document.querySelector(`[data-section="${num}"]`).classList.add('active');
    }
    
    // Siguiente
    function nextSection() {
        if (validateSection(currentSection)) {
            currentSection++;
            showSection(currentSection);
            updateNav();
        }
    }
    
    // Anterior
    function prevSection() {
        if (currentSection > 1) {
            currentSection--;
            showSection(currentSection);
            updateNav();
        }
    }
    
    // Validar
    function validateSection(num) {
        // Limpiar errores
        document.querySelectorAll('.field-error-msg').forEach(e => e.remove());
        document.querySelectorAll('input, select, textarea').forEach(e => e.style.borderColor = '');
        
        let ok = true;
        
        if (num === 1) {
            if (!document.getElementById('discordNick').value.trim()) {
                error('discordNick', 'Ingresa tu nick');
                ok = false;
            }
            if (!document.getElementById('discordId').value.trim()) {
                error('discordId', 'Ingresa tu ID');
                ok = false;
            }
            if (!document.getElementById('age').value) {
                error('age', 'Ingresa tu edad');
                ok = false;
            }
            if (!document.getElementById('timezone').value) {
                error('timezone', 'Selecciona zona horaria');
                ok = false;
            }
            if (!document.getElementById('languages').value.trim()) {
                error('languages', 'Ingresa idiomas');
                ok = false;
            }
        }
        
        if (num === 2) {
            if (!document.querySelector('input[name="hasExperience"]:checked')) {
                alert('Indica si tienes experiencia');
                ok = false;
            }
            if (!document.getElementById('availability').value) {
                error('availability', 'Selecciona disponibilidad');
                ok = false;
            }
        }
        
        if (num === 3) {
            if (!document.getElementById('scenario1').value.trim()) {
                error('scenario1', 'Responde el escenario 1');
                ok = false;
            }
            if (!document.getElementById('scenario2').value.trim()) {
                error('scenario2', 'Responde el escenario 2');
                ok = false;
            }
            if (!document.querySelector('input[name="discordRules"]:checked')) {
                alert('Indica si conoces las reglas');
                ok = false;
            }
        }
        
        if (num === 4) {
            if (!document.getElementById('motivation').value.trim()) {
                error('motivation', 'Escribe tu motivación');
                ok = false;
            }
            if (!document.getElementById('strengths').value.trim()) {
                error('strengths', 'Escribe tus fortalezas');
                ok = false;
            }
            if (!document.getElementById('termsAccepted').checked) {
                alert('Acepta los términos');
                ok = false;
            }
        }
        
        return ok;
    }
    
    function error(id, msg) {
        const el = document.getElementById(id);
        el.style.borderColor = '#f87171';
        const div = document.createElement('div');
        div.className = 'field-error-msg';
        div.style.cssText = 'color:#f87171;font-size:0.8rem;margin-top:5px;';
        div.textContent = '⚠️ ' + msg;
        el.parentElement.appendChild(div);
        el.focus();
    }
    
    // Obtener datos del formulario
    function getData() {
        return {
            discordNick: document.getElementById('discordNick').value.trim(),
            discordId: document.getElementById('discordId').value.trim(),
            age: document.getElementById('age').value,
            timezone: document.getElementById('timezone').value,
            languages: document.getElementById('languages').value.trim(),
            hasExperience: document.querySelector('input[name="hasExperience"]:checked')?.value || 'no',
            experienceDescription: document.getElementById('experienceDescription').value.trim(),
            availability: document.getElementById('availability').value,
            scenario1: document.getElementById('scenario1').value.trim(),
            scenario2: document.getElementById('scenario2').value.trim(),
            discordRules: document.querySelector('input[name="discordRules"]:checked')?.value || '',
            motivation: document.getElementById('motivation').value.trim(),
            strengths: document.getElementById('strengths').value.trim(),
            weaknesses: document.getElementById('weaknesses').value.trim(),
            additionalInfo: document.getElementById('additionalInfo')?.value.trim() || '',
            status: 'new',
            createdAt: new Date().toISOString()
        };
    }
    
    // Guardar en Firebase
    async function saveToFirebase(data) {
        console.log('🔥 Guardando en Supabase...');
        try {
            const docRef = await db.collection('postulaciones').add(data);
            console.log('✅ Guardado! ID:', docRef.id);
            return true;
        } catch (error) {
            console.error('❌ Error:', error);
            return false;
        }
    }
    
    // Enviar formulario
    async function enviar(event) {
        event.preventDefault();
        console.log('📤 Enviando...');
        
        if (!validateSection(4)) return;
        if (isSubmitting) return;
        
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        try {
            const data = getData();
           const saved = await saveToSupabase(data);
            
            if (saved) {
                messageBox.textContent = '✅ ¡Postulación enviada! Se guardó en la nube.';
                messageBox.className = 'message-container success';
                messageBox.classList.remove('hidden');
                
                form.reset();
                currentSection = 1;
                showSection(1);
                updateNav();
                window.scrollTo(0, 0);
                
                alert('🎉 ¡Postulación enviada con éxito!');
            } else {
                alert('❌ Error al guardar. Revisa la consola (F12).');
            }
        } catch (e) {
            console.error(e);
            alert('Error: ' + e.message);
        }
        
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Postulación 📤';
    }
    
    // Eventos
    prevBtn.addEventListener('click', prevSection);
    nextBtn.addEventListener('click', nextSection);
    form.addEventListener('submit', enviar);
    
    // Experiencia
    document.querySelectorAll('input[name="hasExperience"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('experienceDetails').style.display = 
                this.value === 'si' ? 'block' : 'none';
        });
    });
    
    // Staff
    document.getElementById('staffLoginBtn').addEventListener('click', function() {
        window.open('admin.html', '_blank');
    });
    
    // Teclas
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); nextSection(); }
        if (e.ctrlKey && e.key === 'ArrowLeft') { e.preventDefault(); prevSection(); }
    });
    
    // Iniciar
    updateNav();
    console.log('✅ Formulario listo');
});
