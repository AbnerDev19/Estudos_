// Lógica de Seleção para o Admin
document.addEventListener('DOMContentLoaded', () => {
    
    // Seleção de Turmas
    const turmaItems = document.querySelectorAll('.turma-item');
    const editorTitle = document.getElementById('editor-turma-nome');

    turmaItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active de todos
            turmaItems.forEach(i => i.classList.remove('active'));
            // Adiciona ao clicado
            item.classList.add('active');
            
            // Atualiza o título do editor
            const nomeTurma = item.querySelector('span').innerText;
            if(editorTitle) {
                editorTitle.innerText = `Editando: ${nomeTurma}`;
            }
        });
    });

    // Simulação de Salvar
    const btnSave = document.querySelector('.btn-save');
    if(btnSave) {
        btnSave.addEventListener('click', () => {
            const originalText = btnSave.innerText;
            btnSave.innerText = "Salvando...";
            setTimeout(() => {
                btnSave.innerText = "Salvo!";
                setTimeout(() => {
                    btnSave.innerText = originalText;
                }, 2000);
            }, 1000);
        });
    }
});
// ... (Mantenha o código anterior do admin.js) ...

// --- PÁGINA DE ALUNOS ---
const alunosFull = [
    { nome: "João Silva", email: "joao@email.com", turma: "CBMDF", progresso: "78%", acesso: "Hoje, 10:00", status: "active" },
    { nome: "Maria Oliveira", email: "maria@email.com", turma: "Polícia Civil", progresso: "12%", acesso: "Ontem", status: "blocked" },
    { nome: "Pedro Santos", email: "pedro@email.com", turma: "TJ-SP", progresso: "45%", acesso: "3 dias atrás", status: "active" },
    { nome: "Lucas Mendes", email: "lucas@email.com", turma: "CBMDF", progresso: "90%", acesso: "Hoje, 09:30", status: "active" },
    { nome: "Fernanda Lima", email: "fer@email.com", turma: "CBMDF", progresso: "0%", acesso: "Nunca", status: "warning" }
];

if(document.getElementById('lista-alunos-completa')) {
    renderStudentsTable();
    setupModal();
}

function renderStudentsTable() {
    const tbody = document.getElementById('lista-alunos-completa');
    tbody.innerHTML = '';

    alunosFull.forEach(aluno => {
        let statusHtml = '';
        if(aluno.status === 'active') statusHtml = '<span class="status-pill active">Ativo</span>';
        else if(aluno.status === 'blocked') statusHtml = '<span class="status-pill blocked">Bloqueado</span>';
        else statusHtml = '<span class="status-pill" style="background:#ffab00; color:black">Inadimplente</span>';

        // Barra de progresso visual
        const progressHtml = `
            <div style="display:flex; align-items:center; gap:10px">
                <div style="width:80px; height:6px; background:#333; border-radius:3px; overflow:hidden">
                    <div style="width:${aluno.progresso}; height:100%; background:var(--admin-accent)"></div>
                </div>
                <span style="font-size:0.8rem">${aluno.progresso}</span>
            </div>
        `;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${aluno.nome}</strong><br><small style="color:#666">${aluno.email}</small></td>
            <td>${aluno.turma}</td>
            <td>${progressHtml}</td>
            <td>${aluno.acesso}</td>
            <td>${statusHtml}</td>
            <td>
                <button class="btn-open-modal" style="background:none; border:none; color:var(--admin-accent); cursor:pointer; font-weight:600">
                    Detalhes
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function setupModal() {
    const modal = document.getElementById('student-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    // Event listener delegado para botões criados dinamicamente
    document.addEventListener('click', (e) => {
        if(e.target.classList.contains('btn-open-modal')) {
            modal.style.display = 'flex';
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.style.display = 'none';
    });
}

// --- PÁGINA DE QUESTÕES (Lógica de Seleção de Opção) ---
if(document.querySelector('.option-row')) {
    const options = document.querySelectorAll('.option-row');
    options.forEach(opt => {
        opt.addEventListener('click', () => {
            // Remove seleção anterior
            options.forEach(o => {
                o.classList.remove('correct');
                o.querySelector('.radio-circle').classList.remove('selected');
                // Remove o ícone de check se existir
                const check = o.querySelector('.material-symbols-outlined');
                if(check) check.remove();
            });

            // Adiciona nova seleção
            opt.classList.add('correct');
            opt.querySelector('.radio-circle').classList.add('selected');
            
            // Adiciona check icon visualmente
            const icon = document.createElement('span');
            icon.className = 'material-symbols-outlined';
            icon.style.color = '#00e676';
            icon.innerText = 'check_circle';
            opt.appendChild(icon);
        });
    });
}