// ARQUIVO: js/app.js
import { auth, db, provider } from './firebase-config.js';
import { signInWithEmailAndPassword, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginForm = document.getElementById('loginForm');
const btnGoogle = document.getElementById('btn-google');
const msgErro = document.getElementById('msg-erro');
const btnEntrar = document.getElementById('btn-entrar');

// Função auxiliar para redirecionar baseado no CARGO (Role)
async function redirecionarUsuario(user) {
    try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const dados = docSnap.data();
            
            // VERIFICAÇÃO DE CARGO
            if (dados.role === 'admin') {
                window.location.href = "admin_dashboard.html";
            } else {
                window.location.href = "dashboard.html";
            }
        } else {
            // Se o usuário existe no Auth mas não no Banco (ex: login antigo)
            // Mandamos para o dashboard de aluno por segurança
            window.location.href = "dashboard.html";
        }
    } catch (e) {
        console.error("Erro ao verificar cargo:", e);
        // Em caso de erro crítico, manda para o aluno
        window.location.href = "dashboard.html";
    }
}

// --- LOGIN EMAIL/SENHA ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    btnEntrar.innerText = "Verificando...";
    btnEntrar.disabled = true;
    msgErro.style.display = 'none';

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await redirecionarUsuario(userCredential.user);
    } catch (error) {
        btnEntrar.innerText = "Entrar na Plataforma";
        btnEntrar.disabled = false;
        msgErro.style.display = 'block';
        msgErro.innerText = "E-mail ou senha incorretos.";
    }
});

// --- LOGIN GOOGLE ---
btnGoogle.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        await redirecionarUsuario(result.user);
    } catch (error) {
        alert("Erro no Google: " + error.message);
    }
});