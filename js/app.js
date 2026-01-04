// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_ID",
    appId: "SEU_APP_ID"
};

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider(); // Provedor do Google

// --- ELEMENTOS ---
const loginForm = document.getElementById('loginForm');
const btnGoogle = document.getElementById('btn-google');
const msgErro = document.getElementById('msg-erro');
const btnEntrar = document.getElementById('btn-entrar');

// --- LOGIN COM EMAIL/SENHA ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    btnEntrar.innerText = "Verificando...";
    btnEntrar.disabled = true;

    try {
        // await signInWithEmailAndPassword(auth, email, password);
        
        // SIMULAÇÃO
        console.log("Logando com:", email);
        setTimeout(() => {
            alert("Login (Simulado) Bem-sucedido!");
            btnEntrar.innerText = "Entrar na Plataforma";
            btnEntrar.disabled = false;
        }, 1500);

    } catch (error) {
        msgErro.style.display = 'block';
        msgErro.innerText = "Erro ao entrar: " + error.message;
        btnEntrar.innerText = "Entrar na Plataforma";
        btnEntrar.disabled = false;
    }
});

// --- LOGIN COM GOOGLE ---
btnGoogle.addEventListener('click', async () => {
    try {
        // await signInWithPopup(auth, provider);
        alert("Botão do Google Clicado! (Configure o Firebase para funcionar real)");
    } catch (error) {
        console.error(error);
        msgErro.style.display = 'block';
        msgErro.innerText = "Erro no Google: " + error.message;
    }
});

// --- LINK CADASTRO ---
document.getElementById('link-cadastro').addEventListener('click', (e) => {
    e.preventDefault();
    alert("Aqui você levaria o usuário para uma tela igual a esta, mas usando createUserWithEmailAndPassword do Firebase.");
});