function initDashboardB2C24KPI(API_URL) {

  const grid = document.getElementById('b2cKpiGrid');
  const summary = document.getElementById('b2cSummary');
  const lastUpdate = document.getElementById('b2cLastUpdate');

  // loading overlay
  grid.innerHTML = `
    <div class="loading-overlay">
      <div class="spinner-border text-info"></div>
      <div class="loading-text">Loading KPI B2C...</div>
    </div>
  `;

  fetch(API_URL + '?type=b2c_24kpi_banten')
    .then(res => res.json())
    .then(result => {

      /* =====================
         LAST UPDATE
      ====================== */
      lastUpdate.innerHTML = `
        <i class="fa fa-clock"></i>
        ${result.lastUpdate}
      `;

      /* =====================
         SUMMARY
      ====================== */
      summary.innerHTML = `
        <div class="col-md-4">
          <div class="summary-neon">
            <div class="summary-title">TOTAL KPI</div>
            <div class="summary-value">${result.summary.totalKPI}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="summary-neon">
            <div class="summary-title">GOOD</div>
            <div class="summary-value text-success">${result.summary.good}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="summary-neon">
            <div class="summary-title">BAD</div>
            <div class="summary-value text-danger">${result.summary.bad}</div>
          </div>
        </div>
      `;

      /* =====================
         GROUP BY WITEL
      ====================== */
      const grouped = {};
      result.data.forEach(d => {
        if (!grouped[d.witel]) grouped[d.witel] = [];
        grouped[d.witel].push(d);
      });

      /* =====================
         KPI GRID
      ====================== */
      grid.innerHTML = '';

      Object.keys(grouped).forEach(witel => {

        grid.insertAdjacentHTML('beforeend', `
          <div class="col-12">
            <div class="region-title">${witel}</div>
          </div>
        `);

        grouped[witel].forEach(kpi => {

          const isGood = kpi.status_hi === '✅';
          const cardStatus = isGood ? 'card-good' : 'card-bad';
          const valStatus = isGood ? 'value-good' : 'value-bad';
          const witelClass =
            witel.toLowerCase() === 'banten'
              ? 'witel-banten'
              : 'witel-tangerang';

          grid.insertAdjacentHTML('beforeend', `
            <div class="badge-card ${cardStatus} ${witelClass}">
              
              <div class="badge-card-header">
                ${kpi.indikator}
              </div>

              <div class="badge-card-body">

                <div class="row-item">
                  <span>Target</span>
                  <span>${kpi.target ?? '-'}</span>
                </div>

                <div class="row-item">
                  <span>Ach HI</span>
                  <span class="${valStatus}">
                    ${kpi.achievement_hi ?? '-'} ${kpi.status_hi}
                  </span>
                </div>

                <div class="row-item">
                  <span>Kategori</span>
                  <span>${kpi.category}</span>
                </div>

              </div>
            </div>
          `);
        });
      });

    })
    .catch(err => {
      console.error(err);
      grid.innerHTML = `
        <div class="alert alert-danger">
          Gagal memuat data B2C KPI
        </div>
      `;
    });
}
