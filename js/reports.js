/* ============================================================
   reports.js
   ============================================================ */

const Reports = (() => {
  let period = 'monthly';
  let students = [], payments = [], finance = [], attendance = [];

  function getRange() {
    const now = new Date();
    const to = Utils.todayStr();
    let from;
    if (period === 'daily') from = new Date(now);
    else if (period === 'weekly') { from = new Date(now); from.setDate(now.getDate() - 6); }
    else if (period === 'monthly') from = new Date(now.getFullYear(), now.getMonth(), 1);
    else from = new Date(now.getFullYear(), 0, 1);
    return { from: from.toISOString().slice(0, 10), to };
  }

  async function load() {
    students = await DB.getAll('students');
    payments = await DB.getAll('payments');
    finance = await DB.getAll('finance');
    attendance = await DB.getAll('attendance');
  }

  function inRange(dateStr, range) {
    return dateStr >= range.from && dateStr <= range.to;
  }

  function computeSummary(range) {
    const pInRange = payments.filter((p) => inRange(p.date, range));
    const fInRange = finance.filter((f) => inRange(f.date, range));
    const aInRange = attendance.filter((a) => inRange(a.date, range));
    const income = pInRange.reduce((a, b) => a + Number(b.amount), 0) + fInRange.filter((f) => f.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const expense = fInRange.filter((f) => f.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    const present = aInRange.filter((a) => a.status === 'present').length;
    const absent = aInRange.filter((a) => a.status === 'absent').length;
    return { income, expense, profit: income - expense, present, absent, pInRange, fInRange };
  }

  async function render() {
    const t = I18N.t;
    await load();
    const range = getRange();
    const s = computeSummary(range);

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <h1>${t('nav_reports')}</h1>
        <div class="header-actions">
          <button class="btn btn-secondary" id="export-pdf-btn">🖨️ ${t('exportPdf')}</button>
          <button class="btn btn-secondary" id="export-excel-btn">📊 ${t('exportExcel')}</button>
        </div>
      </div>

      <div class="tab-bar">
        ${['daily', 'weekly', 'monthly', 'yearly'].map((p) => `<button class="tab-btn ${period === p ? 'active' : ''}" data-period="${p}">${t(p)}</button>`).join('')}
      </div>

      <div class="stats-grid stats-grid-3">
        <div class="stat-card"><div class="stat-icon icon-blue">👥</div><div><p class="stat-label">${t('totalStudents')}</p><p class="stat-value">${students.length}</p></div></div>
        <div class="stat-card"><div class="stat-icon icon-green">📈</div><div><p class="stat-label">${t('totalIncome')}</p><p class="stat-value">${Utils.fmtMoney(s.income)}</p></div></div>
        <div class="stat-card"><div class="stat-icon icon-red">📉</div><div><p class="stat-label">${t('totalExpenses')}</p><p class="stat-value">${Utils.fmtMoney(s.expense)}</p></div></div>
        <div class="stat-card"><div class="stat-icon ${s.profit >= 0 ? 'icon-green' : 'icon-red'}">💰</div><div><p class="stat-label">${t('netProfit')}</p><p class="stat-value">${Utils.fmtMoney(s.profit)}</p></div></div>
        <div class="stat-card"><div class="stat-icon icon-green">✅</div><div><p class="stat-label">${t('present')}</p><p class="stat-value">${s.present}</p></div></div>
        <div class="stat-card"><div class="stat-icon icon-red">❌</div><div><p class="stat-label">${t('absent')}</p><p class="stat-value">${s.absent}</p></div></div>
      </div>

      <p class="range-note">${range.from} → ${range.to}</p>
      <p class="hint-note">💡 ${t('printHint')}</p>
    `;

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => { period = btn.dataset.period; render(); });
    });
    document.getElementById('export-pdf-btn').addEventListener('click', () => exportPDF(range, s));
    document.getElementById('export-excel-btn').addEventListener('click', () => exportExcel(range, s));
  }

  function exportPDF(range, s) {
    const t = I18N.t;
    const body = `
      <h1>${t('appName')} — ${t('nav_reports')}</h1>
      <h2>${t(period)} · ${range.from} → ${range.to}</h2>
      <div class="summary-grid">
        <div class="summary-box"><p class="label">${t('totalStudents')}</p><p class="value">${students.length}</p></div>
        <div class="summary-box"><p class="label">${t('totalIncome')}</p><p class="value">${Utils.fmtMoney(s.income)}</p></div>
        <div class="summary-box"><p class="label">${t('totalExpenses')}</p><p class="value">${Utils.fmtMoney(s.expense)}</p></div>
        <div class="summary-box"><p class="label">${t('netProfit')}</p><p class="value">${Utils.fmtMoney(s.profit)}</p></div>
        <div class="summary-box"><p class="label">${t('present')}</p><p class="value">${s.present}</p></div>
        <div class="summary-box"><p class="label">${t('absent')}</p><p class="value">${s.absent}</p></div>
      </div>
      <h3>${t('nav_payments')}</h3>
      <table>
        <thead><tr><th>${t('student')}</th><th>${t('amount')}</th><th>${t('date')}</th><th>${t('method')}</th></tr></thead>
        <tbody>
          ${s.pInRange.map((p) => {
            const st = students.find((st) => st.id === p.studentId);
            return `<tr><td>${Utils.escapeHtml(st ? st.name : '')}</td><td>${Utils.fmtMoney(p.amount)}</td><td>${p.date}</td><td>${t(p.method || 'cash')}</td></tr>`;
          }).join('') || `<tr><td colspan="4">${t('noData')}</td></tr>`}
        </tbody>
      </table>
    `;
    Utils.printReport(`${t('nav_reports')} — ${t(period)}`, body);
  }

  function exportExcel(range, s) {
    const t = I18N.t;
    const rows = s.pInRange.map((p) => {
      const st = students.find((st) => st.id === p.studentId);
      return {
        [t('student')]: st ? st.name : '',
        [t('amount')]: p.amount,
        [t('date')]: p.date,
        [t('method')]: t(p.method || 'cash'),
      };
    });
    Utils.downloadCSV(rows, `report-${period}-${range.to}.csv`);
  }

  return { render };
})();
