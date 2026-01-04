import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos Globais
let currentUser = null;
let turmasCarregadas = [];
let questoesCarregadas = [];

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            // Roteamento simples baseado no elemento único da página
            if(document.getElementById('admin-turmas-list')) {
                await initGerenciadorTurmas();
            } else if(document.getElementById('q-editor-title')) {
                await initGerenciadorQuestoes(); // <--- NOVA FUNÇÃO
            }
        } else {
            window.location.href = "index.html";
        }
    });

    // Botão Sair Global
    const linksSair = document.querySelectorAll('a[href="index.html"]');
    linksSair.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => window.location.href = "index.html");
        });
    });
});

// ==========================================================
// MÓDULO 1: GERENCIADOR DE TURMAS
// ==========================================================

async function initGerenciadorTurmas() {
    const listaContainer = document.getElementById('admin-turmas-list');
    const btnSalvar = document.querySelector('.btn-save'); 

    listaContainer.innerHTML = '<p style="color:#666; padding:10px">Carregando...</p>';
    
    const turmasRef = collection(db, "users", currentUser.uid, "minhas_turmas_detalhado");
    const snapshot = await getDocs(turmasRef);
    
    turmasCarregadas = [];
    snapshot.forEach(doc => {
        turmasCarregadas.push({ id: doc.id, ...doc.data() });
    });

    renderizarListaTurmasAdmin();

    if(btnSalvar) {
        btnSalvar.onclick = salvarEdicaoTurma;
    }
}

function renderizarListaTurmasAdmin() {
    const lista = document.getElementById('admin-turmas-list');
    lista.innerHTML = '';

    turmasCarregadas.forEach((turma) => {
        const item = document.createElement('div');
        item.className = 'turma-item';
        item.innerHTML = `<span>${turma.nome}</span><span class="material-symbols-outlined" style="font-size:16px">chevron_right</span>`;
        item.onclick = () => {
            document.querySelectorAll('.turma-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            carregarEditorTurma(turma);
        };
        lista.appendChild(item);
    });
}

let turmaEmEdicao = null;

function carregarEditorTurma(turma) {
    turmaEmEdicao = turma;
    document.getElementById('editor-turma-nome').innerText = `Editando: ${turma.nome}`;
    const inputs = document.querySelectorAll('.editor-scroll .input-group input');
    if(inputs[0]) inputs[0].value = turma.nome || "";

    const containerSemanas = document.querySelector('.editor-scroll');
    const hr = containerSemanas.querySelector('hr');
    
    // Limpa área de semanas
    let nextSibling = hr.nextElementSibling;
    while(nextSibling) {
        const toRemove = nextSibling;
        nextSibling = nextSibling.nextElementSibling;
        toRemove.remove();
    }

    const h3 = document.createElement('h3');
    h3.style.cssText = "color:white; margin-bottom:15px; margin-top:20px";
    h3.innerText = "Cronograma de Semanas";
    containerSemanas.appendChild(h3);

    if(turma.semanas) {
        turma.semanas.forEach((semana, idxSemana) => {
            renderizarBlocoSemana(containerSemanas, semana, idxSemana);
        });
    }

    const btnAddSemana = document.createElement('button');
    btnAddSemana.className = 'btn-add';
    btnAddSemana.style.cssText = "border: 1px solid var(--admin-accent); color:var(--admin-accent); margin-top:10px";
    btnAddSemana.innerText = "+ Nova Semana";
    btnAddSemana.onclick = () => {
        if(!turmaEmEdicao.semanas) turmaEmEdicao.semanas = [];
        turmaEmEdicao.semanas.push({ 
            id: Date.now(), 
            titulo: `Semana ${turmaEmEdicao.semanas.length + 1}`,
            foco: "Novo Foco",
            dias: [] 
        });
        carregarEditorTurma(turmaEmEdicao);
    };
    containerSemanas.appendChild(btnAddSemana);
}

function renderizarBlocoSemana(container, semana, idxSemana) {
    const weekBlock = document.createElement('div');
    weekBlock.className = 'week-block';
    
    let tarefasHTML = '';
    if(semana.dias) {
        semana.dias.forEach(dia => {
            dia.tarefas.forEach(t => {
                tarefasHTML += `
                <div class="task-row">
                    <input type="text" class="dark-input" value="${t.texto}" readonly title="Edição detalhada em breve">
                    <input type="text" class="dark-input" style="width:120px" value="${t.materia}" readonly>
                    <span class="material-symbols-outlined icon-btn">close</span>
                </div>`;
            });
        });
    }

    weekBlock.innerHTML = `
        <div class="week-title-bar">
            <span>${semana.titulo}</span>
            <div class="actions">
                <span class="material-symbols-outlined icon-btn">expand_more</span>
                <span class="material-symbols-outlined icon-btn" style="color:#ff5252">delete</span>
            </div>
        </div>
        <div class="week-body">
            ${tarefasHTML || '<p style="color:#666; font-size:0.9rem; text-align:center;">Sem tarefas.</p>'}
            <button class="btn-add">+ Tarefa (Demo)</button>
        </div>
    `;
    container.appendChild(weekBlock);
}

async function salvarEdicaoTurma() {
    if(!turmaEmEdicao) return;
    const btn = document.querySelector('.editor-top .btn-save');
    const txtOriginal = btn.innerText;
    btn.innerText = "Salvando...";
    
    try {
        const inputs = document.querySelectorAll('.editor-scroll .input-group input');
        if(inputs[0]) turmaEmEdicao.nome = inputs[0].value;

        const docRef = doc(db, "users", currentUser.uid, "minhas_turmas_detalhado", turmaEmEdicao.id.toString());
        await setDoc(docRef, turmaEmEdicao, { merge: true });
        alert("Turma salva!");
        initGerenciadorTurmas();
    } catch (e) {
        alert("Erro: " + e.message);
    } finally {
        btn.innerText = txtOriginal;
    }
}


// ==========================================================
// MÓDULO 2: GERENCIADOR DE QUESTÕES (NOVO!)
// ==========================================================

let questaoAtual = null; // Objeto da questão sendo editada

async function initGerenciadorQuestoes() {
    const listaScroll = document.querySelector('.list-scroll');
    const btnNovaQuestao = document.querySelector('header .btn-save'); // Botão "+ Nova Questão"
    const btnSalvar = document.querySelector('.editor-top .btn-save'); // Botão "Salvar" do editor

    // 1. Configurar Botões
    if(btnNovaQuestao) btnNovaQuestao.onclick = prepararNovaQuestao;
    if(btnSalvar) btnSalvar.onclick = salvarQuestao;

    // 2. Configurar comportamento visual das Alternativas
    setupAlternativasVisual();

    // 3. Carregar Questões
    listaScroll.innerHTML = '<p style="color:#666; padding:10px">Carregando banco...</p>';
    
    // Busca todas as questões da coleção 'banco_questoes'
    // (Em produção real, você usaria paginação ou filtros aqui)
    const questoesRef = collection(db, "users", currentUser.uid, "banco_questoes");
    const snapshot = await getDocs(questoesRef);
    
    questoesCarregadas = [];
    snapshot.forEach(doc => {
        questoesCarregadas.push({ id: doc.id, ...doc.data() });
    });

    renderizarListaQuestoes();
}

function renderizarListaQuestoes() {
    const listaScroll = document.querySelector('.list-scroll');
    listaScroll.innerHTML = '';

    // Agrupar por matéria para ficar bonito na árvore
    const grupos = {};
    questoesCarregadas.forEach(q => {
        const materia = q.materia || "Geral";
        if(!grupos[materia]) grupos[materia] = [];
        grupos[materia].push(q);
    });

    // Renderizar Pastas
    for (const [materia, lista] of Object.entries(grupos)) {
        const folder = document.createElement('div');
        folder.className = 'folder-item';
        
        let childrenHTML = '';
        lista.forEach(q => {
            // Exibe ID curto e início do enunciado
            const resumo = q.enunciado ? q.enunciado.substring(0, 25) + "..." : "Sem texto";
            childrenHTML += `<div class="sub-item" onclick="editarQuestao('${q.id}')">#${q.id.substring(0,4)} - ${resumo}</div>`;
        });

        folder.innerHTML = `
            <div class="folder-header" onclick="this.parentElement.classList.toggle('active')">
                <span class="material-symbols-outlined">folder</span> ${materia} 
                <span style="color:#666; font-size:0.8rem; margin-left:auto">(${lista.length})</span>
            </div>
            <div class="folder-children" style="display:block">
                ${childrenHTML}
            </div>
        `;
        listaScroll.appendChild(folder);
    }
    
    if(Object.keys(grupos).length === 0) {
        listaScroll.innerHTML = '<p style="padding:20px; color:#666">Nenhuma questão cadastrada. Clique em "+ Nova Questão".</p>';
    }
}

// Expõe para o HTML poder chamar (já que é module)
window.editarQuestao = function(id) {
    const q = questoesCarregadas.find(item => item.id === id);
    if(q) carregarNoEditor(q);
};

function prepararNovaQuestao() {
    // Cria um objeto vazio
    const nova = {
        id: null, // Será criado no Firebase
        enunciado: "",
        alternativas: ["", "", "", ""],
        correta: 0, // Índice 0 = A
        comentario: "",
        materia: "Geral",
        banca: "",
        ano: new Date().getFullYear()
    };
    carregarNoEditor(nova);
}

function carregarNoEditor(q) {
    questaoAtual = q;
    const isNew = !q.id;
    
    // Título
    document.getElementById('q-editor-title').innerText = isNew ? "Nova Questão" : `Editando Questão #${q.id.substring(0,6)}`;
    
    // Campos
    document.querySelector('textarea.area-large').value = q.enunciado || "";
    document.querySelector('textarea.area-medium').value = q.comentario || "";
    
    // Metadados (assumindo a ordem dos inputs no HTML original)
    // Matéria não tem input no HTML original da pasta admin_questions, vamos pegar os inputs 'Banca' e 'Ano'
    const inputsMeta = document.querySelectorAll('.meta-row input');
    if(inputsMeta[0]) inputsMeta[0].value = q.banca || "";
    if(inputsMeta[1]) inputsMeta[1].value = q.ano || "";
    
    // Alternativas
    const optionInputs = document.querySelectorAll('.option-row input');
    optionInputs.forEach((input, index) => {
        if(q.alternativas && q.alternativas[index]) {
            input.value = q.alternativas[index];
        } else {
            input.value = "";
        }
    });

    // Marcar correta visualmente
    const optionRows = document.querySelectorAll('.option-row');
    optionRows.forEach((row, index) => {
        row.classList.remove('correct');
        row.querySelector('.radio-circle').classList.remove('selected');
        const check = row.querySelector('.material-symbols-outlined');
        if(check) check.remove();

        if(index === q.correta) {
            row.classList.add('correct');
            row.querySelector('.radio-circle').classList.add('selected');
            // Adiciona ícone check
            const icon = document.createElement('span');
            icon.className = 'material-symbols-outlined';
            icon.style.color = '#00e676';
            icon.innerText = 'check_circle';
            row.appendChild(icon);
        }
    });
}

function setupAlternativasVisual() {
    const options = document.querySelectorAll('.option-row');
    options.forEach((opt, index) => {
        opt.onclick = () => {
            // Atualiza visual
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

            // Atualiza objeto em memória
            if(questaoAtual) questaoAtual.correta = index;
        };
    });
}

async function salvarQuestao() {
    if(!questaoAtual) return;
    const btn = document.querySelector('.editor-top .btn-save');
    const txtOriginal = btn.innerText;
    btn.innerText = "Salvando...";
    btn.disabled = true;

    try {
        // 1. Coletar dados do DOM para o objeto
        questaoAtual.enunciado = document.querySelector('textarea.area-large').value;
        questaoAtual.comentario = document.querySelector('textarea.area-medium').value;
        
        const inputsMeta = document.querySelectorAll('.meta-row input');
        questaoAtual.banca = inputsMeta[0] ? inputsMeta[0].value : "";
        questaoAtual.ano = inputsMeta[1] ? inputsMeta[1].value : "";
        
        // Vamos forçar uma matéria padrão ou pegar de algum lugar se você criar um input pra isso
        // Por enquanto, vou definir baseado na banca ou deixar 'Geral'
        if(!questaoAtual.materia) questaoAtual.materia = "Direito Constitucional"; // Exemplo fixo ou criar input

        const novasAlternativas = [];
        document.querySelectorAll('.option-row input').forEach(inp => novasAlternativas.push(inp.value));
        questaoAtual.alternativas = novasAlternativas;

        // 2. Salvar no Firebase
        const collectionRef = collection(db, "users", currentUser.uid, "banco_questoes");
        
        if(questaoAtual.id) {
            // Atualizar existente
            await setDoc(doc(collectionRef, questaoAtual.id), questaoAtual, { merge: true });
        } else {
            // Criar nova (gera ID automático)
            const docRef = doc(collectionRef); // Gera ID
            questaoAtual.id = docRef.id;
            await setDoc(docRef, questaoAtual);
        }

        alert("Questão salva com sucesso!");
        initGerenciadorQuestoes(); // Recarrega lista

    } catch (e) {
        console.error(e);
        alert("Erro ao salvar: " + e.message);
    } finally {
        btn.innerText = txtOriginal;
        btn.disabled = false;
    }
}