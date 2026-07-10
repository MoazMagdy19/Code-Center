/* ============================================================
   charts.js — minimal dependency-free SVG charts
   ============================================================ */

const Charts = (() => {
  const PALETTE = ['#3b66f5', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  // data: [{ label, income, expense }]
  function groupedBarChart(data, { width = 640, height = 280 } = {}) {
    if (!data.length) return `<div class="chart-empty">${I18N.t('noData')}</div>`;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const maxVal = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));
    const groupW = chartW / data.length;
    const barW = Math.min(28, groupW / 3);

    let bars = '';
    let labels = '';
    let gridLines = '';
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = padding.top + chartH - (chartH * i) / steps;
      const val = Math.round((maxVal * i) / steps);
      gridLines += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="var(--chart-grid)" stroke-width="1"/>`;
      gridLines += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--chart-text)">${val}</text>`;
    }

    data.forEach((d, i) => {
      const gx = padding.left + i * groupW + groupW / 2;
      const incH = (d.income / maxVal) * chartH;
      const expH = (d.expense / maxVal) * chartH;
      const incY = padding.top + chartH - incH;
      const expY = padding.top + chartH - expH;
      bars += `<rect x="${gx - barW - 3}" y="${incY}" width="${barW}" height="${incH}" rx="4" fill="${PALETTE[0]}"><title>${I18N.t('income')}: ${d.income}</title></rect>`;
      bars += `<rect x="${gx + 3}" y="${expY}" width="${barW}" height="${expH}" rx="4" fill="${PALETTE[1]}"><title>${I18N.t('expense')}: ${d.expense}</title></rect>`;
      labels += `<text x="${gx}" y="${height - padding.bottom + 18}" text-anchor="middle" font-size="11" fill="var(--chart-text)">${d.label}</text>`;
    });

    return `
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg" preserveAspectRatio="xMidYMid meet">
        ${gridLines}
        ${bars}
        ${labels}
      </svg>
      <div class="chart-legend">
        <span><i style="background:${PALETTE[0]}"></i>${I18N.t('income')}</span>
        <span><i style="background:${PALETTE[1]}"></i>${I18N.t('expense')}</span>
      </div>
    `;
  }

  // data: [{ label, value }]
  function pieChart(data, { size = 240 } = {}) {
    const total = data.reduce((a, b) => a + b.value, 0);
    if (!total) return `<div class="chart-empty">${I18N.t('noData')}</div>`;
    const r = size / 2 - 8;
    const cx = size / 2;
    const cy = size / 2;
    let angle = -90;
    let paths = '';
    let legend = '';

    data.forEach((d, i) => {
      const pct = d.value / total;
      const sweep = pct * 360;
      const start = angle;
      const end = angle + sweep;
      angle = end;
      const largeArc = sweep > 180 ? 1 : 0;
      const x1 = cx + r * Math.cos((Math.PI * start) / 180);
      const y1 = cy + r * Math.sin((Math.PI * start) / 180);
      const x2 = cx + r * Math.cos((Math.PI * end) / 180);
      const y2 = cy + r * Math.sin((Math.PI * end) / 180);
      const color = PALETTE[i % PALETTE.length];
      if (data.length === 1) {
        paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"><title>${d.label}: ${d.value}</title></circle>`;
      } else {
        paths += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z" fill="${color}"><title>${d.label}: ${d.value}</title></path>`;
      }
      legend += `<span><i style="background:${color}"></i>${d.label} (${((pct) * 100).toFixed(0)}%)</span>`;
    });

    return `
      <svg viewBox="0 0 ${size} ${size}" class="chart-svg pie" preserveAspectRatio="xMidYMid meet">${paths}</svg>
      <div class="chart-legend">${legend}</div>
    `;
  }

  return { groupedBarChart, pieChart, PALETTE };
})();
