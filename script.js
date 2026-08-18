/* --- SEGURIDAD Y BLOQUEO ANTI-INSPECCIÓN --- */
(function() {
    'use strict';
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, true);

    document.addEventListener('keydown', function(e) {
        const code = e.keyCode || e.which;
        const key = (e.key || '').toLowerCase();

        if (code === 123 || code === 122 || key === 'f12' || key === 'f11') {
            e.preventDefault();
            return false;
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (code === 73 || code === 74 || code === 67 || key === 'i' || key === 'j' || key === 'c')) {
            e.preventDefault();
            return false;
        }
        if ((e.ctrlKey || e.metaKey) && (code === 85 || code === 117 || key === 'u')) {
            e.preventDefault();
            return false;
        }
    },
        true);
})();

/* --- ALMACENAMIENTO SEGURO COMPATIBLE CON CUALQUIER NAVEGADOR Y ANDROID WEBVIEW --- */
const SafeStorage = {
    getItem: function(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            try {
                return sessionStorage.getItem(key);
            } catch (err) {
                return null;
            }
        }
    },
    setItem: function(key, val) {
        try {
            localStorage.setItem(key, val);
        } catch (e) {
            try {
                sessionStorage.setItem(key, val);
            } catch (err) {}
        }
    },
    removeItem: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            try {
                sessionStorage.removeItem(key);
            } catch (err) {}
        }
    }
};

/* --- CONTROL DE MODAL DE CONTRASEÑA USADA / EXPIRADA --- */
let modalOrigenExpiracion = false;

function mostrarModalContrasenaUsada(clave, esExpiracionEnUso = false) {
    ejecutarVibracion();
    ejecutarSonidoUI('gen');
    modalOrigenExpiracion = !!esExpiracionEnUso;
    const modal = document.getElementById('usedPasswordModal');
    const display = document.getElementById('usedPassDisplay');
    const subtitle = document.getElementById('usedPassSubtitle');
    const msg = document.getElementById('usedPassMsg');

    const claveCensurada = clave ? (clave.length > 3 ? clave.substring(0,
        3) + '••••': clave): '••••••••';

    if (display) {
        display.textContent = claveCensurada;
    }

    if (esExpiracionEnUso) {
        if (subtitle) subtitle.textContent = "ACCESO DENEGADO - CLAVE EXPIRADA";
        if (msg) {
            msg.innerHTML = `Tu clave temporal <strong id="usedPassDisplay" class="used-pass-highlight">${claveCensurada}</strong> ha expirado mientras utilizabas el <strong>Generador de Sensibilidad</strong>. El acceso ha finalizado.`;
        }
    } else {
        if (subtitle) subtitle.textContent = "CLAVE EXPIRADA O YA UTILIZADA";
        if (msg) {
            msg.innerHTML = `La contraseña ingresada <strong id="usedPassDisplay" class="used-pass-highlight">${claveCensurada}</strong> ha expirado o ya ha cumplido su ciclo en este dispositivo.`;
        }
    }

    if (modal) modal.style.display = 'flex';
}

function cerrarModalContrasenaUsada() {
    ejecutarVibracion();
    ejecutarSonidoUI('select');
    const modal = document.getElementById('usedPasswordModal');
    if (modal) modal.style.display = 'none';

    if (modalOrigenExpiracion) {
        cerrarSesion();
        modalOrigenExpiracion = false;
    }
}

/* ==========================================================================
   🔑 SECCIÓN DE CONTRASEÑAS Y TIEMPOS PROGRAMADOS
   ========================================================================== */

const SISTEMA_CLAVES = {
    ADMIN: ["admin",
        "adminvip"],
    PERMANENTE: ["jhonatan",
        "jhonatanvip"],

    TEMPORALES: [{
        clave: "SENSI_FF_3D",
        tipo: "3 Días",
        mensaje: "Pase Temporal de 3 Días Activo",
        duracionMs: 3 * 24 * 60 * 60 * 1000
    },
        {
            clave: "HEADSHOT_3D",
            tipo: "3 Días",
            mensaje: "Pase Temporal de 3 Días Activo",
            duracionMs: 3 * 24 * 60 * 60 * 1000
        },
        {
            clave: "VIP_PASS_3D",
            tipo: "3 Días",
            mensaje: "Pase Temporal de 3 Días Activo",
            duracionMs: 3 * 24 * 60 * 60 * 1000
        },
        {
            clave: "PRO_SENSI_7D",
            tipo: "7 Días",
            mensaje: "Pase Temporal de 7 Días Activo",
            duracionMs: 7 * 24 * 60 * 60 * 1000
        },
        {
            clave: "RED_NUMBERS_7D",
            tipo: "7 Días",
            mensaje: "Pase Temporal de 7 Días Activo",
            duracionMs: 7 * 24 * 60 * 60 * 1000
        },
        {
            clave: "REGEDIT_FF_7D",
            tipo: "7 Días",
            mensaje: "Pase Temporal de 7 Días Activo",
            duracionMs: 7 * 24 * 60 * 60 * 1000
        },
        {
            clave: "MACRO_SENSI_15D",
            tipo: "15 Días",
            mensaje: "Pase Temporal de 15 Días Activo",
            duracionMs: 15 * 24 * 60 * 60 * 1000
        },
        {
            clave: "ALL_RED_15D",
            tipo: "15 Días",
            mensaje: "Pase Temporal de 15 Días Activo",
            duracionMs: 15 * 24 * 60 * 60 * 1000
        },
        {
            clave: "MASTER_FF_15D",
            tipo: "15 Días",
            mensaje: "Pase Temporal de 15 Días Activo",
            duracionMs: 15 * 24 * 60 * 60 * 1000
        },
        {
            clave: "SENSI_GOD_30D",
            tipo: "30 Días",
            mensaje: "Pase Temporal de 30 Días (1 Mes) Activo",
            duracionMs: 30 * 24 * 60 * 60 * 1000
        },
        {
            clave: "ULTRA_SENSI_30D",
            tipo: "30 Días",
            mensaje: "Pase Temporal de 30 Días (1 Mes) Activo",
            duracionMs: 30 * 24 * 60 * 60 * 1000
        },
        {
            clave: "KING_FREEFIRE_30D",
            tipo: "30 Días",
            mensaje: "Pase Temporal de 30 Días (1 Mes) Activo",
            duracionMs: 30 * 24 * 60 * 60 * 1000
        },
        {
            clave: "TEST_SENSI_1M",
            tipo: "1 minuto",
            mensaje: "Pase Temporal de un minuto (1 minuto) Activo",
            duracionMs: 1 * 60 * 1000
        }]

};

let SERVIDOR_ACTIVO = false;

const SENSI_VALORES = {
    BAJA: {
        baseMin: 130,
        baseMax: 145,
        awmMin: 50,
        awmMax: 60
    },
    MEDIA: {
        baseMin: 165,
        baseMax: 182,
        awmMin: 126,
        awmMax: 142
    },
    ALTA: {
        baseMin: 188,
        baseMax: 197,
        awmMin: 130,
        awmMax: 156
    },
    BOTON: {
        PEQUENO: {
            min: 33,
            max: 39
        },
        MEDIO: {
            min: 41,
            max: 48
        },
        GRANDE: {
            min: 48,
            max: 58
        }
    }
};

const MAX_INTENTOS = 6;
const TIEMPO_BLOQUEO_SEG = 60;
let intentosFallidos = 0;
let temporizadorBloqueo = null;
let passTimerInterval = null;

function setEstadoServidor(activo) {
    SERVIDOR_ACTIVO = !!activo;
    const container = document.getElementById('serverStatusContainer');
    const statusText = document.getElementById('serverStatusText');
    const btnLogin = document.getElementById('btnLoginBtn');

    if (container && statusText) {
        if (SERVIDOR_ACTIVO) {
            container.classList.remove('inactive');
            container.classList.add('active');
            statusText.textContent = 'SERVIDOR ACTIVO';
            if (btnLogin && !verificarEstadoBloqueo()) btnLogin.disabled = false;
        } else {
            container.classList.remove('active');
            container.classList.add('inactive');
            statusText.textContent = 'SERVIDOR INACTIVO';
            if (btnLogin && !verificarEstadoBloqueo()) btnLogin.disabled = false;
            mostrarAlertaLogin('⚠️ EL SERVIDOR SE ENCUENTRA INACTIVO EN ESTE MOMENTO.');
        }
    }
}

function verificarEstadoBloqueo() {
    const bloqueoHasta = SafeStorage.getItem('svs_lock_until');
    if (bloqueoHasta) {
        const bloqueoHastaNum = parseInt(bloqueoHasta, 10);
        if (!isNaN(bloqueoHastaNum)) {
            const tiempoRestante = Math.ceil((bloqueoHastaNum - Date.now()) / 1000);
            if (tiempoRestante > 0) {
                iniciarCooldownBloqueo(tiempoRestante);
                return true;
            }
        }
        SafeStorage.removeItem('svs_lock_until');
        intentosFallidos = 0;
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
        void loginCard.offsetWidth;
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
        mostrarAlertaLogin(`⚠️ LÍMITE ALCANZADO (${MAX_INTENTOS}/${MAX_INTENTOS}). Sistema bloqueado por ${tiempoRestante}s.`);
    };

    actualizarMensaje();

    temporizadorBloqueo = setInterval(() => {
        tiempoRestante--;
        if (tiempoRestante <= 0) {
            clearInterval(temporizadorBloqueo);
            temporizadorBloqueo = null;
            SafeStorage.removeItem('svs_lock_until');
            intentosFallidos = 0;
            if (keyInput) keyInput.disabled = false;
            if (btnLogin) btnLogin.disabled = false;
            const alertBox = document.getElementById('loginAlertBox');
            if (alertBox && SERVIDOR_ACTIVO) alertBox.style.display = 'none';
        } else {
            actualizarMensaje();
        }
    },
        1000);
}

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

function abrirModalSoporte() {
    ejecutarVibracion();
    ejecutarSonidoUI('select');
    const modal = document.getElementById('soporteModal');
    if (modal) modal.style.display = 'flex';
}

function cerrarModalSoporte() {
    ejecutarVibracion();
    ejecutarSonidoUI('select');
    const modal = document.getElementById('soporteModal');
    if (modal) modal.style.display = 'none';
}

function validarClaveEntrada(input) {
    const key = (input || '').trim();
    const keyLower = key.toLowerCase();

    if (SISTEMA_CLAVES.ADMIN.some(a => a.toLowerCase() === keyLower)) {
        return {
            esValida: true,
            tipo: 'ADMIN',
            info: 'Bienvenido Administrador',
            duracionMs: null,
            key: key
        };
    }
    if (SISTEMA_CLAVES.PERMANENTE.some(p => p.toLowerCase() === keyLower)) {
        return {
            esValida: true,
            tipo: 'PERMANENTE',
            info: 'Acceso Permanente VIP',
            duracionMs: null,
            key: key
        };
    }

    const tempMatch = SISTEMA_CLAVES.TEMPORALES.find(t => t.clave === key || t.clave.toLowerCase() === keyLower);
    if (tempMatch) {
        return {
            esValida: true,
            tipo: 'TEMPORAL',
            info: tempMatch.mensaje,
            duracionMs: tempMatch.duracionMs,
            key: tempMatch.clave
        };
    }

    return {
        esValida: false,
        tipo: null,
        info: null,
        duracionMs: null,
        key: null
    };
}

function iniciarTemporizadorEnTiempoReal(session) {
    if (passTimerInterval) clearInterval(passTimerInterval);

    const txtElem = document.getElementById('statusWelcomeText');
    const timerElem = document.getElementById('statusTimerBadge');

    function actualizar() {
        if (!session) return;

        if (session.tipo === 'ADMIN') {
            if (txtElem) txtElem.innerHTML = '👑 <span>Bienvenido Administrador</span>';
            if (timerElem) {
                timerElem.textContent = 'ACCESO TOTAL';
                timerElem.style.borderColor = '#00ff66';
                timerElem.style.color = '#00ff66';
            }
            return;
        }

        if (session.tipo === 'PERMANENTE') {
            if (txtElem) txtElem.innerHTML = '⭐ <span>' + (session.info || 'Acceso Permanente') + '</span>';
            if (timerElem) {
                timerElem.textContent = 'ILIMITADO';
                timerElem.style.borderColor = '#00ff66';
                timerElem.style.color = '#00ff66';
            }
            return;
        }

        if (session.tipo === 'TEMPORAL') {
            const ahora = Date.now();
            const expiresAtNum = parseInt(session.expiresAt, 10);

            if (txtElem) txtElem.innerHTML = '⏳ <span>' + (session.info || 'Pase Temporal Activo') + '</span>';

            if (isNaN(expiresAtNum) || expiresAtNum <= ahora) {
                if (timerElem) {
                    timerElem.textContent = 'EXPIRADO';
                    timerElem.style.borderColor = '#ff0033';
                    timerElem.style.color = '#ff0033';
                }
                if (passTimerInterval) {
                    clearInterval(passTimerInterval);
                    passTimerInterval = null;
                }
                // Muestra la pantalla de Acceso Denegado adaptada al generador cuando expira en uso
                mostrarModalContrasenaUsada(session.key || '••••••••', true);
                return;
            }

            const restante = expiresAtNum - ahora;
            const segsTotales = Math.floor(restante / 1000);
            const dias = Math.floor(segsTotales / 86400);
            const horas = Math.floor((segsTotales % 86400) / 3600);
            const mins = Math.floor((segsTotales % 3600) / 60);
            const segs = segsTotales % 60;

            let textoTiempo = '';
            if (dias > 0) textoTiempo += dias + 'd ';
            textoTiempo += String(horas).padStart(2, '0') + 'h ' +
            String(mins).padStart(2, '0') + 'm ' +
            String(segs).padStart(2, '0') + 's';

            if (timerElem) {
                timerElem.textContent = textoTiempo;
                timerElem.style.borderColor = '#00ff66';
                timerElem.style.color = '#00ff66';
            }
        }
    }

    actualizar();
    passTimerInterval = setInterval(actualizar, 1000);
}

/* ==========================================================================
   🔧 CORRECCIÓN DE LOGIN Y GESTIÓN DE TIEMPOS
   ========================================================================== */
function procesarLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    ejecutarVibracion();
    ejecutarSonidoUI('gen');

    if (verificarEstadoBloqueo()) return;

    const keyInput = document.getElementById('loginKey');
    const keyVal = keyInput ? keyInput.value.trim(): '';

    if (!keyVal) return;

    const resultado = validarClaveEntrada(keyVal);

    if (!SERVIDOR_ACTIVO && resultado.tipo !== 'ADMIN') {
        mostrarAlertaLogin('⚠️ EL SERVIDOR SE ENCUENTRA INACTIVO EN ESTE MOMENTO.');
        return;
    }

    if (!resultado.esValida) {
        intentosFallidos++;
        if (intentosFallidos >= MAX_INTENTOS) {
            const bloqueoHasta = Date.now() + (TIEMPO_BLOQUEO_SEG * 1000);
            SafeStorage.setItem('svs_lock_until', bloqueoHasta.toString());
            iniciarCooldownBloqueo(TIEMPO_BLOQUEO_SEG);
        } else {
            const restantes = MAX_INTENTOS - intentosFallidos;
            mostrarAlertaLogin(`⚠️ Clave incorrecta. Intentos restantes: ${restantes}/${MAX_INTENTOS}`);
        }
        return;
    }

    if (resultado.tipo === 'ADMIN' || resultado.tipo === 'PERMANENTE') {
        completarLoginExitoso(resultado, keyVal, null);
        return;
    }

    if (resultado.tipo === 'TEMPORAL') {
        const storageKey = 'svs_pass_exp_' + resultado.key.toLowerCase();
        const storedExp = SafeStorage.getItem(storageKey);
        const ahora = Date.now();

        if (storedExp && !isNaN(parseInt(storedExp, 10))) {
            const expiresAtNum = parseInt(storedExp, 10);
            if (expiresAtNum > ahora) {
                completarLoginExitoso(resultado, keyVal, expiresAtNum);
                return;
            } else {
                mostrarModalContrasenaUsada(keyVal, false);
                return;
            }
        } else {
            const expiresAt = ahora + resultado.duracionMs;
            SafeStorage.setItem(storageKey, expiresAt.toString());
            completarLoginExitoso(resultado, keyVal, expiresAt);
            return;
        }
    }
}

function completarLoginExitoso(resultado, keyVal, expiresAt) {
    intentosFallidos = 0;
    SafeStorage.removeItem('svs_lock_until');
    SafeStorage.setItem('svs_saved_password', keyVal);

    const sessionData = {
        ...resultado,
        expiresAt: expiresAt
    };

    SafeStorage.setItem('svs_active_session', JSON.stringify(sessionData));
    try {
        sessionStorage.setItem('svs_auth_user', JSON.stringify(sessionData));
    } catch(err) {}

    const alertBox = document.getElementById('loginAlertBox');
    if (alertBox) alertBox.style.display = 'none';

    iniciarCarga(() => {
        const loginCard = document.getElementById('loginCard');
        const mainApp = document.getElementById('mainApp');

        if (loginCard) loginCard.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';

        iniciarTemporizadorEnTiempoReal(sessionData);
        aplicarModoUniversal(appConfig.universalSensi);
        aplicarOcultarLegal(appConfig.hideLegal);
        evaluarSugerenciaEnTiempoReal(false);
    });
}

function cerrarSesion() {
    ejecutarVibracion();
    ejecutarSonidoUI('select');

    if (passTimerInterval) {
        clearInterval(passTimerInterval);
        passTimerInterval = null;
    }
    try {
        sessionStorage.removeItem('svs_auth_user');
    } catch(e) {}
    SafeStorage.removeItem('svs_active_session');

    const mainApp = DOM.mainApp || document.getElementById('mainApp');
    const loginCard = document.getElementById('loginCard');

    if (mainApp) mainApp.style.display = 'none';
    if (loginCard) loginCard.style.display = 'flex';

    const alertBox = document.getElementById('loginAlertBox');
    if (alertBox) alertBox.style.display = 'none';

    const savedPass = SafeStorage.getItem('svs_saved_password');
    const keyInput = document.getElementById('loginKey');
    if (keyInput) keyInput.value = savedPass || '';
}

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
            } else if (window.postMessage) {
                window.postMessage(jsonMessage, '*');
            }
        } catch (e) {}
    }
};

window.recibirDeJava = function(jsonString) {
    try {
        const data = typeof jsonString === 'string' ? JSON.parse(jsonString): jsonString;
        if (!data || typeof data !== 'object') return;

        if (data.action === 'generarSensibilidad') ejecutarBotonGenerar();
        else if (data.action === 'cargarConfiguracion') window.configurarDesdeJava(data.config);
        else if (data.action === 'setServerStatus') setEstadoServidor(!!data.active);
    } catch (e) {}
};

window.actualizarDesdeJava = function(datos) {
    if (datos) {
        const sensiElem = DOM.sensiType || document.getElementById('sensiType');
        actualizarUI(datos, sensiElem ? sensiElem.value: 'Media');
    }
};

window.configurarDesdeJava = function(cfg) {
    if (!cfg) return;
    if (cfg.brand && (DOM.phoneBrand || document.getElementById('phoneBrand'))) (DOM.phoneBrand || document.getElementById('phoneBrand')).value = cfg.brand;
    if (cfg.model && (DOM.phoneModel || document.getElementById('phoneModel'))) (DOM.phoneModel || document.getElementById('phoneModel')).value = cfg.model;
    if (cfg.sensiType && (DOM.sensiType || document.getElementById('sensiType'))) (DOM.sensiType || document.getElementById('sensiType')).value = cfg.sensiType;
    if (cfg.gameMode && (DOM.gameMode || document.getElementById('gameMode'))) (DOM.gameMode || document.getElementById('gameMode')).value = cfg.gameMode;
    if (cfg.useDpi && (DOM.useDpi || document.getElementById('useDpi'))) (DOM.useDpi || document.getElementById('useDpi')).value = cfg.useDpi;
    if (cfg.useBtn && (DOM.useBtn || document.getElementById('useBtn'))) (DOM.useBtn || document.getElementById('useBtn')).value = cfg.useBtn;
    if (cfg.universalSensi !== undefined) aplicarModoUniversal(!!cfg.universalSensi);
    if (cfg.hideLegal !== undefined) aplicarOcultarLegal(!!cfg.hideLegal);
    evaluarSugerenciaEnTiempoReal(false);
};

const DOM = {};

function initDOMCache() {
    const ids = [
        'fpsValue',
        'cpuValue',
        'gpuValue',
        'phoneBrand',
        'phoneModel',
        'fieldPhoneBrand',
        'fieldPhoneModel',
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
        'hideLegalToggle',
        'infoUniversalModal',
        'loaderModal',
        'loaderStatusText',
        'loaderPercentText',
        'loaderProgressBarFill',
        'perfMonitorBox',
        'mainApp',
        'legalSection'
    ];
    ids.forEach(id => DOM[id] = document.getElementById(id));
}

const appConfig = {
    batterySaver: false,
    vibration: true,
    sound: true,
    gpuAccel: true,
    universalSensi: false,
    hideLegal: false
};

function aplicarModoUniversal(activo) {
    const uniToggle = DOM.universalSensiToggle || document.getElementById('universalSensiToggle');
    appConfig.universalSensi = activo !== undefined ? !!activo: (uniToggle ? uniToggle.checked: false);

    if (uniToggle) uniToggle.checked = appConfig.universalSensi;

    const fBrand = DOM.fieldPhoneBrand || document.getElementById('fieldPhoneBrand');
    const fModel = DOM.fieldPhoneModel || document.getElementById('fieldPhoneModel');
    const phoneBrand = DOM.phoneBrand || document.getElementById('phoneBrand');
    const phoneModel = DOM.phoneModel || document.getElementById('phoneModel');

    if (appConfig.universalSensi) {
        if (phoneBrand) phoneBrand.selectedIndex = 0;
        if (phoneModel) phoneModel.value = "";
        if (fBrand) fBrand.style.display = 'none';
        if (fModel) fModel.style.display = 'none';
    } else {
        if (fBrand) fBrand.style.display = 'flex';
        if (fModel) fModel.style.display = 'flex';
    }
    evaluarSugerenciaEnTiempoReal(false);
}

function aplicarOcultarLegal(ocultar) {
    const legalToggle = DOM.hideLegalToggle || document.getElementById('hideLegalToggle');
    appConfig.hideLegal = ocultar !== undefined ? !!ocultar: (legalToggle ? legalToggle.checked: false);
    if (legalToggle) legalToggle.checked = appConfig.hideLegal;

    const legalSec = DOM.legalSection || document.getElementById('legalSection');
    if (legalSec) {
        legalSec.style.display = appConfig.hideLegal ? 'none': 'block';
    }
}

function mostrarInfoSensiUniversal(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    ejecutarVibracion();
    ejecutarSonidoUI('select');
    const modal = DOM.infoUniversalModal || document.getElementById('infoUniversalModal');
    if (modal) modal.style.display = 'flex';
}

function cerrarInfoSensiUniversal() {
    ejecutarVibracion();
    ejecutarSonidoUI('select');
    const modal = DOM.infoUniversalModal || document.getElementById('infoUniversalModal');
    if (modal) modal.style.display = 'none';
}

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
    if (appConfig.vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
            navigator.vibrate(8);
        } catch (e) {}
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

        osc.onended = () => {
            try {
                osc.disconnect();
                gain.disconnect();
            } catch (e) {}
        };

        osc.start(now);
        osc.stop(now + 0.03);
    } catch (e) {}
}

function abrirConfiguracion() {
    ejecutarVibracion();
    ejecutarSonidoUI('select');
    toggleModal(true);
    JavaBridge.enviar('modalConfigAbierto', {
        abierto: true
    });
}

function toggleModal(show) {
    const aiModal = DOM.aiModal || document.getElementById('aiModal');
    if (aiModal) aiModal.style.display = show ? 'flex': 'none';
    JavaBridge.enviar('modalConfigEstado', {
        abierto: !!show
    });
}

let frameCount = 0;
let lastSampleTime = performance.now();
let lastFrameTime = performance.now();
let frameDeltas = new Array(20).fill(16.6);
let deltaIndex = 0;
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
        frameDeltas[deltaIndex] = frameDelta;
        deltaIndex = (deltaIndex + 1) % 20;
    }

    frameCount++;
    const elapsed = now - lastSampleTime;

    if (elapsed >= 250) {
        let sum = 0;
        for (let i = 0; i < 20; i++) sum += frameDeltas[i];
        const avgDelta = sum / 20;
        const safeDelta = Math.max(0.001, avgDelta);
        const realFps = Math.min(144, Math.max(1, Math.round(1000 / safeDelta)));
        const computeTimeRatio = safeDelta / 6.94;

        const cpuCalc = Math.min(99, Math.max(2, Math.round(computeTimeRatio * 18 + Math.abs(frameDelta - safeDelta) * 5 + 3)));
        const gpuCalc = Math.min(99, Math.max(2, Math.round((realFps / 144) * 14 + (computeTimeRatio > 1 ? (computeTimeRatio - 1) * 20: 4))));

        const fpsVal = DOM.fpsValue || document.getElementById('fpsValue');
        const cpuVal = DOM.cpuValue || document.getElementById('cpuValue');
        const gpuVal = DOM.gpuValue || document.getElementById('gpuValue');

        if (fpsVal) fpsVal.textContent = realFps;
        if (cpuVal) cpuVal.textContent = cpuCalc + '%';
        if (gpuVal) gpuVal.textContent = gpuCalc + '%';

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
        frameDeltas.fill(16.6);
        deltaIndex = 0;
        monitorFrameId = requestAnimationFrame(monitorPerformanceLoop);
    }
});

function aplicarModoAhorro() {
    const saverToggle = DOM.batterySaverToggle || document.getElementById('batterySaverToggle');
    const perfBox = DOM.perfMonitorBox || document.getElementById('perfMonitorBox');

    if (!saverToggle) return;
    isBatterySaverActive = saverToggle.checked;
    if (isBatterySaverActive) {
        if (perfBox) perfBox.style.display = 'none';
        if (monitorFrameId) {
            cancelAnimationFrame(monitorFrameId);
            monitorFrameId = null;
        }
    } else {
        if (perfBox) perfBox.style.display = 'flex';
        if (!monitorFrameId) {
            lastSampleTime = performance.now();
            lastFrameTime = performance.now();
            frameCount = 0;
            frameDeltas.fill(16.6);
            deltaIndex = 0;
            monitorFrameId = requestAnimationFrame(monitorPerformanceLoop);
        }
    }
}

function evaluarSugerenciaEnTiempoReal(userTriggered = false) {
    if (userTriggered) {
        ejecutarVibracion();
        ejecutarSonidoUI('select');
    }

    const gameMode = DOM.gameMode || document.getElementById('gameMode');
    const phoneBrand = DOM.phoneBrand || document.getElementById('phoneBrand');
    const modeHintBox = DOM.modeHintBox || document.getElementById('modeHintBox');

    if (!gameMode || !phoneBrand || !modeHintBox) return;

    const mode = String(gameMode.value || '');
    let brandText = "Universal / Multi-Dispositivo";

    if (!appConfig.universalSensi) {
        if (phoneBrand.selectedIndex >= 0 && phoneBrand.options[phoneBrand.selectedIndex]) {
            brandText = phoneBrand.options[phoneBrand.selectedIndex].text;
        } else {
            brandText = phoneBrand.value || "Universal";
        }
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

    const titleHeader = appConfig.universalSensi ? "⚡ RECOMENDACIÓN UNIVERSAL": "⚡ RECOMENDACIÓN PRO";

    modeHintBox.innerHTML = `
    <div class="hint-header">${titleHeader} (${sanitizeInput(brandText)})</div>
    <ul class="hint-list">
    <li><strong>Nivel:</strong> <span class="hint-highlight">${nivelRecomendado}</span></li>
    <li><strong>Técnica:</strong> ${alzamientoMira}</li>
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
    if (str === null || str === undefined) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    return String(str).replace(/[&<>"'/`=]/g, m => map[m]).trim();
        }

        window.addEventListener('DOMContentLoaded', () => {
        initDOMCache();

        verificarEstadoBloqueo();
        setEstadoServidor(SERVIDOR_ACTIVO);

        const loginCard = document.getElementById('loginCard');
        const mainApp = document.getElementById('mainApp');

        if (loginCard) loginCard.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';

        const savedPass = SafeStorage.getItem('svs_saved_password');
        const keyInput = document.getElementById('loginKey');
        if (savedPass && keyInput) {
            keyInput.value = savedPass;
        }

        const saved = SafeStorage.getItem('ff_sys_cfg_v12');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                appConfig.batterySaver = !!parsed.batterySaver;
                appConfig.vibration = parsed.vibration !== undefined ? !!parsed.vibration: true;
                appConfig.sound = parsed.sound !== undefined ? !!parsed.sound: true;
                appConfig.gpuAccel = parsed.gpuAccel !== undefined ? !!parsed.gpuAccel: true;
                appConfig.universalSensi = !!parsed.universalSensi;
                appConfig.hideLegal = !!parsed.hideLegal;

                if (DOM.batterySaverToggle) DOM.batterySaverToggle.checked = appConfig.batterySaver;
                if (DOM.vibrationToggle) DOM.vibrationToggle.checked = appConfig.vibration;
                if (DOM.soundToggle) DOM.soundToggle.checked = appConfig.sound;
                if (DOM.gpuAccelToggle) DOM.gpuAccelToggle.checked = appConfig.gpuAccel;
                if (DOM.universalSensiToggle) DOM.universalSensiToggle.checked = appConfig.universalSensi;
                if (DOM.hideLegalToggle) DOM.hideLegalToggle.checked = appConfig.hideLegal;

                aplicarModoAhorro();
                aplicarModoUniversal(appConfig.universalSensi);
                aplicarOcultarLegal(appConfig.hideLegal);
            } catch (e) {}
        }

        evaluarSugerenciaEnTiempoReal(false);
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
        if (DOM.hideLegalToggle) appConfig.hideLegal = DOM.hideLegalToggle.checked;

        aplicarModoUniversal(appConfig.universalSensi);
        aplicarOcultarLegal(appConfig.hideLegal);

        const mainApp = DOM.mainApp || document.getElementById('mainApp');
        if (mainApp) mainApp.style.transform = appConfig.gpuAccel ? 'translateZ(0)': 'none';

        const payloadData = {
            batterySaver: appConfig.batterySaver,
            vibration: appConfig.vibration,
            sound: appConfig.sound,
            gpuAccel: appConfig.gpuAccel,
            universalSensi: appConfig.universalSensi,
            hideLegal: appConfig.hideLegal
        };

        SafeStorage.setItem('ff_sys_cfg_v12', JSON.stringify(payloadData));
        toggleModal(false);

        JavaBridge.enviar('configuracionGuardada', payloadData);
        }

        let loaderInterval = null;

        function iniciarCarga(alFinalizar) {
        if (loaderInterval) clearInterval(loaderInterval);
        let progreso = 0;

        const loaderModal = DOM.loaderModal || document.getElementById('loaderModal');
        const loaderStatusText = DOM.loaderStatusText || document.getElementById('loaderStatusText');
        const loaderPercentText = DOM.loaderPercentText || document.getElementById('loaderPercentText');
        const loaderProgressBarFill = DOM.loaderProgressBarFill || document.getElementById('loaderProgressBarFill');

        if (loaderModal) loaderModal.style.display = 'flex';
        if (loaderStatusText) loaderStatusText.textContent = '⚡ PROCESANDO...';

        loaderInterval = setInterval(() => {
            progreso += 10;
            const pVal = Math.min(100, progreso);
            if (loaderPercentText) loaderPercentText.textContent = pVal + '%';
            if (loaderProgressBarFill) loaderProgressBarFill.style.width = pVal + '%';
            if (progreso >= 100) {
                clearInterval(loaderInterval);
                loaderInterval = null;
                setTimeout(() => {
                    if (loaderModal) loaderModal.style.display = 'none';
                    if (typeof alFinalizar === 'function') alFinalizar();
                },
                    50);
            }
        }, 30);
        }

        function ejecutarBotonGenerar() {
        ejecutarVibracion();
        ejecutarSonidoUI('gen');
        generar();
        }

        async function generar() {
        const errorBox = DOM.errorBox || document.getElementById('errorBox');
        if (errorBox) errorBox.style.display = 'none';

        const phoneBrand = DOM.phoneBrand || document.getElementById('phoneBrand');
        const phoneModel = DOM.phoneModel || document.getElementById('phoneModel');
        const sensiType = DOM.sensiType || document.getElementById('sensiType');
        const gameMode = DOM.gameMode || document.getElementById('gameMode');
        const useDpi = DOM.useDpi || document.getElementById('useDpi');
        const useBtn = DOM.useBtn || document.getElementById('useBtn');

        const brand = appConfig.universalSensi ? "Universal": sanitizeInput(phoneBrand ? phoneBrand.value: '');
        const model = appConfig.universalSensi ? "Universal": sanitizeInput(phoneModel ? phoneModel.value: '');
        const type = sanitizeInput(sensiType ? sensiType.value: '');
        const mode = sanitizeInput(gameMode ? gameMode.value: '');
        const dpi = sanitizeInput(useDpi ? useDpi.value: '');
        const btn = sanitizeInput(useBtn ? useBtn.value: '');

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
        const strBrand = String(brand || '');
        const strType = String(type || '');
        const strDpi = String(useDpi || '');
        const strBtn = String(useBtn || '');

        let baseMin = SENSI_VALORES.MEDIA.baseMin,
        baseMax = SENSI_VALORES.MEDIA.baseMax,
        awmMin = SENSI_VALORES.MEDIA.awmMin,
        awmMax = SENSI_VALORES.MEDIA.awmMax;

        if (strType.includes('Baja')) {
            baseMin = SENSI_VALORES.BAJA.baseMin;
            baseMax = SENSI_VALORES.BAJA.baseMax;
            awmMin = SENSI_VALORES.BAJA.awmMin;
            awmMax = SENSI_VALORES.BAJA.awmMax;
        } else if (strType.includes('Alta')) {
            baseMin = SENSI_VALORES.ALTA.baseMin;
            baseMax = SENSI_VALORES.ALTA.baseMax;
            awmMin = SENSI_VALORES.ALTA.awmMin;
            awmMax = SENSI_VALORES.ALTA.awmMax;
        }

        let brandOffset = 0;
        if (!appConfig.universalSensi) {
            if (strBrand.includes('Xiaomi') || strBrand.includes('ZTE') || strBrand.includes('ASUS')) brandOffset = 2;
            if (strBrand.includes('Apple')) brandOffset = -3;
            if (strBrand.includes('Samsung')) brandOffset = 1;
        }

        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        const genVal = clamp(rand(baseMin, baseMax) + brandOffset, baseMin, baseMax);
        const redVal = clamp(genVal - rand(1, 3), baseMin, baseMax);
        const m2xVal = clamp(genVal + rand(0, 2), baseMin, baseMax);
        const m4xVal = clamp(genVal - rand(2, 5), baseMin, baseMax);
        const awmVal = rand(awmMin, awmMax);
        const camVal = rand(130, 185);

        let dpiCalculado = "Stock";
        if (strDpi.includes('Con DPI')) {
            const dpiBase = (baseMin >= SENSI_VALORES.ALTA.baseMin) ? rand(520, 580): ((baseMin >= SENSI_VALORES.MEDIA.baseMin) ? rand(460, 520): rand(410, 460));
            dpiCalculado = Math.min(593, dpiBase);
        }

        let btnCalculado = "Omitido";
        if (strBtn.includes('Pequeño')) {
            btnCalculado = rand(SENSI_VALORES.BOTON.PEQUENO.min, SENSI_VALORES.BOTON.PEQUENO.max) + "%";
        } else if (strBtn.includes('Medio')) {
            btnCalculado = rand(SENSI_VALORES.BOTON.MEDIO.min, SENSI_VALORES.BOTON.MEDIO.max) + "%";
        } else if (strBtn.includes('Grande')) {
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
        if (!data || typeof data !== 'object') return;
        const strType = String(sensiType || '');

        let minS = SENSI_VALORES.MEDIA.baseMin,
        maxS = SENSI_VALORES.MEDIA.baseMax,
        awmMin = SENSI_VALORES.MEDIA.awmMin,
        awmMax = SENSI_VALORES.MEDIA.awmMax;

        if (strType.includes('Baja')) {
            minS = SENSI_VALORES.BAJA.baseMin;
            maxS = SENSI_VALORES.BAJA.baseMax;
            awmMin = SENSI_VALORES.BAJA.awmMin;
            awmMax = SENSI_VALORES.BAJA.awmMax;
        } else if (strType.includes('Alta')) {
            minS = SENSI_VALORES.ALTA.baseMin;
            maxS = SENSI_VALORES.ALTA.baseMax;
            awmMin = SENSI_VALORES.ALTA.awmMin;
            awmMax = SENSI_VALORES.ALTA.awmMax;
        }

        const genVal = !isNaN(parseInt(data.gen, 10)) ? clamp(data.gen, minS, maxS): (data.gen || '--');
        const redVal = !isNaN(parseInt(data.red, 10)) ? clamp(data.red, minS, maxS): (data.red || '--');
        const m2xVal = !isNaN(parseInt(data.m2x, 10)) ? clamp(data.m2x, minS, maxS): (data.m2x || '--');
        const m4xVal = !isNaN(parseInt(data.m4x, 10)) ? clamp(data.m4x, minS, maxS): (data.m4x || '--');
        const awmVal = !isNaN(parseInt(data.awm, 10)) ? clamp(data.awm, awmMin, awmMax): (data.awm || '--');
        const camVal = data.cam !== undefined ? data.cam: '--';

        let dpiVal = data.dpi !== undefined ? data.dpi: '--';
        if (!isNaN(parseInt(dpiVal, 10)) && parseInt(dpiVal, 10) > 593) dpiVal = 593;

        const btnVal = data.btn !== undefined ? data.btn: '--';

        const elemGen = DOM.r_gen || document.getElementById('r_gen');
        const elemRed = DOM.r_red || document.getElementById('r_red');
        const elem2x = DOM.r_2x || document.getElementById('r_2x');
        const elem4x = DOM.r_4x || document.getElementById('r_4x');
        const elemAwm = DOM.r_awm || document.getElementById('r_awm');
        const elemCam = DOM.r_cam || document.getElementById('r_cam');
        const elemDpi = DOM.r_dpi || document.getElementById('r_dpi');
        const elemBtn = DOM.r_btn || document.getElementById('r_btn');
        const customNoteBox = DOM.customNoteBox || document.getElementById('customNoteBox');

        if (elemGen) elemGen.textContent = genVal;
        if (elemRed) elemRed.textContent = redVal;
        if (elem2x) elem2x.textContent = m2xVal;
        if (elem4x) elem4x.textContent = m4xVal;
        if (elemAwm) elemAwm.textContent = awmVal;
        if (elemCam) elemCam.textContent = camVal;
        if (elemDpi) elemDpi.textContent = dpiVal;
        if (elemBtn) elemBtn.textContent = btnVal;

        if (customNoteBox) customNoteBox.style.display = 'block';

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