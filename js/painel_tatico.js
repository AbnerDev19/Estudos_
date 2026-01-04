// SIMULAÇÃO DE DADOS (Vindo do Firebase futuramente)
const dadosEvolucao = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
    notas: [65, 68, 72, 70, 75, 78] // Evolução percentual
};

const dadosCompetencias = {
    labels: ['Português', 'Direito Const.', 'Direito Adm.', 'RLM', 'Informática', 'Penal'],
    data: [78, 72, 92, 45, 68, 85] // Notas atuais por matéria
};

document.addEventListener('DOMContentLoaded', () => {
    initEvolutionChart();
    initRadarChart();
});

// --- 1. GRÁFICO DE LINHA (EVOLUÇÃO) ---
function initEvolutionChart() {
    const ctx = document.getElementById('evolutionChart').getContext('2d');
    
    // Gradiente Neon para a linha
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(41, 98, 255, 0.5)'); // Azul
    gradient.addColorStop(1, 'rgba(41, 98, 255, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dadosEvolucao.labels,
            datasets: [{
                label: 'Desempenho Geral (%)',
                data: dadosEvolucao.notas,
                borderColor: '#2962ff',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#2962ff',
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: true,
                tension: 0.4 // Curva suave
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
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#ccc',
                    borderColor: '#333',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
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

// --- 2. GRÁFICO DE RADAR (COMPETÊNCIAS) ---
function initRadarChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: dadosCompetencias.labels,
            datasets: [{
                label: 'Nível de Domínio',
                data: dadosCompetencias.data,
                backgroundColor: 'rgba(0, 230, 118, 0.2)', // Verde transparente
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
                    pointLabels: {
                        color: '#ccc',
                        font: { size: 11 }
                    },
                    ticks: {
                        display: false, // Esconde os números do eixo
                        backdropColor: 'transparent'
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}