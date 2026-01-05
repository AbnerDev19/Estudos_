// ARQUIVO: js/app.js
import { auth, provider } from './firebase-config.js';
import { signInWithEmailAndPassword, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const btnGoogle = document.getElementById('btn-google');
const msgErro = document.getElementById('msg-erro');
const btnEntrar = document.getElementById('btn-entrar');

// --- LISTA DE PROFESSORES/ADMINS ---
// Coloque aqui o SEU email e de quem mais for professor
const ADMIN_EMAILS = [
    "abneroliveira19072004@gmail.com", 
    "abner@exemplo.com", 
    "professor@escola.com" 
];

// Função simples de redirecionamento
function redirecionar(user) {
    console.log("Verificando acesso para:", user.email);
    
    // Verifica se o email está na lista de admins
    if (ADMIN_EMAILS.includes(user.email)) {
        console.log("É Admin!");
        window.location.href = "admin_dashboard.html";
    } else {
        console.log("É Aluno!");
        window.location.href = "dashboard.html";
    }
}

// --- LOGIN EMAIL/SENHA ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    btnEntrar.innerText = "Entrando...";
    btnEntrar.disabled = true;
    msgErro.style.display = 'none';

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        redirecionar(userCredential.user);
    } catch (error) {
        console.error(error);
        btnEntrar.innerText = "Acessar Painel";
        btnEntrar.disabled = false;
        msgErro.style.display = 'block';
        
        if(error.code === 'auth/invalid-credential') {
            msgErro.innerText = "Email ou senha incorretos.";
        } else {
            msgErro.innerText = "Erro: " + error.message;
        }
    }
});

// --- LOGIN GOOGLE ---
btnGoogle.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        redirecionar(result.user);
    } catch (error) {
        console.error(error);
        alert("Erro no Google: " + error.message);
    }
});