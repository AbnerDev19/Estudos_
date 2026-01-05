import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db_editais } from './db_editais.js'; // Dados iniciais para popular o banco

const container = document.getElementById('lista-editais');

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await carregarEditaisGlobais();
        } else {
            window.location.href = "index.html";
        }
    });
});

async function carregarEditaisGlobais() {
    container.innerHTML = '<p style="color:#aaa; text-align:center">Carregando editais...</p>';
    
    // 1. Busca na coleção GLOBAL "editais_globais"
    const editaisRef = collection(db, "editais_globais");
    const snapshot = await getDocs(editaisRef);
    let editaisReais = [];

    if (snapshot.empty) {
        console.log("Banco vazio. Criando editais de exemplo...");
        // SEED: Se não tiver nada, cria os dados do db_editais.js no Firestore
        for (const edital of db_editais) {
            // Removemos ID numérico para deixar o Firestore gerar ou usamos string
            const idString = String(edital.id); 
            await setDoc(doc(editaisRef, idString), edital);
            editaisReais.push({ id: idString, ...edital });
        }
        alert("Editais de exemplo criados no banco de dados!");
    } else {
        snapshot.forEach(doc => {
            editaisReais.push({ id: doc.id, ...doc.data() });
        });
    }

    renderizarCards(editaisReais);
}

function renderizarCards(editais) {
    container.innerHTML = '';
    
    editais.forEach(edital => {
        const statusClass = edital.aberto ? 'status-open' : 'status-closed';
        const statusText = edital.aberto ? 'Aberto' : 'Previsto';
        
        // Dados visuais
        const progresso = edital.progressoGeral || 0;

        container.innerHTML += `
            <div class="catalog-card" onclick="window.location.href='editais-detalhe.html?id=${edital.id}'">
                <span class="status-badge ${statusClass}">${statusText}</span>
                <h3 style="color:white; margin-top:10px">${edital.orgao}</h3>
                <p style="color:var(--primary-blue); font-size:0.9rem; margin-bottom:1rem">${edital.banca || 'Banca não def.'}</p>
                
                <div style="display:flex; gap:10px; margin-bottom:1rem">
                    <small style="color:#aaa">📅 Prova: ${edital.dataProva || 'A definir'}</small>
                </div>

                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progresso}%"></div>
                </div>
                <span class="progress-text">${progresso}% Concluído (Geral)</span>
            </div>
        `;
    });
}