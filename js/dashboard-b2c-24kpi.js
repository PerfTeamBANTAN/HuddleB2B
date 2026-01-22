/* =====================================================
   B2C DASHBOARD RENDER SCRIPT
   NEXT LEVEL • PRODUCTION SAFE (V2)
===================================================== */

window.B2C24KPI = window.B2C24KPI || (function () {

  /* ===============================
     HELPERS
  =============================== */
  const fmt = (v) => {
    if (v === null || v === undefined || isNaN(v)) return '-';
    return Number(v).toLocaleString('id-ID', { maximumFractionDigits: 2 });
  };

  const isGood = (val, target) =>
    typeof val === 'number' &&
    typeof target === 'number' &&
    val >= target;

  const getTrend = (today, yesterday) => {
    if (typeof today !== 'number' || typeof yesterday !== 'number') return '';
    if (today > yesterday) return '▲';
    if (today < yesterday) return '▼';
    return '■';
  };

  /* ===============================
     MINI KPI PROGRESS
  =============================== */
  const miniProgress = (val, target) => {
    if (typeof val !== 'number' || typeof target !== 'number' || target === 0) {
      return { raw: 0, pct: 0, color: '#ff6b6b', glow: '' };
    }

    const raw = (val / target) * 100;
    const pct = Math.min(raw, 120);

    let color = '#ff6b6b';
    let glow  = '0 0 0 transparent';

    if (raw >= 100) {
      color = '#20c997';
      glow  = '0 0 6px rgba(32,201,151,.65)';
    } else if (raw >= 90) {
      color = '#ffc107';
      glow  = '0 0 6px rgba(255,193,7,.55)';
    } else {
      glow  = '0 0 8px rgba(255,107,107,.85)';
    }

    return { raw, pct, color, glow };
  };

  /* ===============================
     SKELETON LOADER
  =============================== */
  function showSkeleton() {
    document.getElementById('b2cSummary').innerHTML = `
      <div class="col-md-4 skeleton-card"></div>
      <div class="col-md-4 skeleton-card"></div>
      <div class="col-md-4 skeleton-card"></div>
    `;
    document.getElementById('b2cKpiGrid').innerHTML =
      '<div class="col-md-3 skeleton-kpi"></div>'.repeat(8);
  }

  /* ===============================
     GROUP BY KATEGORI
  =============================== */
  function groupByKategori(data) {
    return data.reduce((acc, item) => {
      if (!acc[item.kategori]) acc[item.kategori] = [];
      acc[item.kategori].push(item);
      return acc;
    }, {});
  }

  /* ===============================
     RENDER SUMMARY
  =============================== */
  function renderSummary(api) {
    const { summary, lastUpdate } = api;

    const lastEl = document.getElementById('b2cLastUpdate');
    if (lastEl) lastEl.innerText = `Last Update : ${lastUpdate}`;

    document.getElementById('b2cSummary').innerHTML = `
      <div class="col-md-4"><div class="summary-card">
        <h6>TANGERANG</h6>
        <div class="summary-value">${fmt(summary.totalAch?.tangerang)}%</div>
        <div class="summary-sub">✅ ${summary.good} ❌ ${summary.bad}</div>
      </div></div>

      <div class="col-md-4"><div class="summary-card">
        <h6>BANTEN</h6>
        <div class="summary-value">${fmt(summary.totalAch?.banten)}%</div>
        <div class="summary-sub">✅ ${summary.good} ❌ ${summary.bad}</div>
      </div></div>

      <div class="col-md-4"><div class="summary-card">
        <h6>TOTAL KPI</h6>
        <div class="summary-value">${summary.totalKPI}</div>
        <div class="summary-sub">GOOD ${summary.good} | BAD ${summary.bad}</div>
      </div></div>
    `;
  }

  /* ===============================
     RENDER KPI GRID
  =============================== */
  function renderKpiGrid(data) {
  console.log('RENDER KPI GRID BARU JALAN');

  const container = document.getElementById('b2cKpiGrid');
   container.innerHTML = '<div class="b2c-kpi-wrapper"></div>';

   const wrapper = container.querySelector('.b2c-kpi-wrapper');

  const grouped = groupByKategori(data);

  Object.entries(grouped).forEach(([kategori, items]) => {

    const row = document.createElement('div');
    row.className = 'kpi-category-row';

    const title = document.createElement('div');
    title.className = 'kpi-category-title';
    title.textContent = kategori;

    const cards = document.createElement('div');
    cards.className = 'kpi-category-cards';

    items.forEach(kpi => {
      const card = document.createElement('div');
      card.className = 'kpi-card mini';
      card.innerHTML = `
        <div class="kpi-title">${kpi.indikator}</div>
        <div class="kpi-row"><span>Target</span><span>${fmt(kpi.target)}</span></div>
        <div class="kpi-row"><span>Tgr</span><span>${fmt(kpi.tangerang)}</span></div>
        <div class="kpi-row"><span>Bnt</span><span>${fmt(kpi.banten)}</span></div>
      `;
      cards.appendChild(card);
    });

    row.appendChild(title);
    row.appendChild(cards);
    wrapper.appendChild(row);
  });
}

  /* ===============================
     MAIN
  =============================== */
  function render(api) {
    if (!api || !Array.isArray(api.data)) return;
    renderSummary(api);
    renderKpiGrid(api.data);
  }

  async function init() {
    showSkeleton();
    const res = await fetch(`${B2B_API_URL}?type=b2c_24kpi_banten`);
    const json = await res.json();
    render(json);
    setInterval(init, 5 * 60 * 1000);
  }

  return { init };

})();

window.initDashboardB2C24KPI = () => B2C24KPI.init();
