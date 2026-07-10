/* ============================================================
   dashboard.js
   ============================================================ */

const Dashboard = (() => {
  async function computeStats() {
    const [students, courses, schedule, payments, finance] = await Promise.all([
      DB.getAll('students'), DB.getAll('courses'), DB.getAll('schedule'),
      DB.getAll('payments'), DB.getAll('finance'),
    ]);

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[new Date().getDay()];
    const todaysClasses = schedule.filter((s) => (s.day || '').toLowerCase() === todayName).length;

    const month = Utils.monthStr();
    const monthlyPayments = payments.filter((p) => (p.date || '').startsWith(month)).reduce((a, b) => a + Number(b.amount), 0);
    const monthlyFinanceIncome = finance.filter((f) => f.type === 'income' && (f.date || '').startsWith(month)).reduce((a, b) => a + Number(b.amount), 0);
    const monthlyExpenses = finance.filter((f) => f.type === 'expense' && (f.date || '').startsWith(month)).reduce((a, b) => a + Number(b.amount), 0);
    const monthlyIncome = monthlyPayments + monthlyFinanceIncome;

    return {
      totalStudents: students.length,
      totalCourses: courses.length,
      todaysClasses,
      monthlyIncome,
      monthlyExpenses,
      monthlyProfit: monthlyIncome - monthlyExpenses,
      students, courses, payments, finance,
    };
  }

  function last6MonthsData(payments, finance) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }
    return months.map((m) => {
      const income = payments.filter((p) => (p.date || '').startsWith(m)).reduce((a, b) => a + Number(b.amount), 0)
        + finance.filter((f) => f.type === 'income' && (f.date || '').startsWith(m)).reduce((a, b) => a + Number(b.amount), 0);
      const expense = finance.filter((f) => f.type === 'expense' && (f.date || '').startsWith(m)).reduce((a, b) => a + Number(b.amount), 0);
      return { label: m.slice(5), income, expense };
    });
  }

  function recentActivity(stats) {
    const items = [];
    stats.payments.slice(-5).forEach((p) => {
      const student = stats.students.find((s) => s.id === p.studentId);
      items.push({ date: p.date, text: `${I18N.t('recordPayment')}: ${student ? student.name : ''} — ${Utils.fmtMoney(p.amount)}` });
    });
    return items.sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 6);
  }

  async function render() {
    const t = I18N.t;
    const stats = await computeStats();
    const chartData = last6MonthsData(stats.payments, stats.finance);
    const activity = recentActivity(stats);

    const html = `
      <div class="page-header">
        <div><h1>${t('nav_dashboard')}</h1></div>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon icon-blue">👥</div><div><p class="stat-label">${t('totalStudents')}</p><p class="stat-value">${stats.totalStudents}</p></div></div>
        <div class="stat-card"><div class="stat-icon icon-blue">📚</div><div><p class="stat-label">${t('totalCourses')}</p><p class="stat-value">${stats.totalCourses}</p></div></div>
        <div class="stat-card"><div class="stat-icon icon-amber">🗓️</div><div><p class="stat-label">${t('todaysClasses')}</p><p class="stat-value">${stats.todaysClasses}</p></div></div>
        <div class="stat-card"><div class="stat-icon icon-green">📈</div><div><p class="stat-label">${t('monthlyIncome')}</p><p class="stat-value">${Utils.fmtMoney(stats.monthlyIncome)}</p></div></div>
        <div class="stat-card"><div class="stat-icon icon-red">📉</div><div><p class="stat-label">${t('monthlyExpenses')}</p><p class="stat-value">${Utils.fmtMoney(stats.monthlyExpenses)}</p></div></div>
        <div class="stat-card"><div class="stat-icon ${stats.monthlyProfit >= 0 ? 'icon-green' : 'icon-red'}">💰</div><div><p class="stat-label">${t('monthlyProfit')}</p><p class="stat-value">${Utils.fmtMoney(stats.monthlyProfit)}</p></div></div>
      </div>

      <div class="grid-2">
        <div class="card">
          <h3 class="card-title">${t('incomeVsExpense')}</h3>
          <div class="chart-wrap">${Charts.groupedBarChart(chartData)}</div>
        </div>
        <div class="card">
          <h3 class="card-title">${t('recentActivity')}</h3>
          ${activity.length ? `<ul class="activity-list">${activity.map((a) => `<li><span class="activity-date">${a.date || ''}</span><span>${Utils.escapeHtml(a.text)}</span></li>`).join('')}</ul>` : `<p class="empty-state">${t('noData')}</p>`}
        </div>
      </div>
    `;
    document.getElementById('main-content').innerHTML = html;
  }

  return { render };
})();
