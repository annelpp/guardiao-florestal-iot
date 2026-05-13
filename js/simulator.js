/**
 * Lógica de Simulação da Rede Mesh - Guardião Florestal
 * Este script gerencia a propagação de sinais entre os sensores.
 */

const GRID_SIZE = 8;
const REACH_DISTANCE = 1.5; // Alcance do sinal IoT
let sensors = [];

const initNetwork = () => {
    const canvas = document.getElementById('grid-canvas');
    canvas.innerHTML = '';
    sensors = [];

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const div = document.createElement('div');
        div.className = 'sensor';
        div.innerHTML = '🌳';
        div.onclick = () => triggerAnomaly(i);

        canvas.appendChild(div);
        
        sensors.push({
            el: div,
            x: i % GRID_SIZE,
            y: Math.floor(i / GRID_SIZE),
            isTriggered: false
        });
    }
    Logger.info("Rede estabelecida. Aguardando dados dos sensores...");
};

// Função disparada ao detectar calor/fumaça no simulador
const triggerAnomaly = (id) => {
    const node = sensors[id];
    if (node.isTriggered) return;

    node.isTriggered = true;
    node.el.classList.add('fire');
    node.el.innerHTML = '🔥';

    Logger.alert(`Fogo detectado no módulo #${id}`);
    propagateSinal(node);
};

// Lógica de salto entre nós (Rede Mesh)
const propagateSinal = (origin) => {
    sensors.forEach((neighbor, index) => {
        // Cálculo de distância simples (Pitágoras)
        const dx = neighbor.x - origin.x;
        const dy = neighbor.y - origin.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist > 0 && dist <= REACH_DISTANCE && !neighbor.isTriggered) {
            setTimeout(() => {
                neighbor.el.classList.add('notified');
                Logger.info(`Módulo #${index} recebeu e repassou o alerta.`);
            }, dist * 400); // Latência simulada da rede
        }
    });
};

document.getElementById('reset-trigger').onclick = initNetwork;
window.onload = initNetwork;