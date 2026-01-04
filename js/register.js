// ARQUIVO: js/register.js
import { auth } from './firebase-config.js'; // Importa a conexão real
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

    // 1. Validação local: Senhas iguais?
    if (password !== confirmPassword) {
        msgErro.style.display = 'block';
        msgErro.innerText = "As senhas não coincidem.";
        return;
    }

    btnCadastrar.innerText = "Criando conta...";
    btnCadastrar.disabled = true;

    try {
        // 2. Cria o usuário no Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. Atualiza o perfil com o Nome digitado
        await updateProfile(user, {
            displayName: nome
        });

        console.log("Usuário criado:", user.email);
        
        alert(`Conta criada com sucesso! Bem-vindo(a), ${nome}.`);
        window.location.href = "dashboard.html"; // Redireciona para o painel

    } catch (error) {
        console.error(error);
        msgErro.style.display = 'block';

        // Tratamento de erros comuns
        if (error.code === 'auth/email-already-in-use') {
            msgErro.innerText = "Este e-mail já está sendo usado.";
        } else if (error.code === 'auth/weak-password') {
            msgErro.innerText = "A senha deve ter pelo menos 6 caracteres.";
        } else if (error.code === 'auth/invalid-email') {
            msgErro.innerText = "E-mail inválido.";
        } else {
            msgErro.innerText = "Erro ao cadastrar: " + error.message;
        }

        btnCadastrar.innerText = "Criar Conta";
        btnCadastrar.disabled = false;
    }
});