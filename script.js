/* --- SEGURIDAD Y BLOQUEO ANTI-INSPECCIÓN --- */
(function() {
    'use strict';
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, true);

    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 123 || e.keyCode === 122) { // F12, F11
            e.preventDefault();
            return false;
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }
        if ((e.ctrlKey || e.metaKey) && (e.keyCode === 85 || e.keyCode === 117)) { // Ctrl+U
            e.preventDefault();
            return false;
        }
    }, true);
})();

/* ==========================================================================
   🎯 SECCIÓN DE AJUSTE RÁPIDO Y FÁCIL DE VALORES (EDITA AQUÍ)
   ========================================================================== */

// ✏️ CONTRASEÑA DE ACCESO:
const CLAVE_ACCESO_CORRECTA = "sensi";

// ✏️ ESTADO DEL SERVIDOR: true = ACTIVO (Verde) | false = INACTIVO (Rojo)
let SERVIDOR_ACTIVO = true;

// 🎯 AJUSTA AQUÍ LOS RANGOS DE SENSIBILIDAD Y BOTÓN DE DISPARO FÁCILMENTE:
const SENSI_VALORES = {
    // SENSIBILIDAD BAJA
    BAJA: {
        baseMin: 130,
        baseMax: 145,
        awmMin: 50,
        awmMax: 60
    },
    // SENSIBILIDAD MEDIA
    MEDIA: {
        baseMin: 165,
        baseMax: 182,
        awmMin: 126,
        awmMax: 142
    },
    // SENSIBILIDAD ALTA
    ALTA: {
        baseMin: 188,
        baseMax: 197,
        awmMin: 130,
        awmMax: 156
    },
    // TAMAÑOS DE BOTÓN DE DISPARO (%)
    BOTON: {
        PEQUENO: { min: 33, max: 39 },
        MEDIO:   { min: 41, max: 48 },
        GRANDE:  { min: 48, max: 58 }
    }
};

/* ========================================================================== */

/* --- CONTROL DE INTENTOS Y SEGURIDAD DE AUTENTICACIÓN --- */
const MAX_INTENTOS = 6;
const TIEMPO_BLOQUEO_SEG = 60; // 60 segundos de cooldown
let intentosFallidos = 0;
let temporizadorBloqueo = null;

function setEstadoServidor(activo) {
    SERVIDOR_ACTIVO = activo;
    const container = document.getElementById('serverStatusContainer');
    const statusText = document.getElementById('serverStatusText');
    const btnLogin = document.getElementById('btnLoginBtn');

    if (container && statusText) {
        if (activo) {
            container.classList.remove('inactive');
            container.classList.add('active');
            statusText.textContent = 'SERVIDOR ACTIVO';
            if (btnLogin && !verificarEstadoBloqueo()) btnLogin.disabled = false;
        } else {
            container.classList.remove('active');
            container.classList.add('inactive');
            statusText.textContent = 'SERVIDOR INACTIVO';
            if (btnLogin) btnLogin.disabled = true;
            mostrarAlertaLogin('⚠️ EL SERVIDOR SE ENCUENTRA INACTIVO EN ESTE MOMENTO.');
        }
    }
}

function verificarEstadoBloqueo() {
    const bloqueoHasta = localStorage.getItem('svs_lock_until');
    if (bloqueoHasta) {
        const tiempoRestante = Math.ceil((parseInt(bloqueoHasta, 10) - Date.now()) / 1000);
        if (tiempoRestante > 0) {
            iniciarCooldownBloqueo(tiempoRestante);
            return true;
        } else {
            localStorage.removeItem('svs_lock_until');
            intentosFallidos = 0;
        }
    }
    return false;
}

function mostrarAlertaLogin(mensaje) {
    const alertBox = document.getElementById('loginAlertBox');
    const loginCard = document.getElementById('loginCard');
    if (alertBox) {
        alertBox.textContent = mensaje;
        alertBox.style.display = 'block';
    }
    if (loginCard) {
        loginCard.classList.remove('shake-effect');
        void loginCard.offsetWidth; // Trigger reflow
        loginCard.classList.add('shake-effect');
    }
}

function iniciarCooldownBloqueo(segundos) {
    const keyInput = document.getElementById('loginKey');
    const btnLogin = document.getElementById('btnLoginBtn');
    let tiempoRestante = segundos;

    if (keyInput) keyInput.disabled = true;
    if (btnLogin) btnLogin.disabled = true;

    if (temporizadorBloqueo) clearInterval(temporizadorBloqueo);

    const actualizarMensaje = () => {
        mostrarAlertaLogin(`⚠️ LÍMITE DE CONTRASEÑA ALCANZADO (${MAX_INTENTOS}/${MAX_INTENTOS}). Sistema bloqueado por ${tiempoRestante}s.`);
    };

    actualizarMensaje();

    temporizadorBloqueo = setInterval(() => {
        tiempoRestante--;
        if (tiempoRestante <= 0) {
            clearInterval(temporizadorBloqueo);
            localStorage.removeItem('svs_lock_until');
            intentosFallidos = 0;
            if (keyInput) keyInput.disabled = false;
            if (btnLogin && SERVIDOR_ACTIVO) btnLogin.disabled = false;
            const alertBox = document.getElementById('loginAlertBox');
            if (alertBox && SERVIDOR_ACTIVO) alertBox.style.display = 'none';
        } else {
            actualizarMensaje();
        }
    }, 1000);
}

/* --- FUNCIÓN PARA MOSTRAR / OCULTAR CONTRASEÑA (OJO) --- */
function toggleVisibilidadPassword() {
    ejecutarVibracion();
    ejecutarSonidoUI('select');
    const keyInput = document.getElementById('loginKey');
    const eyeOpen = document.getElementById('eyeOpenIcon');
    const eyeClosed = document.getElementById('eyeClosedIcon');

    if (keyInput && eyeOpen && eyeClosed) {
        if (keyInput.type === 'password') {
            keyInput.type = 'text';
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'block';
        } else {
            keyInput.type = 'password';
            eyeOpen.style.display = 'block';
            eyeClosed.style.display = 'none';
        }
    }
}

/* --- MANEJO DEL LOGIN EN TEXTO PLANO --- */
function procesarLogin(e) {
    if (e) e.preventDefault();
    ejecutarVibracion();
    ejecutarSonidoUI('gen');

    if (!SERVIDOR_ACTIVO) {
        mostrarAlertaLogin('⚠️ EL SERVIDOR SE ENCUENTRA INACTIVO EN ESTE MOMENTO.');
        return;
    }

    if (verificarEstadoBloqueo()) return;

    const keyInput = document.getElementById('loginKey');
    const keyInputVal = keyInput ? keyInput.value.trim() : '';

    if (!keyInputVal) return;

    // Comparación directa en texto plano (sin distinción de mayúsculas/minúsculas)
    if (keyInputVal.toLowerCase() === CLAVE_ACCESO_CORRECTA.toLowerCase()) {
        intentosFallidos = 0;
        localStorage.removeItem('svs_lock_until');
        const alertBox = document.getElementById('loginAlertBox');
        if (alertBox) alertBox.style.display = 'none';

        iniciarCarga(() => {
            document.getElementById('loginCard').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            aplicarModoUniversal(appConfig.universalSensi);
            evaluarSugerenciaEnTiempoReal();
        });
    } else {
        intentosFallidos++;
        if (intentosFallidos >= MAX_INTENTOS) {
            const bloqueoHasta = Date.now() + (TIEMPO_BLOQUEO_SEG * 1000);
            localStorage.setItem('svs_lock_until', bloqueoHasta.toString());
            iniciarCooldownBloqueo(TIEMPO_BLOQUEO_SEG);
        } else {
            const restantes = MAX_INTENTOS - intentosFallidos;
            mostrarAlertaLogin(`⚠️ Clave incorrecta. Intentos restantes: ${restantes}/${MAX_INTENTOS}`);
        }
    }
}

/* --- PUENTE SEGURO DE COMUNICACIÓN WEB / JAVA --- */
const JavaBridge = {
    enviar: function(action, payload) {
        try {
            const jsonMessage = JSON.stringify({
                action: action, payload: payload
            });
            if (window.Android && typeof window.Android.onDataFromWeb === 'function') {
                window.Android.onDataFromWeb(jsonMessage);
            } else if (window.JavaBridge && typeof window.JavaBridge.postMessage === 'function') {
                window.JavaBridge.postMessage(jsonMessage);
            } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.javaBridge) {
                window.webkit.messageHandlers.javaBridge.postMessage(jsonMessage);
            }
        } catch(e) {}
    }
};

window.recibirDeJava = function(jsonString) {
    try {
        const data = typeof jsonString === 'string' ? JSON.parse(jsonString): jsonString;
        if (!data || typeof data !== 'object') return;

        if (data.action === 'generarSensibilidad') {
            ejecutarBotonGenerar();
        } else if (data.action === 'cargarConfiguracion') {
            window.configurarDesdeJava(data.config);
        } else if (data.action === 'setServerStatus') {
            setEstadoServidor(!!data.active);
        }
    } catch(e) {}
};

window.actualizarDesdeJava = function(datos) {
    if (datos) actualizarUI(datos, DOM.sensiType ? DOM.sensiType.value: 'Media');
};

window.configurarDesdeJava = function(cfg) {
    if (!cfg) return;
    if (cfg.brand && DOM.phoneBrand) DOM.phoneBrand.value = cfg.brand;
    if (cfg.model && DOM.phoneModel) DOM.phoneModel.value = cfg.model;
    if (cfg.sensiType && DOM.sensiType) DOM.sensiType.value = cfg.sensiType;
    if (cfg.gameMode && DOM.gameMode) DOM.gameMode.value = cfg.gameMode;
    if (cfg.useDpi && DOM.useDpi) DOM.useDpi.value = cfg.useDpi;
    if (cfg.useBtn && DOM.useBtn) DOM.useBtn.value = cfg.useBtn;
    if (cfg.universalSensi !== undefined) aplicarModoUniversal(!!cfg.universalSensi);
    evaluarSugerenciaEnTiempoReal();
};

/* --- CACHE DE ELEMENTOS DOM --- */
const DOM = {};

function initDOMCache() {
    const ids = [
        'fpsValue',
        'cpuValue',
        'gpuValue',
        'phoneBrand',
        'phoneModel',
        'sensiType',
        'gameMode',
        'useDpi',
        'useBtn',
        'modeHintBox',
        'customNoteBox',
        'errorBox',
        'errorMsg',
        'r_gen',
        'r_red',
        'r_2x',
        'r_4x',
        'r_awm',
        'r_cam',
        'r_dpi',
        'r_btn',
        'aiModal',
        'gpuAccelToggle',
        'vibrationToggle',
        'soundToggle',
        'batterySaverToggle',
        'universalSensiToggle',
        'infoUniversalModal',
        'loaderModal',
        'loaderStatusText',
        'loaderPercentText',
        'loaderProgressBarFill',
        'perfMonitorBox',
        'mainApp'
    ];
    ids.forEach(id => DOM[id] = document.getElementById(id));
}

/* --- CONFIGURACIÓN DEL SISTEMA --- */
const appConfig = {
    batterySaver: false,
    vibration: true,
    sound: true,
    gpuAccel: true,
    universalSensi: false
};

/* --- FUNCIONES DE MODO SENSI UNIVERSAL --- */
function aplicarModoUniversal(activo) {
    appConfig.universalSensi = activo !== undefined ? activo : (DOM.universalSensiToggle ? DOM.universalSensiToggle.checked : false);
    
    if (DOM.universalSensiToggle) DOM.universalSensiToggle.checked = appConfig.universalSensi;

    if (DOM.phoneBrand && DOM.phoneModel) {
        if (appConfig.universalSensi) {
            DOM.phoneBrand.disabled = true;
            DOM.phoneModel.disabled = true;
            DOM.phoneModel.placeholder = "Modo Sensi Universal Activo";
            DOM.phoneModel.value = "";
        } else {
            DOM.phoneBrand.disabled = false;
            DOM.phoneModel.disabled = false;
            DOM.phoneModel.placeholder = "Ej: Poco X3, S23...";
        }
    }
    evaluarSugerenciaEnTiempoReal();
}

function mostrarInfoSensiUniversal(e) {
    if (e) e.stopPropagation();
    ejecutarVibracion();
    ejecutarSonidoUI('select');
    if (DOM.infoUniversalModal) DOM.infoUniversalModal.style.display = 'flex';
}

function cerrarInfoSensiUniversal() {
    ejecutarVibracion();
    ejecutarSonidoUI('select');
    if (DOM.infoUniversalModal) DOM.infoUniversalModal.style.display = 'none';
}

/* --- MOTOR DE AUDIO Y VIBRACIÓN --- */
let audioCtxInstance = null;

function obtenerAudioContext() {
    if (!audioCtxInstance) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioCtxInstance = new AudioCtx();
    }
    if (audioCtxInstance && audioCtxInstance.state === 'suspended') {
        audioCtxInstance.resume().catch(() => {});
    }
    return audioCtxInstance;
}

function ejecutarVibracion() {
    if (appConfig.vibration && navigator.vibrate) {
        try {
            navigator.vibrate(8);
        } catch(e) {}
    }
}

function ejecutarSonidoUI(tipo) {
    if (!appConfig.sound) return;
    try {
        const ctx = obtenerAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;

        osc.type = (tipo === 'gen') ? 'triangle': 'sine';
        osc.frequency.setValueAtTime((tipo === 'gen') ? 650: 880, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
    } catch(e) {}
}

/* --- MODALES --- */
function abrirConfiguracion() {
    ejecutarVibracion();
    ejecutarSonidoUI('select');
    toggleModal(true);
    JavaBridge.enviar('modalConfigAbierto', { abierto: true });
}

function toggleModal(show) {
    if (DOM.aiModal) DOM.aiModal.style.display = show ? 'flex': 'none';
    JavaBridge.enviar('modalConfigEstado', { abierto: show });
}

/* --- MONITOR DE RENDIMIENTO --- */
let frameCount = 0;
let lastSampleTime = performance.now();
let lastFrameTime = performance.now();
let frameDeltas = [];
let isBatterySaverActive = false;
let monitorFrameId = null;

function monitorPerformanceLoop(now) {
    if (isBatterySaverActive || document.hidden) {
        monitorFrameId = null;
        return;
    }

    const frameDelta = now - lastFrameTime;
    lastFrameTime = now;

    if (frameDelta > 0) {
        frameDeltas.push(frameDelta);
        if (frameDeltas.length > 20) frameDeltas.shift();
    }

    frameCount++;
    const elapsed = now - lastSampleTime;

    if (elapsed >= 200) {
        const avgDelta = frameDeltas.reduce((a, b) => a + b, 0) / (frameDeltas.length || 1);
        const realFps = Math.min(144, Math.max(1, Math.round(1000 / avgDelta)));
        const computeTimeRatio = avgDelta / 6.94;

        const cpuCalc = Math.min(99, Math.max(2, Math.round(computeTimeRatio * 18 + Math.abs(frameDelta - avgDelta) * 5 + 3)));
        const gpuCalc = Math.min(99, Math.max(2, Math.round((realFps / 144) * 14 + (computeTimeRatio > 1 ? (computeTimeRatio - 1) * 20: 4))));

        if (DOM.fpsValue) DOM.fpsValue.textContent = realFps;
        if (DOM.cpuValue) DOM.cpuValue.textContent = cpuCalc + '%';
        if (DOM.gpuValue) DOM.gpuValue.textContent = gpuCalc + '%';

        frameCount = 0;
        lastSampleTime = now;
    }

    monitorFrameId = requestAnimationFrame(monitorPerformanceLoop);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (monitorFrameId) {
            cancelAnimationFrame(monitorFrameId);
            monitorFrameId = null;
        }
    } else if (!isBatterySaverActive && !monitorFrameId) {
        lastSampleTime = performance.now();
        lastFrameTime = performance.now();
        frameCount = 0;
        frameDeltas = [];
        monitorFrameId = requestAnimationFrame(monitorPerformanceLoop);
    }
});

function aplicarModoAhorro() {
    if (!DOM.batterySaverToggle) return;
    isBatterySaverActive = DOM.batterySaverToggle.checked;
    if (isBatterySaverActive) {
        if (DOM.perfMonitorBox) DOM.perfMonitorBox.style.display = 'none';
        if (monitorFrameId) {
            cancelAnimationFrame(monitorFrameId);
            monitorFrameId = null;
        }
    } else {
        if (DOM.perfMonitorBox) DOM.perfMonitorBox.style.display = 'flex';
        if (!monitorFrameId) {
            lastSampleTime = performance.now();
            lastFrameTime = performance.now();
            frameCount = 0;
            frameDeltas = [];
            monitorFrameId = requestAnimationFrame(monitorPerformanceLoop);
        }
    }
}

/* --- LÓGICA DE RECOMENDACIÓN --- */
function evaluarSugerenciaEnTiempoReal() {
    ejecutarVibracion();
    ejecutarSonidoUI('select');

    if (!DOM.gameMode || !DOM.phoneBrand || !DOM.modeHintBox) return;

    const mode = DOM.gameMode.value;
    let brandText = "Universal / Multi-Dispositivo";

    if (!appConfig.universalSensi) {
        const brandOption = DOM.phoneBrand.options[DOM.phoneBrand.selectedIndex];
        brandText = brandOption ? brandOption.text : DOM.phoneBrand.value;
    }

    let nivelRecomendado = `Alta (${SENSI_VALORES.ALTA.baseMin}-${SENSI_VALORES.ALTA.baseMax})`;
    let alzamientoMira = "Levantamiento seco de un solo toque sin pasar la cabeza.";

    if (mode.includes('Lobo')) {
        nivelRecomendado = `Alta (${SENSI_VALORES.ALTA.baseMin}-${SENSI_VALORES.ALTA.baseMax})`;
        alzamientoMira = "Arrastre rápido en forma de 'J' para distancias cortas.";
    } else if (mode.includes('PVP') || mode.includes('Rojo')) {
        nivelRecomendado = `Alta (${SENSI_VALORES.ALTA.baseMin}-${SENSI_VALORES.ALTA.baseMax})`;
        alzamientoMira = "Levantamiento seco de un solo toque sin pasar la cabeza.";
    } else if (mode.includes('Duelo') || mode.includes('Escuadras')) {
        nivelRecomendado = `Media (${SENSI_VALORES.MEDIA.baseMin}-${SENSI_VALORES.MEDIA.baseMax})`;
        alzamientoMira = "Alzamiento progresivo según la distancia del objetivo.";
    } else if (mode.includes('Battle') || mode.includes('BR')) {
        nivelRecomendado = `Baja (${SENSI_VALORES.BAJA.baseMin}-${SENSI_VALORES.BAJA.baseMax})`;
        alzamientoMira = "Levantamiento suave y constante a larga distancia.";
    }

    const titleHeader = appConfig.universalSensi ? "⚡ RECOMENDACIÓN UNIVERSAL" : "⚡ RECOMENDACIÓN PRO";
    const levelLabel = "Nivel:";
    const techLabel = "Técnica:";

    DOM.modeHintBox.innerHTML = `
    <div class="hint-header">${titleHeader} (${sanitizeInput(brandText)})</div>
    <ul class="hint-list">
    <li><strong>${levelLabel}</strong> <span class="hint-highlight">${nivelRecomendado}</span></li>
    <li><strong>${techLabel}</strong> ${alzamientoMira}</li>
    </ul>
    `;

    JavaBridge.enviar('sugerenciaCambiada', {
        brand: brandText,
        mode: mode,
        nivel: nivelRecomendado,
        tecnica: alzamientoMira,
        universal: appConfig.universalSensi
    });
}

function sanitizeInput(str) {
    return String(str || '').replace(/[&<>"'/`=]/g, '').trim();
}

window.addEventListener('DOMContentLoaded', () => {
    initDOMCache();

    verificarEstadoBloqueo();
    setEstadoServidor(SERVIDOR_ACTIVO);

    const saved = localStorage.getItem('ff_sys_cfg_v12') || sessionStorage.getItem('ff_sys_cfg_v12');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appConfig.batterySaver = !!parsed.batterySaver;
            appConfig.vibration = parsed.vibration !== undefined ? !!parsed.vibration: true;
            appConfig.sound = parsed.sound !== undefined ? !!parsed.sound: true;
            appConfig.gpuAccel = parsed.gpuAccel !== undefined ? !!parsed.gpuAccel: true;
            appConfig.universalSensi = !!parsed.universalSensi;

            if (DOM.batterySaverToggle) DOM.batterySaverToggle.checked = appConfig.batterySaver;
            if (DOM.vibrationToggle) DOM.vibrationToggle.checked = appConfig.vibration;
            if (DOM.soundToggle) DOM.soundToggle.checked = appConfig.sound;
            if (DOM.gpuAccelToggle) DOM.gpuAccelToggle.checked = appConfig.gpuAccel;
            if (DOM.universalSensiToggle) DOM.universalSensiToggle.checked = appConfig.universalSensi;

            aplicarModoAhorro();
            aplicarModoUniversal(appConfig.universalSensi);
        } catch(e) {}
    }

    evaluarSugerenciaEnTiempoReal();
    monitorFrameId = requestAnimationFrame(monitorPerformanceLoop);

    JavaBridge.enviar('appLista', {
        version: '1.2', status: 'ready'
    });
});

function guardarConfiguracion() {
    ejecutarVibracion();
    ejecutarSonidoUI('gen');

    if (DOM.batterySaverToggle) appConfig.batterySaver = DOM.batterySaverToggle.checked;
    if (DOM.vibrationToggle) appConfig.vibration = DOM.vibrationToggle.checked;
    if (DOM.soundToggle) appConfig.sound = DOM.soundToggle.checked;
    if (DOM.gpuAccelToggle) appConfig.gpuAccel = DOM.gpuAccelToggle.checked;
    if (DOM.universalSensiToggle) appConfig.universalSensi = DOM.universalSensiToggle.checked;

    aplicarModoUniversal(appConfig.universalSensi);

    if (DOM.mainApp) DOM.mainApp.style.transform = appConfig.gpuAccel ? 'translateZ(0)': 'none';

    const payloadData = {
        batterySaver: appConfig.batterySaver,
        vibration: appConfig.vibration,
        sound: appConfig.sound,
        gpuAccel: appConfig.gpuAccel,
        universalSensi: appConfig.universalSensi
    };

    const payload = JSON.stringify(payloadData);

    try {
        localStorage.setItem('ff_sys_cfg_v12', payload);
    } catch(e) {
        sessionStorage.setItem('ff_sys_cfg_v12', payload);
    }
    toggleModal(false);

    JavaBridge.enviar('configuracionGuardada', payloadData);
}

/* --- GENERACIÓN DE SENSIBILIDAD --- */
let loaderInterval = null;

function iniciarCarga(alFinalizar) {
    if (loaderInterval) clearInterval(loaderInterval);
    let progreso = 0;
    if (DOM.loaderModal) DOM.loaderModal.style.display = 'flex';

    if (DOM.loaderStatusText) DOM.loaderStatusText.textContent = '⚡ PROCESANDO...';
    loaderInterval = setInterval(() => {
        progreso += 34;
        const pVal = Math.min(100, progreso);
        if (DOM.loaderPercentText) DOM.loaderPercentText.textContent = pVal + '%';
        if (DOM.loaderProgressBarFill) DOM.loaderProgressBarFill.style.width = pVal + '%';
        if (progreso >= 100) {
            clearInterval(loaderInterval);
            setTimeout(() => {
                if (DOM.loaderModal) DOM.loaderModal.style.display = 'none';
                alFinalizar();
            }, 60);
        }
    }, 12);
}

function ejecutarBotonGenerar() {
    ejecutarVibracion();
    ejecutarSonidoUI('gen');
    generar();
}

async function generar() {
    if (DOM.errorBox) DOM.errorBox.style.display = 'none';

    const brand = appConfig.universalSensi ? "Universal" : sanitizeInput(DOM.phoneBrand ? DOM.phoneBrand.value: '');
    const model = appConfig.universalSensi ? "Universal" : sanitizeInput(DOM.phoneModel ? DOM.phoneModel.value: '');
    const type = sanitizeInput(DOM.sensiType ? DOM.sensiType.value: '');
    const mode = sanitizeInput(DOM.gameMode ? DOM.gameMode.value: '');
    const dpi = sanitizeInput(DOM.useDpi ? DOM.useDpi.value: '');
    const btn = sanitizeInput(DOM.useBtn ? DOM.useBtn.value: '');

    const solicitudPayload = {
        brand: brand,
        model: model,
        sensiType: type,
        gameMode: mode,
        useDpi: dpi,
        useBtn: btn,
        universal: appConfig.universalSensi
    };

    JavaBridge.enviar('solicitudGeneracion', solicitudPayload);

    iniciarCarga(() => {
        actualizarUI(generarLocalMatematico(brand, type, dpi, btn), type);
    });
}

function clamp(num, min, max) {
    const parsed = parseInt(num, 10);
    return isNaN(parsed) ? min: Math.min(Math.max(parsed, min), max);
}

function generarLocalMatematico(brand, type, useDpi, useBtn) {
    let baseMin = SENSI_VALORES.MEDIA.baseMin,
        baseMax = SENSI_VALORES.MEDIA.baseMax,
        awmMin  = SENSI_VALORES.MEDIA.awmMin,
        awmMax  = SENSI_VALORES.MEDIA.awmMax;

    if (type.includes('Baja')) {
        baseMin = SENSI_VALORES.BAJA.baseMin;
        baseMax = SENSI_VALORES.BAJA.baseMax;
        awmMin  = SENSI_VALORES.BAJA.awmMin;
        awmMax  = SENSI_VALORES.BAJA.awmMax;
    } else if (type.includes('Alta')) {
        baseMin = SENSI_VALORES.ALTA.baseMin;
        baseMax = SENSI_VALORES.ALTA.baseMax;
        awmMin  = SENSI_VALORES.ALTA.awmMin;
        awmMax  = SENSI_VALORES.ALTA.awmMax;
    }

    let brandOffset = 0;
    if (!appConfig.universalSensi) {
        if (brand.includes('Xiaomi') || brand.includes('ZTE') || brand.includes('ASUS')) brandOffset = 2;
        if (brand.includes('Apple')) brandOffset = -3;
        if (brand.includes('Samsung')) brandOffset = 1;
    }

    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const genVal = clamp(rand(baseMin, baseMax) + brandOffset, baseMin, baseMax);
    const redVal = clamp(genVal - rand(1, 3), baseMin, baseMax);
    const m2xVal = clamp(genVal + rand(0, 2), baseMin, baseMax);
    const m4xVal = clamp(genVal - rand(2, 5), baseMin, baseMax);
    const awmVal = rand(awmMin, awmMax);
    const camVal = rand(130, 185);

    let dpiCalculado = "Stock";
    if (useDpi.includes('Con DPI')) {
        const dpiBase = (baseMin >= SENSI_VALORES.ALTA.baseMin) ? rand(520, 580): ((baseMin >= SENSI_VALORES.MEDIA.baseMin) ? rand(460, 520): rand(410, 460));
        dpiCalculado = Math.min(593, dpiBase);
    }

    let btnCalculado = "Omitido";
    if (useBtn.includes('Pequeño')) {
        btnCalculado = rand(SENSI_VALORES.BOTON.PEQUENO.min, SENSI_VALORES.BOTON.PEQUENO.max) + "%";
    } else if (useBtn.includes('Medio')) {
        btnCalculado = rand(SENSI_VALORES.BOTON.MEDIO.min, SENSI_VALORES.BOTON.MEDIO.max) + "%";
    } else if (useBtn.includes('Grande')) {
        btnCalculado = rand(SENSI_VALORES.BOTON.GRANDE.min, SENSI_VALORES.BOTON.GRANDE.max) + "%";
    }

    return {
        gen: genVal,
        red: redVal,
        m2x: m2xVal,
        m4x: m4xVal,
        awm: awmVal,
        cam: camVal,
        dpi: dpiCalculado,
        btn: btnCalculado
    };
}

function actualizarUI(data, sensiType) {
    let minS = SENSI_VALORES.MEDIA.baseMin,
        maxS = SENSI_VALORES.MEDIA.baseMax,
        awmMin = SENSI_VALORES.MEDIA.awmMin,
        awmMax = SENSI_VALORES.MEDIA.awmMax;

    if (sensiType.includes('Baja')) {
        minS = SENSI_VALORES.BAJA.baseMin;
        maxS = SENSI_VALORES.BAJA.baseMax;
        awmMin = SENSI_VALORES.BAJA.awmMin;
        awmMax = SENSI_VALORES.BAJA.awmMax;
    } else if (sensiType.includes('Alta')) {
        minS = SENSI_VALORES.ALTA.baseMin;
        maxS = SENSI_VALORES.ALTA.baseMax;
        awmMin = SENSI_VALORES.ALTA.awmMin;
        awmMax = SENSI_VALORES.ALTA.awmMax;
    }

    const genVal = !isNaN(data.gen) ? clamp(data.gen, minS, maxS): data.gen;
    const redVal = !isNaN(data.red) ? clamp(data.red, minS, maxS): data.red;
    const m2xVal = !isNaN(data.m2x) ? clamp(data.m2x, minS, maxS): data.m2x;
    const m4xVal = !isNaN(data.m4x) ? clamp(data.m4x, minS, maxS): data.m4x;
    const awmVal = !isNaN(data.awm) ? clamp(data.awm, awmMin, awmMax): data.awm;
    const camVal = data.cam;

    let dpiVal = data.dpi;
    if (!isNaN(parseInt(dpiVal, 10)) && parseInt(dpiVal, 10) > 593) dpiVal = 593;

    const btnVal = data.btn;

    if (DOM.r_gen) DOM.r_gen.textContent = genVal;
    if (DOM.r_red) DOM.r_red.textContent = redVal;
    if (DOM.r_2x) DOM.r_2x.textContent = m2xVal;
    if (DOM.r_4x) DOM.r_4x.textContent = m4xVal;
    if (DOM.r_awm) DOM.r_awm.textContent = awmVal;
    if (DOM.r_cam) DOM.r_cam.textContent = camVal;
    if (DOM.r_dpi) DOM.r_dpi.textContent = dpiVal;
    if (DOM.r_btn) DOM.r_btn.textContent = btnVal;

    if (DOM.customNoteBox) DOM.customNoteBox.style.display = 'block';

    const resultadoCalculado = {
        gen: genVal,
        red: redVal,
        m2x: m2xVal,
        m4x: m4xVal,
        awm: awmVal,
        cam: camVal,
        dpi: dpiVal,
        btn: btnVal
    };

    JavaBridge.enviar('resultadoGenerado', resultadoCalculado);
}
