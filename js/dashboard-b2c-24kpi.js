/* =====================================================
   B2C DASHBOARD RENDER SCRIPT (STABLE VERSION)
   ❗ Tidak butuh API_URL_B2C
   ❗ Compatible dengan loader lama
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
  const { summary, data, lastUpdate } = api;

  const lastEl = document.getElementById('b2cLastUpdate');
  if (lastEl) lastEl.innerText = `Last Update : ${lastUpdate}`;

  const tangerangGood = data.filter(d => isGood(d.tangerang, d.target)).length;
  const bantenGood = data.filter(d => isGood(d.banten, d.target)).length;
  const total = summary.totalKPI || data.length;

  document.getElementById('b2cSummary').innerHTML = `
    <div class="col-md-4">
      <div class="summary-card">
        <h6>TANGERANG</h6>
        <div class="summary-value">${fmt(tangerangGood / total * 100)}%</div>
        <div class="summary-sub">✅ ${tangerangGood} ❌ ${total - tangerangGood}</div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="summary-card">
        <h6>BANTEN</h6>
        <div class="summary-value">${fmt(bantenGood / total * 100)}%</div>
        <div class="summary-sub">✅ ${bantenGood} ❌ ${total - bantenGood}</div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="summary-card">
        <h6>TOTAL KPI</h6>
        <div class="summary-value">${total}</div>
        <div class="summary-sub">
          GOOD ${summary.good} | BAD ${summary.bad}
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
              <span class="${tgGood ? 'good' : 'bad'}">${fmt(kpi.tangerang)}</span>
            </div>

            <div class="kpi-row">
              <span>Banten</span>
              <span class="${bnGood ? 'good' : 'bad'}">${fmt(kpi.banten)}</span>
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
function renderB2CDashboard(apiResponse) {
  if (!apiResponse || !Array.isArray(apiResponse.data)) {
    console.error('Invalid B2C API Response', apiResponse);
    return;
  }

  renderSummary(apiResponse);
  renderKpiGrid(apiResponse.data);
}

/* =====================================================
   🔥 INIT FUNCTION (HARUS ADA & SESUAI LOADER)
===================================================== */
window.initDashboardB2C24KPI = async function () {
  try {
    if (typeof B2B_API_URL === 'undefined') {
      throw new Error('B2B_API_URL tidak tersedia');
    }

    const url = `${B2B_API_URL}?type=b2c_24kpi_banten`;
    const res = await fetch(url);
    const json = await res.json();

    renderB2CDashboard(json);
  } catch (err) {
    console.error('B2C Dashboard Error:', err);
  }
};
