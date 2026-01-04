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
            carregarDadosDashboard(user.uid);
        } else {
            // Se não estiver logado, volta pro login
            window.location.href = "index.html";
        }
    });

    // Botão de Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            signOut(auth).then(() => window.location.href = "index.html");
        });
    }
    
    // Atualiza a data de hoje no topo
    const hoje = new Date();
    document.getElementById('data-hoje').innerText = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
});

// --- CARREGAR DADOS DO USUÁRIO ---
async function carregarUsuario(user) {
    // Tenta pegar o nome do perfil do Auth, ou busca no banco se tiver salvo extra
    const nomeExibicao = user.displayName || "Estudante";
    document.getElementById('saudacao').innerText = `Olá, ${nomeExibicao}!`;
}

// --- CARREGAR DADOS DO FIRESTORE ---
async function carregarDadosDashboard(userId) {
    try {
        // 1. Carregar Provas (Coleção Global ou do Usuário)
        // Para este exemplo, vamos criar uma coleção 'provas' dentro do usuário para ser personalizado
        const provasSnapshot = await getDocs(collection(db, "users", userId, "provas"));
        const provas = [];
        provasSnapshot.forEach(doc => provas.push(doc.data()));
        
        // Se estiver vazio, oferece para criar dados iniciais (Seed)
        if (provas.length === 0) {
            mostrarBotaoSeed(userId); // Função auxiliar para facilitar seus testes
        } else {
            renderizarProvas(provas);
        }

        // 2. Carregar Editais
        const editaisSnapshot = await getDocs(collection(db, "users", userId, "editais"));
        const editais = [];
        editaisSnapshot.forEach(doc => editais.push(doc.data()));
        renderizarEditais(editais);

        // 3. Carregar Turmas
        const turmasSnapshot = await getDocs(collection(db, "users", userId, "minhas_turmas"));
        const turmas = [];
        turmasSnapshot.forEach(doc => turmas.push(doc.data()));
        renderizarTurmas(turmas);

        // 4. Carregar Agenda
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

    // Ordena por data (mais próxima primeiro)
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

    listaTurmas.forEach(turma => {
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

function renderizarAgenda(listaAgenda) {
    const container = document.getElementById('container-agenda');
    container.innerHTML = '';

    // Ordena por hora
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
// Aparece apenas se não houver dados, para facilitar seu setup inicial
function mostrarBotaoSeed(userId) {
    const container = document.querySelector('.main-content');
    const btn = document.createElement('button');
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
    // 1. Provas
    const provasRef = collection(db, "users", userId, "provas");
    await setDoc(doc(provasRef), { nome: "Polícia Federal", banca: "Cebraspe", data: "2025-08-25", cor: "destaque" });
    await setDoc(doc(provasRef), { nome: "Tribunal de Justiça", banca: "Vunesp", data: "2025-09-10", cor: "" });

    // 2. Editais
    const editaisRef = collection(db, "users", userId, "editais");
    await setDoc(doc(editaisRef), { titulo: "Direito Constitucional", progresso: 65, total: 120, estudados: 78 });
    await setDoc(doc(editaisRef), { titulo: "Raciocínio Lógico", progresso: 30, total: 80, estudados: 24 });

    // 3. Turmas
    const turmasRef = collection(db, "users", userId, "minhas_turmas");
    await setDoc(doc(turmasRef), { materia: "Turma de Elite: Policial", professor: "Equipe Alfa", atualizacao: "Nova aula de Penal" });
    await setDoc(doc(turmasRef), { materia: "Informática do Zero", professor: "Prof. Raniere", atualizacao: "PDF Disponível" });

    // 4. Agenda
    const agendaRef = collection(db, "users", userId, "agenda");
    await setDoc(doc(agendaRef), { titulo: "Revisão: Crase e Acentos", hora: "08:00 - 09:30", feito: true });
    await setDoc(doc(agendaRef), { titulo: "Bateria de 30 Questões", hora: "19:00 - 20:00", feito: false });

    alert("Dados criados com sucesso! O sistema agora está funcional.");
}