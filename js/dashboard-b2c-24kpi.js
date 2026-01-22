/* =========================================================
   DASHBOARD B2C – 24 KPI DISTRICT BANTEN
   FULL JS – FINAL & FIXED
========================================================= */

/* ======================
   SHORTCUT
====================== */
const $ = (id) => document.getElementById(id);

/* ======================
   FORMAT & STATUS
====================== */
function formatNumber(val) {
  if (val === null || val === undefined || val === '#N/A') return '-';
  if (isNaN(val)) return val;
  return Number(val).toLocaleString('id-ID', {
    maximumFractionDigits: 2
  });
}

function calcStatus(target, achievement) {
  if (
    target === null || achievement === null ||
    target === '#N/A' || achievement === '#N/A'
  ) return 'NA';

  return Number(achievement) >= Number(target) ? 'GOOD' : 'BAD';
}

function statusColor(status) {
  switch (status) {
    case 'GOOD': return '#2ecc71';
    case 'BAD':  return '#e74c3c';
    default:     return '#7f8c8d';
  }
}

/* ======================
   SUMMARY
====================== */
function renderSummary(summary) {
  if (!summary) return;

  $('b2cSummary').innerHTML = `
    <div class="col-md-4">
      <div class="summary-card">
        <div class="label">TOTAL KPI</div>
        <div class="value">${summary.totalKPI}</div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="summary-card good">
        <div class="label">ACHIEVE</div>
        <div class="value">${summary.good}</div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="summary-card bad">
        <div class="label">NOT ACHIEVE</div>
        <div class="value">${summary.bad}</div>
      </div>
    </div>
  `;
}

/* ======================
   KPI GRID
====================== */
function renderKpiGrid(data) {
  const container = $('b2cKpiGrid');
  container.innerHTML = '';

  data.forEach(kpi => {
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
   NORMALIZER
====================== */
function normalizeData(raw) {
  return raw.map(row => {
    const target = Number(
      String(row.Target || row.target || '0')
        .replace(',', '.')
    );

    const ach = Number(
      String(row['Achievement HI'] || row.ach || '0')
        .replace(',', '.')
    );

    return {
      indikator: row.Indikator,
      witel: row.Witel,
      target: target,
      achievement_hi: ach,
      achievement_yesterday: row['Achievement Kemarin'],
      status_hi: calcStatus(target, ach),
      category: row['Katagori KPI']
    };
  });
}

/* ======================
   MAIN INIT
====================== */
function initDashboardB2C(apiUrl) {
  fetch(apiUrl)
    .then(res => res.json())
    .then(res => {
      if (!res || !res.data) {
        console.error('Invalid API response', res);
        return;
      }

      $('b2cLastUpdate').innerText =
        `Updated ${new Date(res.lastUpdate).toLocaleString('id-ID')}`;

      const data = normalizeData(res.data);

      renderSummary(res.summary);
      renderKpiGrid(data);
    })
    .catch(err => {
      console.error('B2C KPI ERROR:', err);
    });
}

/* ======================
   COMPATIBILITY HOOK
====================== */
function initDashboardB2C24KPI(apiUrl) {
  initDashboardB2C(apiUrl);
}
