/* =====================================================
   DASHBOARD B2B – FINAL KPI LOGIC (LOCKED)
   + LOADING
   + STATUS FILTER (ALL / ACHIEVE / NOT ACHIEVE)
   + FILTER LABEL (WITEL / STATUS / KATEGORI KPI)
===================================================== */

let dashboardRawData = [];
let achChart = null;
let statusChart = null;

const KPI_PER_WITEL = 48;

/* =====================================================
   AUTO CREATE LOADING
===================================================== */
(function ensureDashboardLoader() {
  const wrapper = document.getElementById('dashboard-b2b-wrapper');
  if (!wrapper || document.getElementById('dashboard-b2b-loading')) return;

  if (getComputedStyle(wrapper).position === 'static') {
    wrapper.style.position = 'relative';
  }

  const style = document.createElement('style');
  style.innerHTML = `
    #dashboard-b2b-loading {
      position: absolute;
      inset: 0;
      background: rgba(5,10,20,.75);
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: #fff;
      font-size: 14px;
    }
    #dashboard-b2b-loading.d-none { display: none; }
    #dashboard-b2b-loading .spinner {
      width: 36px;
      height: 36px;
      border: 4px solid rgba(255,255,255,.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .8s linear infinite;
      margin-bottom: 8px;
    }
    .filter-label {
      font-size: 12px;
      font-weight: 600;
      margin-right: 6px;
      white-space: nowrap;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);

  const loader = document.createElement('div');
  loader.id = 'dashboard-b2b-loading';
  loader.className = 'd-none';
  loader.innerHTML = `
    <div class="spinner"></div>
    <div>Loading Dashboard B2B...</div>
  `;
  wrapper.appendChild(loader);
})();

/* =====================================================
   LOADING HANDLER
===================================================== */
function showDashboardLoading() {
  document.getElementById('dashboard-b2b-loading')
    ?.classList.remove('d-none');
}
function hideDashboardLoading() {
  document.getElementById('dashboard-b2b-loading')
    ?.classList.add('d-none');
}

/* =====================================================
   INIT
===================================================== */
function initDashboardB2B(API_URL) {
  showDashboardLoading();

  fetch(`${API_URL}?type=b2b_dashboard`)
    .then(r => r.json())
    .then(res => {
      dashboardRawData = res.data || [];

      initDashboardFilter();
      ensureStatusFilter();
      renderDashboard();

      setText(
        'dashboard-b2b-last-update',
        `Last update: ${res.lastUpdate || '-'}`
      );
    })
    .catch(console.error)
    .finally(hideDashboardLoading);
}

/* =====================================================
   RENDER MASTER
===================================================== */
function renderDashboard() {
  showDashboardLoading();

  requestAnimationFrame(() => {
    const filtered = applyDashboardFilter();
    renderKPI(filtered);
    renderTable(filtered);
    renderAchievementChart(filtered);
    renderStatusChart(filtered);
    hideDashboardLoading();
  });
}

/* =====================================================
   KPI
===================================================== */
function renderKPI(filteredData) {
  const selectedWitel = val('dashboard-filter-witel');

  setText(
    'kpi-total',
    selectedWitel ? KPI_PER_WITEL : KPI_PER_WITEL * 2
  );

  setText(
    'kpi-achieve',
    filteredData.filter(r => r['Status Ach HI'] === '✅').length
  );

  setText(
    'kpi-not-achieve',
    filteredData.filter(r => r['Status Ach HI'] === '❌').length
  );

  let finalAchievement = 0;
  const rows = dashboardRawData.filter(
    r => String(r.Indikator).toLowerCase() === 'achievement'
  );

  const byWitel = {};
  rows.forEach(r => byWitel[r.Witel] = num(r['Achievement HI']));

  finalAchievement = selectedWitel
    ? (byWitel[selectedWitel] || 0)
    : avg(Object.values(byWitel));

  setText(
    'kpi-achievement-hi',
    finalAchievement ? finalAchievement.toFixed(2) + '%' : '-'
  );
}

/* =====================================================
   TABLE
===================================================== */
function renderTable(data) {
  const tbody = document.getElementById('dashboard-b2b-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!data.length) {
    tbody.innerHTML =
      `<tr><td colspan="7" class="text-center">Tidak ada data</td></tr>`;
    return;
  }

  data.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.Indikator}</td>
      <td class="text-end">${fmt(r.Target)}</td>
      <td class="text-end fw-bold">${fmt(r['Achievement HI'])}</td>
      <td class="text-center">${badge(r['Status Ach HI'])}</td>
      <td class="text-end">${fmt(r['Achievement Kemarin'])}</td>
      <td class="text-center">${badge(r['Status Ach Kemarin'])}</td>
      <td>${r['Katagori KPI']}</td>
    `;
    if (r['Status Ach HI'] === '❌') tr.classList.add('table-danger');
    tbody.appendChild(tr);
  });
}

/* =====================================================
   CHART – ACH HI vs KEMARIN
===================================================== */
function renderAchievementChart(data) {
  const el = document.getElementById('achievement-chart');
  if (!el) return;

  el.innerHTML = `<canvas id="achChartCanvas"></canvas>`;
  achChart?.destroy();

  achChart = new Chart(document.getElementById('achChartCanvas'), {
    type: 'line',
    data: {
      labels: data.map(d => d.Indikator),
      datasets: [
        {
          label: 'Achievement HI',
          data: data.map(d => num(d['Achievement HI'])),
          tension: .4,
          fill: true
        },
        {
          label: 'Kemarin',
          data: data.map(d => num(d['Achievement Kemarin'])),
          tension: .4,
          fill: true
        }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

/* =====================================================
   CHART – STATUS KPI
===================================================== */
function renderStatusChart(data) {
  const el = document.getElementById('status-chart');
  if (!el) return;

  el.innerHTML = `<canvas id="statusChartCanvas"></canvas>`;
  statusChart?.destroy();

  const achieveCount = data.filter(d => d['Status Ach HI'] === '✅').length;
  const notAchieveCount = data.filter(d => d['Status Ach HI'] === '❌').length;

  statusChart = new Chart(document.getElementById('statusChartCanvas'), {
    type: 'bar',
    data: {
      labels: ['Achieve', 'Not Achieve'],
      datasets: [{
        label: 'Status KPI (HI)', // 🔧 FIX legend "undefined"
        data: [achieveCount, notAchieveCount],
        backgroundColor: [
          'rgba(25, 135, 84, 0.85)',   // ✅ hijau (Achieve)
          'rgba(220, 53, 69, 0.85)'    // ❌ merah (Not Achieve)
        ],
        borderRadius: 6,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false } // optional: bisa ON/OFF
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}

/* =====================================================
   FILTER + LABEL
===================================================== */
function initDashboardFilter() {
  const witelEl = document.getElementById('dashboard-filter-witel');
  const katEl   = document.getElementById('table-filter-kategori');

  fillSelect(witelEl, uniq(dashboardRawData.map(d => d.Witel)));
  fillSelect(katEl, uniq(dashboardRawData.map(d => d['Katagori KPI'])));

  // === LABEL WITEL ===
  if (witelEl && !witelEl.previousElementSibling?.classList.contains('filter-label')) {
    const lbl = document.createElement('span');
    lbl.textContent = 'WITEL :';
    lbl.className = 'filter-label text-danger';
    witelEl.parentElement.insertBefore(lbl, witelEl);
  }

  // === LABEL KATEGORI KPI ===
  if (katEl && !katEl.previousElementSibling?.classList.contains('filter-label')) {
    const lbl = document.createElement('span');
    lbl.textContent = 'KATEGORI KPI :';
    lbl.className = 'filter-label text-warning';
    katEl.parentElement.insertBefore(lbl, katEl);
  }

  ['dashboard-filter-witel', 'table-filter-kategori', 'table-search']
    .forEach(id =>
      document.getElementById(id)
        ?.addEventListener('input', renderDashboard)
    );
}

/* ===== STATUS FILTER + LABEL ===== */
function ensureStatusFilter() {
  if (document.getElementById('dashboard-filter-status')) return;

  const witelSelect = document.getElementById('dashboard-filter-witel');
  if (!witelSelect) return;

  const label = document.createElement('span');
  label.textContent = 'STATUS :';
  label.className = 'filter-label text-info ms-2';

  const sel = document.createElement('select');
  sel.id = 'dashboard-filter-status';
  sel.className = 'form-select form-select-sm w-auto ms-1';
  sel.innerHTML = `
    <option value="">All</option>
    <option value="✅">Achieve</option>
    <option value="❌">Not Achieve</option>
  `;

  witelSelect.parentElement.appendChild(label);
  witelSelect.parentElement.appendChild(sel);
  sel.addEventListener('input', renderDashboard);
}

function applyDashboardFilter() {
  const witel  = val('dashboard-filter-witel');
  const kat    = val('table-filter-kategori');
  const key    = val('table-search').toLowerCase();
  const status = val('dashboard-filter-status');

  return dashboardRawData.filter(r => {
    if (witel && r.Witel !== witel) return false;
    if (kat && r['Katagori KPI'] !== kat) return false;
    if (key && !r.Indikator.toLowerCase().includes(key)) return false;
    if (status && r['Status Ach HI'] !== status) return false;
    return true;
  });
}

/* =====================================================
   UTIL
===================================================== */
function num(v) {
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}
function avg(arr) {
  return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
}
function fmt(v) {
  if (v === null || v === '') return '-';
  return num(v).toLocaleString('id-ID');
}
function badge(v) {
  if (v === '✅') return `<span class="badge bg-success">Achieve</span>`;
  if (v === '❌') return `<span class="badge bg-danger">Not Achieve</span>`;
  return '-';
}
function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}
function fillSelect(el, arr) {
  if (!el) return;
  el.innerHTML = `<option value="">All</option>`;
  arr.forEach(v => el.innerHTML += `<option value="${v}">${v}</option>`);
}
function val(id) {
  return document.getElementById(id)?.value || '';
}
function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}
