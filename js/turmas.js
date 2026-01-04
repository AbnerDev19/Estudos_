import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db_turmas as dadosIniciais } from './db_turmas.js'; // Usa o mock apenas para criar os dados iniciais

// Elementos
const viewLista = document.getElementById('view-lista');
const viewDetalhes = document.getElementById('view-detalhes');
const listaContainer = document.getElementById('lista-turmas-container');
const btnVoltar = document.getElementById('btn-voltar');

let turmasReais = []; // Armazenará os dados vindos do Firebase

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await carregarTurmas(user.uid);
        } else {
            window.location.href = "index.html";
        }
    });
});

btnVoltar.addEventListener('click', () => {
    viewDetalhes.style.display = 'none';
    viewLista.style.display = 'block';
});

// --- 1. CARREGAR DO FIREBASE (OU MIGRAR) ---
async function carregarTurmas(userId) {
    listaContainer.innerHTML = '<p style="color:#aaa">Carregando suas turmas...</p>';
    
    const turmasRef = collection(db, "users", userId, "minhas_turmas_detalhado");
    const snapshot = await getDocs(turmasRef);

    if (snapshot.empty) {
        // MIGRACAO AUTOMÁTICA: Salva o mock no banco para o usuário ter dados iniciais
        console.log("Criando turmas iniciais no banco...");
        for (const turma of dadosIniciais) {
            // Usa o ID da turma como ID do documento
            await setDoc(doc(turmasRef, String(turma.id)), turma);
            turmasReais.push(turma);
        }
    } else {
        // Carrega o que está no banco
        turmasReais = [];
        snapshot.forEach(doc => {
            turmasReais.push(doc.data());
        });
    }

    renderizarListaTurmas();
}

// --- 2. RENDERIZAR LISTA ---
function renderizarListaTurmas() {
    listaContainer.innerHTML = '';
    
    if (turmasReais.length === 0) {
        listaContainer.innerHTML = '<p>Nenhuma turma encontrada.</p>';
        return;
    }

    turmasReais.forEach(turma => {
        const card = document.createElement('div');
        card.classList.add('turma-card-entry');
        card.onclick = () => abrirTurma(turma); // Passa o objeto turma inteiro

        card.innerHTML = `
            <div class="card-img-top" style="background-image: url('${turma.imagem || 'img/default-course.jpg'}');">
                <div class="card-overlay">
                    <div class="progress-bar" style="height:6px; background:rgba(255,255,255,0.3); border-radius:3px; margin-top:auto;">
                        <div style="width:${turma.progressoTotal}%; height:100%; background:#00e676; border-radius:3px;"></div>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <h3>${turma.nome}</h3>
                <p>${turma.semanas ? turma.semanas.length : 0} Semanas disponíveis</p>
            </div>
        `;
        listaContainer.appendChild(card);
    });
}

// --- 3. ABRIR DETALHES ---
function abrirTurma(turma) {
    viewLista.style.display = 'none';
    viewDetalhes.style.display = 'block';

    document.getElementById('titulo-turma').innerText = turma.nome;

    // A. Painel de Progresso
    const progressoContainer = document.getElementById('painel-progresso-container');
    progressoContainer.innerHTML = '';
    if(turma.materias) {
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
    }

    // B. Sidebar Semanas
    renderizarSidebarSemanas(turma);
    
    // Abre a 1ª semana se existir
    if(turma.semanas && turma.semanas.length > 0) {
        abrirSemana(turma, 0);
    } else {
        document.getElementById('tasks-container').innerHTML = '<p>Sem conteúdo cadastrado.</p>';
    }
}

function renderizarSidebarSemanas(turma) {
    const navContainer = document.getElementById('weeks-navigation');
    navContainer.innerHTML = '';

    if(!turma.semanas) return;

    turma.semanas.forEach((semana, index) => {
        const btn = document.createElement('button');
        btn.classList.add('week-btn');
        btn.innerText = semana.titulo;
        btn.onclick = () => abrirSemana(turma, index);
        btn.dataset.index = index;
        navContainer.appendChild(btn);
    });
}

function abrirSemana(turma, indexSemana) {
    const semana = turma.semanas[indexSemana];
    
    document.querySelectorAll('.week-btn').forEach(b => b.classList.remove('active'));
    const btnAtual = document.querySelector(`.week-btn[data-index="${indexSemana}"]`);
    if(btnAtual) btnAtual.classList.add('active');

    document.getElementById('titulo-semana-atual').innerText = `Metas da ${semana.titulo}`;
    document.querySelector('.alert-box span:last-child').innerText = semana.foco || "Siga o cronograma proposto.";

    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';

    if(!semana.dias || semana.dias.length === 0) {
        tasksContainer.innerHTML = '<p style="color:#666; font-style:italic">Nenhuma tarefa cadastrada ainda.</p>';
        return;
    }

    semana.dias.forEach(dia => {
        let tarefasHTML = '';
        
        dia.tarefas.forEach(tarefa => {
            const isDone = tarefa.feita ? 'completed' : '';
            
            let tagClass = 'tag-padrao';
            if(tarefa.materia && tarefa.materia.includes('Legisl')) tagClass = 'tag-legislacao';
            if(tarefa.materia && tarefa.materia.includes('Portugu')) tagClass = 'tag-portugues';
            if(tarefa.materia && tarefa.materia.includes('Emerg')) tagClass = 'tag-emergencia';

            let arquivoHTML = '';
            if(tarefa.arquivo) {
                arquivoHTML = `<span class="tag-arquivo task-tag" style="margin-left:8px; cursor:pointer"><span class="material-symbols-outlined" style="font-size:12px">attach_file</span> Material</span>`;
            }

            tarefasHTML += `
                <div class="task-item ${isDone}" onclick="this.classList.toggle('completed')">
                    <div class="task-check"></div>
                    <div class="task-content">
                        <p>${tarefa.texto}</p>
                        <span class="task-tag ${tagClass}">${tarefa.materia || 'Geral'}</span>
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