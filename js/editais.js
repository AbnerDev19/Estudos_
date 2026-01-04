import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db_editais as dadosIniciais } from './db_editais.js';

const container = document.getElementById('lista-editais');

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await carregarEditais(user.uid);
        } else {
            window.location.href = "index.html";
        }
    });
});

async function carregarEditais(userId) {
    container.innerHTML = '<p style="color:#aaa; text-align:center">Carregando editais...</p>';
    
    const editaisRef = collection(db, "users", userId, "meus_editais_detalhado");
    const snapshot = await getDocs(editaisRef);
    let editaisReais = [];

    if (snapshot.empty) {
        console.log("Criando editais iniciais...");
        for (const edital of dadosIniciais) {
            await setDoc(doc(editaisRef, String(edital.id)), edital);
            editaisReais.push(edital);
        }
    } else {
        snapshot.forEach(doc => editaisReais.push(doc.data()));
    }

    renderizarCards(editaisReais);
}

function renderizarCards(editais) {
    container.innerHTML = '';
    
    editais.forEach(edital => {
        const statusClass = edital.aberto ? 'status-open' : 'status-closed';
        const statusText = edital.aberto ? 'Aberto' : 'Previsto';

        container.innerHTML += `
            <div class="catalog-card" onclick="window.location.href='editais-detalhe.html?id=${edital.id}'">
                <span class="status-badge ${statusClass}">${statusText}</span>
                <h3 style="color:white; margin-top:10px">${edital.orgao}</h3>
                <p style="color:var(--primary-blue); font-size:0.9rem; margin-bottom:1rem">${edital.banca}</p>
                
                <div style="display:flex; gap:10px; margin-bottom:1rem">
                    <small style="color:#aaa">📅 Prova: ${edital.dataProva}</small>
                </div>

                <div class="progress-container">
                    <div class="progress-bar" style="width: ${edital.progressoGeral}%"></div>
                </div>
                <span class="progress-text">${edital.progressoGeral}% Concluído</span>
            </div>
        `;
    });
}