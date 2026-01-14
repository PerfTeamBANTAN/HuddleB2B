/* =====================================================
   DASHBOARD B2B – FINAL KPI LOGIC + STATUS FILTER + LABEL
   (NO HTML STRUCTURE CHANGED)
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
    }
    #dashboard-b2b-loading.d-none { display:none }
    #dashboard-b2b-loading .spinner {
      width:36px;height:36px;
      border:4px solid rgba(255,255,255,.3);
      border-top-color:#fff;
      border-radius:50%;
      animation:spin .8s linear infinite;
      margin-bottom:8px;
    }
    @keyframes spin { to{transform:rotate(360deg)} }

    .filter-label {
      font-size:11px;
      color:#9fb4ff;
      margin-bottom:2px;
    }
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
   KPI SUMMARY
===================================================== */
function renderKPI(data) {
  const witel = val('dashboard-filter-witel');

  setText('kpi-total', witel ? KPI_PER_WITEL : KPI_PER_WITEL * 2);
  setText('kpi-achieve', data.filter(d => d['Status Ach HI'] === '✅').length);
  setText('kpi-not-achieve', data.filter(d => d['Status Ach HI'] === '❌').length);

  const achRows = dashboardRawData.filter(r =>
    String(r.Indikator).toLowerCase() === 'achievement'
  );

  const byWitel = {};
  achRows.forEach(r => byWitel[r.Witel] = num(r['Achievement HI']));

  const finalAch = witel
    ? byWitel[witel] || 0
    : avg(Object.values(byWitel));

  setText('kpi-achievement-hi', finalAch ? finalAch.toFixed(2) + '%' : '-');
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
   CHARTS
===================================================== */
function renderAchievementChart(data) {
  const el = document.getElementById('achievement-chart');
  if (!el) return;

  el.innerHTML = `<canvas id="achChartCanvas"></canvas>`;
  if (achChart) achChart.destroy();

  achChart = new Chart(achChartCanvas, {
    type: 'line',
    data: {
      labels: data.map(d => d.Indikator),
      datasets: [
        { label:'Achievement HI', data:data.map(d=>num(d['Achievement HI'])), fill:true, tension:.4 },
        { label:'Kemarin', data:data.map(d=>num(d['Achievement Kemarin'])), fill:true, tension:.4 }
      ]
    },
    options:{ responsive:true, maintainAspectRatio:false }
  });
}

function renderStatusChart(data) {
  const el = document.getElementById('status-chart');
  if (!el) return;

  el.innerHTML = `<canvas id="statusChartCanvas"></canvas>`;
  if (statusChart) statusChart.destroy();

  statusChart = new Chart(statusChartCanvas, {
    type:'bar',
    data:{
      labels:['Achieve','Not Achieve'],
      datasets:[{
        data:[
          data.filter(d=>d['Status Ach HI']==='✅').length,
          data.filter(d=>d['Status Ach HI']==='❌').length
        ]
      }]
    },
    options:{ responsive:true, maintainAspectRatio:false }
  });
}

/* =====================================================
   FILTER + LABEL (AUTO INJECT)
===================================================== */
function initDashboardFilter() {

  /* ---- FILTER WITEL ---- */
  fillSelect(
    addFilterLabel('dashboard-filter-witel','Filter Witel'),
    uniq(dashboardRawData.map(d=>d.Witel))
  );

  /* ---- FILTER STATUS KPI ---- */
  const statusFilter = document.createElement('select');
  statusFilter.id = 'dashboard-filter-status';
  statusFilter.className = 'form-select form-select-sm w-auto';
  statusFilter.innerHTML = `
    <option value="">All Status</option>
    <option value="ach">Achieve Only</option>
    <option value="not">Not Achieve Only</option>
  `;

  const witelSelect = document.getElementById('dashboard-filter-witel');
  witelSelect.parentElement.appendChild(
    wrapWithLabel(statusFilter,'Filter Status KPI')
  );

  /* ---- FILTER KATEGORI ---- */
  fillSelect(
    addFilterLabel('table-filter-kategori','Filter Kategori KPI'),
    uniq(dashboardRawData.map(d=>d['Katagori KPI']))
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
  const witel = val('dashboard-filter-witel');
  const status = val('dashboard-filter-status');
  const kat = val('table-filter-kategori');
  const key = val('table-search').toLowerCase();

  return dashboardRawData.filter(r => {
    if (witel && r.Witel !== witel) return false;
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
function addFilterLabel(id,label){
  const el=document.getElementById(id);
  if(!el||el.dataset.labeled)return el;
  el.dataset.labeled='1';
  el.parentElement.insertAdjacentHTML('afterbegin',
    `<div class="filter-label">${label}</div>`);
  return el;
}

function wrapWithLabel(el,label){
  const wrap=document.createElement('div');
  wrap.innerHTML=`<div class="filter-label">${label}</div>`;
  wrap.appendChild(el);
  return wrap;
}

const num=v=>{const n=parseFloat(String(v).replace(',','.'));return isNaN(n)?0:n};
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const fmt=v=>v==null||v===''?'-':num(v).toLocaleString('id-ID');
const uniq=a=>[...new Set(a.filter(Boolean))];
const fillSelect=(el,a)=>{if(!el)return;el.innerHTML='<option value="">All</option>';a.forEach(v=>el.innerHTML+=`<option value="${v}">${v}</option>`)}
const val=id=>document.getElementById(id)?.value||'';
const setText=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
const badge=v=>v==='✅'?'<span class="badge bg-success">Achieve</span>':v==='❌'?'<span class="badge bg-danger">Not Achieve</span>':'-';
