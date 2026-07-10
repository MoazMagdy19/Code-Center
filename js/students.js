/* ============================================================
   students.js
   ============================================================ */

const Students = (() => {
  let allStudents = [];
  let allCourses = [];
  let searchQuery = '';

  async function load() {
    allStudents = await DB.getAll('students');
    allCourses = await DB.getAll('courses');
  }

  function courseName(id) {
    const c = allCourses.find((c) => c.id === id);
    return c ? c.name : '';
  }

  function statusBadgeClass(status) {
    return { paid: 'badge-green', partial: 'badge-amber', unpaid: 'badge-red' }[status] || 'badge-red';
  }

  function filtered() {
    const q = searchQuery.toLowerCase();
    if (!q) return allStudents;
    return allStudents.filter((s) =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.phone || '').includes(q) ||
      courseName(s.courseId).toLowerCase().includes(q)
    );
  }

  function card(s) {
    const t = I18N.t;
    const photo = s.photo
      ? `<img src="${s.photo}" class="avatar" alt="">`
      : `<div class="avatar avatar-placeholder">${(s.name || '?').charAt(0).toUpperCase()}</div>`;
    return `
      <div class="entity-card" data-id="${s.id}">
        <div class="entity-card-top">
          ${photo}
          <div class="entity-card-info">
            <p class="entity-name">${Utils.escapeHtml(s.name)}</p>
            <p class="entity-sub">${Utils.escapeHtml(courseName(s.courseId) || t('noCourse'))}</p>
          </div>
          <span class="badge ${statusBadgeClass(s.paymentStatus)}">${t(s.paymentStatus || 'unpaid')}</span>
        </div>
        <div class="entity-card-meta">
          ${s.phone ? `<p>📞 ${Utils.escapeHtml(s.phone)}</p>` : ''}
          ${s.age ? `<p>${t('age')}: ${s.age}</p>` : ''}
          ${s.parentPhone ? `<p>${t('parentPhone')}: ${Utils.escapeHtml(s.parentPhone)}</p>` : ''}
        </div>
        ${s.notes ? `<p class="entity-notes">${Utils.escapeHtml(s.notes)}</p>` : ''}
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
    const list = filtered();

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <h1>${t('nav_students')}</h1>
        <button class="btn btn-primary" id="add-student-btn">+ ${t('addStudent')}</button>
      </div>
      <div class="toolbar">
        <input type="text" id="student-search" class="input" placeholder="${t('searchStudents')}" value="${Utils.escapeHtml(searchQuery)}">
      </div>
      <div class="entity-grid" id="student-list">
        ${list.length ? list.map(card).join('') : `<p class="empty-state">${t('noData')}</p>`}
      </div>
    `;

    document.getElementById('add-student-btn').addEventListener('click', () => openForm());
    document.getElementById('student-search').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderListOnly();
    });

    document.querySelectorAll('#student-list .edit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.entity-card').dataset.id;
        openForm(allStudents.find((s) => s.id === id));
      });
    });
    document.querySelectorAll('#student-list .del-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.entity-card').dataset.id;
        Utils.confirmDialog(I18N.t('confirmDeleteMsg'), async () => {
          await DB.remove('students', id);
          Utils.toast(I18N.t('deleted'));
          await load();
          renderListOnly();
        });
      });
    });
  }

  function renderListOnly() {
    const list = filtered();
    document.getElementById('student-list').innerHTML = list.length
      ? list.map(card).join('')
      : `<p class="empty-state">${I18N.t('noData')}</p>`;
    document.querySelectorAll('#student-list .edit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.entity-card').dataset.id;
        openForm(allStudents.find((s) => s.id === id));
      });
    });
    document.querySelectorAll('#student-list .del-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.entity-card').dataset.id;
        Utils.confirmDialog(I18N.t('confirmDeleteMsg'), async () => {
          await DB.remove('students', id);
          Utils.toast(I18N.t('deleted'));
          await load();
          renderListOnly();
        });
      });
    });
  }

  function openForm(student) {
    const t = I18N.t;
    const isEdit = !!student;
    const s = student || { name: '', photo: '', phone: '', parentPhone: '', age: '', courseId: '', enrollmentDate: Utils.todayStr(), notes: '', paymentStatus: 'unpaid' };

    const courseOptions = `<option value="">${t('none')}</option>` + allCourses.map((c) => `<option value="${c.id}" ${c.id === s.courseId ? 'selected' : ''}>${Utils.escapeHtml(c.name)}</option>`).join('');

    Utils.openModal(isEdit ? t('editStudent') : t('addStudent'), `
      <form id="student-form">
        <div class="form-row photo-row">
          <div id="photo-preview">${s.photo ? `<img src="${s.photo}" class="avatar-lg">` : `<div class="avatar-lg avatar-placeholder">?</div>`}</div>
          <label class="btn btn-secondary btn-sm file-label">${t('uploadPhoto')}<input type="file" id="student-photo" accept="image/*" hidden></label>
        </div>
        <input type="hidden" id="student-photo-data" value="${s.photo ? Utils.escapeHtml(s.photo) : ''}">

        <div class="form-group"><label>${t('name')}</label><input class="input" id="f-name" value="${Utils.escapeHtml(s.name)}" required></div>

        <div class="form-row">
          <div class="form-group"><label>${t('phone')}</label><input class="input" id="f-phone" value="${Utils.escapeHtml(s.phone)}"></div>
          <div class="form-group"><label>${t('parentPhone')}</label><input class="input" id="f-parentPhone" value="${Utils.escapeHtml(s.parentPhone)}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>${t('age')}</label><input type="number" class="input" id="f-age" value="${s.age || ''}"></div>
          <div class="form-group"><label>${t('course')}</label><select class="input" id="f-course">${courseOptions}</select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>${t('enrollmentDate')}</label><input type="date" class="input" id="f-enroll" value="${s.enrollmentDate || Utils.todayStr()}"></div>
          <div class="form-group"><label>${t('paymentStatus')}</label>
            <select class="input" id="f-status">
              <option value="unpaid" ${s.paymentStatus === 'unpaid' ? 'selected' : ''}>${t('unpaid')}</option>
              <option value="partial" ${s.paymentStatus === 'partial' ? 'selected' : ''}>${t('partial')}</option>
              <option value="paid" ${s.paymentStatus === 'paid' ? 'selected' : ''}>${t('paid')}</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label>${t('notes')}</label><textarea class="input" id="f-notes" rows="3">${Utils.escapeHtml(s.notes)}</textarea></div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancel-btn">${t('cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('save')}</button>
        </div>
      </form>
    `);

    document.getElementById('cancel-btn').addEventListener('click', Utils.closeModal);
    document.getElementById('student-photo').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const dataUrl = await Utils.fileToDataURL(file);
      document.getElementById('student-photo-data').value = dataUrl;
      document.getElementById('photo-preview').innerHTML = `<img src="${dataUrl}" class="avatar-lg">`;
    });

    document.getElementById('student-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        id: isEdit ? s.id : undefined,
        name: document.getElementById('f-name').value.trim(),
        photo: document.getElementById('student-photo-data').value,
        phone: document.getElementById('f-phone').value.trim(),
        parentPhone: document.getElementById('f-parentPhone').value.trim(),
        age: Number(document.getElementById('f-age').value) || null,
        courseId: document.getElementById('f-course').value || null,
        enrollmentDate: document.getElementById('f-enroll').value,
        paymentStatus: document.getElementById('f-status').value,
        notes: document.getElementById('f-notes').value.trim(),
      };
      if (!data.name) return;
      await DB.add('students', data);
      Utils.toast(I18N.t('saved'));
      Utils.closeModal();
      await load();
      renderListOnly();
    });
  }

  return { render };
})();
