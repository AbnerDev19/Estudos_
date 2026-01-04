// ARQUIVO: js/app.js
import { auth, provider } from './firebase-config.js'; // Importa a conexão real
import { signInWithEmailAndPassword, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const btnGoogle = document.getElementById('btn-google');
const msgErro = document.getElementById('msg-erro');
const btnEntrar = document.getElementById('btn-entrar');

// --- LOGIN COM EMAIL E SENHA ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Feedback visual para o usuário saber que algo está acontecendo
    btnEntrar.innerText = "Entrando...";
    btnEntrar.disabled = true;
    msgErro.style.display = 'none';

    try {
        // Tenta fazer o login no Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log("Login realizado com sucesso:", user.email);

        // Lógica simples de redirecionamento (Admin vs Aluno)
        if(email === "admin@portal.com") {
            window.location.href = "admin_dashboard.html";
        } else {
            window.location.href = "dashboard.html";
        }

    } catch (error) {
        console.error("Erro no login:", error);
        msgErro.style.display = 'block';
        
        // Mensagens de erro amigáveis em português
        if(error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            msgErro.innerText = "E-mail ou senha incorretos.";
        } else if (error.code === 'auth/too-many-requests') {
            msgErro.innerText = "Muitas tentativas. Tente novamente mais tarde.";
        } else {
            msgErro.innerText = "Erro ao entrar: " + error.message;
        }

        // Reseta o botão se der erro
        btnEntrar.innerText = "Entrar na Plataforma";
        btnEntrar.disabled = false;
    }
});

// --- LOGIN COM GOOGLE ---
btnGoogle.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
        // Se der certo, o Firebase já autentica e podemos redirecionar
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error(error);
        alert("Erro ao entrar com Google: " + error.message);
    }
});