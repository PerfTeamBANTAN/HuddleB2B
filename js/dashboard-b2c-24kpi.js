/* =====================================================
   B2C DASHBOARD RENDER SCRIPT
   NEXT × NEXT LEVEL • V3 • OPERATIONAL INTELLIGENCE
===================================================== */

/* ===============================
   HELPERS
=============================== */
const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '-';
  return Number(v).toLocaleString('id-ID', { maximumFractionDigits: 2 });
};

const getTrend = (t, y) => {
  if (typeof t !== 'number' || typeof y !== 'number') return '■';
  if (t > y) return '▲';
  if (t < y) return '▼';
  return '■';
};

const miniProgress = (val, target) => {
  if (typeof val !== 'number' || typeof target !== 'number' || target === 0)
    return { raw: 0, pct: 0, color: '#ff6b6b' };

  const raw = (val / target) * 100;
  const pct = Math.min(raw, 130);

  if (raw >= 100) return { raw, pct, color: '#20c997' };
  if (raw >= 90)  return { raw, pct, color: '#ffc107' };
  return { raw, pct, color: '#ff6b6b' };
};

const getBadge = (raw) => {
  if (raw < 85) return `<span style="color:#ff6b6b;font-size:10px;">🔴 CRITICAL</span>`;
  if (raw < 100) return `<span style="color:#ffc107;font-size:10px;">🟠 WATCH</span>`;
  return `<span style="color:#20c997;font-size:10px;">🟢 SAFE</span>`;
};

/* ===============================
   PRIORITY SCORE (AUTO SORT)
=============================== */
const priorityScore = (kpi) => {
  let score = 0;

  if (kpi.tangerang < kpi.target) score += 30;
  if (kpi.banten < kpi.target) score += 30;

  if (getTrend(kpi.tangerang, kpi.tangerang_yesterday) === '▼') score += 20;
  if (getTrend(kpi.banten, kpi.banten_yesterday) === '▼') score += 20;

  return score;
};

/* ===============================
   GROUP & SORT
=============================== */
function groupByKategori(data) {
  return data.reduce((acc, item) => {
    if (!acc[item.kategori]) acc[item.kategori] = [];
    acc[item.kategori].push(item);
    return acc;
  }, {});
}

/* ===============================
   KPI GRID – INTELLIGENT
=============================== */
function renderKpiGrid(data) {
  const container = document.getElementById('b2cKpiGrid');
  container.innerHTML = '';

  const grouped = groupByKategori(data);

  Object.entries(grouped).forEach(([kategori, items]) => {
    items.sort((a, b) => priorityScore(b) - priorityScore(a));

    container.insertAdjacentHTML('beforeend', `
      <div class="col-12">
        <div class="kategori-title">${kategori}</div>
      </div>
    `);

    items.forEach(kpi => {
      const tg = miniProgress(kpi.tangerang, kpi.target);
      const bn = miniProgress(kpi.banten, kpi.target);

      container.insertAdjacentHTML('beforeend', `
        <div class="col-md-4 col-lg-3">
          <div class="kpi-card">
            <div class="kpi-title">
              ${kpi.indikator}<br/>
              ${getBadge(Math.min(tg.raw, bn.raw))}
            </div>

            <div class="kpi-row">
              <span>Target</span>
              <span>${fmt(kpi.target)}</span>
            </div>

            <div class="kpi-row">
              <span>Tangerang ${getTrend(kpi.tangerang, kpi.tangerang_yesterday)}</span>
              <span>${fmt(kpi.tangerang)}</span>
            </div>
            <div style="height:4px;background:#222;border-radius:6px;overflow:hidden;">
              <div style="height:100%;width:${tg.pct}%;background:${tg.color};"></div>
            </div>

            <div class="kpi-row">
              <span>Banten ${getTrend(kpi.banten, kpi.banten_yesterday)}</span>
              <span>${fmt(kpi.banten)}</span>
            </div>
            <div style="height:4px;background:#222;border-radius:6px;overflow:hidden;">
              <div style="height:100%;width:${bn.pct}%;background:${bn.color};"></div>
            </div>
          </div>
        </div>
      `);
    });
  });
}

/* ===============================
   MAIN
=============================== */
function renderB2CDashboard(api) {
  if (!api || !Array.isArray(api.data)) return;
  renderKpiGrid(api.data);
}
