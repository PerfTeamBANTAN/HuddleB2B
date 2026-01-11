/* =====================================================
   GLOBAL STATE
===================================================== */
let alertRawData = [];
let alertHeaders = [];
let currentAlertType = 'alert_sqm_table';

/* =====================================================
   FORMATTER
===================================================== */
function fmtAlertInt(val) {
  if (val === null || val === undefined || val === '') return '-';
  if (isNaN(val)) return val;
  return parseInt(val, 10);
}

/* =====================================================
   ALERT RULE (MERAH JIKA > 0)
===================================================== */
function isAlertValue(val) {
  return Number(val) > 0;
}

/* =====================================================
   SUMMARY CARD
===================================================== */
async function renderAlertSummaryCards(API_URL) {

  const row = document.getElementById('alert-row');
  row.innerHTML = '';

  const res = await fetch(API_URL + '?type=alert_sqm_table');
  const json = await res.json();

  const cardConfig = [
    { title: 'Alert HSI', col: 'ALERT HSI' },
    { title: 'Alert SQM HSI', col: 'ALERT SQM HSI' }
  ];

  cardConfig.forEach(cfg => {

    let banten = 0;
    let tangerang = 0;

    json.data.forEach(r => {
      if (r.WITEL === 'BANTEN') banten += Number(r[cfg.col]) || 0;
      if (r.WITEL === 'TANGERANG') tangerang += Number(r[cfg.col]) || 0;
    });

    const district = banten + tangerang;
    const isBad = district > 0;

    const card = document.createElement('div');
    card.className = `badge-card ${isBad ? 'card-bad' : 'card-good'}`;

    card.innerHTML = `
      <div class="badge-card-header">${cfg.title}</div>
      <div class="badge-card-body text-dark">
        <div class="row-item">
          <span>District</span>
          <span class="${isBad ? 'value-bad' : 'value-good'}">${district}</span>
        </div>
        <div class="row-item">
          <span>Banten</span>
          <span class="${banten > 0 ? 'value-bad' : 'value-good'}">${banten}</span>
        </div>
        <div class="row-item">
          <span>Tangerang</span>
          <span class="${tangerang > 0 ? 'value-bad' : 'value-good'}">${tangerang}</span>
        </div>
      </div>
    `;

    row.appendChild(card);
  });
}

/* =====================================================
   INIT
===================================================== */
async function initAlertHSI(API_URL) {

  const overlay = document.getElementById('alert-loading-overlay');
  const lastUpdate = document.getElementById('alert-last-update');

  overlay.classList.remove('d-none');

  try {
    await renderAlertSummaryCards(API_URL);
    await loadAlertTable(API_URL);

    lastUpdate.innerHTML =
      `<i class="fa fa-clock me-1"></i> Last update: ${new Date().toLocaleString()}`;

  } catch (err) {
    console.error(err);
  } finally {
    overlay.classList.add('d-none');
  }
}

/* =====================================================
   LOAD TABLE
===================================================== */
async function loadAlertTable(API_URL) {

  const body = document.getElementById('alert-table-body');
  body.innerHTML = `<tr><td class="text-center text-muted">Loading...</td></tr>`;

  const res = await fetch(API_URL + '?type=alert_sqm_table');
  const json = await res.json();

  alertHeaders = json.headers;
  alertRawData = json.data;

  initAlertFilter();
  renderAlertTable();
}

/* =====================================================
   FILTER
===================================================== */
function initAlertFilter() {

  const witel = document.getElementById('alert-filter-witel');
  const sto = document.getElementById('alert-filter-sto');

  witel.innerHTML = `<option value="">All Witel</option>`;
  [...new Set(alertRawData.map(d => d.WITEL))].forEach(v =>
    witel.innerHTML += `<option>${v}</option>`
  );

  sto.innerHTML = `<option value="">All STO</option>`;
  [...new Set(alertRawData.map(d => d.STO))].forEach(v =>
    sto.innerHTML += `<option>${v}</option>`
  );

  witel.onchange = renderAlertTable;
  sto.onchange = renderAlertTable;
}

/* =====================================================
   RENDER TABLE
===================================================== */
function renderAlertTable() {

  const head = document.getElementById('alert-table-head');
  const body = document.getElementById('alert-table-body');
  const fw = document.getElementById('alert-filter-witel').value;
  const fs = document.getElementById('alert-filter-sto').value;

  head.innerHTML = '';
  alertHeaders.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    head.appendChild(th);
  });

  body.innerHTML = '';

  alertRawData
    .filter(r => (!fw || r.WITEL === fw) && (!fs || r.STO === fs))
    .forEach(r => {

      const tr = document.createElement('tr');

      alertHeaders.forEach(h => {

        const td = document.createElement('td');
        const val = r[h];

        td.textContent = fmtAlertInt(val);

        if (isAlertValue(val)) {
          td.classList.add('table-danger', 'fw-bold');
        }

        tr.appendChild(td);
      });

      body.appendChild(tr);
    });
}
