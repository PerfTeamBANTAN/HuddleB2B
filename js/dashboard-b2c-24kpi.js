/* =====================================================
   B2C DASHBOARD RENDER SCRIPT
   NEXT LEVEL • PRODUCTION SAFE
===================================================== */

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

const getSummaryClass = (val) => {
  if (val >= 95) return 'summary-good';
  if (val >= 90) return 'summary-warning';
  return 'summary-bad';
};

const getTrend = (today, yesterday) => {
  if (typeof today !== 'number' || typeof yesterday !== 'number') return '';
  if (today > yesterday) return '▲';
  if (today < yesterday) return '▼';
  return '■';
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
   CALCULATE WILAYAH SUMMARY
=============================== */
function calcWilayah(data, wilayah) {
  const valid = data.filter(
    d => typeof d[wilayah] === 'number' && typeof d.target === 'number'
  );

  const good = valid.filter(d => d[wilayah] >= d.target).length;
  const total = valid.length;
  const pct = total ? (good / total) * 100 : null;

  return { good, bad: total - good, pct };
}

/* ===============================
   FIND BEST & WORST KPI
=============================== */
function findExtremes(data, wilayah) {
  const scored = data
    .filter(d => typeof d[wilayah] === 'number' && typeof d.target === 'number')
    .map(d => ({
      indikator: d.indikator,
      diff: d[wilayah] - d.target
    }));

  scored.sort((a, b) => b.diff - a.diff);

  return {
    best: scored[0],
    worst: scored[scored.length - 1]
  };
}

/* ===============================
   RENDER SUMMARY
=============================== */
function renderSummary(api) {
  const { data, lastUpdate } = api;

  document.getElementById('b2cLastUpdate').innerText =
    `Last Update : ${lastUpdate}`;

  const tgr = calcWilayah(data, 'tangerang');
  const btn = calcWilayah(data, 'banten');

  const totalKPI = data.length;

  document.getElementById('b2cSummary').innerHTML = `
    <div class="col-md-4">
      <div class="summary-card ${getSummaryClass(tgr.pct)}">
        <h6>TANGERANG</h6>
        <div class="summary-value">${fmt(tgr.pct)}%</div>
        <div class="summary-sub">✅ ${tgr.good} ❌ ${tgr.bad}</div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="summary-card ${getSummaryClass(btn.pct)}">
        <h6>BANTEN</h6>
        <div class="summary-value">${fmt(btn.pct)}%</div>
        <div class="summary-sub">✅ ${btn.good} ❌ ${btn.bad}</div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="summary-card">
        <h6>TOTAL KPI</h6>
        <div class="summary-value">${totalKPI}</div>
        <div class="summary-sub">
          GOOD ${tgr.good + btn.good} | BAD ${tgr.bad + btn.bad}
        </div>
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

      container.insertAdjacentHTML('beforeend', `
        <div class="col-md-4 col-lg-3">
          <div class="kpi-card">
            <div class="kpi-title">${kpi.indikator}</div>

            <div class="kpi-row">
              <span>Target</span>
              <span>${fmt(kpi.target)}</span>
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
    setInterval(load, 5 * 60 * 1000); // auto refresh 5 menit

  } catch (err) {
    console.error('B2C Dashboard Error:', err);
  }
};
