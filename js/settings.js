/* ============================================================
   settings.js
   ============================================================ */

const Settings = (() => {
  // Blobs can't go directly into JSON, so we base64-encode material files for backup.
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function base64ToBlob(dataUrl) {
    const [meta, b64] = dataUrl.split(',');
    const mime = meta.match(/:(.*?);/)[1];
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  async function doBackup() {
    const data = await DB.exportAll();
    // convert material blobs to base64
    for (const m of data.materials) {
      if (m.blob) {
        m.blobData = await blobToBase64(m.blob);
        delete m.blob;
      }
    }
    const payload = { exportedAt: new Date().toISOString(), version: 1, data };
    Utils.downloadJSON(payload, `training-center-backup-${Utils.todayStr()}.json`);
    Utils.toast(I18N.t('saved'));
  }

  async function doRestore(file) {
    const text = await file.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      Utils.toast('Invalid file', 'error');
      return;
    }
    const data = payload.data || payload;
    if (data.materials) {
      for (const m of data.materials) {
        if (m.blobData) {
          m.blob = base64ToBlob(m.blobData);
          delete m.blobData;
        }
      }
    }
    await DB.importAll(data);
    Utils.toast(I18N.t('restoreDone'));
    setTimeout(() => window.location.reload(), 1200);
  }

  async function render() {
    const t = I18N.t;
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const lang = I18N.getLang();

    document.getElementById('main-content').innerHTML = `
      <div class="page-header"><h1>${t('nav_settings')}</h1></div>

      <div class="grid-2">
        <div class="card">
          <h3 class="card-title">${t('appearance')}</h3>
          <div class="theme-choices">
            <button class="theme-choice ${theme === 'light' ? 'active' : ''}" id="choose-light">☀️<br>${t('lightMode')}</button>
            <button class="theme-choice ${theme === 'dark' ? 'active' : ''}" id="choose-dark">🌙<br>${t('darkMode')}</button>
          </div>
          <h3 class="card-title" style="margin-top:20px">${t('language')}</h3>
          <div class="theme-choices">
            <button class="theme-choice ${lang === 'en' ? 'active' : ''}" id="choose-en">EN<br>English</button>
            <button class="theme-choice ${lang === 'ar' ? 'active' : ''}" id="choose-ar">AR<br>العربية</button>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">${t('backupData')}</h3>
          <p class="hint-note">${t('backupDesc')}</p>
          <button class="btn btn-primary" id="backup-btn">⬇️ ${t('backupBtn')}</button>

          <h3 class="card-title" style="margin-top:20px">${t('restoreData')}</h3>
          <p class="hint-note">${t('restoreDesc')}</p>
          <label class="btn btn-secondary file-label">⬆️ ${t('restoreBtn')}<input type="file" id="restore-input" accept=".json" hidden></label>
        </div>

        <div class="card grid-span-2">
          <p class="hint-note">ℹ️ ${t('storageInfo')}</p>
        </div>
      </div>
    `;

    document.getElementById('choose-light').addEventListener('click', () => setThemeBtn('light'));
    document.getElementById('choose-dark').addEventListener('click', () => setThemeBtn('dark'));
    document.getElementById('choose-en').addEventListener('click', () => setLangBtn('en'));
    document.getElementById('choose-ar').addEventListener('click', () => setLangBtn('ar'));

    document.getElementById('backup-btn').addEventListener('click', doBackup);
    document.getElementById('restore-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      Utils.confirmDialog(I18N.t('restoreConfirm'), () => doRestore(file));
    });
  }

  function setThemeBtn(theme) {
    App.setTheme(theme);
    render();
  }

  function setLangBtn(lang) {
    I18N.setLang(lang);
    document.getElementById('lang-toggle-btn').textContent = lang === 'en' ? 'العربية' : 'English';
    render();
  }

  return { render };
})();
