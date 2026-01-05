import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Variáveis Globais dos Gráficos
let chartEvolucao = null;
let chartRadar = null;

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await carregarDadosTaticos(user.uid);
        } else {
            window.location.href = "index.html";
        }
    });
});

async function carregarDadosTaticos(userId) {
    // IMPORTANTE: Mudei para 'painel_v2' para forçar um reset nos dados antigos
    const statsRef = doc(db, "users", userId, "estatisticas", "painel_v2");
    const docSnap = await getDoc(statsRef);

    let dados;

    if (docSnap.exists()) {
        dados = docSnap.data();
    } else {
        // Cria dados ZERADOS na primeira vez
        console.log("Inicializando painel zerado...");
        dados = gerarDadosIniciais();
        await setDoc(statsRef, dados);
    }

    atualizarKPIs(dados.kpis);
    renderizarGraficoEvolucao(dados.historicoSimulados);
    renderizarGraficoRadar(dados.desempenhoPorMateria);
    renderizarMatrizTatica(dados.desempenhoPorMateria);
}

function gerarDadosIniciais() {
    return {
        kpis: {
            taxaAcerto: 0,
            questoesResolvidas: 0,
            horasEstudo: 0,
            probabilidade: "Calculando..."
        },
        // Gráfico inicial simples
        historicoSimulados: {
            labels: ['Início'],
            notas: [0]
        },
        // Matérias zeradas
        desempenhoPorMateria: {
            "Português": 0,
            "Matemática": 0,
            "Informática": 0,
            "Direito": 0,
            "Legislação": 0
        }
    };
}

// --- 1. ATUALIZAR INDICADORES (KPIs) ---
function atualizarKPIs(kpis) {
    const cards = document.querySelectorAll('.kpi-card');
    
    // 1. Taxa de Acerto
    cards[0].querySelector('.kpi-value').innerText = `${kpis.taxaAcerto}%`;
    
    // 2. Questões Resolvidas
    cards[1].querySelector('.kpi-value').innerText = kpis.questoesResolvidas;
    
    // 3. Horas de Estudo
    cards[2].querySelector('.kpi-value').innerText = `${kpis.horasEstudo}h`;
    
    // 4. Probabilidade
    const probElement = cards[3].querySelector('.kpi-value');
    probElement.innerText = kpis.probabilidade;
    
    // Estilo neutro se for "Calculando..."
    cards[3].className = 'kpi-card'; 
    cards[3].style.borderColor = 'rgba(255,255,255,0.05)';
    probElement.style.color = 'white';

    if(kpis.probabilidade === 'Alta') {
        cards[3].classList.add('highlight');
        cards[3].style.borderColor = '#00e676';
        probElement.style.color = '#00e676';
    } else if (kpis.probabilidade === 'Baixa') {
        cards[3].style.borderColor = '#ff5252';
        probElement.style.color = '#ff5252';
    }
}

// --- 2. GRÁFICO DE LINHA (EVOLUÇÃO) ---
function renderizarGraficoEvolucao(historico) {
    const ctx = document.getElementById('evolutionChart').getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(41, 98, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(41, 98, 255, 0.0)');

    if(chartEvolucao) chartEvolucao.destroy();

    chartEvolucao = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historico.labels,
            datasets: [{
                label: 'Nota Média (%)',
                data: historico.notas,
                borderColor: '#2962ff',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#2962ff',
                pointRadius: 5,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    titleColor: '#fff',
                    bodyColor: '#ccc',
                    borderColor: '#333'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#888' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#888' }
                }
            }
        }
    });
}

// --- 3. GRÁFICO DE RADAR (COMPETÊNCIAS) ---
function renderizarGraficoRadar(materiasObj) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    const labels = Object.keys(materiasObj);
    const data = Object.values(materiasObj);

    if(chartRadar) chartRadar.destroy();

    chartRadar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Domínio Atual',
                data: data,
                backgroundColor: 'rgba(0, 230, 118, 0.2)',
                borderColor: '#00e676',
                pointBackgroundColor: '#00e676',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#00e676'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { color: '#aaa', font: { size: 11 } },
                    ticks: { display: false, backdropColor: 'transparent' },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// --- 4. MATRIZ TÁTICA (LISTAS DINÂMICAS) ---
function renderizarMatrizTatica(materiasObj) {
    const listBad = document.querySelector('.matrix-card.bad .matrix-list');
    const listAvg = document.querySelector('.matrix-card.average .matrix-list');
    const listGood = document.querySelector('.matrix-card.good .matrix-list');
    
    listBad.innerHTML = '';
    listAvg.innerHTML = '';
    listGood.innerHTML = '';

    let hasBad = false, hasAvg = false, hasGood = false;

    for (const [materia, nota] of Object.entries(materiasObj)) {
        const li = document.createElement('li');
        li.innerHTML = `${materia} <span>${nota}%</span>`;

        // Se a nota for 0, podemos decidir se mostramos como "Atenção" ou nem mostramos
        // Aqui vou colocar tudo que é < 60 como "Atenção"
        if (nota < 60) {
            listBad.appendChild(li);
            hasBad = true;
        } else if (nota >= 60 && nota < 80) {
            listAvg.appendChild(li);
            hasAvg = true;
        } else {
            listGood.appendChild(li);
            hasGood = true;
        }
    }
    
    if(!hasBad) listBad.innerHTML = '<li style="color:#666; font-style:italic">Nenhum ponto crítico detectado.</li>';
    if(!hasAvg) listAvg.innerHTML = '<li style="color:#666; font-style:italic">Nenhuma matéria em evolução.</li>';
    if(!hasGood) listGood.innerHTML = '<li style="color:#666; font-style:italic">Sem pontos fortes ainda.</li>';
}