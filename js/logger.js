/**
 * Gerenciador de Logs e Segurança (Blockchain Mockup)
 */
const Logger = {
    container: document.getElementById('event-log'),

    write(msg, isAlert = false) {
        const line = document.createElement('div');
        line.style.padding = "4px 0";
        line.style.color = isAlert ? "#ff5252" : "#81cf9f";
        
        const timestamp = new Date().toLocaleTimeString();
        line.innerHTML = `<span style="opacity:0.4">${timestamp}</span> > ${msg}`;
        
        this.container.prepend(line);
    },

    info(msg) { this.write(msg); },

    alert(msg) {
        this.write(msg.toUpperCase(), true);
        // Simula a criação de um bloco de segurança
        const hash = "0x" + Math.random().toString(16).slice(2, 10);
        this.write(`[BLOCKCHAIN] Registro imutável gerado: ${hash}`);
    }
};