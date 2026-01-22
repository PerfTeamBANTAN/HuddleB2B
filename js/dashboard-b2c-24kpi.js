/* =========================================================
   DASHBOARD B2C – 24 KPI DISTRICT BANTEN
   Compatible with index.html loader
========================================================= */

let B2C_API_URL = '';

/* ================= INIT ================= */

function initDashboardB2C24KPI(apiUrl) {
  B2C_API_URL = apiUrl;
  fetchB2CData();
}

/* ================= FETCH ================= */

async function fetchB2CData() {
  const content = document.getElementById('content-area');

  try {
    showLoading();

    const res = await fetch(B2C_API_URL);
    const json = await res.json();

    console.log('B2C RESPONSE:', json);

    if (!json || !json.data) {
      throw new Error('Invalid B2C API response');
    }

    renderSummary(json.summary, json.lastUpdate);
    renderKPIGrid(json.data);

    hideLoading();

  } catch (err) {
    console.error(err);
    showError('Failed load KPI B2C');
  }
}

/* ================= LOADING ================= */

function showLoading() {
  const content = document.getElementById('content-area');
  content.insertAdjacentHTML('beforeend', `
    <div class="loading-overlay" id="loading-b2c">
      <div class="spinner-border text-light"></div>
      <div class="loading-text">Loading KPI B2C...</div>
    </div>
  `);
}

function hideLoading() {
  const el = document.getElementById('loading-b2c');
  if (el) el.remove();
}

/* ================= SUMMARY ================= */

function renderSummary(summary, lastUpdate) {
  if (!summary) return;

  setText('sum-total', summary.totalKPI);
  setText('sum-good', summary.good);
  setText('sum-warning', summary.warning);
  setText('sum-bad', summary.bad);

  if (lastUpdate) {
    setText(
      'last-update',
      new Date(lastUpdate).toLocaleString('id-ID')
    );
  }
}

/* ================= KPI GRID ================= */

function renderKPIGrid(rows) {
  const wrap = document.getElementById('kpi-grid');
  if (!wrap) return;

  wrap.innerHTML = '';

  rows.forEach(kpi => {
    const status = kpi['Status Ach HI'];
    const isGood = status === '✅';

    wrap.insertAdjacentHTML('beforeend', `
      <div class="kpi-card ${isGood ? 'kpi-good' : 'kpi-bad'}">
        <div class="kpi-title">${kpi.Indikator}</div>

        <div class="kpi-value">
          ${formatNumber(kpi['Achievement HI'])}
        </div>

        <div class="kpi-trend ${isGood ? 'up' : 'down'}">
          Target ${kpi.Target} ${status}
        </div>
      </div>
    `);
  });
}

/* ================= ERROR ================= */

function showError(msg) {
  const content = document.getElementById('content-area');
  content.innerHTML = `
    <div class="text-danger text-center mt-5 fw-bold">
      ${msg}
    </div>
  `;
}

/* ================= UTIL ================= */

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val ?? '-';
}

function formatNumber(val) {
  if (val === null || val === undefined) return '-';
  return Number(val).toLocaleString('id-ID');
}
