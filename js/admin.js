import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos Globais
let currentUser = null;
let turmasCarregadas = [];
let questoesCarregadas = [];
let turmaEmEdicao = null;
let questaoAtual = null;

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            // Roteamento simples
            if (document.getElementById('admin-turmas-list')) {
                await initGerenciadorTurmas();
            } else if (document.getElementById('q-editor-title')) {
                await initGerenciadorQuestoes();
            } else if (document.getElementById('lista-alunos-completa')) {
                await initGerenciadorAlunos(); // <--- Agora funciona!
            }
        } else {
            window.location.href = "index.html";
        }
    });

    // Logout
    const linksSair = document.querySelectorAll('a[href="index.html"]');
    linksSair.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => window.location.href = "index.html");
        });
    });
});

// ==========================================================
// MÓDULO 3: GERENCIADOR DE ALUNOS (NOVO)
// ==========================================================
async function initGerenciadorAlunos() {
    const tabela = document.getElementById('lista-alunos-completa');
    const inputBusca = document.getElementById('busca-aluno');

    tabela.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#666">Carregando alunos...</td></tr>';

    try {
        // Busca todos os usuários da coleção 'users'
        // Nota: Só funciona se você salvou o documento do usuário no registro (register.js)
        const querySnapshot = await getDocs(collection(db, "users"));

        let alunos = [];
        querySnapshot.forEach(doc => {
            alunos.push({ id: doc.id, ...doc.data() });
        });

        const render = (lista) => {
            tabela.innerHTML = '';
            if (lista.length === 0) {
                tabela.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px">Nenhum aluno encontrado.</td></tr>';
                return;
            }

            lista.forEach(aluno => {
                // Tenta pegar estatísticas se existirem
                const progresso = aluno.estatisticas?.painel?.kpis?.taxaAcerto || 0;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="display:flex; align-items:center; gap:10px;">
                        <div class="avatar-circle" style="width:30px; height:30px; font-size:0.8rem; background:#333">
                            ${(aluno.nome || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight:600; color:white">${aluno.nome || 'Sem Nome'}</div>
                            <div style="font-size:0.75rem; color:#666">ID: ${aluno.id.substring(0, 6)}...</div>
                        </div>
                    </td>
                    <td>${aluno.email || '---'}</td>
                    <td>
                        <div style="width:100px; height:6px; background:#333; border-radius:3px; overflow:hidden">
                            <div style="width:${progresso}%; height:100%; background:${progresso > 70 ? '#00e676' : '#2962ff'}"></div>
                        </div>
                        <span style="font-size:0.75rem; color:#888">${progresso}% Acertos</span>
                    </td>
                    <td><span style="padding:4px 8px; border-radius:4px; background:rgba(0,230,118,0.1); color:#00e676; font-size:0.8rem">Ativo</span></td>
                    <td style="text-align:right;">
                        <button class="btn-add" style="width:auto; padding:5px 10px; border:1px solid #333" title="Ver Detalhes">
                            <span class="material-symbols-outlined" style="font-size:16px">visibility</span>
                        </button>
                    </td>
                `;
                tabela.appendChild(tr);
            });
        };

        render(alunos);

        // Filtro de Busca
        if (inputBusca) {
            inputBusca.addEventListener('keyup', (e) => {
                const termo = e.target.value.toLowerCase();
                const filtrados = alunos.filter(a =>
                    (a.nome && a.nome.toLowerCase().includes(termo)) ||
                    (a.email && a.email.toLowerCase().includes(termo))
                );
                render(filtrados);
            });
        }

    } catch (e) {
        console.error(e);
        tabela.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ff5252">Erro ao carregar lista. Verifique permissões.</td></tr>';
    }
}

// ==========================================================
// MÓDULO 1: GERENCIADOR DE TURMAS (Mantido igual)
// ==========================================================
// ... (O resto do código de Turmas e Questões continua aqui igual ao anterior) ...
// Para economizar espaço, vou apenas repetir as funções principais se você precisar, 
// mas o ideal é manter o que já tínhamos e adicionar apenas o initGerenciadorAlunos acima.
// Se quiser o arquivo COMPLETO unificado de novo, me avise.

async function initGerenciadorTurmas() {
    // ... Código que já fizemos ...
    const listaContainer = document.getElementById('admin-turmas-list');
    const btnNovaTurma = document.querySelector('.admin-header .btn-save');
    const btnSalvar = document.querySelector('.editor-top .btn-save');
    const btnAddSemana = document.querySelector('.editor-scroll > .btn-add');

    if (btnNovaTurma) btnNovaTurma.onclick = prepararNovaTurma;
    if (btnSalvar) btnSalvar.onclick = salvarEdicaoTurma;
    if (btnAddSemana) btnAddSemana.onclick = adicionarNovaSemana;

    listaContainer.innerHTML = '<p style="color:#666; padding:10px">Carregando...</p>';
    const turmasRef = collection(db, "turmas");
    const snapshot = await getDocs(turmasRef);

    turmasCarregadas = [];
    snapshot.forEach(doc => turmasCarregadas.push({ id: doc.id, ...doc.data() }));

    renderizarListaTurmasAdmin();
    if (turmasCarregadas.length > 0) carregarEditorTurma(turmasCarregadas[0]);
    else prepararNovaTurma();
}

function renderizarListaTurmasAdmin() {
    const lista = document.getElementById('admin-turmas-list');
    lista.innerHTML = '';
    if (turmasCarregadas.length === 0) {
        lista.innerHTML = '<p style="padding:15px; color:#666">Vazio.</p>'; return;
    }
    turmasCarregadas.forEach((turma) => {
        const item = document.createElement('div');
        item.className = 'turma-item';
        if (turmaEmEdicao && turma.id === turmaEmEdicao.id) item.classList.add('active');
        item.innerHTML = `<span>${turma.nome}</span><span class="material-symbols-outlined" style="font-size:16px">chevron_right</span>`;
        item.onclick = () => {
            document.querySelectorAll('.turma-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            carregarEditorTurma(turma);
        };
        lista.appendChild(item);
    });
}

function prepararNovaTurma() {
    turmaEmEdicao = { id: null, nome: "Nova Turma", focoAtual: "", semanas: [] };
    document.getElementById('editor-turma-nome').innerText = "Criando Nova Turma";
    const inputs = document.querySelectorAll('.editor-scroll .input-group input');
    if (inputs[0]) inputs[0].value = "";
    if (inputs[1]) inputs[1].value = "";
    renderizarSemanasNoEditor();
    document.querySelectorAll('.turma-item').forEach(i => i.classList.remove('active'));
}

function carregarEditorTurma(turma) {
    turmaEmEdicao = turma;
    document.getElementById('editor-turma-nome').innerText = `Editando: ${turma.nome}`;
    const inputs = document.querySelectorAll('.editor-scroll .input-group input');
    if (inputs[0]) inputs[0].value = turma.nome || "";
    if (inputs[1]) inputs[1].value = turma.focoAtual || "";
    renderizarSemanasNoEditor();
}

function renderizarSemanasNoEditor() {
    const container = document.querySelector('.editor-scroll');
    const hr = container.querySelector('hr');
    if (!hr) return;
    let next = hr.nextElementSibling;
    while (next) { const rm = next; next = next.nextElementSibling; rm.remove(); }

    const h3 = document.createElement('h3');
    h3.style.cssText = "color:white; margin:20px 0 15px 0"; h3.innerText = "Cronograma";
    container.appendChild(h3);

    if (turmaEmEdicao && turmaEmEdicao.semanas) {
        turmaEmEdicao.semanas.forEach((sem, idx) => renderizarBlocoSemana(container, sem, idx));
    }

    const btn = document.createElement('button');
    btn.className = 'btn-add'; btn.innerText = "+ Nova Semana";
    btn.style.marginTop = "10px"; btn.onclick = adicionarNovaSemana;
    container.appendChild(btn);
}

function adicionarNovaSemana() {
    if (!turmaEmEdicao.semanas) turmaEmEdicao.semanas = [];
    turmaEmEdicao.semanas.push({ titulo: `Semana ${turmaEmEdicao.semanas.length + 1}`, dias: [] });
    renderizarSemanasNoEditor();
}

function renderizarBlocoSemana(container, semana, idx) {
    const div = document.createElement('div');
    div.className = 'week-block';

    let tarefasHTML = '';
    if (semana.dias) {
        semana.dias.forEach(dia => {
            if (dia.tarefas) dia.tarefas.forEach(t => {
                tarefasHTML += `<div class="task-row"><input class="dark-input" value="${t.texto}" onchange="atualizarTarefaTexto(${idx}, '${dia.nome}', '${t.texto}', this.value)"></div>`;
            });
        });
    }

    div.innerHTML = `<div class="week-title-bar"><span>${semana.titulo}</span><span class="material-symbols-outlined icon-btn" onclick="removerSemana(${idx})">delete</span></div><div class="week-body">${tarefasHTML}<button class="btn-add" onclick="adicionarTarefaExemplo(${idx})">+ Tarefa</button></div>`;
    container.appendChild(div);
}

// Funções Globais Auxiliares
window.adicionarTarefaExemplo = function (idx) {
    if (!turmaEmEdicao.semanas[idx].dias) turmaEmEdicao.semanas[idx].dias = [];
    let dia = turmaEmEdicao.semanas[idx].dias.find(d => d.nome === "Segunda");
    if (!dia) { dia = { nome: "Segunda", tarefas: [] }; turmaEmEdicao.semanas[idx].dias.push(dia); }
    dia.tarefas.push({ texto: "Nova Tarefa", materia: "Geral" });
    renderizarSemanasNoEditor();
}
window.removerSemana = function (idx) {
    if (confirm("Apagar semana?")) { turmaEmEdicao.semanas.splice(idx, 1); renderizarSemanasNoEditor(); }
}
window.atualizarTarefaTexto = function (idx, diaNome, textoAnt, novoTexto) {
    const dia = turmaEmEdicao.semanas[idx].dias.find(d => d.nome === diaNome);
    const tar = dia.tarefas.find(t => t.texto === textoAnt);
    if (tar) tar.texto = novoTexto;
}

async function salvarEdicaoTurma() {
    const inputs = document.querySelectorAll('.editor-scroll .input-group input');
    turmaEmEdicao.nome = inputs[0].value;
    turmaEmEdicao.focoAtual = inputs[1].value;

    const ref = collection(db, "turmas");
    if (turmaEmEdicao.id) await setDoc(doc(ref, turmaEmEdicao.id), turmaEmEdicao, { merge: true });
    else { const d = doc(ref); turmaEmEdicao.id = d.id; await setDoc(d, turmaEmEdicao); }

    alert("Salvo!");
    initGerenciadorTurmas();
}

// ==========================================================
// MÓDULO 2: GERENCIADOR DE QUESTÕES (Simplificado para caber)
// ==========================================================
async function initGerenciadorQuestoes() {
    const list = document.querySelector('.list-scroll');
    const btnNew = document.querySelector('.admin-header .btn-save');
    const btnSave = document.querySelector('.editor-top .btn-save');

    if (btnNew) btnNew.onclick = prepararNovaQuestao;
    if (btnSave) btnSave.onclick = salvarQuestao;

    list.innerHTML = 'Carregando...';
    const snap = await getDocs(collection(db, "banco_questoes"));
    questoesCarregadas = [];
    snap.forEach(d => questoesCarregadas.push({ id: d.id, ...d.data() }));

    list.innerHTML = '';
    questoesCarregadas.forEach(q => {
        const div = document.createElement('div');
        div.className = 'sub-item';
        div.innerText = (q.enunciado || '').substring(0, 30) + '...';
        div.onclick = () => carregarQuestaoNoEditor(q);
        list.appendChild(div);
    });
}

function prepararNovaQuestao() {
    questaoAtual = { id: null, enunciado: "", alternativas: ["", "", "", ""], correta: 0 };
    carregarQuestaoNoEditor(questaoAtual);
}

function carregarQuestaoNoEditor(q) {
    questaoAtual = q;
    document.querySelector('textarea.area-large').value = q.enunciado || "";
    const opts = document.querySelectorAll('.option-row input');
    opts.forEach((inp, i) => inp.value = q.alternativas[i] || "");
    // Atualiza visual da correta (simplificado)
    document.querySelectorAll('.radio-circle').forEach((c, i) => {
        c.style.background = (i == q.correta) ? '#00e676' : 'transparent';
        c.parentElement.onclick = () => {
            questaoAtual.correta = i;
            carregarQuestaoNoEditor(questaoAtual); // Redesenha
        }
    });
}

async function salvarQuestao() {
    questaoAtual.enunciado = document.querySelector('textarea.area-large').value;
    const opts = document.querySelectorAll('.option-row input');
    questaoAtual.alternativas = [opts[0].value, opts[1].value, opts[2].value, opts[3].value];

    const ref = collection(db, "banco_questoes");
    if (questaoAtual.id) await setDoc(doc(ref, questaoAtual.id), questaoAtual, { merge: true });
    else { const d = doc(ref); questaoAtual.id = d.id; await setDoc(d, questaoAtual); }
    alert("Questão Salva!");
    initGerenciadorQuestoes();
}