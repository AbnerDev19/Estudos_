import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc, getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let editalAtual = null;
let progressoUsuario = {}; // Armazena quais IDs de tópicos foram concluídos

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await initPagina();
        } else {
            window.location.href = "index.html";
        }
    });
});

async function initPagina() {
    // 1. Pegar ID da URL
    const params = new URLSearchParams(window.location.search);
    const idEdital = params.get('id');

    if (!idEdital) {
        alert("Edital não especificado.");
        window.location.href = "editais.html";
        return;
    }

    // 2. Carregar o Edital Global
    const docRef = doc(db, "editais_globais", idEdital);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        document.getElementById('titulo-edital').innerText = "Edital não encontrado";
        return;
    }

    editalAtual = { id: docSnap.id, ...docSnap.data() };

    // 3. Carregar o Progresso do Usuário para este Edital
    // Salvaremos em: users/{uid}/progresso_editais/{editalId}
    const progRef = doc(db, "users", currentUser.uid, "progresso_editais", idEdital);
    const progSnap = await getDoc(progRef);
    
    if(progSnap.exists()) {
        progressoUsuario = progSnap.data().topicosFeitos || {};
    }

    renderizarEdital();
}

function renderizarEdital() {
    // Cabeçalho
    document.getElementById('titulo-edital').innerText = editalAtual.orgao;
    document.getElementById('subtitulo-edital').innerText = `Banca: ${editalAtual.banca} | Cargo: ${editalAtual.cargo}`;

    const container = document.getElementById('conteudo-programatico');
    container.innerHTML = '';

    // Renderiza Matérias
    if(editalAtual.materias) {
        editalAtual.materias.forEach((materia, idxMat) => {
            let topicosHTML = '';
            
            materia.topicos.forEach((topico, idxTop) => {
                // Cria um ID único para o tópico para salvar no banco (ex: mat0_top3)
                const topicId = `m${idxMat}_t${idxTop}`;
                const isDone = progressoUsuario[topicId] === true;
                
                topicosHTML += `
                    <div class="topico-item ${isDone ? 'completed' : ''}" 
                         onclick="toggleTopico('${topicId}', this)">
                        <div class="custom-checkbox" style="${isDone ? 'background-color:var(--primary-blue); border-color:var(--primary-blue)' : ''}">
                            ${isDone ? '<span class="material-symbols-outlined" style="font-size:16px; color: white">check</span>' : ''}
                        </div>
                        <span style="color: #ddd">${topico.nome}</span>
                    </div>
                `;
            });

            container.innerHTML += `
                <div class="materia-container active"> <button class="materia-header" onclick="this.parentElement.classList.toggle('active')">
                        <span>${materia.nome}</span>
                        <span class="material-symbols-outlined">expand_more</span>
                    </button>
                    <div class="topicos-list">
                        ${topicosHTML}
                    </div>
                </div>
            `;
        });
    }
}

// Função Global para o OnClick
window.toggleTopico = async function(topicId, elementoDiv) {
    if(!currentUser || !editalAtual) return;

    // 1. Atualiza Visual
    const isNowDone = !elementoDiv.classList.contains('completed');
    elementoDiv.classList.toggle('completed');
    
    const checkbox = elementoDiv.querySelector('.custom-checkbox');
    if(isNowDone) {
        checkbox.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px; color: white">check</span>';
        checkbox.style.backgroundColor = 'var(--primary-blue)';
        checkbox.style.borderColor = 'var(--primary-blue)';
    } else {
        checkbox.innerHTML = '';
        checkbox.style.backgroundColor = 'transparent';
        checkbox.style.borderColor = 'var(--text-gray)';
    }

    // 2. Atualiza Memória Local
    progressoUsuario[topicId] = isNowDone;

    // 3. Salva no Firebase (Debounce ou direto)
    // users/{uid}/progresso_editais/{editalId} -> { topicosFeitos: { m0_t1: true, ... } }
    try {
        const progRef = doc(db, "users", currentUser.uid, "progresso_editais", editalAtual.id);
        await setDoc(progRef, { 
            topicosFeitos: progressoUsuario,
            ultimoAcesso: new Date().toISOString()
        }, { merge: true });
    } catch (e) {
        console.error("Erro ao salvar progresso", e);
    }
}