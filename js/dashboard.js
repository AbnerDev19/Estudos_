// ARQUIVO: js/dashboard.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Verifica autenticação
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário logado:", user.email);
            carregarUsuario(user);
            // Carrega todos os widgets do dashboard
            await carregarDadosDashboard(user.uid);
        } else {
            // Se não estiver logado, volta pro login
            window.location.href = "index.html";
        }
    });

    // Botão de Logout
    const btnLogout = document.querySelector('.logout-link'); // Ajuste de seletor se necessário
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => window.location.href = "index.html");
        });
    }
    
    // Atualiza a data de hoje no topo
    const hoje = new Date();
    document.getElementById('data-hoje').innerText = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
});

// --- CARREGAR DADOS DO USUÁRIO ---
async function carregarUsuario(user) {
    const nomeExibicao = user.displayName || "Estudante";
    document.getElementById('saudacao').innerText = `Olá, ${nomeExibicao}!`;
}

// --- CARREGAR DADOS DO FIRESTORE ---
async function carregarDadosDashboard(userId) {
    try {
        // 1. Carregar Provas (Mantemos pessoal por enquanto)
        const provasSnapshot = await getDocs(collection(db, "users", userId, "provas"));
        const provas = [];
        provasSnapshot.forEach(doc => provas.push(doc.data()));
        
        // Se estiver vazio, oferece para criar dados iniciais de PROVA (Seed)
        if (provas.length === 0) {
            mostrarBotaoSeed(userId); 
        } else {
            renderizarProvas(provas);
        }

        // 2. Carregar Editais (Pessoal)
        const editaisSnapshot = await getDocs(collection(db, "users", userId, "editais"));
        const editais = [];
        editaisSnapshot.forEach(doc => editais.push(doc.data()));
        renderizarEditais(editais);

        // 3. Carregar Turmas (AGORA GLOBAL)
        // MUDANÇA: Busca da coleção global "turmas" para mostrar as recentes
        const turmasSnapshot = await getDocs(collection(db, "turmas"));
        const turmas = [];
        turmasSnapshot.forEach(doc => {
            // Adiciona ID para o link funcionar
            turmas.push({ id: doc.id, ...doc.data() });
        });
        
        // Exibe apenas as 3 primeiras ou mais recentes
        renderizarTurmas(turmas.slice(0, 3));

        // 4. Carregar Agenda (Pessoal)
        const agendaSnapshot = await getDocs(collection(db, "users", userId, "agenda"));
        const agenda = [];
        agendaSnapshot.forEach(doc => agenda.push(doc.data()));
        renderizarAgenda(agenda);

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}

// --- FUNÇÕES DE RENDERIZAÇÃO (Visual) ---

function renderizarProvas(listaProvas) {
    const container = document.getElementById('container-provas');
    container.innerHTML = '';

    listaProvas.sort((a, b) => new Date(a.data) - new Date(b.data));

    listaProvas.forEach(prova => {
        const diasRestantes = Math.ceil((new Date(prova.data) - new Date()) / (1000 * 60 * 60 * 24));
        const html = `
            <div class="prova-card ${prova.cor || ''}">
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

function renderizarEditais(listaEditais) {
    const container = document.getElementById('container-editais');
    container.innerHTML = '';
    
    if(listaEditais.length === 0) {
        container.innerHTML = '<p style="color:#666">Nenhum edital rastreado.</p>';
        return;
    }

    listaEditais.forEach(edital => {
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

function renderizarTurmas(listaTurmas) {
    const container = document.getElementById('container-turmas');
    container.innerHTML = '';

    if(listaTurmas.length === 0) {
        container.innerHTML = '<p style="color:#666; font-size:0.9rem">Nenhuma turma disponível.</p>';
        return;
    }

    listaTurmas.forEach(turma => {
        // Usa o campo 'focoAtual' como atualização, ou um texto padrão
        const badge = turma.focoAtual 
            ? `<small style="color:#00e676; display:block; font-size:0.75rem; margin-top:2px;">● ${turma.focoAtual}</small>` 
            : '';
            
        // Cria elemento HTML
        const div = document.createElement('div');
        div.className = 'turma-card';
        div.innerHTML = `
            <div class="turma-icon"><span class="material-symbols-outlined">school</span></div>
            <div class="turma-details">
                <h4>${turma.nome}</h4>
                <p>${turma.semanas ? turma.semanas.length + ' Semanas' : 'Novo Curso'}</p>
                ${badge}
            </div>
            <button class="btn-acessar">Acessar</button>
        `;

        // Adiciona evento de clique no botão acessar
        div.querySelector('.btn-acessar').addEventListener('click', () => {
             // Redireciona para a tela de turmas, idealmente passando o ID, 
             // mas como a tela de turmas carrega a lista, vamos apenas redirecionar por enquanto.
             // Melhoria futura: url parameters (?id=...)
             window.location.href = "turmas.html";
        });

        container.appendChild(div);
    });
}

function renderizarAgenda(listaAgenda) {
    const container = document.getElementById('container-agenda');
    container.innerHTML = '';

    if(listaAgenda.length === 0) {
        container.innerHTML = '<li style="color:#666; list-style:none">Nada agendado para hoje.</li>';
        return;
    }

    listaAgenda.sort((a, b) => a.hora.localeCompare(b.hora));

    listaAgenda.forEach(item => {
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

// --- FUNÇÃO AUXILIAR PARA POPULAR BANCO (SEED) ---
// Útil para criar Provas e Agenda de exemplo se a conta for nova
function mostrarBotaoSeed(userId) {
    const container = document.querySelector('.main-content');
    // Verifica se já existe para não duplicar
    if(document.getElementById('btn-seed')) return;

    const btn = document.createElement('button');
    btn.id = 'btn-seed';
    btn.innerText = "⚠️ Clique aqui para criar Dados de Exemplo (Setup Inicial)";
    btn.style.cssText = "background: #ff5252; color: white; border: none; padding: 15px; margin-bottom: 20px; width: 100%; cursor: pointer; font-weight: bold; border-radius: 8px;";
    
    btn.onclick = async () => {
        btn.innerText = "Criando dados... aguarde...";
        await salvarDadosIniciais(userId);
        btn.remove();
        window.location.reload();
    };
    
    container.insertBefore(btn, container.firstChild);
}

async function salvarDadosIniciais(userId) {
    // 1. Provas (Pessoal)
    const provasRef = collection(db, "users", userId, "provas");
    await setDoc(doc(provasRef), { nome: "Polícia Federal", banca: "Cebraspe", data: "2025-08-25", cor: "destaque" });
    await setDoc(doc(provasRef), { nome: "Tribunal de Justiça", banca: "Vunesp", data: "2025-09-10", cor: "" });

    // 2. Editais (Pessoal)
    const editaisRef = collection(db, "users", userId, "editais");
    await setDoc(doc(editaisRef), { titulo: "Direito Constitucional", progresso: 65, total: 120, estudados: 78 });
    await setDoc(doc(editaisRef), { titulo: "Raciocínio Lógico", progresso: 30, total: 80, estudados: 24 });

    // 3. Agenda (Pessoal)
    const agendaRef = collection(db, "users", userId, "agenda");
    await setDoc(doc(agendaRef), { titulo: "Revisão: Crase e Acentos", hora: "08:00 - 09:30", feito: true });
    await setDoc(doc(agendaRef), { titulo: "Bateria de 30 Questões", hora: "19:00 - 20:00", feito: false });

    // NOTA: Não criamos turmas aqui porque elas agora são globais e gerenciadas pelo Admin.
    alert("Dados pessoais criados com sucesso!");
}