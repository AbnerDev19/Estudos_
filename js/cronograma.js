import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// Opcional: importar db_eventos se quiser migrar dados de exemplo do calendário também

const daysGrid = document.getElementById('days-grid');
const monthDisplay = document.getElementById('month-year-display');
const btnPrev = document.getElementById('prev-month');
const btnNext = document.getElementById('next-month');

let currentDate = new Date();
let eventos = [];

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await carregarEventos(user.uid);
            renderCalendar();
        } else {
            window.location.href = "index.html";
        }
    });
});

async function carregarEventos(userId) {
    // Busca da coleção 'agenda' que o dashboard já usa, ou cria uma nova 'eventos'
    const querySnapshot = await getDocs(collection(db, "users", userId, "agenda"));
    eventos = [];
    
    // Transforma dados da agenda em formato de calendário (precisa ter campo 'data')
    // Se não tiver, adiciona eventos fictícios para teste visual (ou você pode implementar a migração igual acima)
    querySnapshot.forEach(doc => {
        const data = doc.data();
        // Assume que a agenda tem formato { titulo: "", data: "YYYY-MM-DD", tipo: "estudo" }
        // Se a agenda do dashboard só tem hora, vamos usar a data de hoje para simular
        eventos.push({
            titulo: data.titulo,
            data: data.data || new Date().toISOString().split('T')[0], // Fallback para hoje
            tipo: data.tipo || 'estudo',
            descricao: data.hora || ''
        });
    });
}

function renderCalendar() {
    daysGrid.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Nome do Mês
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    monthDisplay.innerText = `${months[month]} de ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    // Dias vazios antes do dia 1
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('calendar-day', 'empty');
        daysGrid.appendChild(emptyDiv);
    }

    // Dias do mês
    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        dayDiv.innerHTML = `<span>${i}</span>`;
        
        // Formata data YYYY-MM-DD para comparar
        const diaFormatado = `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        // Verifica eventos neste dia
        const eventosDoDia = eventos.filter(e => e.data === diaFormatado);
        
        if (eventosDoDia.length > 0) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'day-dots';
            eventosDoDia.forEach(ev => {
                const dot = document.createElement('span');
                // Mapeia tipos para cores
                let dotClass = 'blue';
                if(ev.tipo === 'prova') dotClass = 'red';
                if(ev.tipo === 'revisao') dotClass = 'green';
                
                dot.classList.add('dot', dotClass);
                dotsContainer.appendChild(dot);
            });
            dayDiv.appendChild(dotsContainer);
        }

        // Clique no dia
        dayDiv.onclick = () => selecionarDia(i, eventosDoDia);

        // Highlight dia atual
        const hoje = new Date();
        if (i === hoje.getDate() && month === hoje.getMonth() && year === hoje.getFullYear()) {
            dayDiv.classList.add('active');
            selecionarDia(i, eventosDoDia); // Auto seleciona hoje
        }

        daysGrid.appendChild(dayDiv);
    }
}

function selecionarDia(dia, listaEventos) {
    document.getElementById('selected-day-number').innerText = String(dia).padStart(2, '0');
    
    const dailyTasks = document.getElementById('daily-tasks');
    dailyTasks.innerHTML = '';

    if (!listaEventos || listaEventos.length === 0) {
        dailyTasks.innerHTML = '<p class="empty-msg">Nenhum evento para este dia.</p>';
        return;
    }

    listaEventos.forEach(ev => {
        const div = document.createElement('div');
        div.className = `task-card type-${ev.tipo || 'estudo'}`;
        div.innerHTML = `
            <h4>${ev.titulo}</h4>
            <p>${ev.descricao}</p>
        `;
        dailyTasks.appendChild(div);
    });
}

// Navegação
btnPrev.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

btnNext.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});