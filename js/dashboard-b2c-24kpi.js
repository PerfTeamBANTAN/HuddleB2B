/* =========================================================
   DASHBOARD B2C – 24 KPI DISTRICT BANTEN
   Compatible with Google AppScript API
========================================================= */

let B2C_API_URL = '';

/* ================= INIT ================= */

function initDashboardB2C24KPI(apiUrl) {
  B2C_API_URL = apiUrl;
  loadB2CData();
}

/* ================= FETCH DATA ================= */

async function loadB2CData() {
  try {
    showLoading();

    const res = await fetch(B2C_API_URL);
    const json = await res.json();

    console.log('B2C KPI DATA:', json);

    if (!json || !Array.isArray(json.data)) {
      throw new Error('Invalid API structure');
    }

    renderLastUpdate(json.lastUpdate);
    renderSummary(json.summary);
    renderKpiGrid(json.data);

    hideLoading();

  } catch (err) {
    console.error(err);
    hideLoading();
    showError('Failed load KPI data');
  }
}

/* ================= HEADER ================= */

function renderLastUpdate(ts) {
  const el = document.getElementById('b2cLastUpdate');
  if (!el || !ts) return;

  el.innerHTML = `
    <i class="fa fa-clock me-1"></i>
    Updated ${new Date(ts).toLocaleString('id-ID')}
  `;
}

/* ================= SUMMARY ================= */

function renderSummary(sum) {
  const wrap = document.getElementById('b2cSummary');
  if (!wrap || !sum) return;

  wrap.innerHTML = '';

  const cards = [
    { label: 'TOTAL KPI', value: sum.totalKPI ?? 0, cls: 'primary' },
    { label: 'GOOD', value: sum.good ?? 0, cls: 'success' },
    { label: 'WARNING', value: sum.warning ?? 0, cls: 'warning' },
    { label: 'BAD', value: sum.bad ?? 0, cls: 'danger' }
  ];

  cards.forEach(c => {
    wrap.insertAdjacentHTML('beforeend', `
      <div class="col-xl-3 col-md-6">
        <div class="summary-card ${c.cls}">
          <div class="summary-label">${c.label}</div>
          <div class="summary-value">${c.value}</div>
          <div class="summary-bar">
            <span style="width:${c.value * 6}px"></span>
          </div>
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
    const title  = kpi.Indikator || '-';
    const ach    = Number(kpi.ach || 0);
    const target = Number(kpi.target || 0);
    const pct    = Number(kpi.pct || 0);

    let status = 'BAD';
    let cls = 'bad';

    if (pct >= 100) {
      status = 'GOOD';
      cls = 'good';
    } else if (pct >= 90) {
      status = 'WARNING';
      cls = 'warning';
    }

    grid.insertAdjacentHTML('beforeend', `
      <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
        <div class="kpi-card ${cls}">
          
          <div class="kpi-title">${title}</div>

          <div class="kpi-ring">
            <svg viewBox="0 0 36 36">
              <path class="ring-bg"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path class="ring-val"
                stroke-dasharray="${pct},100"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <text x="18" y="20.35">${pct}%</text>
            </svg>
          </div>

          <div class="kpi-meta">
            ACH ${format(ach)}<br>
            TGT ${format(target)}
          </div>

          <div class="kpi-status ${cls}">
            ${status}
          </div>

        </div>
      </div>
    `);
  });
}

/* ================= LOADING ================= */

function showLoading() {
  if (document.getElementById('b2cLoading')) return;

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
    <div class="col-12 text-center text-danger fw-bold py-5">
      ${msg}
    </div>
  `;
}

/* ================= UTIL ================= */

function format(val) {
  if (val === null || val === undefined || isNaN(val)) return '-';
  return Number(val).toLocaleString('id-ID');
}
