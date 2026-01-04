// SIMULAÇÃO DO BANCO DE DADOS DE EVENTOS
export const db_eventos = [
    // --- EVENTOS DE JANEIRO 2026 (Para testar com a sua imagem) ---
    {
        data: "2026-01-03",
        tipo: "prova", // prova, estudo, revisao
        titulo: "Simulado Nacional PF",
        descricao: "Foco em Direito Administrativo e RLM.",
        concluido: false
    },
    {
        data: "2026-01-03",
        tipo: "revisao",
        titulo: "Revisar Erros da Semana",
        descricao: "Refazer questões erradas de Português.",
        concluido: true
    },
    {
        data: "2026-01-05",
        tipo: "estudo",
        titulo: "Videoaula: Crase",
        descricao: "Assistir módulos 1 a 3.",
        concluido: false
    },
    {
        data: "2026-01-07",
        tipo: "prova",
        titulo: "Prova Prática",
        descricao: "Teste de aptidão física (treino).",
        concluido: false
    },
    // --- EVENTOS DA DATA ATUAL (Para você ver funcionando hoje) ---
    // O JS vai adicionar alguns eventos dinâmicos baseados no dia de hoje para teste
];

// Função auxiliar para popular dados atuais para teste
export function getEventos() {
    // Adiciona um evento para HOJE dinamicamente para não ficar vazio se não estivermos em 2026
    const hoje = new Date();
    const dataHojeStr = hoje.toISOString().split('T')[0];
    
    // Verifica se já existe, se não, adiciona fictício
    if(!db_eventos.find(e => e.data === dataHojeStr)) {
        db_eventos.push({
            data: dataHojeStr,
            tipo: "estudo",
            titulo: "Meta Diária Automática",
            descricao: "Estudar 2h de Legislação Especial.",
            concluido: false
        });
    }
    return db_eventos;
}