// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
    draftKey: 'enmascarados_draft',
    cooldownTime: 300000
};

// ============================================
// ESTADO
// ============================================
let currentSection = 1;
const totalSections = 4;
let isSubmitting = false;
let lastSubmissionTime = 0;

// ============================================
// DOM LISTO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado');
    
    // Elementos
    const form = document.getElementById('postulacionForm');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressBar = document.getElementById('progressBar');
    const messageContainer = document.getElementById('messageContainer');
    const sections = document.querySelectorAll('.form-section');
    const steps = document.querySelectorAll('.step');
    
    // ============================================
    // NAVEGACIÓN
    // ============================================
    function updateNavigation() {
        // Anterior
        prevBtn.style.display = currentSection === 1 ? 'none' : 'inline-flex';
        
        // Siguiente / Enviar
        if (currentSection === totalSections) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
        
        // Barra de progreso
        const progress = ((currentSection - 1) / (totalSections - 1)) * 100;
        progressBar.style.width = progress + '%';
        
        // Pasos
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 === currentSection) step.classList.add('active');
            else if (index + 1 < currentSection) step.classList.add('completed');
        });
    }
    
    function showSection(num) {
        sections.forEach(s => s.classList.remove('active'));
        const target = document.querySelector(`[data-section="${num}"]`);
        if (target) target.classList.add('active');
    }
    
    function nextSection() {
        if (validateSection(currentSection) && currentSection < totalSections) {
            currentSection++;
            showSection(currentSection);
            updateNavigation();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    function prevSection() {
        if (currentSection > 1) {
            currentSection--;
            showSection(currentSection);
            updateNavigation();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    // ============================================
    // VALIDACIONES
    // ============================================
    function showError(id, msg) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.borderColor = '#f87171';
        const old = el.parentElement.querySelector('.field-error-msg');
        if (old) old.remove();
        const div = document.createElement('div');
        div.className = 'field-error-msg';
        div.style.cssText = 'color:#f87171;font-size:0.8rem;margin-top:5px;';
        div.textContent = '⚠️ ' + msg;
        el.parentElement.appendChild(div);
        el.focus();
    }
    
    function clearErrors() {
        document.querySelectorAll('.field-error-msg').forEach(el => el.remove());
        document.querySelectorAll('input, select, textarea').forEach(el => el.style.borderColor = '');
        messageContainer.classList.add('hidden');
    }
    
    function validateSection(section) {
        clearErrors();
        let valid = true;
        
        if (section === 1) {
            const nick = document.getElementById('discordNick').value.trim();
            if (!nick || nick.length < 2) {
                showError('discordNick', 'Ingresa tu nick (mín. 2 caracteres)');
                valid = false;
            }
            const id = document.getElementById('discordId').value.trim();
            if (!id || !/^\d{17,19}$/.test(id)) {
                showError('discordId', 'ID inválido (17-19 dígitos)');
                valid = false;
            }
            const age = document.getElementById('age').value;
            if (!age || age < 13 || age > 99) {
                showError('age', 'Edad entre 13 y 99 años');
                valid = false;
            }
            if (!document.getElementById('timezone').value) {
                showError('timezone', 'Selecciona tu zona horaria');
                valid = false;
            }
            if (!document.getElementById('languages').value.trim()) {
                showError('languages', 'Indica los idiomas que hablas');
                valid = false;
            }
        }
        
        if (section === 2) {
            const hasExp = document.querySelector('input[name="hasExperience"]:checked');
            if (!hasExp) {
                alert('⚠️ Indica si tienes experiencia');
                valid = false;
            } else if (hasExp.value === 'si') {
                const desc = document.getElementById('experienceDescription').value.trim();
                if (!desc || desc.length < 10) {
                    showError('experienceDescription', 'Describe tu experiencia (mín. 10 caracteres)');
                    valid = false;
                }
            }
            if (!document.getElementById('availability').value) {
                showError('availability', 'Selecciona tu disponibilidad');
                valid = false;
            }
        }
        
        if (section === 3) {
            const s1 = document.getElementById('scenario1').value.trim();
            if (!s1 || s1.length < 20) {
                showError('scenario1', 'Desarrolla tu respuesta (mín. 20 caracteres)');
                valid = false;
            }
            const s2 = document.getElementById('scenario2').value.trim();
            if (!s2 || s2.length < 20) {
                showError('scenario2', 'Desarrolla tu respuesta (mín. 20 caracteres)');
                valid = false;
            }
            if (!document.querySelector('input[name="discordRules"]:checked')) {
                alert('⚠️ Indica tu conocimiento de las reglas');
                valid = false;
            }
        }
        
        if (section === 4) {
            const motivation = document.getElementById('motivation').value.trim();
            if (!motivation || motivation.length < 20) {
                showError('motivation', 'Cuéntanos tu motivación (mín. 20 caracteres)');
                valid = false;
            }
            const strengths = document.getElementById('strengths').value.trim();
            if (!strengths || strengths.length < 10) {
                showError('strengths', 'Indica tus fortalezas (mín. 10 caracteres)');
                valid = false;
            }
            if (!document.getElementById('termsAccepted').checked) {
                alert('⚠️ Debes aceptar los términos');
                valid = false;
            }
        }
        
        return valid;
    }
    
    // ============================================
    // DATOS
    // ============================================
    function getFormData() {
        return {
            discord_nick: document.getElementById('discordNick').value.trim(),
            discord_id: document.getElementById('discordId').value.trim(),
            age: parseInt(document.getElementById('age').value) || 0,
            timezone: document.getElementById('timezone').value,
            languages: document.getElementById('languages').value.trim(),
            has_experience: document.querySelector('input[name="hasExperience"]:checked')?.value || 'no',
            experience_description: document.getElementById('experienceDescription').value.trim(),
            availability: document.getElementById('availability').value,
            scenario1: document.getElementById('scenario1').value.trim(),
            scenario2: document.getElementById('scenario2').value.trim(),
            discord_rules: document.querySelector('input[name="discordRules"]:checked')?.value || '',
            motivation: document.getElementById('motivation').value.trim(),
            strengths: document.getElementById('strengths').value.trim(),
            weaknesses: document.getElementById('weaknesses').value.trim(),
            status: 'new',
            created_at: new Date().toISOString()
        };
    }
    
    // ============================================
    // GUARDAR EN SUPABASE
    // ============================================
    async function saveToSupabase(data) {
        console.log('🟢 Guardando en Supabase...');
        const client = window.supabase;
        if (!client) {
            return { success: false, error: 'Supabase no inicializado' };
        }
        try {
            const { data: result, error } = await client
                .from('postulaciones')
                .insert([data])
                .select();
            if (error) {
                console.error('❌ Error:', error);
                return { success: false, error: error.message };
            }
            console.log('✅ Guardado! ID:', result[0].id);
            return { success: true, id: result[0].id };
        } catch (error) {
            console.error('❌ Error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ============================================
    // ENVIAR
    // ============================================
    async function handleSubmit(e) {
        e.preventDefault();
        console.log('📤 Enviando...');
        
        if (!validateSection(4)) return;
        
        const now = Date.now();
        if (now - lastSubmissionTime < CONFIG.cooldownTime && lastSubmissionTime > 0) {
            const mins = Math.ceil((CONFIG.cooldownTime - (now - lastSubmissionTime)) / 60000);
            alert(`⏰ Espera ${mins} minutos`);
            return;
        }
        
        if (isSubmitting) return;
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Enviando...';
        
        try {
            const data = getFormData();
            const result = await saveToSupabase(data);
            
            if (result.success) {
                messageContainer.innerHTML = '✅ ¡Postulación enviada! Se guardó en Supabase.';
                messageContainer.className = 'message-container success';
                messageContainer.classList.remove('hidden');
                form.reset();
                localStorage.removeItem(CONFIG.draftKey);
                lastSubmissionTime = Date.now();
                currentSection = 1;
                showSection(1);
                updateNavigation();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                alert('🎉 ¡Postulación enviada!');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            messageContainer.textContent = '❌ Error: ' + error.message;
            messageContainer.className = 'message-container error';
            messageContainer.classList.remove('hidden');
        } finally {
            setTimeout(() => {
                isSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Postulación 📤';
            }, 2000);
        }
    }
    
    // ============================================
    // UTILIDADES
    // ============================================
    function toggleExperience() {
        const hasExp = document.querySelector('input[name="hasExperience"]:checked');
        const details = document.getElementById('experienceDetails');
        details.style.display = (hasExp && hasExp.value === 'si') ? 'block' : 'none';
    }
    
    function saveDraft() {
        const data = {
            discordNick: document.getElementById('discordNick').value,
            discordId: document.getElementById('discordId').value,
            age: document.getElementById('age').value,
            timezone: document.getElementById('timezone').value,
            languages: document.getElementById('languages').value
        };
        localStorage.setItem(CONFIG.draftKey, JSON.stringify(data));
    }
    
    function loadDraft() {
        const draft = localStorage.getItem(CONFIG.draftKey);
        if (!draft) return;
        try {
            const data = JSON.parse(draft);
            if (data.discordNick) document.getElementById('discordNick').value = data.discordNick;
            if (data.discordId) document.getElementById('discordId').value = data.discordId;
            if (data.age) document.getElementById('age').value = data.age;
            if (data.timezone) document.getElementById('timezone').value = data.timezone;
            if (data.languages) document.getElementById('languages').value = data.languages;
            console.log('📂 Borrador cargado');
        } catch (e) {
            console.error('Error al cargar borrador:', e);
        }
    }
    
    // ============================================
    // EVENTOS
    // ============================================
    prevBtn.addEventListener('click', prevSection);
    nextBtn.addEventListener('click', nextSection);
    form.addEventListener('submit', handleSubmit);
    
    document.querySelectorAll('input[name="hasExperience"]').forEach(r => {
        r.addEventListener('change', toggleExperience);
    });
    
    document.getElementById('staffLoginBtn').addEventListener('click', function() {
        window.open('admin.html', '_blank');
    });
    
    form.addEventListener('input', function() {
        clearTimeout(window._draftTimeout);
        window._draftTimeout = setTimeout(saveDraft, 2000);
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); nextSection(); }
        if (e.ctrlKey && e.key === 'ArrowLeft') { e.preventDefault(); prevSection(); }
    });
    
    // ============================================
    // INICIAR
    // ============================================
    updateNavigation();
    loadDraft();
    console.log('✅ Formulario listo');
});
