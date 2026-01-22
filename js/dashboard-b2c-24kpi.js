/* =========================================================
   DASHBOARD B2C – KPI DISTRICT BANTEN
   FINAL VERSION – PRODUCTION READY
   Data Source: Google AppScript
========================================================= */

let B2C_API_URL = '';

/* ================= INIT ================= */

function initDashboardB2C(apiUrl) {
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
    renderSummary(json.summary, json.data);
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
    Updated ${new Date(ts).toLocaleString('id-ID')}
  `;
}

/* ================= SUMMARY ================= */

function renderSummary(summary, data) {
  const wrap = document.getElementById('b2cSummary');
  if (!wrap) return;

  const total = data.length;
  const good  = data.filter(d => d['Status Ach HI'] === '✅').length;
  const bad   = data.filter(d => d['Status Ach HI'] === '❌').length;
  const na    = data.filter(d => d['Status Ach HI'] === '#N/A').length;

  wrap.innerHTML = `
    ${summaryCard('TOTAL KPI', total, 'primary')}
    ${summaryCard('GOOD', good, 'success')}
    ${summaryCard('BAD', bad, 'danger')}
    ${summaryCard('NO DATA', na, 'secondary')}
  `;
}

function summaryCard(label, value, cls) {
  return `
    <div class="col-md-3 col-6">
      <div class="summary-tile ${cls}">
        <div class="summary-label">${label}</div>
        <div class="summary-value">${value}</div>
      </div>
    </div>
  `;
}

/* ================= KPI GRID ================= */

function renderKpiGrid(data) {
  const grid = document.getElementById('b2cKpiGrid');
  if (!grid) return;

  grid.innerHTML = '';

  data.forEach(row => {
    const indikator = row.Indikator || '-';
    const witel     = row.Witel || '';
    const target    = parseNum(row.Target);
    const achHi     = parseNum(row['Achievement HI']);
    const achPrev   = parseNum(row['Achievement Kemarin']);
    const status    = row['Status Ach HI'];

    const statusCls = getStatusClass(status);
    const statusTxt = getStatusText(status);

    let pct = null;
    if (target !== null && achHi !== null && target !== 0) {
      pct = Math.round((achHi / target) * 100);
    }

    grid.insertAdjacentHTML('beforeend', `
      <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
        <div class="kpi-tile ${statusCls}">

          <div class="kpi-title" title="${indikator}">
            ${indikator}
          </div>

          <div class="kpi-witel">${witel}</div>

          <div class="kpi-value">
            ${pct !== null ? pct + '%' : 'N/A'}
          </div>

          <div class="kpi-status">${statusTxt}</div>

          <div class="kpi-info">
            <div>ACH HI: <b>${fmt(achHi)}</b></div>
            <div>TARGET: <b>${fmt(target)}</b></div>
            <div>KEMARIN: ${fmt(achPrev)}</div>
          </div>

        </div>
      </div>
    `);
  });
}

/* ================= UTIL ================= */

function parseNum(val) {
  if (val === null || val === undefined) return null;
  if (val === '#N/A') return null;
  if (typeof val === 'number') return val;
  return Number(String(val).replace(',', '.'));
}

function fmt(val) {
  if (val === null || val === undefined) return '-';
  return Number(val).toLocaleString('id-ID');
}

function getStatusClass(status) {
  if (status === '✅') return 'good';
  if (status === '❌') return 'bad';
  return 'nodata';
}

function getStatusText(status) {
  if (status === '✅') return 'GOOD';
  if (status === '❌') return 'BAD';
  return 'NO DATA';
}

/* ================= LOADING ================= */

function showLoading() {
  if (document.getElementById('b2cLoading')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div id="b2cLoading" class="loading-overlay">
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
