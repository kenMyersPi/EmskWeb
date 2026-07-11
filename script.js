// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
    storageKey: 'enmascarados_applications',
    draftKey: 'enmascarados_draft',
    cooldownTime: 300000
};

// ============================================
// ESTADO GLOBAL
// ============================================
let currentSection = 1;
const totalSections = 4;
let isSubmitting = false;
let lastSubmissionTime = 0;

// ============================================
// CUANDO EL DOM ESTÉ LISTO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado - Inicializando formulario');
    
    // Referencias a elementos
    const form = document.getElementById('postulacionForm');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressBar = document.getElementById('progressBar');
    const messageContainer = document.getElementById('messageContainer');
    const sections = document.querySelectorAll('.form-section');
    const steps = document.querySelectorAll('.step');
    
    // ============================================
    // FUNCIONES DE NAVEGACIÓN
    // ============================================
    function updateNavigation() {
        // Mostrar/ocultar botones
        if (currentSection === 1) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'inline-flex';
        }
        
        if (currentSection === totalSections) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
        
        // Actualizar progreso
        const progress = ((currentSection - 1) / (totalSections - 1)) * 100;
        progressBar.style.width = progress + '%';
        
        // Actualizar pasos
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 === currentSection) {
                step.classList.add('active');
            } else if (index + 1 < currentSection) {
                step.classList.add('completed');
            }
        });
        
        console.log('📊 Sección actual:', currentSection, 'Progreso:', progress + '%');
    }
    
    function showSection(sectionNumber) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.querySelector(`[data-section="${sectionNumber}"]`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    function nextSection() {
        console.log('➡️ Intentando ir a siguiente sección desde:', currentSection);
        
        if (validateSection(currentSection)) {
            if (currentSection < totalSections) {
                currentSection++;
                showSection(currentSection);
                updateNavigation();
                console.log('✅ Avanzado a sección:', currentSection);
            }
        }
    }
    
    function previousSection() {
        console.log('⬅️ Retrocediendo desde:', currentSection);
        
        if (currentSection > 1) {
            currentSection--;
            showSection(currentSection);
            updateNavigation();
            console.log('✅ Retrocedido a sección:', currentSection);
        }
    }
    
    // ============================================
    // VALIDACIONES
    // ============================================
    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Marcar campo como error
        element.style.borderColor = '#f87171';
        
        // Eliminar mensaje anterior
        const oldError = element.parentElement.querySelector('.field-error-msg');
        if (oldError) oldError.remove();
        
        // Crear mensaje
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error-msg';
        errorDiv.style.cssText = 'color:#f87171;font-size:0.8rem;margin-top:5px;';
        errorDiv.textContent = message;
        element.parentElement.appendChild(errorDiv);
        
        element.focus();
    }
    
    function clearErrors() {
        document.querySelectorAll('.field-error-msg').forEach(el => el.remove());
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.style.borderColor = '';
        });
        messageContainer.classList.add('hidden');
    }
    
    function validateSection(section) {
        clearErrors();
        let valid = true;
        
        if (section === 1) {
            // Nick
            const nick = document.getElementById('discordNick').value.trim();
            if (!nick) {
                showError('discordNick', 'Ingresa tu nick de Discord');
                valid = false;
            } else if (nick.length < 2) {
                showError('discordNick', 'Mínimo 2 caracteres');
                valid = false;
            }
            
            // ID
            const id = document.getElementById('discordId').value.trim();
            if (!id) {
                showError('discordId', 'Ingresa tu ID de Discord');
                valid = false;
            } else if (!/^\d{17,19}$/.test(id)) {
                showError('discordId', 'El ID debe ser numérico (17-19 dígitos)');
                valid = false;
            }
            
            // Edad
            const age = document.getElementById('age').value;
            if (!age) {
                showError('age', 'Ingresa tu edad');
                valid = false;
            } else if (age < 13 || age > 99) {
                showError('age', 'Edad entre 13 y 99 años');
                valid = false;
            }
            
            // Zona horaria
            if (!document.getElementById('timezone').value) {
                showError('timezone', 'Selecciona tu zona horaria');
                valid = false;
            }
            
            // Idiomas
            if (!document.getElementById('languages').value.trim()) {
                showError('languages', 'Indica los idiomas que hablas');
                valid = false;
            }
        }
        
        if (section === 2) {
            // Experiencia
            const hasExp = document.querySelector('input[name="hasExperience"]:checked');
            if (!hasExp) {
                alert('⚠️ Indica si tienes experiencia como moderador');
                valid = false;
            } else if (hasExp.value === 'si') {
                const expDesc = document.getElementById('experienceDescription').value.trim();
                if (!expDesc || expDesc.length < 10) {
                    showError('experienceDescription', 'Describe tu experiencia (mín. 10 caracteres)');
                    valid = false;
                }
            }
            
            // Disponibilidad
            if (!document.getElementById('availability').value) {
                showError('availability', 'Selecciona tu disponibilidad');
                valid = false;
            }
        }
        
        if (section === 3) {
            // Escenario 1
            const s1 = document.getElementById('scenario1').value.trim();
            if (!s1 || s1.length < 20) {
                showError('scenario1', 'Responde al escenario (mín. 20 caracteres)');
                valid = false;
            }
            
            // Escenario 2
            const s2 = document.getElementById('scenario2').value.trim();
            if (!s2 || s2.length < 20) {
                showError('scenario2', 'Responde al escenario (mín. 20 caracteres)');
                valid = false;
            }
            
            // Reglas Discord
            if (!document.querySelector('input[name="discordRules"]:checked')) {
                alert('⚠️ Indica tu conocimiento de las reglas de Discord');
                valid = false;
            }
        }
        
        if (section === 4) {
            // Motivación
            const motivation = document.getElementById('motivation').value.trim();
            if (!motivation || motivation.length < 20) {
                showError('motivation', 'Cuéntanos tu motivación (mín. 20 caracteres)');
                valid = false;
            }
            
            // Fortalezas
            const strengths = document.getElementById('strengths').value.trim();
            if (!strengths || strengths.length < 10) {
                showError('strengths', 'Indica tus fortalezas (mín. 10 caracteres)');
                valid = false;
            }
            
            // Términos
            if (!document.getElementById('termsAccepted').checked) {
                alert('⚠️ Debes aceptar los términos y condiciones');
                valid = false;
            }
        }
        
        return valid;
    }
    
    // ============================================
    // OBTENER DATOS DEL FORMULARIO
    // ============================================
    function getFormData() {
        const tools = [];
        document.querySelectorAll('input[name="tools"]:checked').forEach(cb => {
            tools.push(cb.value);
        });
        
        return {
            id: 'app_' + Date.now(),
            discordNick: document.getElementById('discordNick').value.trim(),
            discordId: document.getElementById('discordId').value.trim(),
            age: document.getElementById('age').value,
            timezone: document.getElementById('timezone').value,
            languages: document.getElementById('languages').value.trim(),
            hasExperience: document.querySelector('input[name="hasExperience"]:checked')?.value || 'no',
            experienceDescription: document.getElementById('experienceDescription').value.trim(),
            tools: tools,
            availability: document.getElementById('availability').value,
            scenario1: document.getElementById('scenario1').value.trim(),
            scenario2: document.getElementById('scenario2').value.trim(),
            discordRules: document.querySelector('input[name="discordRules"]:checked')?.value || '',
            motivation: document.getElementById('motivation').value.trim(),
            strengths: document.getElementById('strengths').value.trim(),
            weaknesses: document.getElementById('weaknesses').value.trim(),
            additionalInfo: document.getElementById('additionalInfo').value.trim(),
            status: 'new',
            reviewNotes: '',
            reviewedBy: '',
            submittedAt: new Date().toISOString(),
            reviewedAt: null,
            timestamp: new Date().toLocaleString('es-ES')
        };
    }
    
    // ============================================
    // GUARDAR EN LOCALSTORAGE
    // ============================================
    function saveApplication(formData) {
        console.log('💾 Guardando postulación...');
        
        try {
            // Obtener existentes
            const existing = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
            console.log('📊 Postulaciones existentes:', existing.length);
            
            // Agregar nueva
            existing.push(formData);
            
            // Guardar
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(existing));
            console.log('✅ Guardada exitosamente. Total:', existing.length);
            
            // Verificar
            const check = JSON.parse(localStorage.getItem(CONFIG.storageKey));
            console.log('🔍 Verificación:', check.length, 'postulaciones');
            
            return true;
        } catch (error) {
            console.error('❌ Error al guardar:', error);
            return false;
        }
    }
    
    // ============================================
    // ENVIAR FORMULARIO
    // ============================================
    function handleSubmit(event) {
        event.preventDefault();
        console.log('📤 ¡ENVIANDO FORMULARIO!');
        
        // Validar sección final
        if (!validateSection(4)) {
            console.log('❌ Validación fallida en sección 4');
            return false;
        }
        
        // Verificar cooldown
        const now = Date.now();
        if (now - lastSubmissionTime < CONFIG.cooldownTime && lastSubmissionTime > 0) {
            const minutes = Math.ceil((CONFIG.cooldownTime - (now - lastSubmissionTime)) / 60000);
            alert('⏰ Debes esperar ' + minutes + ' minutos para enviar otra postulación.');
            return false;
        }
        
        // Evitar doble envío
        if (isSubmitting) {
            console.log('⚠️ Ya hay un envío en proceso');
            return false;
        }
        
        // Bloquear
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.querySelector('.btn-text').textContent = 'Enviando...';
        
        try {
            // Obtener datos
            const formData = getFormData();
            console.log('📦 Datos recopilados:', formData.discordNick);
            
            // Guardar
            const saved = saveApplication(formData);
            
            if (saved) {
                // Éxito
                messageContainer.textContent = '✅ ¡Postulación enviada con éxito! Revisa admin.html para verla.';
                messageContainer.className = 'message-container success';
                messageContainer.classList.remove('hidden');
                
                // Limpiar formulario
                document.getElementById('postulacionForm').reset();
                localStorage.removeItem(CONFIG.draftKey);
                
                // Actualizar tiempo
                lastSubmissionTime = Date.now();
                
                // Volver al inicio
                currentSection = 1;
                showSection(1);
                updateNavigation();
                
                // Scroll arriba
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                console.log('✅ ¡FORMULARIO ENVIADO EXITOSAMENTE!');
                
                // Efecto visual simple
                alert('🎉 ¡Postulación enviada con éxito!\n\nRevisa admin.html para ver tu postulación en el panel de administración.');
                
            } else {
                throw new Error('Error al guardar');
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            messageContainer.textContent = '❌ Error al enviar. Intenta de nuevo.';
            messageContainer.className = 'message-container error';
            messageContainer.classList.remove('hidden');
        } finally {
            // Desbloquear
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.querySelector('.btn-text').textContent = 'Enviar Postulación';
        }
        
        return false;
    }
    
    // ============================================
    // OTROS
    // ============================================
    function toggleExperienceDetails() {
        const hasExp = document.querySelector('input[name="hasExperience"]:checked');
        const details = document.getElementById('experienceDetails');
        if (hasExp && hasExp.value === 'si') {
            details.style.display = 'block';
        } else {
            details.style.display = 'none';
        }
    }
    
    function saveDraft() {
        const data = getFormData();
        localStorage.setItem(CONFIG.draftKey, JSON.stringify(data));
    }
    
    function loadDraft() {
        const draft = localStorage.getItem(CONFIG.draftKey);
        if (draft) {
            try {
                const data = JSON.parse(draft);
                // Cargar campos básicos
                if (data.discordNick) document.getElementById('discordNick').value = data.discordNick;
                if (data.discordId) document.getElementById('discordId').value = data.discordId;
                if (data.age) document.getElementById('age').value = data.age;
                if (data.timezone) document.getElementById('timezone').value = data.timezone;
                if (data.languages) document.getElementById('languages').value = data.languages;
                if (data.experienceDescription) document.getElementById('experienceDescription').value = data.experienceDescription;
                if (data.availability) document.getElementById('availability').value = data.availability;
                if (data.scenario1) document.getElementById('scenario1').value = data.scenario1;
                if (data.scenario2) document.getElementById('scenario2').value = data.scenario2;
                if (data.motivation) document.getElementById('motivation').value = data.motivation;
                if (data.strengths) document.getElementById('strengths').value = data.strengths;
                if (data.weaknesses) document.getElementById('weaknesses').value = data.weaknesses;
                if (data.additionalInfo) document.getElementById('additionalInfo').value = data.additionalInfo;
                
                console.log('📝 Borrador cargado');
                messageContainer.textContent = '📝 Se cargó un borrador anterior';
                messageContainer.className = 'message-container warning';
                messageContainer.classList.remove('hidden');
                setTimeout(() => messageContainer.classList.add('hidden'), 3000);
            } catch (e) {
                console.error('Error al cargar borrador:', e);
            }
        }
    }
    
    // ============================================
    // CONFIGURAR EVENTOS
    // ============================================
    console.log('🔧 Configurando eventos...');
    
    // Botones de navegación
    prevBtn.addEventListener('click', previousSection);
    nextBtn.addEventListener('click', nextSection);
    
    // Envío del formulario - ¡ESTA ES LA LÍNEA CLAVE!
    form.addEventListener('submit', handleSubmit);
    
    // También prevenir envío por Enter en inputs
    form.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            e.preventDefault();
            if (currentSection === totalSections) {
                handleSubmit(e);
            } else {
                nextSection();
            }
        }
    });
    
    // Experiencia
    document.querySelectorAll('input[name="hasExperience"]').forEach(radio => {
        radio.addEventListener('change', toggleExperienceDetails);
    });
    
    // Staff button
    document.getElementById('staffLoginBtn').addEventListener('click', function() {
        window.open('admin.html', '_blank');
    });
    
    // Autoguardado
    form.addEventListener('input', function() {
        clearTimeout(window._draftTimeout);
        window._draftTimeout = setTimeout(saveDraft, 2000);
    });
    
    // Navegación con teclado
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'ArrowRight') {
            e.preventDefault();
            nextSection();
        }
        if (e.ctrlKey && e.key === 'ArrowLeft') {
            e.preventDefault();
            previousSection();
        }
    });
    
    // ============================================
    // INICIALIZAR
    // ============================================
    updateNavigation();
    loadDraft();
    console.log('✅ Formulario listo');
    console.log('💡 Navega con los botones o Ctrl + ← →');
    console.log('📤 El botón Enviar aparece en la sección 4');
});

console.log('📄 script.js cargado');