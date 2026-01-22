<script>
/* ================================
   B2C KPI DASHBOARD – FINAL JS
   ================================ */

function initDashboardB2C24KPI(result) {

  /* ------------------------------
     COLOR THEME (IMAGE #1 STYLE)
  ------------------------------ */
  const COLORS = {
    bgCard: 'linear-gradient(145deg, #0b2a3f, #081c2c)',
    borderGood: '#00e5ff',
    borderBad: '#ff5252',
    textPrimary: '#e0f7fa',
    textSecondary: '#9fdfff'
  };

  /* ------------------------------
     LAST UPDATE
  ------------------------------ */
  const lastUpdateEl = document.getElementById('b2cLastUpdate');
  lastUpdateEl.innerHTML = `
    <small class="text-info fst-italic">
      Updated ${new Date(result.lastUpdate).toLocaleString('id-ID')}
    </small>
  `;

  /* ------------------------------
     SUMMARY (TOP BOX)
  ------------------------------ */
  const summaryEl = document.getElementById('b2cSummary');
  summaryEl.innerHTML = `
    <div class="col-md-4">
      <div class="p-3 rounded" style="background:${COLORS.bgCard}">
        <div class="text-secondary small">TOTAL KPI</div>
        <div class="fs-3 fw-bold text-info">${result.summary.totalKPI}</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="p-3 rounded" style="background:${COLORS.bgCard}">
        <div class="text-secondary small">ACHIEVE</div>
        <div class="fs-3 fw-bold text-success">${result.summary.good}</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="p-3 rounded" style="background:${COLORS.bgCard}">
        <div class="text-secondary small">NOT ACHIEVE</div>
        <div class="fs-3 fw-bold text-danger">${result.summary.bad}</div>
      </div>
    </div>
  `;

  /* ------------------------------
     GROUP DATA BY WITEL
  ------------------------------ */
  const grouped = {};
  result.data.forEach(d => {
    if (!grouped[d.witel]) grouped[d.witel] = [];
    grouped[d.witel].push(d);
  });

  /* ------------------------------
     KPI GRID
  ------------------------------ */
  const grid = document.getElementById('b2cKpiGrid');
  grid.innerHTML = '';

  Object.keys(grouped).forEach(witel => {

    const achTotal = grouped[witel].find(d => d.indikator.includes('TOTAL ACH'));
    const achValue = achTotal ? achTotal.achievement_hi : '-';

    grid.innerHTML += `
      <div class="col-12 mb-4">
        <div class="p-4 rounded" style="background:${COLORS.bgCard}">
          <h5 class="fw-bold text-info mb-3">${witel}</h5>
          <div class="fs-2 fw-bold text-white mb-3">
            ${achValue}
          </div>

          <div class="row g-3" id="kpi-${witel}"></div>
        </div>
      </div>
    `;

    const kpiContainer = document.getElementById(`kpi-${witel}`);

    grouped[witel]
      .filter(d => !d.indikator.includes('TOTAL ACH'))
      .forEach(kpi => {

        const isGood = kpi.status_hi === 'GOOD';
        const borderColor = isGood ? COLORS.borderGood : COLORS.borderBad;

        kpiContainer.innerHTML += `
          <div class="col-md-3">
            <div class="p-3 rounded h-100"
              style="
                background:${COLORS.bgCard};
                border:2px solid ${borderColor};
              ">

              <div class="fw-bold text-info small mb-1">
                ${kpi.indikator}
              </div>

              <div class="text-secondary small">
                Target : ${kpi.target ?? 'NA'}
              </div>

              <div class="fs-4 fw-bold text-white">
                ${kpi.achievement_hi ?? 'NA'}
              </div>

              <div class="small ${isGood ? 'text-success' : 'text-danger'}">
                ${isGood ? '✔ Achieve' : '✖ Not Achieve'}
              </div>

              <div class="text-secondary small mt-1">
                ${kpi.category}
              </div>
            </div>
          </div>
        `;
      });

  });
}

/* ===============================
   AUTO INIT (PASTIKAN result ADA)
================================ */
if (typeof result !== 'undefined') {
  initDashboardB2C24KPI(result);
}
</script>
