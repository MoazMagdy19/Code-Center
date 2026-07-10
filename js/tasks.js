/* ============================================================
   tasks.js
   ============================================================ */

const Tasks = (() => {
  let tasks = [];

  async function load() {
    tasks = await DB.getAll('tasks');
  }

  function priorityClass(p) {
    return { low: 'badge-gray', medium: 'badge-amber', high: 'badge-red' }[p] || 'badge-gray';
  }

  function card(t) {
    const tr = I18N.t;
    return `
      <div class="entity-card task-card ${t.completed ? 'task-completed' : ''}" data-id="${t.id}">
        <div class="entity-card-top">
          <label class="task-check-label">
            <input type="checkbox" class="task-check" ${t.completed ? 'checked' : ''}>
            <span class="entity-name-sm">${Utils.escapeHtml(t.title)}</span>
          </label>
          <span class="badge ${priorityClass(t.priority)}">${tr(t.priority || 'medium')}</span>
        </div>
        ${t.description ? `<p class="entity-notes">${Utils.escapeHtml(t.description)}</p>` : ''}
        ${t.dueDate ? `<p class="note-date">${tr('dueDate')}: ${t.dueDate}</p>` : ''}
        <div class="entity-card-actions">
          <button class="btn btn-secondary btn-sm edit-btn">✏️ ${tr('edit')}</button>
          <button class="btn btn-danger btn-sm del-btn">🗑️</button>
        </div>
      </div>
    `;
  }

  async function render() {
    const t = I18N.t;
    await load();
    const pending = tasks.filter((x) => !x.completed);
    const completed = tasks.filter((x) => x.completed);

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <h1>${t('nav_tasks')}</h1>
        <button class="btn btn-primary" id="add-task-btn">+ ${t('addTask')}</button>
      </div>
      <div class="grid-2">
        <div>
          <h3 class="card-title">${t('pending')} (${pending.length})</h3>
          <div class="entity-grid" id="pending-list">${pending.length ? pending.map(card).join('') : `<p class="empty-state">${t('noData')}</p>`}</div>
        </div>
        <div>
          <h3 class="card-title">${t('completed')} (${completed.length})</h3>
          <div class="entity-grid" id="completed-list">${completed.length ? completed.map(card).join('') : `<p class="empty-state">${t('noData')}</p>`}</div>
        </div>
      </div>
    `;

    document.getElementById('add-task-btn').addEventListener('click', () => openForm());
    bindEvents();
  }

  function bindEvents() {
    document.querySelectorAll('.task-card .task-check').forEach((cb) => {
      cb.addEventListener('change', async (e) => {
        const id = e.target.closest('.task-card').dataset.id;
        const task = tasks.find((x) => x.id === id);
        task.completed = e.target.checked;
        await DB.put('tasks', task);
        await render();
      });
    });
    document.querySelectorAll('.task-card .edit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => openForm(tasks.find((x) => x.id === e.target.closest('.task-card').dataset.id)));
    });
    document.querySelectorAll('.task-card .del-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.task-card').dataset.id;
        Utils.confirmDialog(I18N.t('confirmDeleteMsg'), async () => {
          await DB.remove('tasks', id);
          Utils.toast(I18N.t('deleted'));
          await render();
        });
      });
    });
  }

  function openForm(task) {
    const t = I18N.t;
    const isEdit = !!task;
    const x = task || { title: '', description: '', dueDate: '', priority: 'medium', completed: false };

    Utils.openModal(isEdit ? t('editTask') : t('addTask'), `
      <form id="task-form">
        <div class="form-group"><label>${t('title')}</label><input class="input" id="f-title" value="${Utils.escapeHtml(x.title)}" required></div>
        <div class="form-group"><label>${t('description')}</label><textarea class="input" id="f-desc" rows="3">${Utils.escapeHtml(x.description)}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>${t('dueDate')}</label><input type="date" class="input" id="f-due" value="${x.dueDate || ''}"></div>
          <div class="form-group"><label>${t('priority')}</label>
            <select class="input" id="f-priority">
              <option value="low" ${x.priority === 'low' ? 'selected' : ''}>${t('low')}</option>
              <option value="medium" ${x.priority === 'medium' ? 'selected' : ''}>${t('medium')}</option>
              <option value="high" ${x.priority === 'high' ? 'selected' : ''}>${t('high')}</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancel-btn">${t('cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('save')}</button>
        </div>
      </form>
    `);

    document.getElementById('cancel-btn').addEventListener('click', Utils.closeModal);
    document.getElementById('task-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        id: isEdit ? x.id : undefined,
        title: document.getElementById('f-title').value.trim(),
        description: document.getElementById('f-desc').value.trim(),
        dueDate: document.getElementById('f-due').value,
        priority: document.getElementById('f-priority').value,
        completed: isEdit ? x.completed : false,
      };
      if (!data.title) return;
      await DB.add('tasks', data);
      Utils.toast(I18N.t('saved'));
      Utils.closeModal();
      await render();
    });
  }

  return { render };
})();
