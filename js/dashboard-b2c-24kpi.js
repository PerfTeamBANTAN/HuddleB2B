/* =====================================================
   DASHBOARD B2C 24 KPI – SAFE VERSION
===================================================== */

window.initDashboardB2C24KPI = function (result) {

  if (!result || !result.data) {
    console.error('B2C KPI: data kosong');
    return;
  }

  const bgCard = 'linear-gradient(145deg, #0b2a3f, #081c2c)';
  const borderGood = '#00e5ff';
  const borderBad = '#ff5252';

  /* LAST UPDATE */
  const lastUpdateEl = document.getElementById('b2cLastUpdate');
  if (lastUpdateEl) {
    lastUpdateEl.innerHTML =
      'Updated ' + new Date(result.lastUpdate).toLocaleString('id-ID');
  }

  /* SUMMARY */
  const summaryEl = document.getElementById('b2cSummary');
  summaryEl.innerHTML = `
    <div class="col-md-4">
      <div class="p-3 rounded" style="background:${bgCard}">
        <div class="text-secondary small">TOTAL KPI</div>
        <div class="fs-3 fw-bold text-info">${result.summary.totalKPI}</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="p-3 rounded" style="background:${bgCard}">
        <div class="text-secondary small">ACHIEVE</div>
        <div class="fs-3 fw-bold text-success">${result.summary.good}</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="p-3 rounded" style="background:${bgCard}">
        <div class="text-secondary small">NOT ACHIEVE</div>
        <div class="fs-3 fw-bold text-danger">${result.summary.bad}</div>
      </div>
    </div>
  `;

  /* GROUP BY WITEL */
  const group = {};
  result.data.forEach(d => {
    if (!group[d.witel]) group[d.witel] = [];
    group[d.witel].push(d);
  });

  const grid = document.getElementById('b2cKpiGrid');
  grid.innerHTML = '';

  Object.keys(group).forEach(witel => {

    grid.innerHTML += `
      <div class="col-12 mb-4">
        <div class="p-4 rounded" style="background:${bgCard}">
          <h5 class="fw-bold text-info mb-3">${witel}</h5>
          <div class="row g-3" id="kpi-${witel}"></div>
        </div>
      </div>
    `;

    const wrap = document.getElementById(`kpi-${witel}`);

    group[witel].forEach(kpi => {
      if (kpi.indikator.includes('TOTAL ACH')) return;

      const good = kpi.status_hi === 'GOOD';
      const border = good ? borderGood : borderBad;

      wrap.innerHTML += `
        <div class="col-md-3">
          <div class="p-3 rounded h-100"
            style="background:${bgCard};border:2px solid ${border}">
            <div class="fw-bold text-info small">${kpi.indikator}</div>
            <div class="small text-secondary">Target : ${kpi.target ?? 'NA'}</div>
            <div class="fs-4 fw-bold text-white">${kpi.achievement_hi ?? 'NA'}</div>
            <div class="${good ? 'text-success' : 'text-danger'} small">
              ${good ? '✔ Achieve' : '✖ Not Achieve'}
            </div>
            <div class="text-secondary small mt-1">${kpi.category}</div>
          </div>
        </div>
      `;
    });
  });
};
