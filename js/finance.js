/* ============================================================
   finance.js
   ============================================================ */

const Finance = (() => {
  let records = [];
  const CATEGORY_KEYS = ['cat_rent', 'cat_salaries', 'cat_equipment', 'cat_utilities', 'cat_marketing', 'cat_supplies', 'cat_other'];

  async function load() {
    records = await DB.getAll('finance');
  }

  function totals() {
    const income = records.filter((r) => r.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const expense = records.filter((r) => r.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    return { income, expense, profit: income - expense };
  }

  function expenseByCategory() {
    const map = new Map();
    records.filter((r) => r.type === 'expense').forEach((r) => {
      const key = r.category || 'cat_other';
      map.set(key, (map.get(key) || 0) + Number(r.amount));
    });
    return Array.from(map.entries()).map(([key, value]) => ({ label: I18N.t(key), value }));
  }

  function table() {
    const t = I18N.t;
    const rows = [...records].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>${t('status')}</th><th>${t('category')}</th><th>${t('amount')}</th><th>${t('date')}</th><th>${t('notes')}</th><th></th></tr></thead>
          <tbody>
            ${rows.map((r) => `
              <tr data-id="${r.id}">
                <td><span class="badge ${r.type === 'income' ? 'badge-green' : 'badge-red'}">${t(r.type)}</span></td>
                <td>${r.category ? t(r.category) : '—'}</td>
                <td>${Utils.fmtMoney(r.amount)}</td>
                <td>${r.date}</td>
                <td>${Utils.escapeHtml(r.note || '')}</td>
                <td><button class="icon-btn-sm del-btn">🗑️</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${rows.length === 0 ? `<p class="empty-state">${t('noData')}</p>` : ''}
      </div>
    `;
  }

  async function render() {
    const t = I18N.t;
    await load();
    const tot = totals();
    const catData = expenseByCategory();

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <h1>${t('nav_finance')}</h1>
        <div class="header-actions">
          <button class="btn btn-secondary" id="add-income-btn">＋ ${t('addIncome')}</button>
          <button class="btn btn-secondary" id="add-expense-btn">－ ${t('addExpense')}</button>
        </div>
      </div>

      <div class="stats-grid stats-grid-3">
        <div class="stat-card"><div class="stat-icon icon-green">📈</div><div><p class="stat-label">${t('totalIncome')}</p><p class="stat-value">${Utils.fmtMoney(tot.income)}</p></div></div>
        <div class="stat-card"><div class="stat-icon icon-red">📉</div><div><p class="stat-label">${t('totalExpenses')}</p><p class="stat-value">${Utils.fmtMoney(tot.expense)}</p></div></div>
        <div class="stat-card"><div class="stat-icon ${tot.profit >= 0 ? 'icon-green' : 'icon-red'}">💰</div><div><p class="stat-label">${t('netProfit')}</p><p class="stat-value">${Utils.fmtMoney(tot.profit)}</p></div></div>
      </div>

      ${catData.length ? `<div class="card"><h3 class="card-title">${t('expensesByCategory')}</h3><div class="chart-wrap chart-wrap-pie">${Charts.pieChart(catData)}</div></div>` : ''}

      <div class="card" id="finance-table-card">
        <h3 class="card-title">${t('history')}</h3>
        ${table()}
      </div>
    `;

    document.getElementById('add-income-btn').addEventListener('click', () => openForm('income'));
    document.getElementById('add-expense-btn').addEventListener('click', () => openForm('expense'));
    bindDelete();
  }

  function bindDelete() {
    document.querySelectorAll('#finance-table-card .del-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('tr').dataset.id;
        Utils.confirmDialog(I18N.t('confirmDeleteMsg'), async () => {
          await DB.remove('finance', id);
          Utils.toast(I18N.t('deleted'));
          await render();
        });
      });
    });
  }

  function openForm(type) {
    const t = I18N.t;
    const catOptions = CATEGORY_KEYS.map((k) => `<option value="${k}">${t(k)}</option>`).join('');

    Utils.openModal(type === 'income' ? t('addIncome') : t('addExpense'), `
      <form id="finance-form">
        ${type === 'expense' ? `<div class="form-group"><label>${t('category')}</label><select class="input" id="f-category">${catOptions}</select></div>` : ''}
        <div class="form-row">
          <div class="form-group"><label>${t('amount')}</label><input type="number" class="input" id="f-amount" required></div>
          <div class="form-group"><label>${t('date')}</label><input type="date" class="input" id="f-date" value="${Utils.todayStr()}"></div>
        </div>
        <div class="form-group"><label>${t('notes')}</label><input class="input" id="f-note"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancel-btn">${t('cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('save')}</button>
        </div>
      </form>
    `);

    document.getElementById('cancel-btn').addEventListener('click', Utils.closeModal);
    document.getElementById('finance-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = Number(document.getElementById('f-amount').value);
      if (!amount) return;
      await DB.add('finance', {
        type,
        category: type === 'expense' ? document.getElementById('f-category').value : '',
        amount,
        date: document.getElementById('f-date').value || Utils.todayStr(),
        note: document.getElementById('f-note').value.trim(),
      });
      Utils.toast(I18N.t('saved'));
      Utils.closeModal();
      await render();
    });
  }

  return { render };
})();
