/* =====================================================
   GLOBAL STATE
===================================================== */
let ttrRawData = [];
let ttrHeaders = [];
let currentType = 'ttr_hsi_table';

/* =====================================================
   FORMATTER
===================================================== */
function fmt(val, digit = 2) {
  if (val === null || val === undefined || val === '') return '-';
  if (isNaN(val)) return val;
  return Number(val).toFixed(digit).replace(/\.00$/, '');
}

function fmtPercent(val) {
  if (val === null || val === undefined || val === '') return '-';
  if (isNaN(val)) return val;
  return fmt(val, 2);
}

function fmtInt(val) {
  if (val === null || val === undefined || val === '') return '-';
  if (isNaN(val)) return val;
  return parseInt(val, 10);
}

/* =====================================================
   AUTO ALERT RULE
===================================================== */
function isAlertCell(type, header, row) {

  if (type === 'ttr_hsi_table') {

    if (header === '% TTR INDIBIZ 4H' && row[header] < 77) return true;
    if (header === 'Tiket Not Ach INDIBIZ 4H' && row[header] > 0) return true;

    if (header === '% TTR INDIBIZ 24H' && row[header] < 96.6) return true;
    if (header === 'Tiket Not Ach INDIBIZ 24H' && row[header] > 0) return true;

    if (header === '% TTR RESELLER 6H' && row[header] < 92.9) return true;
    if (header === 'Tiket Not Ach RESELLER 6H' && row[header] > 0) return true;

    if (header === '% TTR RESELLER 36H' && row[header] < 99.1) return true;
    if (header === 'Tiket Not Ach RESELLER 36H HI' && row[header] > 0) return true;
  }

  if (type === 'ttr_datin_table') {

    if (header === '% TTR Datin K2' && row[header] < 81) return true;
    if (header === 'Tiket Not Ach K2' && row[header] > 0) return true;
    if (header === 'Tiket K2 HI' && row[header] > 0) return true;

    if (header === '% TTR Datin K3' && row[header] < 95) return true;
    if (header === 'Tiket Not Ach K3' && row[header] > 0) return true;
    if (header === 'Tiket K3 HI' && row[header] > 0) return true;
  }

  return false;
}

/* =====================================================
   KPI SUMMARY CARD FINAL
===================================================== */
async function renderSummaryCards(API_URL) {

  const row = document.getElementById('ttr-row');
  row.innerHTML = '';

  /* ===============================
     FETCH KPI TTR
  =============================== */
  const res = await fetch(API_URL + '?type=kpi');
  const json = await res.json();

  const ttrMap = {};

  json.data
    .filter(d => d.indikator.toUpperCase().includes('TTR'))
    .forEach(d => {

      const key = d.indikator.toUpperCase();

      if (!ttrMap[key]) {
        ttrMap[key] = {
          indikator: d.indikator,
          target: d.target,
          BANTEN: 0,
          TANGERANG: 0
        };
      }

      if (d.witel.toUpperCase() === 'BANTEN') {
        ttrMap[key].BANTEN = Number(d.ach) || 0;
      }
      if (d.witel.toUpperCase() === 'TANGERANG') {
        ttrMap[key].TANGERANG = Number(d.ach) || 0;
      }
    });

  /* ===============================
     RENDER CARD TTR (NO DISTRICT)
  =============================== */
  Object.values(ttrMap).forEach(d => {

    const card = document.createElement('div');
    card.className = 'badge-card';

    card.innerHTML = `
      <div class="badge-card-header">${d.indikator}</div>
      <div class="badge-card-body text-dark">
        <div class="row-item"><span>Target</span><span>${fmt(d.target,1)}</span></div>
        <div class="row-item"><span>Banten</span><span>${fmt(d.BANTEN)}</span></div>
        <div class="row-item"><span>Tangerang</span><span>${fmt(d.TANGERANG)}</span></div>
      </div>
    `;

    row.appendChild(card);
  });

  /* =====================================================
   RENDER CARD TTR & NOT ACH (FINAL FIX)
===================================================== */
async function renderSummaryCards(API_URL) {

  const row = document.getElementById('ttr-row');
  row.innerHTML = '';

  /* ===============================
     KPI TTR
  =============================== */
  const kpiRes = await fetch(API_URL + '?type=kpi');
  const kpiJson = await kpiRes.json();

  const ttrMap = {};

  kpiJson.data
    .filter(d => d.indikator.toUpperCase().includes('TTR'))
    .forEach(d => {

      const key = d.indikator.toUpperCase();

      if (!ttrMap[key]) {
        ttrMap[key] = {
          indikator: d.indikator,
          target: d.target,
          BANTEN: 0,
          TANGERANG: 0
        };
      }

      if (d.witel === 'BANTEN') ttrMap[key].BANTEN = Number(d.ach) || 0;
      if (d.witel === 'TANGERANG') ttrMap[key].TANGERANG = Number(d.ach) || 0;
    });

  Object.values(ttrMap).forEach(d => {
    row.innerHTML += `
      <div class="badge-card">
        <div class="badge-card-header">${d.indikator}</div>
        <div class="badge-card-body text-dark">
          <div class="row-item"><span>Target</span><span>${fmt(d.target,1)}</span></div>
          <div class="row-item"><span>Banten</span><span>${fmt(d.BANTEN)}</span></div>
          <div class="row-item"><span>Tangerang</span><span>${fmt(d.TANGERANG)}</span></div>
        </div>
      </div>
    `;
  });

  /* ===============================
     DATIN TABLE (K2 & K3)
  =============================== */
  const datinRes = await fetch(API_URL + '?type=ttr_datin_table');
  const datinJson = await datinRes.json();

  const datinCards = [
    { title: 'Tiket Not Ach DATIN K2', col: 'Tiket Not Ach K2' },
    { title: 'Tiket Not Ach DATIN K3', col: 'Tiket Not Ach K3' }
  ];

  datinCards.forEach(cfg => {
    let banten = 0;
    let tgr = 0;

    datinJson.data.forEach(r => {
      if (r.WITEL === 'BANTEN') banten += Number(r[cfg.col]) || 0;
      if (r.WITEL === 'TANGERANG') tgr += Number(r[cfg.col]) || 0;
    });

    row.innerHTML += `
      <div class="badge-card">
        <div class="badge-card-header">${cfg.title}</div>
        <div class="badge-card-body text-dark">
          <div class="row-item"><span>District Banten</span><span>${banten + tgr}</span></div>
          <div class="row-item"><span>Banten</span><span>${banten}</span></div>
          <div class="row-item"><span>Tangerang</span><span>${tgr}</span></div>
        </div>
      </div>
    `;
  });

  /* ===============================
     HSI & RESELLER TABLE
  =============================== */
  const hsiRes = await fetch(API_URL + '?type=ttr_hsi_table');
  const hsiJson = await hsiRes.json();

  const hsiCards = [
    { title: 'Tiket Not Ach HSI 4H', col: 'Tiket Not Ach INDIBIZ 4H' },
    { title: 'Tiket Not Ach HSI 24H', col: 'Tiket Not Ach INDIBIZ 24H' },
    { title: 'Tiket Not Ach Reseller 6H', col: 'Tiket Not Ach RESELLER 6H' },
    { title: 'Tiket Not Ach Reseller 36H', col: 'Tiket Not Ach RESELLER 36H' }
  ];

  hsiCards.forEach(cfg => {
    let banten = 0;
    let tgr = 0;

    hsiJson.data.forEach(r => {
      if (r.WITEL === 'BANTEN') banten += Number(r[cfg.col]) || 0;
      if (r.WITEL === 'TANGERANG') tgr += Number(r[cfg.col]) || 0;
    });

    row.innerHTML += `
      <div class="badge-card">
        <div class="badge-card-header">${cfg.title}</div>
        <div class="badge-card-body text-dark">
          <div class="row-item"><span>District Banten</span><span>${banten + tgr}</span></div>
          <div class="row-item"><span>Banten</span><span>${banten}</span></div>
          <div class="row-item"><span>Tangerang</span><span>${tgr}</span></div>
        </div>
      </div>
    `;
  });
}


/* =====================================================
   INIT
===================================================== */
async function initTTRHSI(API_URL) {

  const overlay = document.getElementById('ttr-loading-overlay');
  const lastUpdate = document.getElementById('ttr-last-update');

  overlay.classList.remove('d-none');

  try {
    await renderSummaryCards(API_URL);
    await loadTTRTable(API_URL, currentType);

    lastUpdate.innerHTML =
      `<i class="fa fa-clock me-1"></i> Last update: ${new Date().toLocaleString()}`;

  } catch (err) {
    console.error(err);
  } finally {
    overlay.classList.add('d-none');
  }

  document.querySelectorAll('#ttr-tabs button').forEach(btn => {
    btn.onclick = async () => {
      document.querySelectorAll('#ttr-tabs button').forEach(b => {
        b.classList.remove('btn-primary', 'active');
        b.classList.add('btn-outline-light');
      });
      btn.classList.add('btn-primary', 'active');
      currentType = btn.dataset.type;
      await loadTTRTable(API_URL, currentType);
    };
  });
}

/* =====================================================
   LOAD TABLE
===================================================== */
async function loadTTRTable(API_URL, type) {

  const body = document.getElementById('ttr-table-body');
  body.innerHTML = `<tr><td class="text-center text-muted">Loading...</td></tr>`;

  const res = await fetch(API_URL + '?type=' + type);
  const json = await res.json();

  ttrHeaders = json.headers;
  ttrRawData = json.data;

  initTTRFilter();
  renderTTRTable();
}

/* =====================================================
   FILTER
===================================================== */
function initTTRFilter() {

  const witel = document.getElementById('ttr-filter-witel');
  const sto = document.getElementById('ttr-filter-sto');

  witel.innerHTML = `<option value="">All Witel</option>`;
  [...new Set(ttrRawData.map(d => d.WITEL))].forEach(v =>
    witel.innerHTML += `<option>${v}</option>`
  );

  sto.innerHTML = `<option value="">All STO</option>`;
  [...new Set(ttrRawData.map(d => d.STO))].forEach(v =>
    sto.innerHTML += `<option>${v}</option>`
  );

  witel.onchange = renderTTRTable;
  sto.onchange = renderTTRTable;
}

/* =====================================================
   RENDER TABLE
===================================================== */
function renderTTRTable() {

  const head = document.getElementById('ttr-table-head');
  const body = document.getElementById('ttr-table-body');
  const fw = document.getElementById('ttr-filter-witel').value;
  const fs = document.getElementById('ttr-filter-sto').value;

  head.innerHTML = '';
  ttrHeaders.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    head.appendChild(th);
  });

  body.innerHTML = '';

  ttrRawData
    .filter(r => (!fw || r.WITEL === fw) && (!fs || r.STO === fs))
    .forEach(r => {

      const tr = document.createElement('tr');

      ttrHeaders.forEach(h => {

        const td = document.createElement('td');

        if (h.includes('%')) td.textContent = fmtPercent(r[h]);
        else if (h.toLowerCase().includes('tiket')) td.textContent = fmtInt(r[h]);
        else td.textContent = fmt(r[h]);

        if (isAlertCell(currentType, h, r)) {
          td.classList.add('table-danger', 'fw-bold');
        }

        tr.appendChild(td);
      });

      body.appendChild(tr);
    });
}
