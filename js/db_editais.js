// SIMULAÇÃO DO BANCO DE DADOS (ADMIN CONTROLS)
// No futuro, isso virá do Firebase (Firestore)

export const db_editais = [
    {
        id: 1,
        orgao: "Polícia Federal",
        cargo: "Agente de Polícia",
        banca: "Cebraspe",
        dataProva: "25/08/2025",
        aberto: true,
        progressoGeral: 45,
        // ESTA PARTE É CONTROLADA PELO ADM:
        materias: [
            {
                nome: "Língua Portuguesa",
                topicos: [
                    { nome: "Compreensão e interpretação de textos", feito: true },
                    { nome: "Tipologia textual", feito: true },
                    { nome: "Ortografia oficial", feito: false },
                    { nome: "Acentuação gráfica", feito: false },
                    { nome: "Emprego do sinal indicativo de crase", feito: false }
                ]
            },
            {
                nome: "Noções de Direito Administrativo",
                topicos: [
                    { nome: "Estado, governo e administração pública", feito: true },
                    { nome: "Direito administrativo: conceito e fontes", feito: false },
                    { nome: "Ato administrativo", feito: false }
                ]
            },
            {
                nome: "Informática",
                topicos: [
                    { nome: "Conceitos de Internet e Intranet", feito: true },
                    { nome: "Ferramentas e aplicativos de navegação", feito: true },
                    { nome: "Noções de sistema operacional (Windows/Linux)", feito: false },
                    { nome: "Redes de computadores", feito: false },
                    { nome: "Noções de Python", feito: false }
                ]
            }
        ]
    },
    {
        id: 2,
        orgao: "Tribunal de Justiça SP",
        cargo: "Escrevente Técnico",
        banca: "Vunesp",
        dataProva: "10/09/2025",
        aberto: false,
        progressoGeral: 12,
        materias: [
            {
                nome: "Língua Portuguesa",
                topicos: [
                    { nome: "Análise, compreensão e interpretação", feito: true },
                    { nome: "Coesão e coerência", feito: false }
                ]
            },
            {
                nome: "Matemática",
                topicos: [
                    { nome: "Operações com números reais", feito: false },
                    { nome: "Regra de três simples e composta", feito: false }
                ]
            }
        ]
    }
];