// js/tasks.js
import { cachedData, funWords } from './config.js';
import { saveDB } from './db.js';
import { showToast, playSuccessSound, escapeHtml, formatDateIndo, getDaysRemaining } from './utils.js';
import { addXP } from './gamification.js';

let taskFilter = "all";
let editingTaskId = null;
let dragSrcEl = null;

export function filterTasks(type, btn) { 
    taskFilter = type; 
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active')); 
    btn.classList.add('active'); 
    loadTasks(); 
}

export function handleTaskButton() {
    const text = escapeHtml(document.getElementById('taskInput').value);
    const date = document.getElementById('taskDate').value; 
    const priority = document.getElementById('taskPriority').value;
    if(!text || !date) return showToast("Lengkapi data tugas!", 'error');

    let tasks = cachedData.tasks; 
    if(editingTaskId) {
        const idx = tasks.findIndex(t => t.id === editingTaskId);
        if(idx !== -1) { tasks[idx].text = text; tasks[idx].date = date; tasks[idx].priority = priority; showToast("Tugas diupdate!", "success"); }
        editingTaskId = null; document.getElementById('addTaskBtn').innerHTML = `Tambah Tugas`;
    } else {
        tasks.push({ id: Date.now(), text, date: date, priority, completed: false });
        addXP(5); 
        playSuccessSound('ding'); showToast("Tugas ditambah! (+5 XP)", "success");
    }
    saveDB('tasks', tasks);
    document.getElementById('taskInput').value = ''; document.getElementById('taskDate').value = ''; 
    loadTasks();
}

export function loadTaskToEdit(id) {
    const task = cachedData.tasks.find(t => t.id === id);
    if(task) {
        document.getElementById('taskInput').value = task.text;
        document.getElementById('taskDate').value = task.date; 
        document.getElementById('taskPriority').value = task.priority;
        editingTaskId = id;
        document.getElementById('addTaskBtn').innerHTML = `Simpan`;
        document.getElementById('taskInput').focus();
    }
}

export function loadTasks() {
    const list = document.getElementById('taskList');
    const tasks = cachedData.tasks || [];
    list.innerHTML = '';
    const total = tasks.length; 
    const done = tasks.filter(t => t.completed).length;
    const pct = total ? Math.round((done/total)*100) : 0;
    document.getElementById('taskProgressText').innerText = `${pct}%`;
    document.getElementById('taskProgressPath').style.strokeDasharray = `${pct}, 100`;

    const search = document.getElementById('searchTaskInput').value.toLowerCase();
    let filtered = tasks.filter(t => {
        if(taskFilter === 'pending') return !t.completed;
        if(taskFilter === 'completed') return t.completed;
        return t.text.toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-message"><i class="fas fa-clipboard-check"></i><p>Tidak ada tugas.</p></div>`;
        renderUrgentDeadlines(tasks);
        return;
    }

    filtered.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed - b.completed;
        return new Date(a.date) - new Date(b.date);
    });

    filtered.forEach((t) => {
        const daysLeft = getDaysRemaining(t.date);
        let dateDisplay = `<i class="far fa-calendar"></i> ${formatDateIndo(t.date)}`;
        let badgeClass = 'deadline-far';
        if (daysLeft !== null && !t.completed) {
            if (daysLeft < 0) { dateDisplay = `⚠️ Telat ${Math.abs(daysLeft)} hari`; badgeClass = 'deadline-urgent'; }
            else if (daysLeft === 0) { dateDisplay = `🔥 HARI INI`; badgeClass = 'deadline-urgent'; }
            else if (daysLeft === 1) { dateDisplay = `⏰ Besok`; badgeClass = 'deadline-near'; }
            else { dateDisplay = `📅 ${daysLeft} Hari Lagi`; badgeClass = daysLeft <= 3 ? 'deadline-near' : 'deadline-far'; }
        }
        const randomWord = funWords[Math.floor(Math.random() * funWords.length)];
        const li = document.createElement('li');
        li.className = `task-item priority-${t.priority} ${t.completed ? 'completed' : ''}`;
        li.draggable = true;
        li.dataset.id = t.id;
        li.innerHTML = `<div class="task-content" style="display:flex;align-items:center;width:100%;"><div class="check-btn" onclick="toggleTask(${t.id})"><i class="fas fa-check"></i></div><div class="task-text"><span>${escapeHtml(t.text)}</span><small class="${badgeClass}">${dateDisplay} • ${t.priority}</small></div><span class="fun-badge">${randomWord}</span></div><div class="task-actions"><button class="action-btn" onclick="loadTaskToEdit(${t.id})"><i class="fas fa-pencil-alt"></i></button><button class="action-btn delete" onclick="deleteTask(${t.id})"><i class="fas fa-trash"></i></button><i class="fas fa-grip-lines" style="cursor:move; color:#ccc; margin-left:10px;"></i></div>`;
        
        // Drag Events
        li.addEventListener('dragstart', function(e) { dragSrcEl = this; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/html', this.innerHTML); this.style.opacity = '0.4'; });
        li.addEventListener('dragover', function(e) { if (e.preventDefault) e.preventDefault(); e.dataTransfer.dropEffect = 'move'; return false; });
        li.addEventListener('drop', handleDrop);
        li.addEventListener('dragend', function() { this.style.opacity = '1'; });
        
        list.appendChild(li);
    });
    renderUrgentDeadlines(tasks);
}

function handleDrop(e) {
    if (e.stopPropagation) { e.stopPropagation(); }
    if (dragSrcEl !== this) {
        const idSrc = parseInt(dragSrcEl.dataset.id);
        const idDest = parseInt(this.dataset.id);
        const tasks = cachedData.tasks;
        const idxSrc = tasks.findIndex(t => t.id === idSrc);
        const idxDest = tasks.findIndex(t => t.id === idDest);
        if (idxSrc > -1 && idxDest > -1) {
            const [movedItem] = tasks.splice(idxSrc, 1);
            tasks.splice(idxDest, 0, movedItem);
            saveDB('tasks', tasks);
            loadTasks(); 
        }
    }
    return false;
}

function renderUrgentDeadlines(tasks) {
    const urgentList = document.getElementById('urgentList');
    if(!urgentList) return; 
    urgentList.innerHTML = '';
    const urgentTasks = tasks.filter(t => {
        const days = getDaysRemaining(t.date);
        return !t.completed && days !== null && days >= 0 && days <= 3;
    });
    if (urgentTasks.length === 0) urgentList.innerHTML = '<div style="text-align:center;color:var(--text-sub);padding:10px;">Aman! Tidak ada deadline dekat. 🎉</div>';
    else {
        urgentTasks.forEach(t => {
            const days = getDaysRemaining(t.date);
            let textDay = days === 0 ? "Hari Ini!" : days === 1 ? "Besok" : `${days} Hari`;
            urgentList.innerHTML += `<li class="urgent-item"><span>${escapeHtml(t.text)}</span><span class="urgent-days">${textDay}</span></li>`;
        });
    }
}

export function toggleTask(id) { 
    const tasks = cachedData.tasks; 
    const t = tasks.find(x => x.id === id); 
    if(t) { 
        t.completed = !t.completed; 
        if(t.completed) {
            playSuccessSound('ding');
            addXP(10); 
            showToast("Tugas Selesai! (+10 XP)", "success");
        }
        saveDB('tasks', tasks); 
        loadTasks();
    }
}

export function deleteTask(id) { 
    if(confirm("Hapus?")) { 
        const tasks = cachedData.tasks.filter(x => x.id !== id); 
        saveDB('tasks', tasks); 
        loadTasks();
    } 
}

export function clearCompletedTasks() {
    const tasks = cachedData.tasks.filter(t => !t.completed);
    if(confirm("Hapus semua yang selesai?")) saveDB('tasks', tasks);
}