import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await carregarEstatisticasGerais();
        } else {
            window.location.href = "index.html";
        }
    });
});

async function carregarEstatisticasGerais() {
    try {
        // 1. Contar Alunos (Users)
        // Nota: O Firebase Client SDK não lista todos usuários de Auth, 
        // mas podemos contar documentos na coleção 'users' se você salvou eles lá no cadastro.
        const collUsers = collection(db, "users");
        const snapshotUsers = await getCountFromServer(collUsers);
        document.getElementById('total-alunos').innerText = snapshotUsers.data().count;

        // 2. Contar Questões
        const collQuest = collection(db, "banco_questoes");
        const snapshotQuest = await getCountFromServer(collQuest);
        document.getElementById('total-questoes').innerText = snapshotQuest.data().count;

        // 3. Contar Turmas
        const collTurmas = collection(db, "turmas");
        const snapshotTurmas = await getCountFromServer(collTurmas);
        document.getElementById('total-turmas').innerText = snapshotTurmas.data().count;

    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        // Em caso de erro (ex: permissão), deixa traços
    }
}