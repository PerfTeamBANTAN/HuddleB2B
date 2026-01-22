/* =========================================================
   DASHBOARD B2C – 24 KPI DISTRICT BANTEN
   Neon Tech Dashboard Style
========================================================= */

let B2C_API_URL = '';

/* ================= INIT ================= */

function initDashboardB2C24KPI(apiUrl) {
  B2C_API_URL = apiUrl;
  loadB2CData();
}

/* ================= FETCH ================= */

async function loadB2CData() {
  try {
    showLoading();

    const res = await fetch(B2C_API_URL);
    const json = await res.json();

    console.log('B2C KPI DATA:', json);

    if (!json || !Array.isArray(json.data)) {
      throw new Error('Invalid API structure');
    }

    const summary = buildSummary(json.data);

    renderLastUpdate(json.lastUpdate);
    renderSummary(summary);
    renderKpiGrid(json.data);

    hideLoading();

  } catch (err) {
    console.error(err);
    showError('Failed load KPI');
  }
}

/* ================= SUMMARY ================= */

function buildSummary(data) {
  let good = 0, warning = 0, bad = 0;

  data.forEach(kpi => {
    const s = kpi['Status Ach HI'];
    if (s === '✅') good++;
    else if (s === '⚠️') warning++;
    else bad++;
  });

  return {
    total: data.length,
    good,
    warning,
    bad
  };
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

/* ================= SUMMARY VIEW ================= */

function renderSummary(sum) {
  const wrap = document.getElementById('b2cSummary');
  if (!wrap) return;

  wrap.innerHTML = '';

  const items = [
    { label: 'TOTAL KPI', value: sum.total, color: 'info' },
    { label: 'GOOD', value: sum.good, color: 'success' },
    { label: 'WARNING', value: sum.warning, color: 'warning' },
    { label: 'BAD', value: sum.bad, color: 'danger' }
  ];

  items.forEach(item => {
    wrap.insertAdjacentHTML('beforeend', `
      <div class="col-xl-3 col-md-6">
        <div class="summary-neon ${item.color}">
          <div class="summary-title">${item.label}</div>
          <div class="summary-value" data-val="${item.value}">0</div>
          <div class="summary-grid">${renderGrid(item.value)}</div>
        </div>
      </div>
    `);
  });

  animateNumbers();
}

function renderGrid(val) {
  let cells = '';
  const max = 20;
  for (let i = 0; i < max; i++) {
    cells += `<span class="${i < val ? 'on' : ''}"></span>`;
  }
  return cells;
}

/* ================= KPI GRID ================= */

function renderKpiGrid(data) {
  const grid = document.getElementById('b2cKpiGrid');
  if (!grid) return;

  grid.innerHTML = '';

  data.forEach(kpi => {
    const ach = Number(kpi['Achievement HI']) || 0;
    const target = Number(kpi.Target) || 0;
    const status = kpi['Status Ach HI'];

    const pct = target ? Math.round((ach / target) * 100) : 0;
    const good = status === '✅';

    grid.insertAdjacentHTML('beforeend', `
      <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
        <div class="kpi-neon ${good ? 'good' : 'bad'}">
          <div class="kpi-name">${kpi.Indikator}</div>

          <div class="kpi-circle">
            <svg viewBox="0 0 36 36">
              <path class="bg"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="progress"
                stroke-dasharray="${pct},100"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div class="pct">${pct}%</div>
          </div>

          <div class="kpi-meta">
            <span>ACH</span> ${format(ach)}<br>
            <span>TGT</span> ${format(target)}
          </div>

          <div class="kpi-status ${good ? 'ok' : 'bad'}">
            ${status}
          </div>
        </div>
      </div>
    `);
  });
}

/* ================= ANIMATION ================= */

function animateNumbers() {
  document.querySelectorAll('.summary-value').forEach(el => {
    const target = Number(el.dataset.val);
    let cur = 0;

    const step = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) {
        cur = target;
        clearInterval(timer);
      }
      el.textContent = cur;
    }, 20);
  });
}

/* ================= LOADING ================= */

function showLoading() {
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
    <div class="col-12 text-center text-danger fw-bold">
      ${msg}
    </div>
  `;
}

/* ================= UTIL ================= */

function format(val) {
  if (!val) return '-';
  return Number(val).toLocaleString('id-ID');
}
