// --- DADOS SIMULADOS (MOCK DB) ---
const db_simulado = {
    usuario: { nome: "Carlos Eduardo" },
    provas: [
        { id: 1, nome: "Polícia Federal", banca: "Cebraspe", data: "2025-08-25", cor: "destaque" },
        { id: 2, nome: "Tribunal de Justiça", banca: "Vunesp", data: "2025-09-10", cor: "" },
        { id: 3, nome: "Receita Federal", banca: "FGV", data: "2025-11-02", cor: "" },
        { id: 4, nome: "Banco do Brasil", banca: "Cesgranrio", data: "2025-12-15", cor: "" }
    ],
    editais: [
        { titulo: "Direito Constitucional", progresso: 65, total: 120, estudados: 78 },
        { titulo: "Raciocínio Lógico", progresso: 30, total: 80, estudados: 24 },
        { titulo: "Língua Portuguesa", progresso: 90, total: 50, estudados: 45 }
    ],
    turmas: [
        { materia: "Turma de Elite: Policial", professor: "Equipe Alfa", atualizacao: "Nova aula de Penal" },
        { materia: "Resolução de Questões", professor: "Prof. Telles", atualizacao: "" },
        { materia: "Informática do Zero", professor: "Prof. Raniere", atualizacao: "PDF Disponível" }
    ],
    agenda: [
        { titulo: "Revisão: Crase e Acentos", hora: "08:00 - 09:30", feito: true },
        { titulo: "Vídeo: Poder Executivo", hora: "14:00 - 15:30", feito: false },
        { titulo: "Bateria de 30 Questões", hora: "19:00 - 20:00", feito: false }
    ]
};

// --- RENDERIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Saudação
    document.getElementById('saudacao').innerText = `Olá, ${db_simulado.usuario.nome}!`;
    
    // Data
    const hoje = new Date();
    document.getElementById('data-hoje').innerText = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    renderizarProvas();
    renderizarEditais();
    renderizarTurmas();
    renderizarAgenda();
});

function renderizarProvas() {
    const container = document.getElementById('container-provas');
    container.innerHTML = '';

    db_simulado.provas.forEach(prova => {
        // Cálculo simples de dias
        const diasRestantes = Math.ceil((new Date(prova.data) - new Date()) / (1000 * 60 * 60 * 24));
        
        const html = `
            <div class="prova-card ${prova.cor}">
                <div class="prova-header">
                    <span class="prova-tag">${prova.banca}</span>
                    <span class="material-symbols-outlined" style="color:white; font-size:1.2rem">notifications</span>
                </div>
                <div class="prova-timer">
                    <h4>${diasRestantes}</h4>
                    <p>Dias Restantes</p>
                </div>
                <div class="prova-date">
                    <span class="material-symbols-outlined" style="font-size:1rem">event</span>
                    ${prova.nome}
                </div>
            </div>`;
        container.innerHTML += html;
    });
}

function renderizarEditais() {
    const container = document.getElementById('container-editais');
    container.innerHTML = '';
    
    db_simulado.editais.forEach(edital => {
        const html = `
            <div class="edital-card">
                <div class="edital-info">
                    <h4>${edital.titulo}</h4>
                    <span>${edital.estudados}/${edital.total} Tópicos</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${edital.progresso}%"></div>
                </div>
                <span class="progress-text">${edital.progresso}% Concluído</span>
            </div>`;
        container.innerHTML += html;
    });
}

function renderizarTurmas() {
    const container = document.getElementById('container-turmas');
    container.innerHTML = '';

    db_simulado.turmas.forEach(turma => {
        const badge = turma.atualizacao ? `<small style="color:#00e676; display:block; font-size:0.75rem; margin-top:2px;">● ${turma.atualizacao}</small>` : '';
        const html = `
            <div class="turma-card">
                <div class="turma-icon"><span class="material-symbols-outlined">school</span></div>
                <div class="turma-details">
                    <h4>${turma.materia}</h4>
                    <p>${turma.professor}</p>
                    ${badge}
                </div>
                <button class="btn-acessar">Acessar</button>
            </div>`;
        container.innerHTML += html;
    });
}

function renderizarAgenda() {
    const container = document.getElementById('container-agenda');
    container.innerHTML = '';

    db_simulado.agenda.forEach(item => {
        const checkIcon = item.feito ? 'check_box' : 'check_box_outline_blank';
        const checkedClass = item.feito ? 'done' : '';
        
        const html = `
            <li class="todo-item ${checkedClass}">
                <span class="material-symbols-outlined check-icon">${checkIcon}</span>
                <div class="task-info">
                    <strong>${item.titulo}</strong>
                    <small>${item.hora}</small>
                </div>
            </li>`;
        container.innerHTML += html;
    });
}