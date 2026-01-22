/* =====================================================
   B2C DASHBOARD RENDER SCRIPT
   Compatible with API:
   {
     lastUpdate,
     summary,
     data:[{ kategori, indikator, target, banten, tangerang }]
   }
===================================================== */

/* ===============================
   HELPERS
=============================== */
const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '-';
  return Number(v).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
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

  document.getElementById('b2cLastUpdate').innerText =
    `Last Update : ${lastUpdate}`;

  const tangerangGood = data.filter(d =>
    isGood(d.tangerang, d.target)
  ).length;

  const bantenGood = data.filter(d =>
    isGood(d.banten, d.target)
  ).length;

  const total = summary.totalKPI;

  document.getElementById('b2cSummary').innerHTML = `
    <div class="col-md-4">
      <div class="summary-card">
        <h6>TANGERANG</h6>
        <div class="summary-value">
          ${fmt((tangerangGood / total) * 100)}%
        </div>
        <div class="summary-sub">
          ✅ ${tangerangGood} &nbsp; ❌ ${total - tangerangGood}
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="summary-card">
        <h6>BANTEN</h6>
        <div class="summary-value">
          ${fmt((bantenGood / total) * 100)}%
        </div>
        <div class="summary-sub">
          ✅ ${bantenGood} &nbsp; ❌ ${total - bantenGood}
        </div>
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

  Object.keys(grouped).forEach(kategori => {

    /* ===== KATEGORI HEADER ===== */
    container.insertAdjacentHTML(
      'beforeend',
      `
      <div class="col-12">
        <div class="kategori-title">
          ${kategori}
        </div>
      </div>
      `
    );

    /* ===== KPI CARDS ===== */
    grouped[kategori].forEach(kpi => {
      const tgGood = isGood(kpi.tangerang, kpi.target);
      const bnGood = isGood(kpi.banten, kpi.target);

      container.insertAdjacentHTML(
        'beforeend',
        `
        <div class="col-md-4 col-lg-3">
          <div class="kpi-card">
            <div class="kpi-title">
              ${kpi.indikator}
            </div>

            <div class="kpi-row">
              <span>Target</span>
              <span>${fmt(kpi.target)}</span>
            </div>

            <div class="kpi-row">
              <span>Tangerang</span>
              <span class="${tgGood ? 'good' : 'bad'}">
                ${fmt(kpi.tangerang)}
              </span>
            </div>

            <div class="kpi-row">
              <span>Banten</span>
              <span class="${bnGood ? 'good' : 'bad'}">
                ${fmt(kpi.banten)}
              </span>
            </div>
          </div>
        </div>
        `
      );
    });
  });
}

/* ===============================
   MAIN RENDER
=============================== */
function renderB2CDashboard(apiResponse) {
  if (!apiResponse || !apiResponse.data) {
    console.error('Invalid API Response', apiResponse);
    return;
  }

  renderSummary(apiResponse);
  renderKpiGrid(apiResponse.data);
}

/* ===============================
   FETCH & INIT
=============================== */
// contoh
// fetch(API_URL)
//   .then(res => res.json())
//   .then(renderB2CDashboard)
//   .catch(console.error);
