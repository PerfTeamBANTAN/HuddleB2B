/* =====================================================
   B2C DISTRICT KPI DASHBOARD – FINAL FIXED
===================================================== */

const $ = id => document.getElementById(id);

function num(v) {
  if (v === null || v === undefined || v === '' || v === '#N/A') return 0;
  return Number(String(v).replace(',', '.'));
}

function fmt(v) {
  return Number(v).toLocaleString('id-ID', { maximumFractionDigits: 2 });
}

function getStatus(target, ach) {
  if (!target) return 'NA';
  return ach >= target ? 'GOOD' : 'BAD';
}

/* ================= SUMMARY ================= */
function renderSummary(data) {
  const total = data.length;
  const good = data.filter(d => d.status === 'GOOD').length;
  const bad  = data.filter(d => d.status === 'BAD').length;

  $('b2cSummary').innerHTML = `
    <div class="col-md-4">
      <div class="summary-neon">
        <div class="summary-title">TOTAL KPI</div>
        <div class="summary-value">${total}</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="summary-neon">
        <div class="summary-title">ACHIEVE</div>
        <div class="summary-value text-success">${good}</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="summary-neon">
        <div class="summary-title">NOT ACHIEVE</div>
        <div class="summary-value text-danger">${bad}</div>
      </div>
    </div>
  `;
}

/* ================= KPI GRID ================= */
function renderKPI(data) {
  const wrap = $('b2cKpiGrid');
  wrap.innerHTML = '';

  data.forEach(kpi => {
    const pct = kpi.target
      ? Math.min(100, Math.round((kpi.ach / kpi.target) * 100))
      : 0;

    wrap.insertAdjacentHTML('beforeend', `
      <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
        <div class="kpi-neon ${kpi.status === 'GOOD' ? 'good' : 'bad'}">
          <div class="kpi-name">${kpi.indikator}</div>
          <div class="kpi-value">${fmt(kpi.ach)}</div>
          <div class="kpi-target">TGT ${fmt(kpi.target)}</div>
          <div class="kpi-status ${kpi.status === 'GOOD' ? 'ok' : 'bad'}">
            ${kpi.status}
          </div>
        </div>
      </div>
    `);
  });
}

/* ================= NORMALIZE ================= */
function normalize(raw) {
  return raw.map(r => {
    const target = num(r.Target);
    const ach = num(r['Achievement HI']);

    return {
      indikator: r.Indikator || r['Indikator '] || '-',
      target,
      ach,
      status: getStatus(target, ach)
    };
  });
}

/* =====================================================
   ✅ INI YANG DIPANGGIL OLEH SYSTEM KAMU
===================================================== */
function initDashboardB2C24KPI(apiUrl) {
  fetch(apiUrl)
    .then(r => r.json())
    .then(res => {
      const data = normalize(res.data || []);

      $('b2cLastUpdate').innerText =
        `Updated ${new Date(res.lastUpdate).toLocaleString('id-ID')}`;

      renderSummary(data);
      renderKPI(data);
    })
    .catch(err => console.error('B2C KPI ERROR', err));
}
