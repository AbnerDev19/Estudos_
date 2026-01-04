import { db_turmas } from './db_turmas.js';

// Elementos
const viewLista = document.getElementById('view-lista');
const viewDetalhes = document.getElementById('view-detalhes');
const listaContainer = document.getElementById('lista-turmas-container');
const btnVoltar = document.getElementById('btn-voltar');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderizarListaTurmas();
});

// Voltar para a lista
btnVoltar.addEventListener('click', () => {
    viewDetalhes.style.display = 'none';
    viewLista.style.display = 'block';
});

// 1. RENDERIZAR LISTA (CARDS)
function renderizarListaTurmas() {
    listaContainer.innerHTML = '';
    
    db_turmas.forEach(turma => {
        const card = document.createElement('div');
        card.classList.add('turma-card-entry');
        card.onclick = () => abrirTurma(turma.id); // Clique abre detalhes

        card.innerHTML = `
            <div class="card-img-top" style="background-image: url('${turma.imagem}');">
                <div class="card-overlay">
                    <div class="progress-bar" style="height:6px; background:rgba(255,255,255,0.3); border-radius:3px; margin-top:auto;">
                        <div style="width:${turma.progressoTotal}%; height:100%; background:#00e676; border-radius:3px;"></div>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <h3>${turma.nome}</h3>
                <p>${turma.semanas.length} Semanas disponíveis</p>
            </div>
        `;
        listaContainer.appendChild(card);
    });
}

// 2. ABRIR DETALHES DA TURMA
function abrirTurma(id) {
    const turma = db_turmas.find(t => t.id === id);
    if(!turma) return;

    // Troca de View
    viewLista.style.display = 'none';
    viewDetalhes.style.display = 'block';

    // Preenche Cabeçalho
    document.getElementById('titulo-turma').innerText = turma.nome;

    // A. Renderiza Painel de Progresso (Topo)
    const progressoContainer = document.getElementById('painel-progresso-container');
    progressoContainer.innerHTML = '';
    turma.materias.forEach(mat => {
        progressoContainer.innerHTML += `
            <div class="stat-item">
                <div class="stat-header">
                    <span>${mat.nome}</span>
                    <span>${mat.percentual}%</span>
                </div>
                <div class="stat-bar-bg">
                    <div class="stat-bar-fill" style="width: ${mat.percentual}%; background-color: ${mat.cor}"></div>
                </div>
            </div>
        `;
    });

    // B. Renderiza Botões das Semanas (Sidebar)
    renderizarSidebarSemanas(turma);
    
    // Abre a primeira semana por padrão
    abrirSemana(turma, 0);
}

function renderizarSidebarSemanas(turma) {
    const navContainer = document.getElementById('weeks-navigation');
    navContainer.innerHTML = '';

    turma.semanas.forEach((semana, index) => {
        const btn = document.createElement('button');
        btn.classList.add('week-btn');
        btn.innerText = semana.titulo;
        btn.onclick = () => abrirSemana(turma, index);
        btn.dataset.index = index; // Para controle de active
        navContainer.appendChild(btn);
    });
}

// 3. RENDERIZAR CONTEÚDO DA SEMANA (METAS)
function abrirSemana(turma, indexSemana) {
    const semana = turma.semanas[indexSemana];
    
    // Atualiza botões active na sidebar
    document.querySelectorAll('.week-btn').forEach(b => b.classList.remove('active'));
    const btnAtual = document.querySelector(`.week-btn[data-index="${indexSemana}"]`);
    if(btnAtual) btnAtual.classList.add('active');

    // Atualiza Título e Foco
    document.getElementById('titulo-semana-atual').innerText = `Metas da ${semana.titulo}`;
    document.querySelector('.alert-box span:last-child').innerText = semana.foco || "Siga o cronograma proposto.";

    // Renderiza Tarefas por Dia
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';

    if(semana.dias.length === 0) {
        tasksContainer.innerHTML = '<p style="color:#666; font-style:italic">Nenhuma tarefa cadastrada ainda.</p>';
        return;
    }

    semana.dias.forEach(dia => {
        let tarefasHTML = '';
        
        dia.tarefas.forEach(tarefa => {
            const isDone = tarefa.feita ? 'completed' : '';
            
            // Define cor da tag baseado na materia (simples string check)
            let tagClass = 'tag-padrao';
            if(tarefa.materia.includes('Legisl')) tagClass = 'tag-legislacao';
            if(tarefa.materia.includes('Portugu')) tagClass = 'tag-portugues';
            if(tarefa.materia.includes('Emerg')) tagClass = 'tag-emergencia';

            // Verifica se tem arquivo
            let arquivoHTML = '';
            if(tarefa.arquivo) {
                arquivoHTML = `<span class="tag-arquivo task-tag" style="margin-left:8px; cursor:pointer">
                    <span class="material-symbols-outlined" style="font-size:12px">attach_file</span> Material
                </span>`;
            }

            tarefasHTML += `
                <div class="task-item ${isDone}" onclick="this.classList.toggle('completed')">
                    <div class="task-check"></div>
                    <div class="task-content">
                        <p>${tarefa.texto}</p>
                        <span class="task-tag ${tagClass}">${tarefa.materia}</span>
                        ${arquivoHTML}
                    </div>
                </div>
            `;
        });

        tasksContainer.innerHTML += `
            <div class="day-group">
                <h4 class="day-title">${dia.nome}</h4>
                ${tarefasHTML}
            </div>
        `;
    });
}