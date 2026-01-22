/* =====================================================
   B2C DASHBOARD RENDER SCRIPT
   NEXT LEVEL • PRODUCTION SAFE (V2)
===================================================== */

/* ===============================
   HELPERS (SAFE GUARD)
=============================== */
window.fmt = window.fmt || function (v) {
  if (v === null || v === undefined || isNaN(v)) return '-';
  return Number(v).toLocaleString('id-ID', { maximumFractionDigits: 2 });
};

window.isGood = window.isGood || function (val, target) {
  return typeof val === 'number' &&
         typeof target === 'number' &&
         val >= target;
};

window.getTrend = window.getTrend || function (today, yesterday) {
  if (typeof today !== 'number' || typeof yesterday !== 'number') return '';
  if (today > yesterday) return '▲';
  if (today < yesterday) return '▼';
  return '■';
};

/* ===============================
   MINI KPI PROGRESS
=============================== */
window.miniProgress = window.miniProgress || function (val, target) {
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
  const summary = document.getElementById('b2cSummary');
  const grid    = document.getElementById('b2cKpiGrid');

  if (summary) {
    summary.innerHTML = `
      <div class="col-md-4 skeleton-card"></div>
      <div class="col-md-4 skeleton-card"></div>
      <div class="col-md-4 skeleton-card"></div>
    `;
  }

  if (grid) {
    grid.innerHTML =
      '<div class="col-md-3 skeleton-kpi"></div>'.repeat(8);
  }
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

  const tangerangAch = summary.totalAch?.tangerang ?? null;
  const bantenAch    = summary.totalAch?.banten ?? null;

  document.getElementById('b2cSummary').innerHTML = `
    <div class="col-md-4">
      <div class="summary-card">
        <h6>TANGERANG</h6>
        <div class="summary-value">${fmt(tangerangAch)}%</div>
        <div class="summary-sub">✅ ${summary.good} ❌ ${summary.bad}</div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="summary-card">
        <h6>BANTEN</h6>
        <div class="summary-value">${fmt(bantenAch)}%</div>
        <div class="summary-sub">✅ ${summary.good} ❌ ${summary.bad}</div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="summary-card">
        <h6>TOTAL KPI</h6>
        <div class="summary-value">${summary.totalKPI}</div>
        <div class="summary-sub">GOOD ${summary.good} | BAD ${summary.bad}</div>
      </div>
    </div>
  `;
}

/* ===============================
   RENDER KPI GRID
=============================== */
function renderKpiGrid(data) {
  const container = document.getElementById('b2cKpiGrid');
  container.innerHTML = '';

  const grouped = groupByKategori(data);

  Object.entries(grouped).forEach(([kategori, items]) => {
    container.insertAdjacentHTML('beforeend', `
      <div class="col-12">
        <div class="kategori-title">${kategori}</div>
      </div>
    `);

    items.forEach(kpi => {
      const tgGood = isGood(kpi.tangerang, kpi.target);
      const bnGood = isGood(kpi.banten, kpi.target);

      const tg = miniProgress(kpi.tangerang, kpi.target);
      const bn = miniProgress(kpi.banten, kpi.target);

      const totalStack = tg.pct + bn.pct || 1;

      container.insertAdjacentHTML('beforeend', `
        <div class="col-md-4 col-lg-3">
          <div class="kpi-card">
            <div class="kpi-title">${kpi.indikator}</div>

            <div class="kpi-row">
              <span>Target</span>
              <span>${fmt(kpi.target)}</span>
            </div>

            <div style="margin:6px 0;height:5px;background:rgba(255,255,255,.12);border-radius:6px;overflow:hidden;">
              <div style="height:100%;width:${(tg.pct/totalStack)*100}%;background:${tg.color};float:left"></div>
              <div style="height:100%;width:${(bn.pct/totalStack)*100}%;background:${bn.color};float:left"></div>
            </div>

            <div class="kpi-row">
              <span>Tangerang</span>
              <span class="${tgGood ? 'good' : 'bad'}">
                ${fmt(kpi.tangerang)}
                <small>${getTrend(kpi.tangerang, kpi.tangerang_yesterday)}</small>
              </span>
            </div>

            <div class="kpi-row">
              <span>Banten</span>
              <span class="${bnGood ? 'good' : 'bad'}">
                ${fmt(kpi.banten)}
                <small>${getTrend(kpi.banten, kpi.banten_yesterday)}</small>
              </span>
            </div>
          </div>
        </div>
      `);
    });
  });
}

/* ===============================
   MAIN RENDER
=============================== */
function renderB2CDashboard(api) {
  if (!api || !Array.isArray(api.data)) return;
  renderSummary(api);
  renderKpiGrid(api.data);
}

/* ===============================
   INIT + AUTO REFRESH
=============================== */
window.initDashboardB2C24KPI = async function () {
  try {
    showSkeleton();

    const load = async () => {
      const res = await fetch(`${B2B_API_URL}?type=b2c_24kpi_banten`);
      const json = await res.json();
      renderB2CDashboard(json);
    };

    await load();
    setInterval(load, 5 * 60 * 1000);
  } catch (err) {
    console.error('B2C Dashboard Error:', err);
  }
};
