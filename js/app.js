/* ============================================================
   app.js — bootstraps the app: nav, theme, routing, init
   ============================================================ */

const App = (() => {
  const memoryStore = {};
  const safeStorage = {
    getItem(key) {
      try { return localStorage.getItem(key); } catch { return memoryStore[key] ?? null; }
    },
    setItem(key, value) {
      try { localStorage.setItem(key, value); } catch { memoryStore[key] = value; }
    },
  };

  const pages = {
    dashboard: () => Dashboard.render(),
    students: () => Students.render(),
    courses: () => Courses.render(),
    schedule: () => Schedule.render(),
    attendance: () => Attendance.render(),
    payments: () => Payments.render(),
    finance: () => Finance.render(),
    reports: () => Reports.render(),
    materials: () => Materials.render(),
    notes: () => Notes.render(),
    tasks: () => Tasks.render(),
    settings: () => Settings.render(),
  };

  let currentPage = 'dashboard';

  async function navigate(page) {
    if (!pages[page]) page = 'dashboard';
    currentPage = page;
    document.querySelectorAll('.nav-link').forEach((a) => {
      a.classList.toggle('active', a.dataset.page === page);
    });
    const main = document.getElementById('main-content');
    main.classList.add('page-loading');
    await pages[page]();
    main.classList.remove('page-loading');
    document.getElementById('sidebar').classList.remove('open');
    window.scrollTo(0, 0);
  }

  function initTheme() {
    const saved = safeStorage.getItem('tc_theme') || 'light';
    setTheme(saved);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    safeStorage.setItem('tc_theme', theme);
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme');
    setTheme(cur === 'dark' ? 'light' : 'dark');
  }

  function bindGlobalEvents() {
    document.querySelectorAll('.nav-link').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(a.dataset.page);
      });
    });

    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

    document.getElementById('lang-toggle-btn').addEventListener('click', () => {
      const next = I18N.getLang() === 'en' ? 'ar' : 'en';
      I18N.setLang(next);
      document.getElementById('lang-toggle-btn').textContent = next === 'en' ? 'العربية' : 'English';
      navigate(currentPage); // re-render current page in new language
    });

    document.getElementById('menu-toggle-btn').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') Utils.closeModal();
    });
  }

  async function init() {
    I18N.setLang(I18N.getLang());
    document.getElementById('lang-toggle-btn').textContent = I18N.getLang() === 'en' ? 'العربية' : 'English';
    initTheme();
    await DB.open();
    bindGlobalEvents();
    await navigate('dashboard');
  }

  return { navigate, init, setTheme };
})();

document.addEventListener('DOMContentLoaded', App.init);
