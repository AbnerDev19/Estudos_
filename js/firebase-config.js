// ARQUIVO: js/firebase-config.js

// Importações via CDN (Compatível com Vercel/Navegador sem build)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Suas chaves de configuração do Projeto Portal Estudos
const firebaseConfig = {
  apiKey: "AIzaSyDoOLW8nOf3QNRsNicQOBHJHBpwPx2zQ0g",
  authDomain: "portal-estudos-db64b.firebaseapp.com",
  projectId: "portal-estudos-db64b",
  storageBucket: "portal-estudos-db64b.firebasestorage.app",
  messagingSenderId: "787608798940",
  appId: "1:787608798940:web:8a101df4522fccd3871619",
  measurementId: "G-06PJS1J08E"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();

// Exporta para ser usado nos outros arquivos (app.js, register.js, etc)
export { auth, db, provider, analytics };