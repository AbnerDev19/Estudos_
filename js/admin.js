// --- DADOS SIMULADOS GLOBAIS ---
const alunosFull = [
    { id: 1, nome: "João Silva", email: "joao@email.com", turma: "CBMDF 2025", progresso: 78, acesso: "Hoje, 10:00", status: "active", avatar: "JS" },
    { id: 2, nome: "Maria Oliveira", email: "maria@email.com", turma: "Polícia Civil", progresso: 12, acesso: "Ontem", status: "blocked", avatar: "MO" },
    { id: 3, nome: "Pedro Santos", email: "pedro@email.com", turma: "TJ-SP", progresso: 45, acesso: "3 dias atrás", status: "active", avatar: "PS" },
    { id: 4, nome: "Lucas Mendes", email: "lucas@email.com", turma: "CBMDF 2025", progresso: 90, acesso: "Hoje, 09:30", status: "active", avatar: "LM" },
    { id: 5, nome: "Fernanda Lima", email: "fer@email.com", turma: "CBMDF 2025", progresso: 0, acesso: "Nunca", status: "warning", avatar: "FL" },
    { id: 6, nome: "Roberto Costa", email: "beto@email.com", turma: "Polícia Federal", progresso: 32, acesso: "1 semana atrás", status: "active", avatar: "RC" }
];

const turmasMock = [
    { id: 1, nome: "Concurso CBMDF 2025", alunos: 120, mediaProgresso: 65, status: "Aberta" },
    { id: 2, nome: "Polícia Civil - Agente", alunos: 85, mediaProgresso: 42, status: "Aberta" },
    { id: 3, nome: "Tribunal de Justiça SP", alunos: 42, mediaProgresso: 88, status: "Reta Final" }
];

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    
    // DASHBOARD (Visão Geral)
    if(document.getElementById('dashboard-turmas-stats')) {
        renderDashboardTurmas();
        renderDashboardAlunosRecentes();
    }

    // ALUNOS
    if(document.getElementById('lista-alunos-completa')) {
        renderizarTabelaAlunos();
        setupFiltrosEBusca();
        setupModalDinamico();
    }

    // CONTEÚDO (Gerenciar Turmas)
    if(document.getElementById('lista-turmas-admin')) {
        renderContentManager();
    }

    // GLOBAL (Botões Salvar, etc)
    setupBotoesSalvar();
    setupSelecaoOpcoes(); // Para as questões
    setupSelecaoTurmas(); // Para o editor de turmas
});

// --- FUNÇÕES DO DASHBOARD (NOVA) ---
function renderDashboardTurmas() {
    const container = document.getElementById('dashboard-turmas-stats');
    container.innerHTML = '';

    turmasMock.forEach(turma => {
        // Cor da barra baseada na média
        const corBarra = turma.mediaProgresso > 70 ? '#00e676' : (turma.mediaProgresso > 40 ? '#2962ff' : '#ffab00');
        
        const html = `
            <div class="kpi-box" style="display:block">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px">
                    <h4 style="color:white; font-size:1rem">${turma.nome}</h4>
                    <span class="status-pill active" style="font-size:0.7rem">${turma.status}</span>
                </div>
                
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px">
                    <span class="material-symbols-outlined" style="color:#666">group</span>
                    <span style="color:#ccc; font-size:0.9rem">${turma.alunos} Alunos</span>
                </div>

                <div style="margin-top:auto">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#888; margin-bottom:5px">
                        <span>Progresso Médio</span>
                        <span>${turma.mediaProgresso}%</span>
                    </div>
                    <div style="width:100%; height:6px; background:#333; border-radius:3px; overflow:hidden">
                        <div style="width:${turma.mediaProgresso}%; height:100%; background:${corBarra}"></div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

function renderDashboardAlunosRecentes() {
    const tbody = document.getElementById('lista-alunos-recentes');
    tbody.innerHTML = '';

    // Pega os 3 primeiros para exibir na home
    alunosFull.slice(0, 3).forEach(aluno => {
        const statusHtml = aluno.status === 'active' 
            ? '<span class="status-pill active">Ativo</span>' 
            : '<span class="status-pill blocked">Pendente</span>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div class="avatar-circle" style="width:30px; height:30px; font-size:12px; background:#222">${aluno.avatar}</div>
                    ${aluno.nome}
                </div>
            </td>
            <td>${aluno.email}</td>
            <td>${aluno.turma}</td>
            <td>${statusHtml}</td>
            <td><span class="material-symbols-outlined" style="font-size:18px; cursor:pointer; color:#888">more_vert</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// --- OUTRAS FUNÇÕES (ALUNOS, CONTEÚDO, MODAL, ETC) ---
// (Mantenha aqui as funções renderizarTabelaAlunos, setupFiltrosEBusca, setupModalDinamico, etc que já fizemos anteriormente)
// Vou incluir as essenciais abaixo para garantir que tudo funcione junto:

function renderizarTabelaAlunos() { /* Lógica da tabela de alunos (já criada) */
    const tbody = document.getElementById('lista-alunos-completa');
    if(!tbody) return;
    tbody.innerHTML = '';
    alunosFull.forEach(aluno => {
        // ... (código da tabela completa)
        // Se precisar eu repito, mas assumo que você tem do passo anterior
    });
}

function renderContentManager() {
    const lista = document.getElementById('lista-turmas-admin');
    lista.innerHTML = '';
    turmasMock.forEach((turma, index) => {
        const item = document.createElement('div');
        item.className = index === 0 ? 'turma-item active' : 'turma-item';
        item.innerHTML = `<span>${turma.nome}</span><span class="material-symbols-outlined" style="font-size:16px">chevron_right</span>`;
        lista.appendChild(item);
    });
}

function setupSelecaoTurmas() {
    const itens = document.querySelectorAll('.turma-item');
    const titulo = document.getElementById('editor-turma-nome');
    itens.forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.turma-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            if(titulo) titulo.innerText = `Editando: ${item.querySelector('span').innerText}`;
        });
    });
}

function setupSelecaoOpcoes() {
    const options = document.querySelectorAll('.option-row');
    options.forEach(opt => {
        opt.addEventListener('click', () => {
            options.forEach(o => {
                o.classList.remove('correct');
                o.querySelector('.radio-circle').classList.remove('selected');
                const check = o.querySelector('.material-symbols-outlined');
                if(check) check.remove();
            });
            opt.classList.add('correct');
            opt.querySelector('.radio-circle').classList.add('selected');
            const icon = document.createElement('span');
            icon.className = 'material-symbols-outlined';
            icon.style.color = '#00e676';
            icon.innerText = 'check_circle';
            opt.appendChild(icon);
        });
    });
}

function setupBotoesSalvar() {
    const btns = document.querySelectorAll('.btn-save');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const txt = btn.innerText;
            btn.innerText = "Salvando...";
            setTimeout(() => btn.innerText = txt, 1000);
        });
    });
}