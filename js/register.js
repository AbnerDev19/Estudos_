// js/register.js
import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const registerForm = document.getElementById('registerForm');
const msgErro = document.getElementById('msg-erro');
const btnCadastrar = document.getElementById('btn-cadastrar');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        msgErro.style.display = 'block';
        msgErro.innerText = "As senhas não coincidem.";
        return;
    }

    btnCadastrar.innerText = "Criando...";
    btnCadastrar.disabled = true;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Atualiza o nome do usuário
        await updateProfile(userCredential.user, { displayName: nome });
        
        alert("Conta criada! Redirecionando...");
        window.location.href = "dashboard.html";

    } catch (error) {
        msgErro.style.display = 'block';
        if (error.code === 'auth/email-already-in-use') msgErro.innerText = "E-mail já cadastrado.";
        else if (error.code === 'auth/weak-password') msgErro.innerText = "Senha muito fraca (mínimo 6 dígitos).";
        else msgErro.innerText = "Erro: " + error.message;
        
        btnCadastrar.innerText = "Criar Conta";
        btnCadastrar.disabled = false;
    }
});