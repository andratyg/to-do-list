// js/finance.js
import { cachedData, getCurrentUser } from './config.js';
import { saveDB } from './db.js';
import { showToast, playSuccessSound, escapeHtml } from './utils.js';
import { addXP } from './gamification.js';

export function addTransaction(type) {
    const desc = escapeHtml(document.getElementById('moneyDesc').value);
    const amount = parseInt(document.getElementById('moneyAmount').value);
    const wallet = document.getElementById('selectedWallet').value; 
    const category = document.getElementById('txnCategory').value;
    if(!desc || !amount || amount <= 0) return showToast("Data tidak valid!", 'error');
    const newTxn = { id: Date.now(), desc, amount, type, wallet, category, date: new Date().toISOString().split('T')[0] };
    let txns = cachedData.transactions;
    txns.push(newTxn);
    if(type === 'in') { addXP(5); playSuccessSound('coin'); } 
    saveDB('transactions', txns);
    document.getElementById('moneyDesc').value = ''; document.getElementById('moneyAmount').value = '';
    showToast(`${type==='in'?"Masuk":"Keluar"} tercatat!`, type==='in'?'success':'error');
    loadTransactions();
}

export function loadTransactions() {
    const list = document.getElementById('transactionList');
    const txns = cachedData.transactions || [];
    const filter = document.getElementById('historyFilter').value;
    let bal = { total:0, dana:0, ovo:0, gopay:0, cash:0 };
    list.innerHTML = '';
    txns.forEach(t => {
        if(t.type === 'in') { bal.total+=t.amount; bal[t.wallet]+=t.amount; } 
        else { bal.total-=t.amount; bal[t.wallet]-=t.amount; }
    });
    txns.slice().reverse().forEach(t => {
        let show = (filter === 'all') || (filter === 'in' && t.type === 'in') || (filter === 'out' && t.type === 'out');
        if(show) {
            const color = t.type === 'in' ? 'var(--green)' : 'var(--red)';
            const sign = t.type === 'in' ? '+' : '-';
            list.innerHTML += `<li class="txn-item"><div class="txn-left"><b>${escapeHtml(t.desc)}</b><small>${t.wallet.toUpperCase()} • ${t.category}</small></div><div class="txn-right"><b style="color:${color}">${sign} Rp ${t.amount.toLocaleString('id-ID')}</b><button class="delete-txn-btn" onclick="delTxn(${t.id})"><i class="fas fa-trash"></i></button></div></li>`;
        }
    });
    document.getElementById('totalBalance').innerText = "Rp " + bal.total.toLocaleString('id-ID');
    ['dana','ovo','gopay','cash'].forEach(k => document.getElementById(`saldo-${k}`).innerText = "Rp " + bal[k].toLocaleString('id-ID'));
    renderExpenseChart(txns);
}

export function delTxn(id) { 
    if(confirm("Hapus?")) { 
        const t = cachedData.transactions.filter(x => x.id !== id); 
        saveDB('transactions', t); 
        loadTransactions();
    } 
}

export function exportFinanceReport() {
    const txns = cachedData.transactions || [];
    if (txns.length === 0) return showToast("Belum ada data keuangan!", "error");

    const userName = getCurrentUser() || "Pengguna";
    const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let wallets = { 'dana': 0, 'ovo': 0, 'gopay': 0, 'cash': 0, 'lainnya': 0 };
    let totalMasuk = 0;
    let totalKeluar = 0;
    
    let dataRows = [
        [{ v: "LAPORAN KEUANGAN: " + userName.toUpperCase(), s: { font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4F46E5" } }, alignment: { horizontal: "center" } } }],
        [{ v: "Tanggal: " + dateStr, s: { alignment: { horizontal: "center" } } }],
        [] 
    ];

    txns.forEach(t => {
        let w = t.wallet ? t.wallet.toLowerCase() : 'lainnya';
        if (!wallets.hasOwnProperty(w)) w = 'lainnya'; 
        
        if (t.type === 'in') { wallets[w] += t.amount; totalMasuk += t.amount; } 
        else { wallets[w] -= t.amount; totalKeluar += t.amount; }
    });

    const styleSubHeader = { font: { bold: true }, fill: { fgColor: { rgb: "E5E7EB" } } };
    dataRows.push([{ v: "RINGKASAN SALDO", s: styleSubHeader }]);
    dataRows.push(["Total Pemasukan", { v: totalMasuk, t: 'n', z: '"Rp" #,##0' }]);
    dataRows.push(["Total Pengeluaran", { v: totalKeluar, t: 'n', z: '"Rp" #,##0' }]);
    dataRows.push(["Saldo Bersih", { v: totalMasuk - totalKeluar, t: 'n', z: '"Rp" #,##0', s: { font: { bold: true } } }]);
    dataRows.push([]); 

    const walletKeys = ['cash', 'dana', 'ovo', 'gopay'];
    const styleHeaderCol = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "6B7280" } }, alignment: { horizontal: "center" } };

    walletKeys.forEach(w => {
        const wTxns = txns.filter(t => (t.wallet || 'lainnya').toLowerCase() === w);
        if (wTxns.length > 0) {
            dataRows.push([{ v: `DOMPET: ${w.toUpperCase()} (Saldo: Rp ${wallets[w].toLocaleString('id-ID')})`, s: { font: { bold: true, color: { rgb: "4F46E5" } } } }]);
            dataRows.push([
                { v: "No", s: styleHeaderCol },
                { v: "Tanggal", s: styleHeaderCol },
                { v: "Keterangan", s: styleHeaderCol },
                { v: "Kategori", s: styleHeaderCol },
                { v: "Tipe", s: styleHeaderCol },
                { v: "Jumlah", s: styleHeaderCol }
            ]);
            wTxns.reverse().forEach((t, idx) => {
                const isMasuk = t.type === 'in';
                const color = isMasuk ? "10B981" : "EF4444"; 
                dataRows.push([
                    { v: idx + 1, s: { alignment: { horizontal: "center" } } },
                    { v: t.date, s: { alignment: { horizontal: "center" } } },
                    { v: t.desc },
                    { v: t.category },
                    { v: isMasuk ? "Masuk" : "Keluar", s: { alignment: { horizontal: "center" } } },
                    { v: t.amount, t: 'n', z: '"Rp" #,##0', s: { font: { color: { rgb: color }, bold: true } } }
                ]);
            });
            dataRows.push([]); 
        }
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dataRows);

    ws['!cols'] = [{ wch: 5 }, { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } }];

    XLSX.utils.book_append_sheet(wb, ws, "Laporan Keuangan");
    const fileName = `Laporan_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast("Laporan Excel Berhasil Didownload! 📊", "success");
    playSuccessSound('ding');
}

export function editTarget() { 
    const uid = window.auth.currentUser.uid;
    const val = prompt("Target Tabungan (Rp):", localStorage.getItem(`${uid}_target`) || 0); 
    if(val && !isNaN(val)) { 
        localStorage.setItem(`${uid}_target`, val); 
        saveSetting('target', val); 
        loadTarget(); 
    } 
}

export function loadTarget() {
    const uid = window.auth.currentUser ? window.auth.currentUser.uid : null;
    if(!uid) return;
    const target = parseInt(localStorage.getItem(`${uid}_target`) || 0);
    const saving = cachedData.transactions.reduce((acc, t) => t.category === 'Tabungan' ? (t.type === 'in' ? acc + t.amount : acc - t.amount) : acc, 0);
    document.getElementById('targetAmount').innerText = "Rp " + target.toLocaleString('id-ID');
    const pct = target > 0 ? Math.min((Math.max(saving, 0) / target) * 100, 100) : 0;
    document.getElementById('targetProgressBar').style.width = `${pct}%`;
    document.getElementById('targetPercentage').innerText = `${pct.toFixed(1)}% (Rp ${Math.max(saving, 0).toLocaleString('id-ID')})`;
}

export function renderExpenseChart(txns) {
    const container = document.getElementById('expenseChartContainer');
    let total = 0; let cats = {};
    
    txns.forEach(t => { 
        if(t.type === 'out') { 
            total += t.amount; 
            cats[t.category] = (cats[t.category]||0) + t.amount; 
        }
    });

    if(!document.getElementById('btnSetBudget')) {
        const btnHtml = `<button id="btnSetBudget" onclick="openBudgetModal()" class="btn-text-danger" style="width:100%; margin-bottom:10px; border:1px dashed var(--border-color); font-size:0.8rem;"><i class="fas fa-cog"></i> Atur Batas Anggaran</button>`;
        container.insertAdjacentHTML('beforebegin', btnHtml);
    }

    if(total === 0) { container.innerHTML = `<div class="empty-message small"><p>Belum ada pengeluaran.</p></div>`; return; }
    
    let html = '';
    const colors = { 'Jajan':'#f97316', 'Transport':'#3b82f6', 'Tabungan':'#10b981', 'Belanja':'#8b5cf6', 'Lainnya':'#6b7280' };
    
    Object.keys(cats).forEach(c => {
        const amount = cats[c];
        const budget = (cachedData.budgets && cachedData.budgets[c]) ? cachedData.budgets[c] : 0;
        const pctTotal = Math.round((amount/total)*100);
        
        let budgetInfo = '';
        let barColor = colors[c]||'#ccc';
        let statusIcon = '';

        if (budget > 0) {
            const pctBudget = Math.round((amount / budget) * 100);
            if (pctBudget >= 100) {
                barColor = '#ef4444'; 
                statusIcon = '🔥 Over!';
                showToast(`Peringatan: Kategori ${c} sudah boros!`, 'error'); 
            } else if (pctBudget >= 80) {
                barColor = '#f59e0b'; 
                statusIcon = '⚠️';
            }
            budgetInfo = `<br><small style="font-size:0.65rem; color:${barColor};">Terpakai: Rp ${amount.toLocaleString('id-ID')} / Rp ${budget.toLocaleString('id-ID')} (${pctBudget}%) ${statusIcon}</small>`;
        } else {
            budgetInfo = `<br><small style="font-size:0.65rem; color:var(--text-sub);">Tidak ada batas</small>`;
        }

        html += `
        <div class="expense-item" style="margin-bottom:12px;">
            <div class="expense-label" style="align-items:flex-start;">
                <span class="dot" style="background:${colors[c]||'#ccc'}; margin-top:5px;"></span>
                <div style="line-height:1.2;">
                    ${c}
                    ${budgetInfo}
                </div>
            </div>
            <div class="expense-value">
                Rp ${amount.toLocaleString('id-ID')} 
                <div class="expense-bar-bg" style="width:80px; height:6px; margin-left:auto; margin-top:5px; background:var(--border-color);">
                    <div class="expense-bar-fill" style="width:${Math.min(100, (budget > 0 ? (amount/budget)*100 : pctTotal))}%; background:${barColor};"></div>
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

export function toggleTransferModal() {
    const modal = document.getElementById('transferModal');
    modal.style.display = (modal.style.display === 'none') ? 'flex' : 'none';
}

export function executeTransfer() {
    const source = document.getElementById('sourceWallet').value;
    const target = document.getElementById('targetWallet').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);

    if (source === target) return showToast("Dompet asal dan tujuan sama!", "error");
    if (!amount || amount <= 0) return showToast("Jumlah tidak valid!", "error");

    const txns = cachedData.transactions || [];
    let currentBalance = 0;
    txns.forEach(t => {
        if((t.wallet || 'cash') === source) {
            if(t.type === 'in') currentBalance += t.amount;
            else currentBalance -= t.amount;
        }
    });

    if (currentBalance < amount) {
        return showToast(`Saldo ${source.toUpperCase()} tidak cukup! (Sisa: Rp ${currentBalance.toLocaleString()})`, "error");
    }

    const timestamp = Date.now();
    const dateStr = new Date().toISOString().split('T')[0];

    const txnOut = { id: timestamp, desc: `Transfer ke ${target.toUpperCase()}`, amount: amount, type: 'out', wallet: source, category: 'Transfer', date: dateStr };
    const txnIn = { id: timestamp + 1, desc: `Transfer dari ${source.toUpperCase()}`, amount: amount, type: 'in', wallet: target, category: 'Transfer', date: dateStr };

    cachedData.transactions.push(txnOut);
    cachedData.transactions.push(txnIn);
    
    saveDB('transactions', cachedData.transactions);

    document.getElementById('transferAmount').value = "";
    toggleTransferModal();
    loadTransactions(); 
    playSuccessSound('coin');
    showToast("Transfer Berhasil!", "success");
}

// Subscription & Budget Functions
export function openBudgetModal() {
    const cats = ['Jajan', 'Transport', 'Belanja', 'Lainnya'];
    let html = '';
    
    if (!cachedData.budgets) cachedData.budgets = {};

    cats.forEach(c => {
        const currentLimit = cachedData.budgets[c] || 0;
        html += `
            <div class="form-group" style="margin-bottom:10px;">
                <label style="font-size:0.85rem; color:var(--text-sub);">${c}</label>
                <input type="number" id="budget-${c}" value="${currentLimit}" placeholder="0 (Tanpa Batas)" class="sub-input">
            </div>
        `;
    });

    if(document.getElementById('budgetModal')) document.getElementById('budgetModal').remove();
    const modalContent = `
        <div id="budgetModal" class="modal-backdrop" style="display:flex;">
            <div class="modal-content fade-in-up" style="max-width:350px;">
                <div class="modal-head">
                    <h3>💰 Atur Anggaran Bulanan</h3>
                    <button class="close-icon" onclick="document.getElementById('budgetModal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p style="font-size:0.8rem; color:var(--text-sub); margin-bottom:15px;">Set batas maksimal pengeluaranmu bulan ini.</p>
                    ${html}
                </div>
                <div class="modal-foot">
                    <button onclick="saveBudgets()" class="btn-primary btn-block">Simpan Anggaran</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalContent);
}

export function saveBudgets() {
    const cats = ['Jajan', 'Transport', 'Belanja', 'Lainnya'];
    if (!cachedData.budgets) cachedData.budgets = {};

    cats.forEach(c => {
        const val = document.getElementById(`budget-${c}`).value;
        cachedData.budgets[c] = parseInt(val) || 0;
    });

    saveDB('budgets', cachedData.budgets); 
    document.getElementById('budgetModal').remove();
    showToast("Anggaran tersimpan! 🎯", "success");
    renderExpenseChart(cachedData.transactions); 
}

export function openSubModal() {
    renderSubscriptions();
    document.getElementById('subModal').style.display = 'flex';
}

export function renderSubscriptions() {
    const list = document.getElementById('subList');
    const totalEl = document.getElementById('totalSubCost');
    const subs = cachedData.subscriptions || [];
    
    list.innerHTML = '';
    let total = 0;

    if (subs.length === 0) {
        list.innerHTML = '<div class="empty-message small"><p>Belum ada langganan.</p></div>';
    } else {
        subs.forEach((sub, index) => {
            total += parseInt(sub.cost);
            const today = new Date().getDate();
            let diff = sub.date - today;
            let statusText = diff === 0 ? "HARI INI!" : diff < 0 ? "Sudah lewat" : `${diff} hari lagi`;
            if (diff < 0) statusText = `Tgl ${sub.date} depan`;

            const html = `
                <div class="sub-item">
                    <div class="sub-info">
                        <h4>${escapeHtml(sub.name)}</h4>
                        <small>📅 Tgl Tagihan: ${sub.date} (${statusText})</small>
                    </div>
                    <div style="display:flex; align-items:center;">
                        <div class="sub-cost">
                            <b>Rp ${parseInt(sub.cost).toLocaleString('id-ID')}</b>
                        </div>
                        <button class="btn-del-sub" onclick="deleteSubscription(${index})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            list.innerHTML += html;
        });
    }
    
    totalEl.innerText = "Rp " + total.toLocaleString('id-ID');
}

export function addSubscription() {
    const name = document.getElementById('subName').value;
    const cost = parseInt(document.getElementById('subCost').value);
    const date = parseInt(document.getElementById('subDate').value);

    if (!name || !cost || !date) return showToast("Lengkapi semua data!", "error");
    if (date < 1 || date > 31) return showToast("Tanggal harus 1-31", "error");
    if (cost <= 0) return showToast("Harga tidak boleh nol atau negatif!", "error");

    if (!cachedData.subscriptions) cachedData.subscriptions = [];
    
    cachedData.subscriptions.push({ name, cost, date });
    saveDB('subscriptions', cachedData.subscriptions);
    
    document.getElementById('subName').value = '';
    document.getElementById('subCost').value = '';
    document.getElementById('subDate').value = '';
    
    showToast("Langganan disimpan!", "success");
    renderSubscriptions();
}

export function deleteSubscription(index) {
    if(confirm("Hapus langganan ini?")) {
        cachedData.subscriptions.splice(index, 1);
        saveDB('subscriptions', cachedData.subscriptions);
        renderSubscriptions();
        showToast("Dihapus.", "info");
    }
}

export function checkSubscriptionReminders() {
    const subs = cachedData.subscriptions || [];
    const today = new Date().getDate();

    subs.forEach(sub => {
        const diff = sub.date - today;
        if (diff === 3) showToast(`🎗️ Siapkan dana: ${sub.name} bayar 3 hari lagi.`, "info");
        if (diff === 1) showToast(`⏰ Besok bayar tagihan ${sub.name}!`, "info");
        if (diff === 0) showToast(`💸 HARI INI: Bayar tagihan ${sub.name}!`, "error");
    });
}