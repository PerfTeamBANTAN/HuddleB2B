/* =========================================================
   DASHBOARD B2C – 24 KPI DISTRICT BANTEN
   Compatible with dynamic loader
========================================================= */

let B2C_API_URL = '';

/* ================= INIT ================= */

function initDashboardB2C24KPI(apiUrl) {
  B2C_API_URL = apiUrl;
  loadB2CData();
}

/* ================= FETCH ================= */

async function loadB2CData() {
  try {
    showLoading();

    const res = await fetch(B2C_API_URL);
    const json = await res.json();

    console.log('B2C KPI DATA:', json);

    if (!json || !json.data || !json.summary) {
      throw new Error('Invalid API structure');
    }

    renderLastUpdate(json.lastUpdate);
    renderSummary(json.summary);
    renderKpiGrid(json.data);

    hideLoading();

  } catch (err) {
    console.error(err);
    showError('Failed load KPI');
  }
}

/* ================= HEADER ================= */

function renderLastUpdate(ts) {
  const el = document.getElementById('b2cLastUpdate');
  if (!el || !ts) return;

  el.innerHTML = `
    <i class="fa fa-clock me-1"></i>
    ${new Date(ts).toLocaleString('id-ID')}
  `;
}

/* ================= SUMMARY ================= */

function renderSummary(sum) {
  const wrap = document.getElementById('b2cSummary');
  if (!wrap) return;

  wrap.innerHTML = '';

  const cards = [
    { label: 'Total KPI', value: sum.totalKPI, cls: 'primary' },
    { label: 'Good', value: sum.good, cls: 'success' },
    { label: 'Warning', value: sum.warning, cls: 'warning' },
    { label: 'Bad', value: sum.bad, cls: 'danger' }
  ];

  cards.forEach(c => {
    wrap.insertAdjacentHTML('beforeend', `
      <div class="col-md-3 col-6">
        <div class="summary-card ${c.cls}">
          <div class="summary-label">${c.label}</div>
          <div class="summary-value">${c.value}</div>
        </div>
      </div>
    `);
  });
}

/* ================= KPI GRID ================= */

function renderKpiGrid(data) {
  const grid = document.getElementById('b2cKpiGrid');
  if (!grid) return;

  grid.innerHTML = '';

  data.forEach(kpi => {
    const ach = kpi['Achievement HI'];
    const target = kpi.Target;
    const status = kpi['Status Ach HI'];

    const good = status === '✅';
    const pct = target ? ((ach / target) * 100).toFixed(1) : 0;

    grid.insertAdjacentHTML('beforeend', `
      <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
        <div class="kpi-card ${good ? 'good' : 'bad'}">
          <div class="kpi-title">${kpi.Indikator}</div>

          <div class="kpi-ach">
            ${format(ach)}
          </div>

          <div class="kpi-meta">
            Target ${format(target)}
          </div>

          <div class="kpi-status ${good ? 'text-success' : 'text-danger'}">
            ${status} ${pct}%
          </div>
        </div>
      </div>
    `);
  });
}

/* ================= LOADING ================= */

function showLoading() {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="loading-overlay" id="b2cLoading">
      <div class="spinner-border text-info"></div>
      <div class="mt-2">Loading KPI...</div>
    </div>
  `);
}

function hideLoading() {
  const el = document.getElementById('b2cLoading');
  if (el) el.remove();
}

/* ================= ERROR ================= */

function showError(msg) {
  const grid = document.getElementById('b2cKpiGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="col-12 text-center text-danger fw-bold">
      ${msg}
    </div>
  `;
}

/* ================= UTIL ================= */

function format(val) {
  if (val === null || val === undefined) return '-';
  return Number(val).toLocaleString('id-ID');
}
