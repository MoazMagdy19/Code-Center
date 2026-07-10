/* ============================================================
   courses.js
   ============================================================ */

const Courses = (() => {
  let allCourses = [];
  const DEFAULT_COLORS = ['#3b66f5', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  async function load() {
    allCourses = await DB.getAll('courses');
  }

  function card(c) {
    const t = I18N.t;
    return `
      <div class="entity-card course-card" data-id="${c.id}" style="--course-color:${c.color || DEFAULT_COLORS[0]}">
        <div class="course-color-bar"></div>
        <p class="entity-name">${Utils.escapeHtml(c.name)}</p>
        ${c.description ? `<p class="entity-sub">${Utils.escapeHtml(c.description)}</p>` : ''}
        <div class="entity-card-meta">
          <p>💲 ${Utils.fmtMoney(c.price)}</p>
          <p>⏱️ ${Utils.escapeHtml(c.duration || '—')}</p>
          <p>📄 ${c.sessions || 0} ${t('sessions')}</p>
        </div>
        <div class="entity-card-actions">
          <button class="btn btn-secondary btn-sm edit-btn">✏️ ${t('edit')}</button>
          <button class="btn btn-danger btn-sm del-btn">🗑️</button>
        </div>
      </div>
    `;
  }

  async function render() {
    const t = I18N.t;
    await load();
    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <h1>${t('nav_courses')}</h1>
        <button class="btn btn-primary" id="add-course-btn">+ ${t('addCourse')}</button>
      </div>
      <div class="entity-grid" id="course-list">
        ${allCourses.length ? allCourses.map(card).join('') : `<p class="empty-state">${t('noData')}</p>`}
      </div>
    `;
    document.getElementById('add-course-btn').addEventListener('click', () => openForm());
    bindListEvents();
  }

  function bindListEvents() {
    document.querySelectorAll('#course-list .edit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => openForm(allCourses.find((c) => c.id === e.target.closest('.entity-card').dataset.id)));
    });
    document.querySelectorAll('#course-list .del-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.entity-card').dataset.id;
        Utils.confirmDialog(I18N.t('confirmDeleteMsg'), async () => {
          await DB.remove('courses', id);
          Utils.toast(I18N.t('deleted'));
          await render();
        });
      });
    });
  }

  function openForm(course) {
    const t = I18N.t;
    const isEdit = !!course;
    const c = course || { name: '', description: '', price: '', duration: '', sessions: '', color: DEFAULT_COLORS[0] };

    Utils.openModal(isEdit ? t('editCourse') : t('addCourse'), `
      <form id="course-form">
        <div class="form-group"><label>${t('courseName')}</label><input class="input" id="f-name" value="${Utils.escapeHtml(c.name)}" required></div>
        <div class="form-group"><label>${t('description')}</label><textarea class="input" id="f-desc" rows="2">${Utils.escapeHtml(c.description)}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>${t('price')}</label><input type="number" class="input" id="f-price" value="${c.price}"></div>
          <div class="form-group"><label>${t('duration')}</label><input class="input" id="f-duration" value="${Utils.escapeHtml(c.duration)}" placeholder="e.g. 8 weeks"></div>
        </div>
        <div class="form-group"><label>${t('sessions')}</label><input type="number" class="input" id="f-sessions" value="${c.sessions}"></div>
        <div class="form-group">
          <label>${t('courseColor')}</label>
          <div class="color-swatches" id="color-swatches">
            ${DEFAULT_COLORS.map((col) => `<button type="button" class="swatch ${col === c.color ? 'active' : ''}" data-color="${col}" style="background:${col}"></button>`).join('')}
          </div>
          <input type="hidden" id="f-color" value="${c.color || DEFAULT_COLORS[0]}">
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancel-btn">${t('cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('save')}</button>
        </div>
      </form>
    `);

    document.getElementById('cancel-btn').addEventListener('click', Utils.closeModal);
    document.querySelectorAll('#color-swatches .swatch').forEach((sw) => {
      sw.addEventListener('click', () => {
        document.querySelectorAll('#color-swatches .swatch').forEach((s) => s.classList.remove('active'));
        sw.classList.add('active');
        document.getElementById('f-color').value = sw.dataset.color;
      });
    });

    document.getElementById('course-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        id: isEdit ? c.id : undefined,
        name: document.getElementById('f-name').value.trim(),
        description: document.getElementById('f-desc').value.trim(),
        price: Number(document.getElementById('f-price').value) || 0,
        duration: document.getElementById('f-duration').value.trim(),
        sessions: Number(document.getElementById('f-sessions').value) || 0,
        color: document.getElementById('f-color').value,
      };
      if (!data.name) return;
      await DB.add('courses', data);
      Utils.toast(I18N.t('saved'));
      Utils.closeModal();
      await render();
    });
  }

  return { render, load, get all() { return allCourses; } };
})();
