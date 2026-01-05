import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let todasQuestoes = [];
let questoesFiltradas = [];
let indiceAtual = 0;
let questaoAtual = null;
let alternativaSelecionada = null;

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await carregarBancoDeQuestoes();
        } else {
            window.location.href = "index.html";
        }
    });

    document.getElementById('btn-filtrar').addEventListener('click', aplicarFiltros);
});

async function carregarBancoDeQuestoes() {
    const area = document.getElementById('questoes-area');
    try {
        // Busca na coleção global criada pelo Admin
        const querySnapshot = await getDocs(collection(db, "banco_questoes"));
        
        todasQuestoes = [];
        querySnapshot.forEach((doc) => {
            todasQuestoes.push({ id: doc.id, ...doc.data() });
        });

        if (todasQuestoes.length === 0) {
            area.innerHTML = '<p style="text-align:center; padding:50px">Nenhuma questão cadastrada pelo Admin ainda.</p>';
            return;
        }

        // Popula os Selects de Filtro
        popularFiltros();
        
        // Inicia com todas
        questoesFiltradas = [...todasQuestoes];
        renderizarQuestao();

    } catch (e) {
        console.error(e);
        area.innerHTML = '<p style="color:red; text-align:center">Erro ao carregar questões.</p>';
    }
}

function popularFiltros() {
    const materias = [...new Set(todasQuestoes.map(q => q.materia || "Geral"))];
    const bancas = [...new Set(todasQuestoes.map(q => q.banca || "Outras"))];

    const selMateria = document.getElementById('filtro-materia');
    const selBanca = document.getElementById('filtro-banca');

    materias.forEach(m => selMateria.innerHTML += `<option value="${m}">${m}</option>`);
    bancas.forEach(b => selBanca.innerHTML += `<option value="${b}">${b}</option>`);
}

function aplicarFiltros() {
    const mat = document.getElementById('filtro-materia').value;
    const ban = document.getElementById('filtro-banca').value;

    questoesFiltradas = todasQuestoes.filter(q => {
        const matchMat = mat ? (q.materia === mat) : true;
        const matchBan = ban ? (q.banca === ban) : true;
        return matchMat && matchBan;
    });

    indiceAtual = 0;
    renderizarQuestao();
}

function renderizarQuestao() {
    const area = document.getElementById('questoes-area');
    alternativaSelecionada = null;

    if (questoesFiltradas.length === 0) {
        area.innerHTML = '<p style="text-align:center; padding:50px">Nenhuma questão encontrada com esses filtros.</p>';
        return;
    }

    if (indiceAtual >= questoesFiltradas.length) {
        area.innerHTML = '<p style="text-align:center; padding:50px; color:#00e676">🎉 Você finalizou todas as questões deste filtro!</p><button class="btn-save" onclick="location.reload()" style="display:block; margin:0 auto">Reiniciar</button>';
        return;
    }

    questaoAtual = questoesFiltradas[indiceAtual];

    // Monta HTML das Alternativas
    let htmlAlternativas = '';
    questaoAtual.alternativas.forEach((texto, idx) => {
        htmlAlternativas += `
            <div class="q-option" onclick="selecionarAlternativa(this, ${idx})">
                <div class="radio-circle" style="width:20px; height:20px; border:2px solid #666; border-radius:50%"></div>
                <span>${texto}</span>
            </div>
        `;
    });

    area.innerHTML = `
        <div class="q-header">
            <div>
                <span class="q-badge">${questaoAtual.materia || 'Geral'}</span>
                <span class="q-badge" style="background:#444">${questaoAtual.banca || 'Banca'}</span>
            </div>
            <span style="color:#666">Questão ${indiceAtual + 1} de ${questoesFiltradas.length}</span>
        </div>
        
        <div class="q-text">${questaoAtual.enunciado}</div>
        
        <div class="q-options" id="lista-opcoes">
            ${htmlAlternativas}
        </div>

        <div class="feedback-area" id="feedback"></div>

        <div style="display:flex; justify-content:space-between">
            <button class="btn-action btn-responder" id="btn-responder" onclick="responderQuestao()">Responder</button>
            <button class="btn-action btn-proxima" id="btn-proxima" onclick="proximaQuestao()" style="display:none">Próxima >></button>
        </div>
    `;
}

// Funções Globais (precisam estar no window pois o HTML é gerado dinamicamente)
window.selecionarAlternativa = function(el, idx) {
    // Se já respondeu, não deixa mudar
    if(document.getElementById('btn-proxima').style.display === 'block') return;

    document.querySelectorAll('.q-option').forEach(op => {
        op.classList.remove('selected');
        op.querySelector('.radio-circle').style.backgroundColor = 'transparent';
        op.querySelector('.radio-circle').style.borderColor = '#666';
    });
    
    el.classList.add('selected');
    el.querySelector('.radio-circle').style.backgroundColor = 'var(--primary-blue)';
    el.querySelector('.radio-circle').style.borderColor = 'var(--primary-blue)';
    
    alternativaSelecionada = idx;
}

window.responderQuestao = async function() {
    if (alternativaSelecionada === null) {
        alert("Selecione uma alternativa!");
        return;
    }

    const opcoes = document.querySelectorAll('.q-option');
    const corretaIndex = parseInt(questaoAtual.correta);
    const feedback = document.getElementById('feedback');
    const btnResponder = document.getElementById('btn-responder');
    const btnProxima = document.getElementById('btn-proxima');

    // Bloqueia botão
    btnResponder.style.display = 'none';
    btnProxima.style.display = 'block';

    let acertou = false;

    // Visual
    if (alternativaSelecionada === corretaIndex) {
        // ACERTOU
        acertou = true;
        opcoes[alternativaSelecionada].classList.add('correct');
        feedback.className = 'feedback-area success';
        feedback.style.display = 'block';
        feedback.innerText = "Parabéns! Você acertou.";
    } else {
        // ERROU
        opcoes[alternativaSelecionada].classList.add('wrong');
        opcoes[corretaIndex].classList.add('correct'); // Mostra a correta
        feedback.className = 'feedback-area error';
        feedback.style.display = 'block';
        feedback.innerText = "Que pena! A resposta correta está destacada.";
    }

    // Se tiver comentário, mostra
    if(questaoAtual.comentario) {
        feedback.innerHTML += `<br><br><strong>Comentário:</strong> ${questaoAtual.comentario}`;
    }

    // --- ATUALIZA ESTATÍSTICAS (PAINEL TÁTICO) ---
    await atualizarEstatisticas(acertou, questaoAtual.materia);
}

window.proximaQuestao = function() {
    indiceAtual++;
    renderizarQuestao();
}

// LÓGICA INTELIGENTE: Atualiza o painel tático em tempo real
async function atualizarEstatisticas(acertou, materia) {
    const userId = auth.currentUser.uid;
    const statsRef = doc(db, "users", userId, "estatisticas", "painel_v2");

    try {
        const docSnap = await getDoc(statsRef);
        let dados = docSnap.exists() ? docSnap.data() : criarDadosZerados();

        // 1. Atualiza Totais
        dados.kpis.questoesResolvidas = (dados.kpis.questoesResolvidas || 0) + 1;
        
        // Lógica de Taxa de Acerto (Simples: Acertos Totais / Questões Totais)
        // Precisamos guardar o número absoluto de acertos para recalcular a porcentagem
        if(!dados.controleInterno) dados.controleInterno = { acertosTotais: 0 };
        
        if (acertou) {
            dados.controleInterno.acertosTotais++;
        }

        const total = dados.kpis.questoesResolvidas;
        const acertos = dados.controleInterno.acertosTotais;
        dados.kpis.taxaAcerto = Math.round((acertos / total) * 100);

        // 2. Atualiza Desempenho por Matéria
        if (!dados.desempenhoPorMateria) dados.desempenhoPorMateria = {};
        if (!dados.controleMateria) dados.controleMateria = {}; // { Portugues: {total: 10, acertos: 5} }

        // Normaliza nome da matéria
        const matKey = materia || "Geral";
        
        if(!dados.controleMateria[matKey]) dados.controleMateria[matKey] = { total: 0, acertos: 0 };
        
        dados.controleMateria[matKey].total++;
        if(acertou) dados.controleMateria[matKey].acertos++;

        // Recalcula % da matéria específica
        const matStats = dados.controleMateria[matKey];
        dados.desempenhoPorMateria[matKey] = Math.round((matStats.acertos / matStats.total) * 100);

        // 3. Atualiza Gráfico de Evolução (Simplificado: adiciona ponto a cada 5 questões para não lotar)
        if (total % 5 === 0) {
            if(!dados.historicoSimulados) dados.historicoSimulados = { labels: [], notas: [] };
            dados.historicoSimulados.labels.push(`Q.${total}`);
            dados.historicoSimulados.notas.push(dados.kpis.taxaAcerto);
            
            // Mantém apenas os últimos 10 pontos
            if(dados.historicoSimulados.labels.length > 10) {
                dados.historicoSimulados.labels.shift();
                dados.historicoSimulados.notas.shift();
            }
        }

        // Salva
        await setDoc(statsRef, dados);
        console.log("Estatísticas atualizadas!");

    } catch (e) {
        console.error("Erro ao salvar stats:", e);
    }
}

function criarDadosZerados() {
    return {
        kpis: { taxaAcerto: 0, questoesResolvidas: 0, horasEstudo: 0, probabilidade: "Calculando..." },
        controleInterno: { acertosTotais: 0 },
        controleMateria: {},
        desempenhoPorMateria: {},
        historicoSimulados: { labels: ['Início'], notas: [0] }
    };
}