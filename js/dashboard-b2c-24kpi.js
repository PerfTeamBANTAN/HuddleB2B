/* =====================================================
   B2C DISTRICT KPI DASHBOARD – FINAL PRO
===================================================== */

const $ = id => document.getElementById(id);

/* ================= UTIL ================= */
function toNum(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  return Number(String(v).replace(/,/g,'').replace('%','')) || 0;
}

function fmt(v) {
  return v.toLocaleString('id-ID', { maximumFractionDigits: 2 });
}

function status(target, ach) {
  if (!target) return 'NA';
  return ach >= target ? 'GOOD' : 'BAD';
}

/* ================= FIELD AUTO DETECT ================= */
function pick(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== '') return obj[k];
  }
  return null;
}

/* ================= NORMALIZE DATA ================= */
function normalize(rows) {
  return rows.map(r => {
    const target = toNum(pick(r, [
      'Target', 'TARGET', 'TGT', 'Target KPI'
    ]));

    const ach = toNum(pick(r, [
      'Achievement HI', 'ACH HI', 'Actual', 'Realisasi'
    ]));

    const indikator = pick(r, [
      'Indikator', 'KPI', 'Nama KPI'
    ]) || 'KPI';

    return {
      indikator,
      target,
      ach,
      status: status(target, ach)
    };
  }).filter(d => d.target > 0 || d.ach > 0);
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

/* ================= KPI CARD ================= */
function renderKPI(data) {
  const wrap = $('b2cKpiGrid');
  wrap.innerHTML = '';

  data.forEach(d => {
    const pct = d.target
      ? Math.min(100, Math.round(d.ach / d.target * 100))
      : 0;

    const stroke = 283 - (pct / 100) * 283;

    wrap.insertAdjacentHTML('beforeend', `
      <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
        <div class="kpi-neon ${d.status === 'GOOD' ? 'good' : 'bad'}">
          <div class="kpi-name">${d.indikator}</div>

          <div class="kpi-circle">
            <svg viewBox="0 0 100 100">
              <circle class="bg" cx="50" cy="50" r="45"/>
              <circle class="progress"
                cx="50" cy="50" r="45"
                stroke-dasharray="283"
                stroke-dashoffset="${stroke}"/>
            </svg>
            <div class="pct">${pct}%</div>
          </div>

          <div class="kpi-meta">
            <div>ACH ${fmt(d.ach)}</div>
            <div>TGT ${fmt(d.target)}</div>
          </div>

          <div class="kpi-status ${d.status === 'GOOD' ? 'ok' : 'bad'}">
            ${d.status}
          </div>
        </div>
      </div>
    `);
  });
}

/* ================= INIT ================= */
function initDashboardB2C24KPI(apiUrl) {
  fetch(apiUrl)
    .then(r => r.json())
    .then(res => {
      const rows = res.data || res;
      const data = normalize(rows);

      $('b2cLastUpdate').innerText =
        `Updated ${new Date().toLocaleString('id-ID')}`;

      renderSummary(data);
      renderKPI(data);
    })
    .catch(err => {
      console.error('B2C KPI ERROR', err);
    });
}
