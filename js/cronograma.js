import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const daysGrid = document.getElementById('days-grid');
const monthDisplay = document.getElementById('month-year-display');
const btnPrev = document.getElementById('prev-month');
const btnNext = document.getElementById('next-month');

let currentDate = new Date();
let eventosCarregados = [];

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await carregarTodosEventos(user.uid);
            renderCalendar();
        } else {
            window.location.href = "index.html";
        }
    });
});

async function carregarTodosEventos(userId) {
    eventosCarregados = [];
    
    // 1. BUSCAR PROVAS (Eventos Importantes)
    try {
        const provasRef = collection(db, "users", userId, "provas");
        const snapshotProvas = await getDocs(provasRef);
        snapshotProvas.forEach(doc => {
            const p = doc.data();
            // Adiciona ao calendário
            eventosCarregados.push({
                id: doc.id,
                titulo: p.nome, // ex: Polícia Federal
                descricao: `Banca: ${p.banca}`,
                data: p.data,   // YYYY-MM-DD
                tipo: 'prova',  // Vermelho
                concluido: false
            });
        });
    } catch (e) {
        console.error("Erro ao carregar provas:", e);
    }

    // 2. BUSCAR AGENDA (Tarefas Diárias)
    try {
        const agendaRef = collection(db, "users", userId, "agenda");
        const snapshotAgenda = await getDocs(agendaRef);
        
        // SEED: Se a agenda estiver vazia, cria exemplos com datas para o calendário não ficar branco
        if(snapshotAgenda.empty) {
            await criarAgendaExemplo(userId);
            // Recarrega recursivamente após criar
            return carregarTodosEventos(userId);
        }

        snapshotAgenda.forEach(doc => {
            const a = doc.data();
            // Só adiciona se tiver data definida (senão é só to-do solto)
            if(a.data) {
                eventosCarregados.push({
                    id: doc.id,
                    titulo: a.titulo,
                    descricao: a.hora || 'Dia todo',
                    data: a.data,
                    tipo: a.tipo || 'estudo', // azul ou verde
                    concluido: a.feito
                });
            }
        });

    } catch (e) {
        console.error("Erro ao carregar agenda:", e);
    }
}

async function criarAgendaExemplo(userId) {
    console.log("Criando agenda de exemplo...");
    const hoje = new Date();
    const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);
    const dia5 = new Date(hoje); dia5.setDate(5); // Dia 5 deste mês
    
    const agendaRef = collection(db, "users", userId, "agenda");
    
    const exemplos = [
        { titulo: "Revisão de Português", data: hoje.toISOString().split('T')[0], hora: "08:00", tipo: "revisao", feito: false },
        { titulo: "Simulado RLM", data: amanha.toISOString().split('T')[0], hora: "14:00", tipo: "estudo", feito: false },
        { titulo: "Lei Seca (Constitucional)", data: dia5.toISOString().split('T')[0], hora: "19:00", tipo: "estudo", feito: true }
    ];

    for(const ex of exemplos) {
        await setDoc(doc(agendaRef), ex);
    }
}

function renderCalendar() {
    daysGrid.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Atualiza título do Mês
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    monthDisplay.innerText = `${months[month]} de ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    // Dias vazios do mês anterior
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('calendar-day', 'empty');
        daysGrid.appendChild(emptyDiv);
    }

    // Dias do mês atual
    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        dayDiv.innerHTML = `<span>${i}</span>`;
        
        // Formata data YYYY-MM-DD local
        const mesFormatado = String(month+1).padStart(2, '0');
        const diaFormatado = String(i).padStart(2, '0');
        const dataStr = `${year}-${mesFormatado}-${diaFormatado}`;
        
        // Filtra eventos deste dia
        const eventosDoDia = eventosCarregados.filter(e => e.data === dataStr);
        
        // Bolinhas coloridas (Indicadores)
        if (eventosDoDia.length > 0) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'day-dots';
            eventosDoDia.forEach(ev => {
                const dot = document.createElement('span');
                // Mapeia tipos para cores (definidas no CSS)
                let dotClass = 'blue'; // Padrão estudo
                if(ev.tipo === 'prova') dotClass = 'red';
                if(ev.tipo === 'revisao') dotClass = 'green';
                
                dot.classList.add('dot', dotClass);
                dotsContainer.appendChild(dot);
            });
            dayDiv.appendChild(dotsContainer);
        }

        // Clique no dia
        dayDiv.onclick = () => {
            // Remove active dos outros
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('active'));
            dayDiv.classList.add('active');
            selecionarDia(i, year, months[month], eventosDoDia);
        };

        // Seleciona automaticamente o dia de HOJE se estivermos no mês atual
        const hoje = new Date();
        if (i === hoje.getDate() && month === hoje.getMonth() && year === hoje.getFullYear()) {
            dayDiv.classList.add('active');
            selecionarDia(i, year, months[month], eventosDoDia);
        }

        daysGrid.appendChild(dayDiv);
    }
}

function selecionarDia(dia, ano, mesNome, listaEventos) {
    // Atualiza Painel Lateral
    document.getElementById('selected-day-number').innerText = String(dia).padStart(2, '0');
    document.getElementById('selected-week-day').innerText = `${mesNome}, ${ano}`; // Simplificado
    document.getElementById('selected-full-date').innerText = "Agenda do Dia";

    const dailyTasks = document.getElementById('daily-tasks');
    dailyTasks.innerHTML = '';

    // Barra de Progresso Semanal (Simulada para visual)
    atualizarProgressoVisual(listaEventos);

    if (!listaEventos || listaEventos.length === 0) {
        dailyTasks.innerHTML = '<p class="empty-msg">Nada agendado para este dia.</p>';
        return;
    }

    listaEventos.forEach(ev => {
        const div = document.createElement('div');
        div.className = `task-card type-${ev.tipo || 'estudo'}`;
        
        const icone = ev.concluido ? 'check_circle' : 'radio_button_unchecked';
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start">
                <div>
                    <h4>${ev.titulo}</h4>
                    <p>${ev.descricao}</p>
                </div>
                <span class="material-symbols-outlined" style="color: ${ev.concluido ? '#00e676' : '#666'}">${icone}</span>
            </div>
        `;
        dailyTasks.appendChild(div);
    });
}

function atualizarProgressoVisual(listaEventos) {
    // Apenas um visual effect para a barra lateral não ficar zerada
    const feitos = listaEventos.filter(e => e.concluido).length;
    const total = listaEventos.length;
    
    document.getElementById('week-done').innerText = feitos;
    document.getElementById('week-todo').innerText = total - feitos;
    
    let pct = 0;
    if(total > 0) pct = (feitos / total) * 100;
    document.getElementById('week-progress-bar').style.width = `${pct}%`;
}

// Navegação Mês
btnPrev.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

btnNext.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});