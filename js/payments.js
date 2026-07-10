/* ============================================================
   payments.js
   ============================================================ */

const Payments = (() => {
  let students = [];
  let courses = [];
  let payments = [];
  let filterStudent = '';

  async function load() {
    students = await DB.getAll('students');
    courses = await DB.getAll('courses');
    payments = await DB.getAll('payments');
  }

  function coursePrice(studentId) {
    const s = students.find((s) => s.id === studentId);
    if (!s || !s.courseId) return 0;
    const c = courses.find((c) => c.id === s.courseId);
    return c ? Number(c.price) : 0;
  }

  function paidTotal(studentId) {
    return payments.filter((p) => p.studentId === studentId).reduce((a, b) => a + Number(b.amount), 0);
  }

  function balanceBar() {
    if (!filterStudent) return '';
    const t = I18N.t;
    const total = coursePrice(filterStudent);
    const paid = paidTotal(filterStudent);
    const remaining = total - paid;
    return `
      <div class="balance-boxes">
        <div class="balance-box"><p class="label">${t('coursePrice')}</p><p class="value">${Utils.fmtMoney(total)}</p></div>
        <div class="balance-box"><p class="label">${t('paid')}</p><p class="value text-green">${Utils.fmtMoney(paid)}</p></div>
        <div class="balance-box"><p class="label">${t('remainingBalance')}</p><p class="value ${remaining > 0 ? 'text-red' : 'text-green'}">${Utils.fmtMoney(remaining)}</p></div>
      </div>
    `;
  }

  function table() {
    const t = I18N.t;
    const rows = payments.filter((p) => !filterStudent || p.studentId === filterStudent).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>${t('student')}</th><th>${t('amount')}</th><th>${t('date')}</th><th>${t('method')}</th><th>${t('notes')}</th><th></th></tr></thead>
          <tbody>
            ${rows.map((p) => {
              const s = students.find((s) => s.id === p.studentId);
              return `<tr data-id="${p.id}">
                <td>${s ? Utils.escapeHtml(s.name) : ''}</td>
                <td>${Utils.fmtMoney(p.amount)}</td>
                <td>${p.date}</td>
                <td>${t(p.method || 'cash')}</td>
                <td>${Utils.escapeHtml(p.note || '')}</td>
                <td><button class="icon-btn-sm del-btn">🗑️</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        ${rows.length === 0 ? `<p class="empty-state">${t('noData')}</p>` : ''}
      </div>
    `;
  }

  async function render() {
    const t = I18N.t;
    await load();
    const studentOptions = `<option value="">${t('all')}</option>` + students.map((s) => `<option value="${s.id}" ${s.id === filterStudent ? 'selected' : ''}>${Utils.escapeHtml(s.name)}</option>`).join('');

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <h1>${t('nav_payments')}</h1>
        <button class="btn btn-primary" id="add-payment-btn">+ ${t('recordPayment')}</button>
      </div>
      <div class="toolbar"><select class="input" id="student-filter">${studentOptions}</select></div>
      <div id="balance-bar">${balanceBar()}</div>
      <div id="payments-table">${table()}</div>
    `;

    document.getElementById('add-payment-btn').addEventListener('click', () => openForm());
    document.getElementById('student-filter').addEventListener('change', (e) => {
      filterStudent = e.target.value;
      document.getElementById('balance-bar').innerHTML = balanceBar();
      document.getElementById('payments-table').innerHTML = table();
      bindDeleteButtons();
    });
    bindDeleteButtons();
  }

  function bindDeleteButtons() {
    document.querySelectorAll('#payments-table .del-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.closest('tr').dataset.id;
        Utils.confirmDialog(I18N.t('confirmDeleteMsg'), async () => {
          await DB.remove('payments', id);
          Utils.toast(I18N.t('deleted'));
          await load();
          document.getElementById('balance-bar').innerHTML = balanceBar();
          document.getElementById('payments-table').innerHTML = table();
          bindDeleteButtons();
        });
      });
    });
  }

  function openForm() {
    const t = I18N.t;
    const studentOptions = `<option value="">${t('none')}</option>` + students.map((s) => `<option value="${s.id}" ${s.id === filterStudent ? 'selected' : ''}>${Utils.escapeHtml(s.name)}</option>`).join('');

    Utils.openModal(t('recordPayment'), `
      <form id="payment-form">
        <div class="form-group"><label>${t('student')}</label><select class="input" id="f-student" required>${studentOptions}</select></div>
        <div class="form-row">
          <div class="form-group"><label>${t('amount')}</label><input type="number" class="input" id="f-amount" required></div>
          <div class="form-group"><label>${t('date')}</label><input type="date" class="input" id="f-date" value="${Utils.todayStr()}"></div>
        </div>
        <div class="form-group"><label>${t('method')}</label>
          <select class="input" id="f-method">
            <option value="cash">${t('cash')}</option>
            <option value="card">${t('card')}</option>
            <option value="transfer">${t('transfer')}</option>
            <option value="other">${t('other')}</option>
          </select>
        </div>
        <div class="form-group"><label>${t('notes')}</label><input class="input" id="f-note"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancel-btn">${t('cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('save')}</button>
        </div>
      </form>
    `);

    document.getElementById('cancel-btn').addEventListener('click', Utils.closeModal);
    document.getElementById('payment-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const studentId = document.getElementById('f-student').value;
      const amount = Number(document.getElementById('f-amount').value);
      if (!studentId || !amount) return;
      await DB.add('payments', {
        studentId, amount,
        date: document.getElementById('f-date').value || Utils.todayStr(),
        method: document.getElementById('f-method').value,
        note: document.getElementById('f-note').value.trim(),
      });
      Utils.toast(I18N.t('saved'));
      Utils.closeModal();
      await render();
    });
  }

  return { render };
})();
