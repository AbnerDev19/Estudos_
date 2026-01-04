// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- CONFIGURAÇÃO DO FIREBASE (Usaremos a mesma em todos os arquivos) ---
const firebaseConfig = {
    // Suas chaves virão aqui depois
    apiKey: "SUA_API_KEY",
    authDomain: "...",
    // ... resto das chaves
};

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();

// --- ELEMENTOS ---
const registerForm = document.getElementById('registerForm');
const msgErro = document.getElementById('msg-erro');
const btnCadastrar = document.getElementById('btn-cadastrar');
const btnGoogle = document.getElementById('btn-google');

// --- LÓGICA DE CADASTRO ---
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgErro.style.display = 'none';

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // 1. Validação local: Senhas iguais?
    if (password !== confirmPassword) {
        msgErro.style.display = 'block';
        msgErro.innerText = "As senhas não coincidem.";
        return;
    }

    // 2. Feedback visual
    btnCadastrar.innerText = "Criando conta...";
    btnCadastrar.disabled = true;

    try {
        // --- AQUI SERÁ A CRIAÇÃO REAL NO FIREBASE ---
        /*
        // Cria o usuário
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Atualiza o perfil com o Nome
        await updateProfile(user, {
            displayName: nome
        });

        // Redireciona
        window.location.href = "feed.html";
        */

        // SIMULAÇÃO
        console.log("Cadastrando:", nome, email);
        setTimeout(() => {
            alert(`Conta criada com sucesso para ${nome}! Redirecionando ao login...`);
            window.location.href = "index.html"; // Volta pro login após cadastrar
        }, 2000);

    } catch (error) {
        console.error(error);
        msgErro.style.display = 'block';
        
        // Tratamento de erros comuns do Firebase (exemplo)
        if (error.code === 'auth/email-already-in-use') {
            msgErro.innerText = "Este e-mail já está cadastrado.";
        } else if (error.code === 'auth/weak-password') {
            msgErro.innerText = "A senha é muito fraca.";
        } else {
            msgErro.innerText = "Erro ao cadastrar: " + error.message;
        }

        btnCadastrar.innerText = "Criar Conta";
        btnCadastrar.disabled = false;
    }
});

// --- CADASTRO COM GOOGLE (Mesma lógica do Login) ---
btnGoogle.addEventListener('click', async () => {
   alert("Cadastro com Google (Simulação). Se a conta não existir, o Firebase cria automaticamente.");
   // O código real é igual ao do login: await signInWithPopup(auth, provider);
});