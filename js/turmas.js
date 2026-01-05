import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos do DOM
const viewLista = document.getElementById('view-lista');
const viewDetalhes = document.getElementById('view-detalhes');
const listaContainer = document.getElementById('lista-turmas-container');
const btnVoltar = document.getElementById('btn-voltar');

// Variável para armazenar as turmas carregadas
let turmasReais = []; 

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Carrega as turmas globais criadas pelo Admin
            await carregarTurmasGlobais();
        } else {
            window.location.href = "index.html";
        }
    });
});

// Botão Voltar (da tela de detalhes para a lista)
btnVoltar.addEventListener('click', () => {
    viewDetalhes.style.display = 'none';
    viewLista.style.display = 'block';
    // Limpa a visualização anterior
    document.getElementById('tasks-container').innerHTML = '';
});

// --- 1. CARREGAR TURMAS (GLOBAL) ---
async function carregarTurmasGlobais() {
    listaContainer.innerHTML = '<p style="color:#aaa">Buscando turmas disponíveis...</p>';
    
    try {
        // MUDANÇA: Busca na coleção "turmas" (onde o Admin salvou)
        const turmasRef = collection(db, "turmas");
        const snapshot = await getDocs(turmasRef);

        turmasReais = [];
        snapshot.forEach(doc => {
            // Junta o ID do documento com os dados (nome, semanas, materias, etc)
            turmasReais.push({ id: doc.id, ...doc.data() });
        });

        renderizarListaTurmas();
    } catch (error) {
        console.error("Erro ao buscar turmas:", error);
        listaContainer.innerHTML = '<p style="color:#ff5252">Erro ao carregar turmas. Tente novamente.</p>';
    }
}

// --- 2. RENDERIZAR LISTA (CATÁLOGO) ---
function renderizarListaTurmas() {
    listaContainer.innerHTML = '';
    
    if (turmasReais.length === 0) {
        listaContainer.innerHTML = '<p>Nenhuma turma encontrada no sistema.</p>';
        return;
    }

    turmasReais.forEach(turma => {
        // Cria o card da turma
        const card = document.createElement('div');
        card.classList.add('turma-card-entry');
        
        // Ao clicar, chama a função que abre OS DETALHES ESPECÍFICOS desta turma
        card.onclick = () => abrirTurma(turma); 

        // Define imagem padrão se não houver
        const bgImage = turma.imagem || 'https://via.placeholder.com/400x200/1a1a1a/ffffff?text=Curso';
        
        // Calcula quantas semanas existem (para exibir no card)
        const qtdSemanas = turma.semanas ? turma.semanas.length : 0;

        card.innerHTML = `
            <div class="card-img-top" style="background-image: url('${bgImage}'); background-size: cover;">
                <div class="card-overlay">
                    <div class="progress-bar" style="height:6px; background:rgba(255,255,255,0.3); border-radius:3px; margin-top:auto;">
                        <div style="width:${turma.progressoTotal || 0}%; height:100%; background:#00e676; border-radius:3px;"></div>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <h3>${turma.nome}</h3>
                <p>${qtdSemanas} Semanas disponíveis</p>
                <small style="color:#666">${turma.focoAtual || 'Sem foco definido'}</small>
            </div>
        `;
        listaContainer.appendChild(card);
    });
}

// --- 3. ABRIR DETALHES (CRONOGRAMA ESPECÍFICO) ---
function abrirTurma(turma) {
    // Troca a visualização
    viewLista.style.display = 'none';
    viewDetalhes.style.display = 'block';

    // Preenche cabeçalho
    document.getElementById('titulo-turma').innerText = turma.nome;

    // A. Painel de Progresso (Matérias)
    const progressoContainer = document.getElementById('painel-progresso-container');
    progressoContainer.innerHTML = '';
    
    // Se a turma tiver matérias cadastradas (estrutura do Admin)
    if(turma.materias && turma.materias.length > 0) {
        turma.materias.forEach(mat => {
            progressoContainer.innerHTML += `
                <div class="stat-item">
                    <div class="stat-header">
                        <span>${mat.nome}</span>
                        <span>${mat.percentual || 0}%</span>
                    </div>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill" style="width: ${mat.percentual || 0}%; background-color: ${mat.cor || '#2962ff'}"></div>
                    </div>
                </div>
            `;
        });
    } else {
        progressoContainer.innerHTML = '<p style="color:#666; font-size:0.9rem">Estatísticas indisponíveis.</p>';
    }

    // B. Sidebar de Semanas (Navegação)
    renderizarSidebarSemanas(turma);
    
    // Abre automaticamente a 1ª semana se existir
    if(turma.semanas && turma.semanas.length > 0) {
        abrirSemana(turma, 0);
    } else {
        document.getElementById('tasks-container').innerHTML = '<p style="padding:20px; color:#aaa">O professor ainda não liberou semanas para esta turma.</p>';
        document.getElementById('titulo-semana-atual').innerText = "Aguardando Cronograma";
        document.querySelector('.alert-box').style.display = 'none';
    }
}

function renderizarSidebarSemanas(turma) {
    const navContainer = document.getElementById('weeks-navigation');
    navContainer.innerHTML = '';

    if(!turma.semanas) return;

    turma.semanas.forEach((semana, index) => {
        const btn = document.createElement('button');
        btn.classList.add('week-btn');
        btn.innerText = semana.titulo || `Semana ${index + 1}`;
        
        // Ao clicar, carrega AS TAREFAS DESTA SEMANA ESPECÍFICA
        btn.onclick = () => abrirSemana(turma, index);
        
        btn.dataset.index = index;
        navContainer.appendChild(btn);
    });
}

function abrirSemana(turma, indexSemana) {
    // 1. Pega os dados da semana correta dentro do objeto da turma
    const semana = turma.semanas[indexSemana];
    
    // 2. Atualiza UI da sidebar (botão ativo)
    document.querySelectorAll('.week-btn').forEach(b => b.classList.remove('active'));
    const btnAtual = document.querySelector(`.week-btn[data-index="${indexSemana}"]`);
    if(btnAtual) btnAtual.classList.add('active');

    // 3. Atualiza Título e Foco
    document.getElementById('titulo-semana-atual').innerText = semana.titulo || "Metas da Semana";
    const alertBox = document.querySelector('.alert-box');
    
    if(semana.foco) {
        alertBox.style.display = 'flex';
        alertBox.querySelector('span:last-child').innerText = semana.foco;
    } else {
        alertBox.style.display = 'none';
    }

    // 4. Renderiza as Tarefas
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';

    if(!semana.dias || semana.dias.length === 0) {
        tasksContainer.innerHTML = '<p style="color:#666; font-style:italic">Nenhuma tarefa cadastrada nesta semana.</p>';
        return;
    }

    // Loop pelos dias (Segunda, Terça...)
    semana.dias.forEach(dia => {
        let tarefasHTML = '';
        
        if(dia.tarefas && dia.tarefas.length > 0) {
            dia.tarefas.forEach(tarefa => {
                // Lógica de tags visuais baseada no nome da matéria
                let tagClass = 'tag-padrao'; // Classe CSS genérica
                const mat = (tarefa.materia || '').toLowerCase();
                
                if(mat.includes('lei') || mat.includes('dir')) tagClass = 'tag-legislacao'; 
                
                tarefasHTML += `
                    <div class="task-item" onclick="this.classList.toggle('completed')">
                        <div class="task-check"></div>
                        <div class="task-content">
                            <p>${tarefa.texto}</p>
                            <span class="task-tag ${tagClass}" style="font-size:0.7rem; background:#333; padding:2px 6px; border-radius:4px; color:#aaa">
                                ${tarefa.materia || 'Geral'}
                            </span>
                        </div>
                    </div>
                `;
            });
        } else {
            tarefasHTML = '<p style="font-size:0.8rem; color:#444">Dia livre / Revisão.</p>';
        }

        tasksContainer.innerHTML += `
            <div class="day-group" style="margin-bottom:20px">
                <h4 class="day-title" style="color:var(--primary-blue); margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:5px">${dia.nome}</h4>
                ${tarefasHTML}
            </div>
        `;
    });
}