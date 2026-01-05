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
        // 1. Cria autenticação (Email/Senha)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Atualiza nome no Auth
        await updateProfile(user, { displayName: nome });

        // 3. CRIA O DOCUMENTO DO USUÁRIO NO FIRESTORE COM O CARGO
        // Isso é crucial para a personalização e segurança
        await setDoc(doc(db, "users", user.uid), {
            nome: nome,
            email: email,
            role: "student", // <--- Todo mundo nasce aluno
            dataCadastro: new Date().toISOString(),
            estatisticas: { // Inicializa stats vazios para não dar erro no painel
                painel_v2: {
                    kpis: { taxaAcerto: 0, questoesResolvidas: 0 },
                    historicoSimulados: { labels: ['Início'], notas: [0] }
                }
            }
        });

        alert(`Conta criada com sucesso! Bem-vindo(a), ${nome}.`);
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error(error);
        msgErro.style.display = 'block';
        if (error.code === 'auth/email-already-in-use') {
            msgErro.innerText = "Este e-mail já está em uso.";
        } else {
            msgErro.innerText = "Erro: " + error.message;
        }
        btnCadastrar.innerText = "Criar Conta";
        btnCadastrar.disabled = false;
    }
});