// js/app.js
import { auth, provider } from './firebase-config.js'; // Importa do central
import { signInWithEmailAndPassword, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const btnGoogle = document.getElementById('btn-google');
const msgErro = document.getElementById('msg-erro');
const btnEntrar = document.getElementById('btn-entrar');

// Login Email/Senha
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    btnEntrar.innerText = "Entrando...";
    btnEntrar.disabled = true;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Verifica se é o admin (simulação simples por email)
        if(email === "admin@portal.com") {
            window.location.href = "admin_dashboard.html";
        } else {
            window.location.href = "dashboard.html";
        }

    } catch (error) {
        console.error(error);
        msgErro.style.display = 'block';
        msgErro.innerText = "Email ou senha incorretos.";
        btnEntrar.innerText = "Entrar na Plataforma";
        btnEntrar.disabled = false;
    }
});

// Login Google
btnGoogle.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
        window.location.href = "dashboard.html";
    } catch (error) {
        alert("Erro no Google: " + error.message);
    }
});