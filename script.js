/* ==========================================================================
   LÓGICA E INTERACTIVIDAD UNIFICADA + CAMBIO DE TEMA — EcoPickLed
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 0. CAMBIO DE TEMA (CLARO / OSCURO)
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeToggleBtnMobile = document.getElementById('theme-toggle-btn-mobile');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    function toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        
        if (isDark) {
            if (themeIcon) themeIcon.className = "fa-solid fa-sun text-yellow-400";
            if (themeText) themeText.innerText = "Modo Claro";
            localStorage.setItem('theme', 'dark');
        } else {
            if (themeIcon) themeIcon.className = "fa-solid fa-moon text-amber-500";
            if (themeText) themeText.innerText = "Modo Oscuro";
            localStorage.setItem('theme', 'light');
        }
    }

    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (themeToggleBtnMobile) themeToggleBtnMobile.addEventListener('click', toggleTheme);

    // Cargar preferencia guardada o valor por defecto
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        if (themeIcon) themeIcon.className = "fa-solid fa-sun text-yellow-400";
        if (themeText) themeText.innerText = "Modo Claro";
    }

    // 1. CONTROL MENÚ MÓVIL
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 2. SIMULADOR EN TIEMPO REAL PICK-TO-LIGHT
    const pickingSequence = [
        { shelfId: 1, qty: 3, name: 'Tornillos M6 Inox' },
        { shelfId: 3, qty: 1, name: 'Fuente 24V DinRail' },
        { shelfId: 5, qty: 2, name: 'Tiras LED RGB 12V' }
    ];

    let currentStep = -1;
    let isSimulationRunning = false;

    const btnStartPick = document.getElementById('btn-start-pick');
    const btnResetPick = document.getElementById('btn-reset-pick');
    const orderStatusText = document.getElementById('order-status-text');

    function logConsole(message, type = 'info') {
        const consoleDiv = document.getElementById('console-logs');
        if (!consoleDiv) return;

        const p = document.createElement('p');
        const time = new Date().toLocaleTimeString();
        let colorClass = 'text-slate-400';
        
        if (type === 'active') colorClass = 'text-emerald-400 font-bold';
        if (type === 'done') colorClass = 'text-sky-400 font-bold';
        if (type === 'warn') colorClass = 'text-amber-400';

        p.className = colorClass;
        p.innerHTML = `<span class="text-slate-600">[${time}]</span> ${message}`;
        consoleDiv.appendChild(p);
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }

    function startPickingSimulation() {
        resetPickingSimulation();
        isSimulationRunning = true;
        if (orderStatusText) orderStatusText.innerText = "Estado: Orden en proceso...";
        
        if (btnStartPick) {
            btnStartPick.disabled = true;
            btnStartPick.classList.add('opacity-50');
        }
        
        logConsole("Iniciando Orden #8942 en SGA...", "warn");
        nextPickingStep();
    }

    function nextPickingStep() {
        currentStep++;
        if (currentStep < pickingSequence.length) {
            const step = pickingSequence[currentStep];
            activateShelf(step.shelfId, step.qty, step.name);
        } else {
            if (orderStatusText) orderStatusText.innerText = "Estado: Orden Finalizada con Éxito";
            logConsole("✔ ORDEN FINALIZADA. Todos los elementos recogidos y registrados.", "done");
            
            if (btnStartPick) {
                btnStartPick.disabled = false;
                btnStartPick.classList.remove('opacity-50');
            }
            isSimulationRunning = false;
        }
    }

    function activateShelf(id, qty, name) {
        const shelf = document.getElementById(`shelf-${id}`);
        const ledBar = document.getElementById(`led-bar-${id}`);
        const display = document.getElementById(`display-num-${id}`);
        const btn = document.getElementById(`btn-confirm-${id}`);
        const dot = document.getElementById(`indicator-dot-${id}`);

        if (shelf) shelf.classList.add('border-logoEco', 'bg-emerald-50/30');
        if (ledBar) ledBar.className = "led-bar-active";
        if (display) {
            display.innerText = qty < 10 ? `0${qty}` : qty;
            display.className = "font-mono text-2xl font-extrabold text-logoEco dark:text-emerald-400 animate-pulse";
        }
        if (dot) dot.className = "w-3 h-3 rounded-full bg-logoEco dark:bg-emerald-400 shadow-md shadow-logoEco";

        if (btn) {
            btn.disabled = false;
            btn.className = "shelf-btn-active";
        }

        logConsole(`LED encendido en Balda A-${id} (${name}). Recoger ${qty} Ud(s).`, "active");
    }

    function confirmPick(id) {
        if (!isSimulationRunning) return;

        const shelf = document.getElementById(`shelf-${id}`);
        const ledBar = document.getElementById(`led-bar-${id}`);
        const display = document.getElementById(`display-num-${id}`);
        const btn = document.getElementById(`btn-confirm-${id}`);
        const dot = document.getElementById(`indicator-dot-${id}`);

        if (shelf) shelf.classList.remove('border-logoEco', 'bg-emerald-50/30');
        if (ledBar) ledBar.className = "led-bar-off";
        if (display) {
            display.innerText = "00";
            display.className = "font-mono text-2xl font-extrabold text-slate-400 dark:text-slate-600";
        }
        if (dot) dot.className = "w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700";

        if (btn) {
            btn.disabled = true;
            btn.className = "shelf-btn-disabled";
        }

        logConsole(`Confirmación recibida en Balda A-${id}. Actualizando stock...`, "info");

        setTimeout(() => {
            nextPickingStep();
        }, 400);
    }

    function resetPickingSimulation() {
        currentStep = -1;
        isSimulationRunning = false;
        if (orderStatusText) orderStatusText.innerText = "Estado: Esperando inicio de pedido";
        
        if (btnStartPick) {
            btnStartPick.disabled = false;
            btnStartPick.classList.remove('opacity-50');
        }

        for (let i = 1; i <= 6; i++) {
            const shelf = document.getElementById(`shelf-${i}`);
            const ledBar = document.getElementById(`led-bar-${i}`);
            const display = document.getElementById(`display-num-${i}`);
            const btn = document.getElementById(`btn-confirm-${i}`);
            const dot = document.getElementById(`indicator-dot-${i}`);

            if (shelf) shelf.classList.remove('border-logoEco', 'bg-emerald-50/30');
            if (ledBar) ledBar.className = "led-bar-off";
            if (display) {
                display.innerText = "00";
                display.className = "font-mono text-2xl font-extrabold text-slate-400 dark:text-slate-600";
            }
            if (dot) dot.className = "w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700";

            if (btn) {
                btn.disabled = true;
                btn.className = "shelf-btn-disabled";
            }
        }
    }

    if (btnStartPick) btnStartPick.addEventListener('click', startPickingSimulation);
    if (btnResetPick) btnResetPick.addEventListener('click', resetPickingSimulation);

    for (let i = 1; i <= 6; i++) {
        const btn = document.getElementById(`btn-confirm-${i}`);
        if (btn) {
            btn.addEventListener('click', () => confirmPick(i));
        }
    }

    // 3. CALCULADORA DE RETORNO DE INVERSIÓN (ROI)
    const inputOperators = document.getElementById('input-operators');
    const inputHours = document.getElementById('input-hours');
    const inputCost = document.getElementById('input-cost');

    function calculateROI() {
        if (!inputOperators || !inputHours || !inputCost) return;

        const operators = parseInt(inputOperators.value);
        const hours = parseFloat(inputHours.value);
        const cost = parseInt(inputCost.value);

        const valOp = document.getElementById('val-operators');
        const valHs = document.getElementById('val-hours');
        const valCs = document.getElementById('val-cost');

        if (valOp) valOp.innerText = `${operators} operario${operators > 1 ? 's' : ''}`;
        if (valHs) valHs.innerText = `${hours.toFixed(1)} hrs/día`;
        if (valCs) valCs.innerText = `${cost} €/h`;

        // Algoritmo de cálculo
        const horasAhorradasDia = hours * 0.35;
        const horasAhorradasMes = operators * horasAhorradasDia * 22;
        const ahorroTiempoMes = horasAhorradasMes * cost;

        const erroresEvitadosMes = operators * (8 * 0.90);
        const ahorroErroresMes = erroresEvitadosMes * 25;

        const totalMensual = ahorroTiempoMes + ahorroErroresMes;
        const totalAnual = totalMensual * 12;

        const resMensual = document.getElementById('ahorroMensual');
        const resAnual = document.getElementById('ahorroAnual');

        if (resMensual) resMensual.innerText = `${Math.round(totalMensual).toLocaleString('es-ES')} €`;
        if (resAnual) resAnual.innerText = `${Math.round(totalAnual).toLocaleString('es-ES')} €`;
    }

    if (inputOperators && inputHours && inputCost) {
        inputOperators.addEventListener('input', calculateROI);
        inputHours.addEventListener('input', calculateROI);
        inputCost.addEventListener('input', calculateROI);
        calculateROI();
    }

    // 4. FORMULARIO DE CONTACTO
    const contactForm = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success-msg');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (successMsg) successMsg.classList.remove('hidden');
            contactForm.reset();
            setTimeout(() => {
                if (successMsg) successMsg.classList.add('hidden');
            }, 5000);
        });
    }
});