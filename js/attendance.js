/* ============================================================
   attendance.js
   ============================================================ */

const Attendance = (() => {
  let students = [];
  let records = [];
  let date = Utils.todayStr();
  let tab = 'mark';

  async function load() {
    students = await DB.getAll('students');
    records = await DB.getAll('attendance');
  }

  function statusFor(studentId, d) {
    return records.find((r) => r.studentId === studentId && r.date === d);
  }

  function percentageFor(studentId) {
    const recs = records.filter((r) => r.studentId === studentId);
    if (!recs.length) return 0;
    const present = recs.filter((r) => r.status === 'present').length;
    return Math.round((present / recs.length) * 100);
  }

  async function mark(studentId, status) {
    const existing = statusFor(studentId, date);
    if (existing) {
      existing.status = status;
      await DB.put('attendance', existing);
    } else {
      await DB.add('attendance', { studentId, date, status });
    }
    records = await DB.getAll('attendance');
    renderMarkList();
  }

  function studentRow(s) {
    const t = I18N.t;
    const rec = statusFor(s.id, date);
    const pct = percentageFor(s.id);
    return `
      <div class="attendance-row" data-id="${s.id}">
        <div class="attendance-row-info">
          <p class="entity-name-sm">${Utils.escapeHtml(s.name)}</p>
          <p class="entity-sub">${t('attendancePercentage')}: ${pct}%</p>
        </div>
        <div class="attendance-actions">
          <button class="btn btn-sm ${rec && rec.status === 'present' ? 'btn-success' : 'btn-secondary'}" data-status="present">✅ ${t('present')}</button>
          <button class="btn btn-sm ${rec && rec.status === 'absent' ? 'btn-danger' : 'btn-secondary'}" data-status="absent">❌ ${t('absent')}</button>
        </div>
      </div>
    `;
  }

  function renderMarkList() {
    const container = document.getElementById('attendance-list');
    if (!container) return;
    container.innerHTML = students.length ? students.map(studentRow).join('') : `<p class="empty-state">${I18N.t('noData')}</p>`;
    container.querySelectorAll('.attendance-row').forEach((row) => {
      row.querySelectorAll('button[data-status]').forEach((btn) => {
        btn.addEventListener('click', () => mark(row.dataset.id, btn.dataset.status));
      });
    });
  }

  function historyTable() {
    const t = I18N.t;
    const rows = [...records].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>${t('student')}</th><th>${t('date')}</th><th>${t('status')}</th></tr></thead>
          <tbody>
            ${rows.map((r) => {
              const s = students.find((s) => s.id === r.studentId);
              return `<tr><td>${s ? Utils.escapeHtml(s.name) : ''}</td><td>${r.date}</td><td><span class="badge ${r.status === 'present' ? 'badge-green' : 'badge-red'}">${t(r.status)}</span></td></tr>`;
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

    document.getElementById('main-content').innerHTML = `
      <div class="page-header"><h1>${t('nav_attendance')}</h1></div>
      <div class="tab-bar">
        <button class="tab-btn ${tab === 'mark' ? 'active' : ''}" data-tab="mark">${t('markAttendance')}</button>
        <button class="tab-btn ${tab === 'history' ? 'active' : ''}" data-tab="history">${t('history')}</button>
      </div>
      <div id="tab-content"></div>
    `;

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        tab = btn.dataset.tab;
        render();
      });
    });

    renderTabContent();
  }

  function renderTabContent() {
    const container = document.getElementById('tab-content');
    if (tab === 'mark') {
      container.innerHTML = `
        <div class="toolbar"><input type="date" id="attendance-date" class="input" value="${date}"></div>
        <div id="attendance-list" class="card-list"></div>
      `;
      document.getElementById('attendance-date').addEventListener('change', (e) => {
        date = e.target.value;
        renderMarkList();
      });
      renderMarkList();
    } else {
      container.innerHTML = historyTable();
    }
  }

  return { render };
})();
