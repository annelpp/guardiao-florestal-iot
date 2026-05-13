/* =========================================
   GUARDIÃO FLORESTAL - APP.JS
   ========================================= */

const SIZE = 8;
let nodes = [];
let fireCount = 0;
let alertCount = 0;

// ---- ELEMENTOS DO DOM ----
const gridEl       = document.getElementById('forest-grid');
const logBox       = document.getElementById('log-box');
const blockChainEl = document.getElementById('blockchain-box');
const statNodes    = document.getElementById('stat-nodes');
const statFire     = document.getElementById('stat-fire');
const statAlert    = document.getElementById('stat-alert');
const gridCoords   = document.getElementById('grid-coords');
const gridStatus   = document.getElementById('grid-status');
const alertBanner  = document.getElementById('alert-banner');
const alertBannerMsg = document.getElementById('alert-banner-msg');
const nodeModal    = document.getElementById('node-modal');

// ---- SVG DE ÁRVORE REALISTA ----
function treeSVG(variant) {
    // 3 variantes de copa para variar o visual
    const canopyColors = [
        { top: '#2d6a4f', mid: '#1b4332', bot: '#081c15' },
        { top: '#40916c', mid: '#2d6a4f', bot: '#1b4332' },
        { top: '#52b788', mid: '#40916c', bot: '#2d6a4f' },
    ];
    const c = canopyColors[variant % 3];
    const trunkH = 10 + (variant % 3) * 2;

    return `
    <svg class="tree-svg" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
      <!-- Sombra no chão -->
      <ellipse cx="28" cy="54" rx="10" ry="2.5" fill="rgba(0,0,0,0.35)"/>
      <!-- Tronco -->
      <rect class="trunk" x="23" y="${56 - trunkH}" width="10" height="${trunkH}"
            rx="3" fill="#5c3d1e"/>
      <!-- Raízes -->
      <path class="trunk" d="M23 ${56 - trunkH + 6} Q18 ${56 - trunkH + 12} 14 ${56 - trunkH + 10}"
            stroke="#5c3d1e" stroke-width="2" fill="none"/>
      <path class="trunk" d="M33 ${56 - trunkH + 6} Q38 ${56 - trunkH + 12} 42 ${56 - trunkH + 10}"
            stroke="#5c3d1e" stroke-width="2" fill="none"/>
      <!-- Camada base (mais larga) -->
      <polygon class="canopy" points="28,${56 - trunkH - 10} 10,${56 - trunkH + 2} 46,${56 - trunkH + 2}"
               fill="${c.bot}"/>
      <!-- Camada meio -->
      <polygon class="canopy" points="28,${56 - trunkH - 22} 12,${56 - trunkH - 6} 44,${56 - trunkH - 6}"
               fill="${c.mid}"/>
      <!-- Ponta (topo) -->
      <polygon class="canopy-top" points="28,4 15,${56 - trunkH - 18} 41,${56 - trunkH - 18}"
               fill="${c.top}"/>
      <!-- Brilho lateral -->
      <line x1="24" y1="8" x2="19" y2="${56 - trunkH - 14}"
            stroke="rgba(255,255,255,0.07)" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
}

// ---- ÁRVORE EM CHAMAS (SVG com fogo) ----
function fireSVG() {
    return `
    <svg class="tree-svg" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="54" rx="10" ry="2.5" fill="rgba(0,0,0,0.4)"/>
      <rect class="trunk" x="23" y="38" width="10" height="16" rx="3" fill="#7a2e00"/>
      <!-- Copa queimada -->
      <polygon class="canopy" points="28,28 10,42 46,42" fill="#c1440e"/>
      <polygon class="canopy" points="28,16 12,32 44,32" fill="#e05a2b"/>
      <polygon class="canopy-top" points="28,4 15,20 41,20" fill="#e63946"/>
      <!-- Chamas animadas -->
      <g class="flames">
        <ellipse cx="20" cy="10" rx="4" ry="7" fill="#f4a261" opacity="0.85">
          <animate attributeName="ry" values="7;5;8;6;7" dur="0.6s" repeatCount="indefinite"/>
          <animate attributeName="cy" values="10;8;11;9;10" dur="0.6s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="28" cy="3" rx="4" ry="8" fill="#ffd166" opacity="0.9">
          <animate attributeName="ry" values="8;6;9;7;8" dur="0.5s" repeatCount="indefinite"/>
          <animate attributeName="cy" values="3;1;4;2;3" dur="0.5s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="36" cy="11" rx="3" ry="6" fill="#f4a261" opacity="0.8">
          <animate attributeName="ry" values="6;4;7;5;6" dur="0.7s" repeatCount="indefinite"/>
          <animate attributeName="cy" values="11;9;12;10;11" dur="0.7s" repeatCount="indefinite"/>
        </ellipse>
      </g>
    </svg>`;
}

// ---- ÁRVORE EM ALERTA (SVG com sensor) ----
function alertSVG(variant) {
    return `
    <svg class="tree-svg" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="54" rx="10" ry="2.5" fill="rgba(0,0,0,0.35)"/>
      <rect class="trunk" x="23" y="38" width="10" height="16" rx="3" fill="#4a4a5e"/>
      <polygon class="canopy" points="28,28 10,42 46,42" fill="#1a2e4a"/>
      <polygon class="canopy" points="28,16 12,32 44,32" fill="#1f3a5c"/>
      <polygon class="canopy-top" points="28,4 15,20 41,20" fill="#4cc9f0" opacity="0.85"/>
      <!-- Antena -->
      <line x1="28" y1="4" x2="28" y2="-2" stroke="#4cc9f0" stroke-width="2" stroke-linecap="round"/>
      <circle cx="28" cy="-3" r="2" fill="#4cc9f0">
        <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/>
      </circle>
      <!-- Ondas de sinal -->
      <circle cx="28" cy="-3" r="5" fill="none" stroke="#4cc9f0" stroke-width="1" opacity="0.5">
        <animate attributeName="r" values="5;12;5" dur="1.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0;0.5" dur="1.2s" repeatCount="indefinite"/>
      </circle>
    </svg>`;
}

// ---- ÁRVORE CONTIDA ----
function containedSVG(variant) {
    const canopyColors = [
        { top: '#2d6a4f', mid: '#1b4332', bot: '#081c15' },
        { top: '#40916c', mid: '#2d6a4f', bot: '#1b4332' },
        { top: '#52b788', mid: '#40916c', bot: '#2d6a4f' },
    ];
    const c = canopyColors[variant % 3];
    const trunkH = 10 + (variant % 3) * 2;
    return `
    <svg class="tree-svg" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="54" rx="10" ry="2.5" fill="rgba(0,0,0,0.35)"/>
      <rect class="trunk" x="23" y="${56-trunkH}" width="10" height="${trunkH}" rx="3" fill="#5c3d1e"/>
      <polygon class="canopy" points="28,${56-trunkH-10} 10,${56-trunkH+2} 46,${56-trunkH+2}" fill="${c.bot}"/>
      <polygon class="canopy" points="28,${56-trunkH-22} 12,${56-trunkH-6} 44,${56-trunkH-6}" fill="${c.mid}"/>
      <polygon class="canopy-top" points="28,4 15,${56-trunkH-18} 41,${56-trunkH-18}" fill="${c.top}"/>
      <!-- Ícone de verificado -->
      <circle cx="42" cy="12" r="7" fill="#8338ec" opacity="0.9"/>
      <text x="42" y="16" text-anchor="middle" font-size="8" fill="white">✓</text>
    </svg>`;
}

// ---- CRIA A FLORESTA ----
function createForest() {
    gridEl.innerHTML = '';
    nodes = [];
    fireCount = 0;
    alertCount = 0;
    updateStats();

    for (let i = 0; i < SIZE * SIZE; i++) {
        const row = Math.floor(i / SIZE);
        const col = i % SIZE;
        const variant = (row * 3 + col * 7 + i) % 3;

        const nodeEl = document.createElement('div');
        nodeEl.classList.add('tree-node');
        nodeEl.innerHTML = treeSVG(variant);
        nodeEl.dataset.index = i;
        nodeEl.title = `Nó [${row},${col}]`;

        nodeEl.addEventListener('click', () => startIncident(i));
        nodeEl.addEventListener('mouseenter', () => {
            gridCoords.textContent = `Nó [${row},${col}]  •  ID: ${i}`;
        });
        nodeEl.addEventListener('mouseleave', () => {
            gridCoords.textContent = '—';
        });

        gridEl.appendChild(nodeEl);

        nodes.push({
            element: nodeEl,
            status: 'healthy',
            row,
            col,
            variant,
        });
    }
}

// ---- INICIAR INCIDENTE ----
function startIncident(index) {
    const node = nodes[index];
    if (node.status !== 'healthy') {
        openModal(index);
        return;
    }

    addLog(`⚠️ Anomalia detectada no Módulo [${node.row},${node.col}]`, 'fire-log');
    showAlertBanner(`Foco detectado no Nó [${node.row},${node.col}]`);

    gridStatus.textContent = '🔴 ALERTA: INCÊNDIO DETECTADO';
    gridStatus.classList.add('danger');

    setNodeStatus(index, 'fire');
    spawnFireParticles(node.element);
    propagate(index);
}

// ---- DEFINIR STATUS DO NÓ ----
function setNodeStatus(index, status) {
    const node = nodes[index];
    const prev = node.status;

    // Ajusta contadores
    if (prev === 'fire')  fireCount  = Math.max(0, fireCount  - 1);
    if (prev === 'alert') alertCount = Math.max(0, alertCount - 1);
    if (status === 'fire')  fireCount++;
    if (status === 'alert') alertCount++;

    node.status = status;
    node.element.classList.remove('healthy', 'fire', 'alert', 'contained', 'transmitting');
    node.element.classList.add(status);

    // Atualiza SVG
    if (status === 'fire')      node.element.innerHTML = fireSVG();
    else if (status === 'alert') node.element.innerHTML = alertSVG(node.variant);
    else if (status === 'contained') node.element.innerHTML = containedSVG(node.variant);
    else node.element.innerHTML = treeSVG(node.variant);

    // Reanexa eventos
    node.element.addEventListener('click', () => startIncident(index));
    node.element.addEventListener('mouseenter', () => {
        gridCoords.textContent = `Nó [${node.row},${node.col}]  •  ID: ${index}`;
    });
    node.element.addEventListener('mouseleave', () => {
        gridCoords.textContent = '—';
    });

    // Onda de transmissão
    node.element.classList.add('transmitting');
    setTimeout(() => node.element.classList.remove('transmitting'), 1000);

    updateStats();
}

// ---- PROPAGAÇÃO MESH ----
function propagate(index) {
    const origin = nodes[index];

    const neighbors = nodes.filter(n => {
        if (n.status !== 'healthy') return false;
        const dist = Math.sqrt(Math.pow(n.row - origin.row, 2) + Math.pow(n.col - origin.col, 2));
        return dist > 0 && dist < 1.5;
    });

    neighbors.forEach((neighbor, i) => {
        const ni = nodes.indexOf(neighbor);
        setTimeout(() => {
            if (nodes[ni].status !== 'healthy') return;
            setNodeStatus(ni, 'alert');
            addLog(`📡 Sinal propagado para [${neighbor.row},${neighbor.col}]`, 'alert-log');

            // Blockchain a cada 2 alertas
            if (i % 2 === 0) {
                addBlockchainEntry(index, ni);
            }
        }, 350 * (i + 1));
    });
}

// ---- BLOCKCHAIN ----
function addBlockchainEntry(fromIndex, toIndex) {
    const from = nodes[fromIndex];
    const to   = nodes[toIndex];
    const hash = '0x' + [...Array(16)].map(() => Math.floor(Math.random()*16).toString(16)).join('');
    const ts   = Date.now();

    addLog(`🔗 Hash registrado: ${hash.substring(0, 12)}…`, 'chain-log');

    const entry = document.createElement('div');
    entry.className = 'chain-entry';
    entry.innerHTML = `
        <div class="chain-dot"></div>
        <div>
            <span style="color:#ce93d8">${hash}</span><br>
            <span style="color:#888">From [${from.row},${from.col}] → [${to.row},${to.col}]</span><br>
            <span style="color:#555">ts: ${ts}</span>
        </div>`;
    blockChainEl.prepend(entry);
}

// ---- LOG ----
function addLog(msg, type = '') {
    const time = new Date().toLocaleTimeString('pt-BR');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<span class="log-time">${time}</span><span>${msg}</span>`;
    logBox.prepend(entry);

    // Mantém máximo de 40 entradas
    while (logBox.children.length > 40) logBox.lastChild.remove();
}

// ---- BANNER DE ALERTA ----
function showAlertBanner(msg) {
    alertBannerMsg.textContent = msg;
    alertBanner.classList.remove('hidden');
    clearTimeout(showAlertBanner._timer);
    showAlertBanner._timer = setTimeout(() => {
        alertBanner.classList.add('hidden');
    }, 6000);
}

// ---- PARTÍCULAS DE FOGO ----
function spawnFireParticles(el) {
    const emojis = ['🔥','💨','🌋','✨'];
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'fire-particles';
            p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            p.style.left = (Math.random() * 30 - 10) + 'px';
            el.appendChild(p);
            setTimeout(() => p.remove(), 1300);
        }, i * 200);
    }
}

// ---- ESTATÍSTICAS ----
function updateStats() {
    statNodes.textContent = nodes.filter(n => n.status === 'healthy').length;
    statFire.textContent  = fireCount;
    statAlert.textContent = alertCount;
}

// ---- RESETAR ----
function resetForest() {
    alertBanner.classList.add('hidden');
    gridStatus.textContent = 'Sistema Ativo';
    gridStatus.classList.remove('danger');
    logBox.innerHTML = '';
    blockChainEl.innerHTML = '';
    createForest();
    addLog('🌲 Floresta reiniciada. Monitoramento ativo.');
}

// ---- CONTER INCÊNDIOS ----
function containAllFires() {
    let contained = 0;
    nodes.forEach((n, i) => {
        if (n.status === 'fire' || n.status === 'alert') {
            setTimeout(() => {
                setNodeStatus(i, 'contained');
                addLog(`🧯 Nó [${n.row},${n.col}] contido.`, 'alert-log');
            }, contained * 120);
            contained++;
        }
    });

    if (contained === 0) {
        addLog('ℹ️ Nenhum foco ativo para conter.');
        return;
    }

    setTimeout(() => {
        gridStatus.textContent = 'Incêndio Contido';
        gridStatus.classList.remove('danger');
        alertBanner.classList.add('hidden');
    }, contained * 120 + 300);
}

// ---- SIMULAR ALEATÓRIO ----
function simulateRandom() {
    const healthy = nodes.filter(n => n.status === 'healthy');
    if (healthy.length === 0) {
        addLog('⚠️ Sem nós saudáveis disponíveis.');
        return;
    }
    const pick = healthy[Math.floor(Math.random() * healthy.length)];
    startIncident(nodes.indexOf(pick));
}

// ---- MODAL DE DETALHE ----
function openModal(index) {
    const n = nodes[index];
    const statusLabels = {
        healthy:   '✅ Saudável',
        fire:      '🔥 Foco de Incêndio',
        alert:     '📡 Em Alerta (IoT)',
        contained: '🧯 Contido',
    };
    document.getElementById('modal-title').textContent = `Nó [${n.row},${n.col}]`;
    document.getElementById('modal-body').innerHTML = `
        Status:  ${statusLabels[n.status]}<br>
        Linha:   ${n.row} / Coluna: ${n.col}<br>
        ID:      ${index}<br>
        Variante: ${n.variant}<br>
        Temp. simulada: ${(28 + Math.random() * 40).toFixed(1)} °C<br>
        Umidade: ${(20 + Math.random() * 60).toFixed(0)} %<br>
        Bateria: ${(50 + Math.random() * 50).toFixed(0)} %
    `;
    nodeModal.classList.remove('hidden');
}

function closeModal() {
    nodeModal.classList.add('hidden');
}

nodeModal.addEventListener('click', (e) => {
    if (e.target === nodeModal) closeModal();
});

// ---- BACKGROUND CANVAS (partículas) ----
function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 1.5 + 0.3,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.6 + 0.2,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(46,204,113,${p.alpha})`;
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = W;
            if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H;
            if (p.y > H) p.y = 0;
        });
        requestAnimationFrame(draw);
    }

    draw();
}

// ---- INICIALIZAÇÃO ----
createForest();
initBackground();
addLog('🛰️ Sistema Guardião Florestal inicializado.');
addLog('🌲 64 nódulos IoT conectados à rede Mesh.');