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
  return fmt(val, 2);
}

function fmtInt(val) {
  if (val === null || val === undefined || val === '') return '-';
  return parseInt(val, 10);
}

/* =====================================================
   CARD COLOR HELPER
===================================================== */
function danger(val, target) {
  if (val === null || val === undefined) return '';
  return Number(val) < Number(target) ? 'text-danger fw-bold' : '';
}

function dangerTicket(val) {
  return Number(val) > 0 ? 'text-danger fw-bold' : '';
}

/* =====================================================
   AUTO ALERT RULE (TABLE)
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
    if (header === 'Tiket Not Ach RESELLER 36H' && row[header] > 0) return true;
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
   DETAIL TYPE MAPPER (TTR DATIN)
===================================================== */
function getTTRDetailType(type, header) {

  /* ================= DATIN ================= */
  if (type === 'ttr_datin_table') {
    if (header === 'Tot Tiket K2') return 'ttr_datin_k2_detail';
    if (header === 'Tot Tiket K3') return 'ttr_datin_k3_detail';

    if (header === 'Tiket Not Ach K2') return 'ttr_datin_not_ach_k2_detail';
    if (header === 'Tiket Not Ach K3') return 'ttr_datin_not_ach_k3_detail';
  }

  /* ================= HSI ================= */
  if (type === 'ttr_hsi_table') {

    // INDIBIZ
    if (header === 'Tot Tiket INDIBIZ 4H')
      return 'ttr_hsi_indibiz_4h_detail';

    if (header === 'Tiket Not Ach INDIBIZ 4H')
      return 'ttr_hsi_indibiz_4h_not_ach_detail';

    if (header === 'Tot Tiket INDIBIZ 24H')
      return 'ttr_hsi_indibiz_24h_detail';

    if (header === 'Tiket Not Ach INDIBIZ 24H')
      return 'ttr_hsi_indibiz_24h_not_ach_detail';

    // RESELLER
    if (header === 'Tot Tiket RESELLER 6H')
      return 'ttr_hsi_reseller_6h_detail';

    if (header === 'Tiket Not Ach RESELLER 6H')
      return 'ttr_hsi_reseller_6h_not_ach_detail';

    if (header === 'Tot Tiket RESELLER 36H')
      return 'ttr_hsi_reseller_36h_detail';

    if (header === 'Tiket Not Ach RESELLER 36H')
      return 'ttr_hsi_reseller_36h_not_ach_detail';
  }

  return null;
}



/* =====================================================
   HEADER FORMATTER (VISUAL ONLY)
===================================================== */
function formatHeaderLabel(h) {

  if (h === 'STO' || h === 'WITEL') return h;

  let label = h;

  label = label.replace('% ', '%<br>');
  label = label.replace(/TTR/g, '<strong>TTR</strong>');

  label = label.replace(
    /Tiket Not Ach/i,
    '<small>Tiket</small><br><strong>Not Ach</strong>'
  );

  label = label.replace(
    /Tiket (K\d) HI/i,
    '<small>Tiket</small><br><strong>$1 HI</strong>'
  );

  label = label.replace(/(\d+H)/g, '<br><small>$1</small>');

  return label;
}

/* =====================================================
   KPI SUMMARY CARD
===================================================== */
async function renderSummaryCards(API_URL) {

  const row = document.getElementById('ttr-row');
  row.innerHTML = '';

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
          <div class="row-item"><span>Banten</span>
            <span class="${danger(d.BANTEN, d.target)}">${fmt(d.BANTEN)}</span>
          </div>
          <div class="row-item"><span>Tangerang</span>
            <span class="${danger(d.TANGERANG, d.target)}">${fmt(d.TANGERANG)}</span>
          </div>
        </div>
      </div>
    `;
  });
}

/* =====================================================
   INIT
===================================================== */
async function initTTRHSI(API_URL) {

  window.API_URL = API_URL;

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

      btn.classList.remove('btn-outline-light');
      btn.classList.add('btn-primary', 'active');

      currentType = btn.dataset.type;
      await loadTTRTable(API_URL, currentType);
    };
  });
}

/* =====================================================
   LOAD TABLE (IMPROVED LOADING UX – SAFE)
===================================================== */
async function loadTTRTable(API_URL, type) {

  const body = document.getElementById('ttr-table-body');

  /* === LOADING STATE (VISIBLE ON DARK UI) === */
  body.innerHTML = `
    <tr>
      <td colspan="30" class="text-center py-4">
        <div class="d-flex flex-column align-items-center gap-2">
          <span class="spinner-border text-light"></span>
          <span class="text-light fw-semibold">Loading data...</span>
        </div>
      </td>
    </tr>
  `;

  try {

    const res = await fetch(API_URL + '?type=' + type);
    const json = await res.json();

    /* === SAFETY CHECK === */
    if (!json || !Array.isArray(json.data)) {
      body.innerHTML = `
        <tr>
          <td colspan="30" class="text-center text-danger py-4">
            Gagal memuat data
          </td>
        </tr>
      `;
      return;
    }

    ttrHeaders = json.headers || [];
    ttrRawData = json.data || [];

    initTTRFilter();
    renderTTRTable();

  } catch (err) {

    console.error(err);
    body.innerHTML = `
      <tr>
        <td colspan="30" class="text-center text-danger py-4">
          Error saat mengambil data
        </td>
      </tr>
    `;
  }
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
    th.innerHTML = formatHeaderLabel(h);
    th.style.textAlign = 'center';
    head.appendChild(th);
  });

  body.innerHTML = '';

  ttrRawData
    .filter(r => (!fw || r.WITEL === fw) && (!fs || r.STO === fs))
    .forEach(r => {

      const tr = document.createElement('tr');

      ttrHeaders.forEach(h => {

        const td = document.createElement('td');
        let value;

        if (h.includes('%')) value = fmtPercent(r[h]);
        else if (h.toLowerCase().includes('tiket')) value = fmtInt(r[h]);
        else value = fmt(r[h]);

        const detailType = getTTRDetailType(currentType, h);

        if (detailType && Number(r[h]) > 0) {
          td.innerHTML = `
            <span class="text-primary fw-bold"
              style="cursor:pointer;text-decoration:underline"
              onclick="openTTRDetail('${detailType}','${r.STO}','${r.WITEL}')">
              ${value}
            </span>`;
        }
        else if (isAlertCell(currentType, h, r)) {
          td.innerHTML = `<span class="text-danger fw-bold">${value}</span>`;
        }
        else {
          td.textContent = value;
        }

        tr.appendChild(td);
      });

      body.appendChild(tr);
    });
}

/* =====================================================
   OPEN DETAIL MODAL TTR (IKUT POLA SQM - STABIL)
===================================================== */
async function openTTRDetail(type, sto, witel) {

  const modal = document.getElementById('global-modal');
  const title = modal.querySelector('.modal-title');
  const body  = modal.querySelector('.modal-body');

  const titleMap = {

  /* DATIN */
  tot_tiket_k2_detail:        'Detail Tot Tiket K2',
  tot_tiket_k3_detail:        'Detail Tot Tiket K3',
  tiket_not_ach_k2_detail:    'Detail Tiket Not Ach K2',
  tiket_not_ach_k3_detail:    'Detail Tiket Not Ach K3',

  /* INDIBIZ */
  tot_indibiz_4h_detail:      'Detail Tot Tiket INDIBIZ 4H',
  tiket_not_ach_indibiz_4h_detail: 'Detail Tiket Not Ach INDIBIZ 4H',

  tot_indibiz_24h_detail:     'Detail Tot Tiket INDIBIZ 24H',
  tiket_not_ach_indibiz_24h_detail: 'Detail Tiket Not Ach INDIBIZ 24H',

  /* RESELLER */
  tot_reseller_6h_detail:     'Detail Tot Tiket RESELLER 6H',
  tiket_not_ach_reseller_6h_detail: 'Detail Tiket Not Ach RESELLER 6H',

  tot_reseller_36h_detail:    'Detail Tot Tiket RESELLER 36H',
  tiket_not_ach_reseller_36h_detail: 'Detail Tiket Not Ach RESELLER 36H'
};



  title.textContent =
    `${titleMap[type] || 'Detail TTR'} – ${witel} / ${sto}`;

  body.innerHTML = `
    <div class="text-center py-5">
      <span class="spinner-border"></span>
    </div>
  `;

  new bootstrap.Modal(modal).show();

  /* === FETCH (SAMA PERSIS SEPERTI SQM) === */
  const res = await fetch(
    `${API_URL}?type=${type}&sto=${encodeURIComponent(sto)}&witel=${encodeURIComponent(witel)}`
  );

  const json = await res.json();

  if (!json.data || !json.data.length) {
    body.innerHTML = `
      <div class="text-center py-4 text-muted">
        Tidak ada data
      </div>`;
    return;
  }

  body.innerHTML = `
    <div class="table-responsive">
      <table class="table table-sm table-bordered table-dark align-middle">
        <thead class="table-secondary text-dark">
          <tr>
            ${json.headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${json.data.map(r => `
            <tr>
              ${json.headers.map(h => `<td>${r[h] ?? ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}


