/* ============================================================
   schedule.js
   ============================================================ */

const Schedule = (() => {
  const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  let items = [];
  let courses = [];

  async function load() {
    items = await DB.getAll('schedule');
    courses = await DB.getAll('courses');
  }

  function courseInfo(id) {
    return courses.find((c) => c.id === id);
  }

  function classCard(item) {
    const t = I18N.t;
    const course = courseInfo(item.courseId);
    return `
      <div class="schedule-item" data-id="${item.id}" style="border-inline-start-color:${course ? course.color : '#94a3b8'}">
        <div class="schedule-item-top">
          <p class="entity-name-sm">${course ? Utils.escapeHtml(course.name) : t('none')}</p>
          <div class="entity-card-actions-sm">
            <button class="icon-btn-sm edit-btn">✏️</button>
            <button class="icon-btn-sm del-btn">🗑️</button>
          </div>
        </div>
        <p class="schedule-time">🕒 ${item.startTime || ''}${item.endTime ? ` - ${item.endTime}` : ''}</p>
        ${item.classroom ? `<p class="schedule-room">📍 ${Utils.escapeHtml(item.classroom)}</p>` : ''}
        ${item.notes ? `<p class="schedule-notes">${Utils.escapeHtml(item.notes)}</p>` : ''}
      </div>
    `;
  }

  function dayColumn(day) {
    const t = I18N.t;
    const dayItems = items.filter((i) => i.day === day).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    return `
      <div class="schedule-day-col">
        <div class="schedule-day-header">
          <h4>${t('day_' + day)}</h4>
          <button class="icon-btn-sm add-day-btn" data-day="${day}">+</button>
        </div>
        <div class="schedule-day-body">
          ${dayItems.length ? dayItems.map(classCard).join('') : `<p class="empty-state-sm">${t('noClasses')}</p>`}
        </div>
      </div>
    `;
  }

  async function render() {
    const t = I18N.t;
    await load();
    document.getElementById('main-content').innerHTML = `
      <div class="page-header"><h1>${t('nav_schedule')}</h1></div>
      <div class="schedule-grid">${DAYS.map(dayColumn).join('')}</div>
    `;
    bindEvents();
  }

  function bindEvents() {
    document.querySelectorAll('.add-day-btn').forEach((btn) => {
      btn.addEventListener('click', () => openForm(null, btn.dataset.day));
    });
    document.querySelectorAll('.schedule-item .edit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.schedule-item').dataset.id;
        openForm(items.find((i) => i.id === id));
      });
    });
    document.querySelectorAll('.schedule-item .del-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.schedule-item').dataset.id;
        Utils.confirmDialog(I18N.t('confirmDeleteMsg'), async () => {
          await DB.remove('schedule', id);
          Utils.toast(I18N.t('deleted'));
          await render();
        });
      });
    });
  }

  function openForm(item, presetDay) {
    const t = I18N.t;
    const isEdit = !!item;
    const s = item || { day: presetDay || DAYS[0], startTime: '', endTime: '', classroom: '', courseId: '', notes: '' };
    const courseOptions = `<option value="">${t('none')}</option>` + courses.map((c) => `<option value="${c.id}" ${c.id === s.courseId ? 'selected' : ''}>${Utils.escapeHtml(c.name)}</option>`).join('');
    const dayOptions = DAYS.map((d) => `<option value="${d}" ${d === s.day ? 'selected' : ''}>${t('day_' + d)}</option>`).join('');

    Utils.openModal(isEdit ? t('editClass') : t('addClass'), `
      <form id="schedule-form">
        <div class="form-group"><label>${t('day')}</label><select class="input" id="f-day">${dayOptions}</select></div>
        <div class="form-row">
          <div class="form-group"><label>${t('startTime')}</label><input type="time" class="input" id="f-start" value="${s.startTime}"></div>
          <div class="form-group"><label>${t('endTime')}</label><input type="time" class="input" id="f-end" value="${s.endTime}"></div>
        </div>
        <div class="form-group"><label>${t('course')}</label><select class="input" id="f-course">${courseOptions}</select></div>
        <div class="form-group"><label>${t('classroom')}</label><input class="input" id="f-room" value="${Utils.escapeHtml(s.classroom)}"></div>
        <div class="form-group"><label>${t('notes')}</label><textarea class="input" id="f-notes" rows="2">${Utils.escapeHtml(s.notes)}</textarea></div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancel-btn">${t('cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('save')}</button>
        </div>
      </form>
    `);

    document.getElementById('cancel-btn').addEventListener('click', Utils.closeModal);
    document.getElementById('schedule-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        id: isEdit ? s.id : undefined,
        day: document.getElementById('f-day').value,
        startTime: document.getElementById('f-start').value,
        endTime: document.getElementById('f-end').value,
        courseId: document.getElementById('f-course').value || null,
        classroom: document.getElementById('f-room').value.trim(),
        notes: document.getElementById('f-notes').value.trim(),
      };
      await DB.add('schedule', data);
      Utils.toast(I18N.t('saved'));
      Utils.closeModal();
      await render();
    });
  }

  return { render };
})();
