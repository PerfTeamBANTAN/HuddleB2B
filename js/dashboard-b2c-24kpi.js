/* =========================================================
   B2C KPI DASHBOARD – FULL JS (FIXED & STABLE)
   ========================================================= */

/* ======================
   UTILITIES
====================== */
const $ = (id) => document.getElementById(id);

function formatNumber(val) {
  if (val === null || val === undefined || val === '#N/A') return '-';
  return Number(val).toLocaleString('id-ID', { maximumFractionDigits: 2 });
}

function calcStatus(target, achievement) {
  if (
    target === null ||
    achievement === null ||
    target === '#N/A' ||
    achievement === '#N/A'
  ) return 'NA';
  return Number(achievement) >= Number(target) ? 'GOOD' : 'BAD';
}

function statusColor(status) {
  switch (status) {
    case 'GOOD': return '#2ecc71';
    case 'BAD': return '#e74c3c';
    default: return '#7f8c8d';
  }
}

/* ======================
   SUMMARY SECTION
====================== */
function renderSummary(data) {
  const total = data.length;
  const good = data.filter(d => d.status_hi === 'GOOD').length;
  const bad  = data.filter(d => d.status_hi === 'BAD').length;

  $('b2cSummary').innerHTML = `
    <div class="col-md-4">
      <div class="summary-card">
        <div class="label">TOTAL KPI</div>
        <div class="value">${total}</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="summary-card good">
        <div class="label">ACHIEVE</div>
        <div class="value">${good}</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="summary-card bad">
        <div class="label">NOT ACHIEVE</div>
        <div class="value">${bad}</div>
      </div>
    </div>
  `;
}

/* ======================
   KPI CARD
====================== */
function renderKpiGrid(data) {
  const container = $('b2cKpiGrid');
  container.innerHTML = '';

  data.forEach((kpi) => {
    const color = statusColor(kpi.status_hi);

    container.insertAdjacentHTML('beforeend', `
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
   DATA NORMALIZER
====================== */
function normalizeData(raw) {
  return raw.map(row => {
    const status = calcStatus(row.Target, row['Achievement HI']);

    return {
      indikator: row.Indikator,
      witel: row.Witel,
      target: row.Target,
      achievement_hi: row['Achievement HI'],
      achievement_yesterday: row['Achievement Kemarin'],
      status_hi: status,
      category: row['Katagori KPI']
    };
  });
}

/* ======================
   MAIN INIT
====================== */
function initDashboardB2C(apiUrl) {
  console.log('B2C KPI DATA FETCH...');

  fetch(apiUrl)
    .then(res => res.json())
    .then(res => {
      const data = normalizeData(res.data);

      $('b2cLastUpdate').innerText =
        `Updated ${new Date(res.lastUpdate).toLocaleString('id-ID')}`;

      renderSummary(data);
      renderKpiGrid(data);
    })
    .catch(err => {
      console.error('B2C KPI ERROR:', err);
    });
}

/* =========================================================
   🔥 COMPATIBILITY FIX (INI YANG HILANG SEBELUMNYA)
   ========================================================= */
function initDashboardB2C4KPI(apiUrl) {
  initDashboardB2C(apiUrl);
}
