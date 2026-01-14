/* =====================================================
   GLOBAL STATE
===================================================== */
let ttrRawData = [];
let ttrHeaders = [];
let currentType = 'ttr_hsi_table';

/* =====================================================
   JSONP FETCH (ANTI CORS – GAS SAFE)
===================================================== */
function fetchJSONP(url) {
  return new Promise((resolve, reject) => {
    const cb = 'cb_' + Math.random().toString(36).substring(2, 10);

    window[cb] = data => {
      resolve(data);
      delete window[cb];
      script.remove();
    };

    const script = document.createElement('script');
    script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + cb;
    script.onerror = () => reject('JSONP Error');

    document.body.appendChild(script);
  });
}

/* =====================================================
   FORMATTER
===================================================== */
function fmt(val, digit = 2) {
  if (val === null || val === undefined || val === '') return '-';
  if (isNaN(val)) return val;
  return Number(val).toFixed(digit).replace(/\.00$/, '');
}
function fmtPercent(val) { return fmt(val, 2); }
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
    if (header === 'Tiket Not Ach RESELLER 36H' && row[header] > 0) return true;
  }

  if (type === 'ttr_datin_table') {
    if (header === '% TTR Datin K2' && row[header] < 81) return true;
    if (header === 'Tiket Not Ach K2' && row[header] > 0) return true;

    if (header === '% TTR Datin K3' && row[header] < 95) return true;
    if (header === 'Tiket Not Ach K3' && row[header] > 0) return true;
  }

  return false;
}

/* =====================================================
   DETAIL TYPE MAPPER
===================================================== */
function getTTRDetailType(type, header) {

  if (type === 'ttr_datin_table') {
    if (header === 'Tot Tiket K2') return 'tot_tiket_k2_detail';
    if (header === 'Tiket Not Ach K2') return 'tiket_not_ach_k2_detail';
    if (header === 'Tot Tiket K3') return 'tot_tiket_k3_detail';
    if (header === 'Tiket Not Ach K3') return 'tiket_not_ach_k3_detail';
  }

  if (type === 'ttr_hsi_table') {
    if (header === 'Tot Tiket INDIBIZ 4H') return 'tot_indibiz_4h_detail';
    if (header === 'Tiket Not Ach INDIBIZ 4H') return 'tiket_not_ach_indibiz_4h_detail';
    if (header === 'Tot Tiket INDIBIZ 24H') return 'tot_indibiz_24h_detail';
    if (header === 'Tiket Not Ach INDIBIZ 24H') return 'tiket_not_ach_indibiz_24h_detail';

    if (header === 'Tot Tiket RESELLER 6H') return 'tot_reseller_6h_detail';
    if (header === 'Tiket Not Ach RESELLER 6H') return 'tiket_not_ach_reseller_6h_detail';
    if (header === 'Tot Tiket RESELLER 36H') return 'tot_reseller_36h_detail';
    if (header === 'Tiket Not Ach RESELLER 36H') return 'tiket_not_ach_reseller_36h_detail';
  }

  return null;
}

/* =====================================================
   HEADER FORMATTER
===================================================== */
function formatHeaderLabel(h) {
  if (h === 'STO' || h === 'WITEL') return h;
  let label = h;
  label = label.replace('% ', '%<br>');
  label = label.replace(/TTR/g, '<strong>TTR</strong>');
  label = label.replace(/Tiket Not Ach/i,'<small>Tiket</small><br><strong>Not Ach</strong>');
  label = label.replace(/(\d+H)/g, '<br><small>$1</small>');
  return label;
}

/* =====================================================
   KPI SUMMARY
===================================================== */
async function renderSummaryCards(API_URL) {

  const row = document.getElementById('ttr-row');
  row.innerHTML = '';

  const kpiJson = await fetchJSONP(API_URL + '?type=kpi');
  const ttrMap = {};

  kpiJson.data
    .filter(d => d.indikator.toUpperCase().includes('TTR'))
    .forEach(d => {
      const key = d.indikator.toUpperCase();
      if (!ttrMap[key]) {
        ttrMap[key] = { indikator: d.indikator, target: d.target, BANTEN: 0, TANGERANG: 0 };
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
          <div class="row-item"><span>Banten</span><span class="${danger(d.BANTEN,d.target)}">${fmt(d.BANTEN)}</span></div>
          <div class="row-item"><span>Tangerang</span><span class="${danger(d.TANGERANG,d.target)}">${fmt(d.TANGERANG)}</span></div>
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
  document.getElementById('ttr-loading-overlay').classList.remove('d-none');

  await renderSummaryCards(API_URL);
  await loadTTRTable(API_URL, currentType);

  document.getElementById('ttr-loading-overlay').classList.add('d-none');

  document.querySelectorAll('#ttr-tabs button').forEach(btn => {
    btn.onclick = async () => {
      document.querySelectorAll('#ttr-tabs button').forEach(b => {
        b.classList.remove('btn-primary','active');
        b.classList.add('btn-outline-light');
      });
      btn.classList.add('btn-primary','active');
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
  body.innerHTML = `<tr><td colspan="30" class="text-center py-4">
    <span class="spinner-border text-light"></span></td></tr>`;

  const json = await fetchJSONP(API_URL + '?type=' + type);

  ttrHeaders = json.headers || [];
  ttrRawData = json.data || [];

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
  [...new Set(ttrRawData.map(d => d.WITEL))].forEach(v => witel.innerHTML += `<option>${v}</option>`);

  sto.innerHTML = `<option value="">All STO</option>`;
  [...new Set(ttrRawData.map(d => d.STO))].forEach(v => sto.innerHTML += `<option>${v}</option>`);

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
        let value = h.includes('%') ? fmtPercent(r[h]) :
                    h.toLowerCase().includes('tiket') ? fmtInt(r[h]) :
                    fmt(r[h]);

        const detailType = getTTRDetailType(currentType, h);

        if (detailType && Number(r[h]) > 0) {
          td.innerHTML = `<span class="text-primary fw-bold"
            style="cursor:pointer;text-decoration:underline"
            onclick="openTTRDetail('${detailType}','${r.STO}','${r.WITEL}')">${value}</span>`;
        }
        else if (isAlertCell(currentType, h, r)) {
          td.innerHTML = `<span class="text-danger fw-bold">${value}</span>`;
        }
        else td.textContent = value;

        tr.appendChild(td);
      });

      body.appendChild(tr);
    });
}

/* =====================================================
   DETAIL MODAL
===================================================== */
async function openTTRDetail(type, sto, witel) {

  const modal = document.getElementById('global-modal');
  modal.querySelector('.modal-title').textContent = `${witel} / ${sto}`;
  modal.querySelector('.modal-body').innerHTML = `<div class="text-center py-4">
    <span class="spinner-border"></span></div>`;

  new bootstrap.Modal(modal).show();

  const json = await fetchJSONP(
    `${API_URL}?type=${type}&sto=${encodeURIComponent(sto)}&witel=${encodeURIComponent(witel)}`
  );

  if (!json.data || !json.data.length) {
    modal.querySelector('.modal-body').innerHTML = `<div class="text-center text-muted py-4">Tidak ada data</div>`;
    return;
  }

  modal.querySelector('.modal-body').innerHTML = `
    <div class="table-responsive">
      <table class="table table-sm table-bordered table-dark">
        <thead><tr>${json.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${json.data.map(r=>`<tr>${json.headers.map(h=>`<td>${r[h]??''}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>`;
}
