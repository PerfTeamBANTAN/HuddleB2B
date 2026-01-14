/* =====================================================
   DASHBOARD B2B – FINAL KPI LOGIC (STO LABEL FIX)
===================================================== */

let dashboardRawData = [];
let achChart = null;
let statusChart = null;

const KPI_PER_WITEL = 48;

/* =====================================================
   AUTO LOADER + LABEL STYLE
===================================================== */
(function () {
  const wrapper = document.getElementById('dashboard-b2b-wrapper');
  if (!wrapper) return;

  if (getComputedStyle(wrapper).position === 'static') {
    wrapper.style.position = 'relative';
  }

  const style = document.createElement('style');
  style.innerHTML = `
    #dashboard-b2b-loading {
      position:absolute; inset:0;
      background:rgba(5,10,20,.75);
      z-index:50;
      display:flex;align-items:center;justify-content:center;
      flex-direction:column;color:#fff
    }
    #dashboard-b2b-loading.d-none{display:none}
    .spinner{width:36px;height:36px;border:4px solid rgba(255,255,255,.3);
      border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}

    .filter-label{
      font-size:11px;
      color:#9fb4ff;
      margin-bottom:2px;
      white-space:nowrap;
    }
  `;
  document.head.appendChild(style);

  if (!document.getElementById('dashboard-b2b-loading')) {
    const loader = document.createElement('div');
    loader.id = 'dashboard-b2b-loading';
    loader.className = 'd-none';
    loader.innerHTML = `<div class="spinner"></div><div>Loading Dashboard B2B...</div>`;
    wrapper.appendChild(loader);
  }
})();

/* =====================================================
   LOADING
===================================================== */
const showDashboardLoading = () =>
  document.getElementById('dashboard-b2b-loading')?.classList.remove('d-none');
const hideDashboardLoading = () =>
  document.getElementById('dashboard-b2b-loading')?.classList.add('d-none');

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
      renderDashboard();
      setText('dashboard-b2b-last-update', `Last update: ${res.lastUpdate || '-'}`);
    })
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
function renderKPI(data) {
  const sto = val('dashboard-filter-witel');

  setText('kpi-total', sto ? KPI_PER_WITEL : KPI_PER_WITEL * 2);
  setText('kpi-achieve', data.filter(d => d['Status Ach HI'] === '✅').length);
  setText('kpi-not-achieve', data.filter(d => d['Status Ach HI'] === '❌').length);

  const ach = dashboardRawData
    .filter(r => String(r.Indikator).toLowerCase() === 'achievement')
    .reduce((a, b) => a + num(b['Achievement HI']), 0);

  setText('kpi-achievement-hi', ach ? (ach / 2).toFixed(2) + '%' : '-');
}

/* =====================================================
   TABLE
===================================================== */
function renderTable(data) {
  const tbody = document.getElementById('dashboard-b2b-table-body');
  tbody.innerHTML = '';

  if (!data.length) {
    tbody.innerHTML =
      `<tr><td colspan="7" class="text-center">Tidak ada data</td></tr>`;
    return;
  }

  data.forEach(r => {
    const tr = document.createElement('tr');
    if (r['Status Ach HI'] === '❌') tr.classList.add('table-danger');

    tr.innerHTML = `
      <td>${r.Indikator}</td>
      <td class="text-end">${fmt(r.Target)}</td>
      <td class="text-end fw-bold">${fmt(r['Achievement HI'])}</td>
      <td class="text-center">${badge(r['Status Ach HI'])}</td>
      <td class="text-end">${fmt(r['Achievement Kemarin'])}</td>
      <td class="text-center">${badge(r['Status Ach Kemarin'])}</td>
      <td>${r['Katagori KPI']}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* =====================================================
   CHART
===================================================== */
function renderAchievementChart(data) {
  const el = document.getElementById('achievement-chart');
  el.innerHTML = `<canvas id="achChartCanvas"></canvas>`;
  achChart?.destroy();

  achChart = new Chart(achChartCanvas, {
    type: 'line',
    data: {
      labels: data.map(d => d.Indikator),
      datasets: [
        { label: 'Achievement HI', data: data.map(d => num(d['Achievement HI'])), fill: true },
        { label: 'Kemarin', data: data.map(d => num(d['Achievement Kemarin'])), fill: true }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function renderStatusChart(data) {
  const el = document.getElementById('status-chart');
  el.innerHTML = `<canvas id="statusChartCanvas"></canvas>`;
  statusChart?.destroy();

  statusChart = new Chart(statusChartCanvas, {
    type: 'bar',
    data: {
      labels: ['Achieve', 'Not Achieve'],
      datasets: [{
        data: [
          data.filter(d => d['Status Ach HI'] === '✅').length,
          data.filter(d => d['Status Ach HI'] === '❌').length
        ]
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

/* =====================================================
   FILTER + LABEL FIX (STO INCLUDED)
===================================================== */
function initDashboardFilter() {

  /* ===== FILTER STO (WITEL) ===== */
  const stoSelect = document.getElementById('dashboard-filter-witel');
  wrapLabelOnce(stoSelect, 'Filter STO');

  fillSelect(
    stoSelect,
    uniq(dashboardRawData.map(d => d.Witel))
  );

  /* ===== FILTER STATUS KPI ===== */
  const status = document.createElement('select');
  status.id = 'dashboard-filter-status';
  status.className = 'form-select form-select-sm w-auto';
  status.innerHTML = `
    <option value="">All Status</option>
    <option value="ach">Achieve Only</option>
    <option value="not">Not Achieve Only</option>
  `;
  stoSelect.parentElement.appendChild(wrapWithLabel(status, 'Filter Status KPI'));

  /* ===== FILTER KATEGORI ===== */
  const kat = document.getElementById('table-filter-kategori');
  wrapLabelOnce(kat, 'Filter Kategori KPI');

  fillSelect(
    kat,
    uniq(dashboardRawData.map(d => d['Katagori KPI']))
  );

  ['dashboard-filter-witel','dashboard-filter-status','table-filter-kategori','table-search']
    .forEach(id =>
      document.getElementById(id)?.addEventListener('input', renderDashboard)
    );
}

/* =====================================================
   APPLY FILTER
===================================================== */
function applyDashboardFilter() {
  const sto = val('dashboard-filter-witel');
  const status = val('dashboard-filter-status');
  const kat = val('table-filter-kategori');
  const key = val('table-search').toLowerCase();

  return dashboardRawData.filter(r => {
    if (sto && r.Witel !== sto) return false;
    if (kat && r['Katagori KPI'] !== kat) return false;
    if (key && !r.Indikator.toLowerCase().includes(key)) return false;
    if (status === 'ach' && r['Status Ach HI'] !== '✅') return false;
    if (status === 'not' && r['Status Ach HI'] !== '❌') return false;
    return true;
  });
}

/* =====================================================
   UTIL
===================================================== */
function wrapLabelOnce(el, text) {
  if (!el || el.dataset.labeled) return;
  el.dataset.labeled = '1';
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="filter-label">${text}</div>`;
  el.parentNode.insertBefore(wrap, el);
  wrap.appendChild(el);
}

function wrapWithLabel(el, text) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="filter-label">${text}</div>`;
  wrap.appendChild(el);
  return wrap;
}

const num = v => parseFloat(String(v).replace(',', '.')) || 0;
const fmt = v => v == null || v === '' ? '-' : num(v).toLocaleString('id-ID');
const uniq = a => [...new Set(a.filter(Boolean))];
const val = id => document.getElementById(id)?.value || '';
const setText = (id, v) => document.getElementById(id).textContent = v;
const badge = v =>
  v === '✅'
    ? '<span class="badge bg-success">Achieve</span>'
    : '<span class="badge bg-danger">Not Achieve</span>';
