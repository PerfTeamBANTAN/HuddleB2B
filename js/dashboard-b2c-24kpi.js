/* =========================================================
   B2C KPI DASHBOARD – FINAL & MATCH APPS SCRIPT
========================================================= */

const $ = id => document.getElementById(id);

function formatNumber(val) {
  if (val === null || val === undefined) return '-';
  return val.toLocaleString('id-ID', { maximumFractionDigits: 2 });
}

function statusColor(status) {
  if (status === 'GOOD') return '#2ecc71';
  if (status === 'BAD') return '#e74c3c';
  return '#7f8c8d';
}

/* ======================
   SUMMARY
====================== */
function renderSummary(summary) {
  $('b2cSummary').innerHTML = `
    <div class="col-md-4">
      <div class="summary-card">
        <div class="label">TOTAL KPI</div>
        <div class="value">${summary.totalKPI}</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="summary-card good">
        <div class="label">GOOD</div>
        <div class="value">${summary.good}</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="summary-card bad">
        <div class="label">BAD</div>
        <div class="value">${summary.bad}</div>
      </div>
    </div>
  `;
}

/* ======================
   KPI GRID
====================== */
function renderKpiGrid(data) {
  const grid = $('b2cKpiGrid');
  grid.innerHTML = '';

  data.forEach(kpi => {
    const color = statusColor(kpi.status_hi);

    grid.insertAdjacentHTML('beforeend', `
      <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
        <div class="kpi-card">
          <div class="kpi-title">${kpi.indikator}</div>

          <div class="kpi-circle" style="border-color:${color}">
            <span style="color:${color}">
              ${formatNumber(kpi.achievement_hi)}
            </span>
          </div>

          <div class="kpi-meta">
            <div>TGT ${formatNumber(kpi.target)}</div>
            <div class="kpi-status" style="color:${color}">
              ${kpi.status_hi}
            </div>
          </div>
        </div>
      </div>
    `);
  });
}

/* ======================
   INIT
====================== */
function initDashboardB2C24KPI(apiUrl) {
  fetch(apiUrl)
    .then(r => r.json())
    .then(res => {
      $('b2cLastUpdate').innerText =
        `Updated ${new Date(res.lastUpdate).toLocaleString('id-ID')}`;

      renderSummary(res.summary);
      renderKpiGrid(res.data);
    })
    .catch(err => console.error('B2C KPI ERROR', err));
}

/* 🔥 PENTING */
window.initDashboardB2C24KPI = initDashboardB2C24KPI;
