function initDashboardB2C24KPI(API_URL) {

  const summaryEl = document.getElementById('b2cSummary');
  const gridEl = document.getElementById('b2cKpiGrid');
  const lastUpdateEl = document.getElementById('b2cLastUpdate');

  summaryEl.innerHTML = skeletonSummary();
  gridEl.innerHTML = skeletonGrid();

  fetch(`${API_URL}?type=b2c_24kpi_banten`)
    .then(res => res.json())
    .then(json => {
      renderSummary(json.summary);
      renderGrid(json.data);

      lastUpdateEl.innerHTML =
        `<i class="fa fa-clock"></i>
         ${new Date(json.lastUpdate).toLocaleString()}`;
    })
    .catch(err => {
      summaryEl.innerHTML =
        `<div class="text-danger">Failed load KPI</div>`;
      console.error(err);
    });

  /* ================= SUMMARY ================= */

  function renderSummary(s) {
    summaryEl.innerHTML = `
      ${sumCard('TOTAL KPI', s.totalKPI, 'primary')}
      ${sumCard('AVG ACH', s.avgAch + '%', 'info')}
      ${sumCard('GOOD', s.good, 'success')}
      ${sumCard('WARNING', s.warning, 'warning')}
      ${sumCard('BELOW', s.bad, 'danger')}
    `;
  }

  function sumCard(title, val, color) {
    return `
      <div class="col-6 col-md-2">
        <div class="kpi-card text-center">
          <div class="kpi-title">${title}</div>
          <div class="kpi-value text-${color}">${val}</div>
        </div>
      </div>
    `;
  }

  /* ================= GRID ================= */

  function renderGrid(data) {
    gridEl.innerHTML = '';

    data.forEach(kpi => {
      const pct = kpi.pct || 0;
      const color =
        pct >= 100 ? 'success' :
        pct >= 90  ? 'warning' : 'danger';

      gridEl.innerHTML += `
        <div class="col-6 col-md-3 col-xl-2">
          <div class="kpi-card">
            <div class="kpi-title">${kpi.KPI || kpi['KPI NAME']}</div>
            <div class="kpi-value text-${color}">
              ${pct}%
            </div>
            <div class="progress mt-2" style="height:6px">
              <div class="progress-bar bg-${color}"
                   style="width:${Math.min(pct,100)}%">
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }

  /* ================= SKELETON ================= */

  function skeletonSummary() {
    return Array(5).fill(`
      <div class="col-6 col-md-2">
        <div class="kpi-card skeleton" style="height:90px"></div>
      </div>
    `).join('');
  }

  function skeletonGrid() {
    return Array(12).fill(`
      <div class="col-6 col-md-3 col-xl-2">
        <div class="kpi-card skeleton" style="height:110px"></div>
      </div>
    `).join('');
  }
}
