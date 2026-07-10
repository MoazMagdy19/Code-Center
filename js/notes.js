/* ============================================================
   notes.js
   ============================================================ */

const Notes = (() => {
  let notes = [];
  let students = [];
  let tab = 'general';

  async function load() {
    notes = await DB.getAll('notes');
    students = await DB.getAll('students');
  }

  function studentName(id) {
    const s = students.find((s) => s.id === id);
    return s ? s.name : '';
  }

  function card(n) {
    const t = I18N.t;
    return `
      <div class="entity-card note-card" data-id="${n.id}">
        <div class="entity-card-top">
          <p class="entity-name-sm">${Utils.escapeHtml(n.title || t('title'))}</p>
          <div class="entity-card-actions-sm">
            <button class="icon-btn-sm edit-btn">✏️</button>
            <button class="icon-btn-sm del-btn">🗑️</button>
          </div>
        </div>
        ${n.studentId ? `<p class="entity-sub">${Utils.escapeHtml(studentName(n.studentId))}</p>` : ''}
        <p class="entity-notes">${Utils.escapeHtml(n.content || '')}</p>
        <p class="note-date">${n.date || ''}</p>
      </div>
    `;
  }

  async function render() {
    const t = I18N.t;
    await load();
    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <h1>${t('nav_notes')}</h1>
        <button class="btn btn-primary" id="add-note-btn">+ ${t('addNote')}</button>
      </div>
      <div class="tab-bar">
        <button class="tab-btn ${tab === 'general' ? 'active' : ''}" data-tab="general">${t('generalReminders')}</button>
        <button class="tab-btn ${tab === 'daily' ? 'active' : ''}" data-tab="daily">${t('dailyNotes')}</button>
        <button class="tab-btn ${tab === 'student' ? 'active' : ''}" data-tab="student">${t('studentNotes')}</button>
      </div>
      <div class="entity-grid" id="notes-list"></div>
    `;

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => { tab = btn.dataset.tab; renderList(); document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b === btn)); });
    });
    document.getElementById('add-note-btn').addEventListener('click', () => openForm());
    renderList();
  }

  function renderList() {
    const t = I18N.t;
    const list = notes.filter((n) => n.type === tab);
    const container = document.getElementById('notes-list');
    container.innerHTML = list.length ? list.map(card).join('') : `<p class="empty-state">${t('noData')}</p>`;
    container.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => openForm(notes.find((n) => n.id === e.target.closest('.note-card').dataset.id)));
    });
    container.querySelectorAll('.del-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.note-card').dataset.id;
        Utils.confirmDialog(I18N.t('confirmDeleteMsg'), async () => {
          await DB.remove('notes', id);
          Utils.toast(I18N.t('deleted'));
          await load();
          renderList();
        });
      });
    });
  }

  function openForm(note) {
    const t = I18N.t;
    const isEdit = !!note;
    const n = note || { type: tab, studentId: '', title: '', content: '', date: Utils.todayStr() };
    const studentOptions = `<option value="">${t('none')}</option>` + students.map((s) => `<option value="${s.id}" ${s.id === n.studentId ? 'selected' : ''}>${Utils.escapeHtml(s.name)}</option>`).join('');

    Utils.openModal(isEdit ? t('editNote') : t('addNote'), `
      <form id="note-form">
        ${n.type === 'student' ? `<div class="form-group"><label>${t('student')}</label><select class="input" id="f-student">${studentOptions}</select></div>` : ''}
        <div class="form-group"><label>${t('title')}</label><input class="input" id="f-title" value="${Utils.escapeHtml(n.title)}"></div>
        <div class="form-group"><label>${t('content')}</label><textarea class="input" id="f-content" rows="4">${Utils.escapeHtml(n.content)}</textarea></div>
        <div class="form-group"><label>${t('date')}</label><input type="date" class="input" id="f-date" value="${n.date || Utils.todayStr()}"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancel-btn">${t('cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('save')}</button>
        </div>
      </form>
    `);

    document.getElementById('cancel-btn').addEventListener('click', Utils.closeModal);
    document.getElementById('note-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        id: isEdit ? n.id : undefined,
        type: n.type,
        studentId: n.type === 'student' ? (document.getElementById('f-student').value || null) : null,
        title: document.getElementById('f-title').value.trim(),
        content: document.getElementById('f-content').value.trim(),
        date: document.getElementById('f-date').value || Utils.todayStr(),
      };
      await DB.add('notes', data);
      Utils.toast(I18N.t('saved'));
      Utils.closeModal();
      await load();
      renderList();
    });
  }

  return { render };
})();
