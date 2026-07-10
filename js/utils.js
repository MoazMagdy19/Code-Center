/* ============================================================
   utils.js — shared helpers used across all page modules
   ============================================================ */

const Utils = (() => {
  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function monthStr(d = new Date()) {
    return d.toISOString().slice(0, 7);
  }

  function fmtMoney(n) {
    const v = Number(n) || 0;
    return v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function fmtSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  // ---------- Modal ----------
  function openModal(title, bodyHtml, { size = 'md' } = {}) {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal');
    modal.className = `modal modal-${size}`;
    modal.innerHTML = `
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="icon-btn" id="modal-close-btn" aria-label="close">&times;</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
    `;
    overlay.classList.add('active');
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
  }

  function confirmDialog(message, onConfirm) {
    const t = I18N.t;
    openModal(t('confirmDeleteTitle'), `
      <p class="confirm-msg">${escapeHtml(message)}</p>
      <div class="form-actions">
        <button class="btn btn-secondary" id="confirm-cancel">${t('cancel')}</button>
        <button class="btn btn-danger" id="confirm-ok">${t('delete')}</button>
      </div>
    `, { size: 'sm' });
    document.getElementById('confirm-cancel').addEventListener('click', closeModal);
    document.getElementById('confirm-ok').addEventListener('click', () => {
      closeModal();
      onConfirm();
    });
  }

  // ---------- File helpers ----------
  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function downloadJSON(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
  }

  // Exports an array of objects to CSV (opens directly in Excel)
  function downloadCSV(rows, filename) {
    if (!rows.length) {
      toast(I18N.t('noData'), 'error');
      return;
    }
    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(',')];
    rows.forEach((row) => {
      const line = headers.map((h) => {
        const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvLines.push(line.join(','));
    });
    const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
  }

  // Opens a print-friendly window; user can "Save as PDF" from the browser print dialog
  function printReport(titleHtml, bodyHtml) {
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html><html lang="${I18N.getLang()}" dir="${I18N.getLang() === 'ar' ? 'rtl' : 'ltr'}">
      <head><meta charset="UTF-8"><title>${titleHtml}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1e293b; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        h2 { font-size: 15px; color: #64748b; font-weight: normal; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0 28px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 13px; text-align: start; }
        th { background: #f1f5f9; }
        .summary-grid { display: flex; gap: 16px; flex-wrap: wrap; margin: 16px 0; }
        .summary-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 18px; min-width: 140px; }
        .summary-box .label { font-size: 11px; color: #64748b; text-transform: uppercase; }
        .summary-box .value { font-size: 20px; font-weight: bold; }
      </style></head>
      <body>${bodyHtml}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  function el(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html.trim();
    return tmp.firstElementChild;
  }

  return {
    todayStr, monthStr, fmtMoney, fmtSize, escapeHtml, toast,
    openModal, closeModal, confirmDialog,
    fileToDataURL, downloadBlob, downloadJSON, downloadCSV, printReport, el,
  };
})();
