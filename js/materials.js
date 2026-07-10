/* ============================================================
   materials.js
   ============================================================ */

const Materials = (() => {
  let materials = [];
  let courses = [];
  let filterCourse = '';
  let uploadCourse = '';

  async function load() {
    materials = await DB.getAll('materials');
    courses = await DB.getAll('courses');
  }

  function iconFor(type) {
    const t = (type || '').toLowerCase();
    if (['pdf'].includes(t)) return '📄';
    if (['doc', 'docx'].includes(t)) return '📝';
    if (['ppt', 'pptx'].includes(t)) return '📊';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(t)) return '🖼️';
    if (['mp4', 'mov', 'avi', 'webm'].includes(t)) return '🎬';
    if (['zip', 'rar', '7z'].includes(t)) return '🗜️';
    if (['js', 'ts', 'py', 'java', 'cpp', 'html', 'css', 'json'].includes(t)) return '💻';
    return '📎';
  }

  function courseName(id) {
    const c = courses.find((c) => c.id === id);
    return c ? c.name : '';
  }

  function card(m) {
    const t = I18N.t;
    return `
      <div class="entity-card material-card" data-id="${m.id}">
        <div class="material-icon">${iconFor(m.fileType)}</div>
        <div class="material-info">
          <p class="entity-name-sm">${Utils.escapeHtml(m.name)}</p>
          <p class="entity-sub">${courseName(m.courseId) || t('uncategorized')} · ${Utils.fmtSize(m.size || 0)}</p>
          <div class="entity-card-actions">
            <button class="btn btn-secondary btn-sm open-btn">${t('open')}</button>
            <button class="btn btn-danger btn-sm del-btn">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }

  async function render() {
    const t = I18N.t;
    await load();
    const courseOptionsFilter = `<option value="">${t('all')}</option>` + courses.map((c) => `<option value="${c.id}" ${c.id === filterCourse ? 'selected' : ''}>${Utils.escapeHtml(c.name)}</option>`).join('');
    const courseOptionsUpload = `<option value="">${t('uncategorized')}</option>` + courses.map((c) => `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`).join('');

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <h1>${t('nav_materials')}</h1>
        <div class="header-actions">
          <select class="input" id="upload-course">${courseOptionsUpload}</select>
          <label class="btn btn-primary file-label">+ ${t('uploadFile')}<input type="file" id="file-input" hidden></label>
        </div>
      </div>
      <div class="toolbar"><select class="input" id="filter-course">${courseOptionsFilter}</select></div>
      <div class="entity-grid" id="materials-list"></div>
    `;

    document.getElementById('filter-course').addEventListener('change', (e) => {
      filterCourse = e.target.value;
      renderList();
    });
    document.getElementById('upload-course').addEventListener('change', (e) => { uploadCourse = e.target.value; });
    document.getElementById('file-input').addEventListener('change', handleUpload);

    renderList();
  }

  function renderList() {
    const t = I18N.t;
    const list = filterCourse ? materials.filter((m) => m.courseId === filterCourse) : materials;
    const container = document.getElementById('materials-list');
    container.innerHTML = list.length ? list.map(card).join('') : `<p class="empty-state">${t('noData')}</p>`;

    container.querySelectorAll('.open-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.material-card').dataset.id;
        const m = materials.find((m) => m.id === id);
        if (m && m.blob) {
          const url = URL.createObjectURL(m.blob);
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
      });
    });
    container.querySelectorAll('.del-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.material-card').dataset.id;
        Utils.confirmDialog(I18N.t('confirmDeleteMsg'), async () => {
          await DB.remove('materials', id);
          Utils.toast(I18N.t('deleted'));
          await load();
          renderList();
        });
      });
    });
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    await DB.add('materials', {
      courseId: uploadCourse || null,
      name: file.name,
      fileType: ext,
      size: file.size,
      blob: file,
      dateAdded: Utils.todayStr(),
    });
    Utils.toast(I18N.t('saved'));
    e.target.value = '';
    await load();
    renderList();
  }

  return { render };
})();
