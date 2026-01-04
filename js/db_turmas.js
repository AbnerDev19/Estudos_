// SIMULAÇÃO DO BANCO DE DADOS DAS TURMAS

export const db_turmas = [
    {
        id: 1,
        nome: "Concurso CBMDF 2025",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Bras%C3%A3o_CBMDF.png", // Imagem Externa ou local
        progressoTotal: 35,
        // DADOS DO PAINEL SUPERIOR
        materias: [
            { nome: "Língua Portuguesa", percentual: 73, cor: "#00e676" },
            { nome: "Matemática", percentual: 62, cor: "#2962ff" },
            { nome: "Química", percentual: 49, cor: "#ffab00" },
            { nome: "Física", percentual: 73, cor: "#2962ff" },
            { nome: "Biologia", percentual: 9, cor: "#ff5252" },
            { nome: "Legislação", percentual: 25, cor: "#00e676" },
            { nome: "Emergência Pré-Hospitalar", percentual: 97, cor: "#00e676" }
        ],
        // DADOS DAS SEMANAS (Conteúdo Admin)
        semanas: [
            {
                id: 1,
                titulo: "Semana 1",
                foco: "Foco em Legislação e Resolução de Questões",
                dias: [
                    {
                        nome: "Segunda-feira",
                        tarefas: [
                            { texto: "Ler e grifar os 30 primeiros artigos do Estatuto dos Bombeiros (Lei 7.479/86).", materia: "Legislação", feita: true },
                            { texto: "Revisar o uso da crase e resolver a folha de exercícios.", materia: "Língua Portuguesa", feita: false }
                        ]
                    },
                    {
                        nome: "Terça-feira",
                        tarefas: [
                            { texto: "Assistir videoaula sobre Suporte Básico de Vida (SBV).", materia: "Emergência", feita: false, arquivo: "Aula_SBV.pdf" },
                            { texto: "Resolver 15 exercícios de Análise Combinatória.", materia: "Matemática", feita: false }
                        ]
                    },
                    {
                        nome: "Quarta-feira",
                        tarefas: [
                            { texto: "Baixar e ler o PDF de Resumo de Termoquímica.", materia: "Química", feita: false, arquivo: "Resumo_Termo.pdf" }
                        ]
                    }
                ]
            },
            {
                id: 2,
                titulo: "Semana 2",
                foco: "Física Mecânica e Biologia Celular",
                dias: [
                    {
                        nome: "Segunda-feira",
                        tarefas: [
                            { texto: "Leis de Newton: Teoria e Prática.", materia: "Física", feita: false }
                        ]
                    }
                ]
            },
            { id: 3, titulo: "Semana 3", foco: "Revisão Geral", dias: [] }
        ]
    },
    {
        id: 2,
        nome: "Polícia Civil - Agente",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/0/05/Bras%C3%A3o_da_Pol%C3%ADcia_Civil_do_Distrito_Federal.png",
        progressoTotal: 12,
        materias: [
            { nome: "Direito Penal", percentual: 10, cor: "#ff5252" },
            { nome: "Informática", percentual: 40, cor: "#2962ff" }
        ],
        semanas: [
            {
                id: 1,
                titulo: "Semana 1",
                foco: "Introdução ao Direito Penal",
                dias: [ { nome: "Segunda", tarefas: [{texto: "Aula 01", materia: "Direito", feita: false}] } ]
            }
        ]
    }
];