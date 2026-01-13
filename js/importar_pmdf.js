// ARQUIVO: js/importar_pmdf.js
import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURAÇÃO DAS FASES (Baseado no seu texto) ---
const FASES = {
    1: { nome: "Fase 1: Fundação", fim: 13, foco: "Base Teórica e Compreensão" },       // Jan - Mar
    2: { nome: "Fase 2: Expansão", fim: 26, foco: "Legislação Específica e Matérias Menores" }, // Abr - Jun
    3: { nome: "Fase 3: Aprofundamento", fim: 39, foco: "Jurisprudência, Leis Extravagantes e Redação" }, // Jul - Set
    4: { nome: "Fase 4: Sprint Final", fim: 52, foco: "Simulados, Revisão Reverso e Decoreba" } // Out - Dez
};

// --- GERADOR DE CONTEÚDO SEMANAL ---
function gerarSemanas() {
    const semanas = [];

    for (let i = 1; i <= 52; i++) {
        let faseAtual = 1;
        if (i > 13) faseAtual = 2;
        if (i > 26) faseAtual = 3;
        if (i > 39) faseAtual = 4;

        const configFase = FASES[faseAtual];
        let diasSemana = [];

        // LÓGICA DE CADA FASE (Define as tarefas por dia)
        if (faseAtual === 1) {
            diasSemana = [
                { nome: "Segunda", tarefas: [{ texto: "Português: Interpretação/Gramática", materia: "Língua Portuguesa" }, { texto: "D. Const: Art. 5º e 144", materia: "Direito Constitucional" }, { texto: "Lei Seca + 20 Questões", materia: "Prática" }] },
                { nome: "Terça", tarefas: [{ texto: "RLM: Lógica Proposicional", materia: "Raciocínio Lógico" }, { texto: "D. Adm: Poderes e Atos", materia: "Direito Administrativo" }, { texto: "Exercícios de Fixação", materia: "Prática" }] },
                { nome: "Quarta", tarefas: [{ texto: "Português: Morfologia", materia: "Língua Portuguesa" }, { texto: "D. Penal: Teoria do Crime", materia: "Direito Penal" }, { texto: "Flashcards", materia: "Revisão" }] },
                { nome: "Quinta", tarefas: [{ texto: "Matemática: Razão/Proporção", materia: "Matemática" }, { texto: "Legislação PMDF: Estatuto", materia: "Legislação PMDF" }, { texto: "Leitura Arts. 1-45", materia: "Leitura" }] },
                { nome: "Sexta", tarefas: [{ texto: "Penal Militar: Parte Geral", materia: "Penal Militar" }, { texto: "Proc. Penal: Inquérito", materia: "Processo Penal" }, { texto: "Estudo Comparativo", materia: "Revisão" }] },
                { nome: "Sábado", tarefas: [{ texto: "RIDE/Inglês", materia: "Conhecimentos Gerais" }, { texto: "Simulado Temático (40 questões)", materia: "Simulado" }] }
            ];
        } else if (faseAtual === 2) {
            diasSemana = [
                { nome: "Segunda", tarefas: [{ texto: "Português: Sintaxe Avançada", materia: "Língua Portuguesa" }, { texto: "D. Humanos: Tratados Internacionais", materia: "Direitos Humanos" }, { texto: "Reescritura de Frases", materia: "Prática" }] },
                { nome: "Terça", tarefas: [{ texto: "Matemática: Análise Comb./Probabilidade", materia: "Matemática" }, { texto: "Legislação: Leis 6.450 e 12.086", materia: "Legislação PMDF" }, { texto: "Exercícios de Contagem", materia: "Prática" }] },
                { nome: "Quarta", tarefas: [{ texto: "D. Adm: Licitações (14.133)", materia: "Direito Administrativo" }, { texto: "Proc. Penal Mil: IPM e Menagem", materia: "Proc. Penal Militar" }, { texto: "Leitura Lei Seca", materia: "Leitura" }] },
                { nome: "Quinta", tarefas: [{ texto: "Criminologia: Escolas e Vitimologia", materia: "Criminologia" }, { texto: "D. Penal: Crimes em Espécie", materia: "Direito Penal" }, { texto: "Mapa Mental", materia: "Revisão" }] },
                { nome: "Sexta", tarefas: [{ texto: "Penal Militar: Crimes em Espécie", materia: "Penal Militar" }, { texto: "Proc. Penal: Prisões", materia: "Processo Penal" }, { texto: "Tabela de Prazos", materia: "Revisão" }] },
                { nome: "Sábado", tarefas: [{ texto: "Revisão Geral (Erros)", materia: "Revisão" }, { texto: "Simulado Completo (80 questões)", materia: "Simulado" }] }
            ];
        } else if (faseAtual === 3) {
            diasSemana = [
                { nome: "Segunda", tarefas: [{ texto: "Jurisprudência STF/STJ (Informativos)", materia: "Direito Avançado" }, { texto: "Leis Extravagantes: Drogas/Maria da Penha", materia: "Legislação Especial" }, { texto: "Redação: Tema Segurança Pública", materia: "Redação" }] },
                { nome: "Terça", tarefas: [{ texto: "Matemática/RLM: Bateria de Questões Difíceis", materia: "Exatas" }, { texto: "Legislação PMDF: Decretos Específicos", materia: "Legislação PMDF" }] },
                { nome: "Quarta", tarefas: [{ texto: "Ciclo de Revisão: Constitucional/Adm", materia: "Revisão" }, { texto: "60 Questões (Bateria)", materia: "Prática Massiva" }] },
                { nome: "Quinta", tarefas: [{ texto: "Ciclo de Revisão: Penal/Processo", materia: "Revisão" }, { texto: "Lei de Abuso de Autoridade", materia: "Legislação Especial" }] },
                { nome: "Sexta", tarefas: [{ texto: "Ciclo de Revisão: Militar", materia: "Revisão" }, { texto: "Estudo de Caso (Redação)", materia: "Redação" }] },
                { nome: "Sábado", tarefas: [{ texto: "Simulado Cronometrado (4h30)", materia: "Simulado" }, { texto: "Correção Analítica", materia: "Análise" }] }
            ];
        } else { // FASE 4 (Sprint Final)
            diasSemana = [
                { nome: "Segunda", tarefas: [{ texto: "Revisão Reverso (Qconcursos)", materia: "Prática" }, { texto: "Decoreba: Prazos Processuais", materia: "Memorização" }] },
                { nome: "Terça", tarefas: [{ texto: "Revisão Reverso (Tec Concursos)", materia: "Prática" }, { texto: "Decoreba: Penas e Crimes", materia: "Memorização" }] },
                { nome: "Quarta", tarefas: [{ texto: "Simulado Rápido (40 questões)", materia: "Simulado" }, { texto: "Correção de Erros", materia: "Revisão" }] },
                { nome: "Quinta", tarefas: [{ texto: "Leitura Dinâmica: RIDE e Atualidades", materia: "Leitura" }, { texto: "Decoreba: Competências CF", materia: "Memorização" }] },
                { nome: "Sexta", tarefas: [{ texto: "Revisão Final: Caderno de Erros", materia: "Revisão" }, { texto: "Estratégia de Prova", materia: "Mentalidade" }] },
                { nome: "Sábado", tarefas: [{ texto: "Simulado Final (Tipo Prova)", materia: "Simulado" }] }
            ];
        }

        semanas.push({
            titulo: `Semana ${i} - ${configFase.nome}`,
            foco: configFase.foco,
            dias: diasSemana
        });
    }

    return semanas;
}

const turmaPMDF = {
    nome: "Concurso PMDF 2026 - Anual Completo",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Bras%C3%A3o_da_Pol%C3%ADcia_Militar_do_Distrito_Federal.png",
    progressoTotal: 0,
    focoAtual: "Ciclo Anual: Das Bases à Aprovação",

    materias: [
        { nome: "Língua Portuguesa", percentual: 0, cor: "#00e676" },
        { nome: "Direito", percentual: 0, cor: "#2962ff" },
        { nome: "Exatas", percentual: 0, cor: "#8257e5" },
        { nome: "Legislação PMDF", percentual: 0, cor: "#f59e0b" },
        { nome: "Redação", percentual: 0, cor: "#ff5252" }
    ],

    semanas: gerarSemanas() // AQUI A MÁGICA ACONTECE
};

// Função executora
async function subirTurma() {
    try {
        console.log("Gerando cronograma anual...");
        console.log(`Total de semanas geradas: ${turmaPMDF.semanas.length}`);

        const docRef = await addDoc(collection(db, "turmas"), turmaPMDF);

        console.log("Sucesso! Turma criada com ID: ", docRef.id);
        alert(`Cronograma Anual PMDF (52 Semanas) importado com sucesso!\nID: ${docRef.id}`);
    } catch (e) {
        console.error("Erro ao adicionar turma: ", e);
        alert("Erro: " + e.message);
    }
}

window.subirTurma = subirTurma;