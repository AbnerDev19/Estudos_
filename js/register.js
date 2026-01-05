// ARQUIVO: js/register.js
import { auth, db } from './firebase-config.js'; 
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const registerForm = document.getElementById('registerForm');
const msgErro = document.getElementById('msg-erro');
const btnCadastrar = document.getElementById('btn-cadastrar');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgErro.style.display = 'none';

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        msgErro.style.display = 'block';
        msgErro.innerText = "As senhas não coincidem.";
        return;
    }

    btnCadastrar.innerText = "Criando conta...";
    btnCadastrar.disabled = true;

    try {
        // 1. Cria o usuário
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Define o nome
        await updateProfile(user, { displayName: nome });

        // 3. Cria o documento do aluno no banco (Necessário para o Painel Tático funcionar)
        await setDoc(doc(db, "users", user.uid), {
            nome: nome,
            email: email,
            dataCadastro: new Date().toISOString(),
            // Inicializa stats zerados
            estatisticas: { 
                painel_v2: {
                    kpis: { taxaAcerto: 0, questoesResolvidas: 0 },
                    historicoSimulados: { labels: ['Início'], notas: [0] }
                }
            }
        });

        alert("Conta criada com sucesso!");
        window.location.href = "dashboard.html"; // Todo cadastro novo vai pro painel de aluno

    } catch (error) {
        console.error(error);
        msgErro.style.display = 'block';
        msgErro.innerText = "Erro: " + error.message;
        btnCadastrar.innerText = "Criar Conta";
        btnCadastrar.disabled = false;
    }
});