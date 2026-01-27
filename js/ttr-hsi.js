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
   COLOR RULE
===================================================== */
function danger(val, target) {
  if (val === null || val === undefined) return '';
  return Number(val) < Number(target) ? 'text-danger fw-bold' : '';
}

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
   HEADER FORMAT
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

function getGroupClass(header) {
  if (/INDIBIZ 4H/i.test(header)) return 'grp-indibiz-4h';
  if (/INDIBIZ 24H/i.test(header)) return 'grp-indibiz-24h';
  if (/RESELLER 6H/i.test(header)) return 'grp-reseller-6h';
  if (/RESELLER 36H/i.test(header)) return 'grp-reseller-36h';
  if (/DATIN K2/i.test(header)) return 'grp-datin-k2';
  if (/DATIN K3/i.test(header)) return 'grp-datin-k3';
  return '';
}

function getGroupTitle(grp) {
  if (grp.includes('indibiz-4h')) return 'TTR INDIBIZ 4H';
  if (grp.includes('indibiz-24h')) return 'TTR INDIBIZ 24H';
  if (grp.includes('reseller-6h')) return 'TTR RESELLER 6H';
  if (grp.includes('reseller-36h')) return 'TTR RESELLER 36H';
  if (grp.includes('datin-k2')) return 'TTR DATIN K2';
  if (grp.includes('datin-k3')) return 'TTR DATIN K3';
  return '';
}

/* =====================================================
   DETAIL ENDPOINT MAPPER (FIXED & COMPLETE)
===================================================== */
function getDetailEndpoint(type, header) {

  /* ================= DATIN ================= */
  if (type === 'ttr_datin_table') {
    if (header === 'Tot Tiket K2') return 'ttr_datin_k2_detail';
    if (header === 'Tiket Not Ach K2') return 'ttr_datin_k2_notach_detail';
    if (header === 'Tot Tiket K3') return 'ttr_datin_k3_detail';
    if (header === 'Tiket Not Ach K3') return 'ttr_datin_k3_notach_detail';
  }

  /* ================= HSI ================= */
  if (type === 'ttr_hsi_table') {

    // INDIBIZ
    if (header === 'Tot Tiket INDIBIZ 4H') return 'ttr_indibiz_detail';
    if (header === 'Tot Tiket INDIBIZ 24H') return 'ttr_indibiz_detail';
    if (header === 'Tiket Not Ach INDIBIZ 4H') return 'ttr_indibiz_4h_notach_detail';
    if (header === 'Tiket Not Ach INDIBIZ 24H') return 'ttr_indibiz_24h_notach_detail';

    // RESELLER
    if (header === 'Tot Tiket RESELLER 6H') return 'ttr_reseller_detail';
    if (header === 'Tot Tiket RESELLER 36H') return 'ttr_reseller_detail';
    if (header === 'Tiket Not Ach RESELLER 6H') return 'ttr_reseller_6h_notach_detail';
    if (header === 'Tiket Not Ach RESELLER 36H') return 'ttr_reseller_36h_notach_detail';
  }

  return null;
}

/* =====================================================
   KPI SUMMARY CARD
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
  const sto   = document.getElementById('ttr-filter-sto');
  const pic   = document.getElementById('ttr-filter-pic');

  const fw = witel.value;
  const fs = sto.value;

  witel.innerHTML = `<option value="">All Witel</option>`;
  [...new Set(ttrRawData.map(d => d.WITEL).filter(Boolean))]
    .forEach(v => witel.innerHTML += `<option ${v===fw?'selected':''}>${v}</option>`);

  sto.innerHTML = `<option value="">All STO</option>`;
  ttrRawData
    .filter(d => !fw || d.WITEL === fw)
    .map(d => d.STO)
    .filter(Boolean)
    .filter((v,i,a)=>a.indexOf(v)===i)
    .forEach(v => sto.innerHTML += `<option ${v===fs?'selected':''}>${v}</option>`);

  pic.innerHTML = `<option value="">All PIC</option>`;
  ttrRawData
    .filter(d => (!fw || d.WITEL === fw) && (!fs || d.STO === fs))
    .map(d => d.PIC)
    .filter(Boolean)
    .filter((v,i,a)=>a.indexOf(v)===i)
    .forEach(v => pic.innerHTML += `<option>${v}</option>`);

  witel.onchange = () => { sto.value=''; pic.value=''; initTTRFilter(); renderTTRTable(); };
  sto.onchange   = () => { pic.value=''; initTTRFilter(); renderTTRTable(); };
  pic.onchange   = renderTTRTable;
}

function buildGroupBoundaries(headers) {
  const map = {};
  headers.forEach((h, i) => {
    const grp = getGroupClass(h);
    if (!grp) return;

    if (!map[grp]) {
      map[grp] = { start: i, end: i };
    } else {
      map[grp].end = i;
    }
  });
  return map;
}

function renderTTRTable() {
  const thead = document.getElementById('ttr-thead');
  const body = document.getElementById('ttr-table-body');
  const fw = document.getElementById('ttr-filter-witel').value;
  const fs = document.getElementById('ttr-filter-sto').value;
  const fp = document.getElementById('ttr-filter-pic').value;

  thead.innerHTML = '';
  body.innerHTML = '';

  // buat group map & boundaries
  const groupMap = {};
  ttrHeaders.forEach(h => groupMap[h] = getGroupClass(h));

  const groupBounds = {};
  ttrHeaders.forEach((h,i)=>{
    const grp = groupMap[h]; 
    if(!grp) return;
    if(!groupBounds[grp]) groupBounds[grp] = {start:i,end:i};
    else groupBounds[grp].end = i;
  });

  // HEADER_MAP sesuai currentType
  let HEADER_MAP = [];

  if (currentType === 'ttr_datin_table') {
    HEADER_MAP = [
      { label: 'STO',   cols: ['STO'] },
      { label: 'WITEL', cols: ['WITEL'] },
      {
        label: 'TTR DATIN K2',
        grp: 'grp-datin-k2',
        cols: [
          '% TTR Datin K2',
          'Tot Tiket K2',
          'Tiket Not Ach K2',
          'Tiket K2 HI'
        ]
      },
      {
        label: 'TTR DATIN K3',
        grp: 'grp-datin-k3',
        cols: [
          '% TTR Datin K3',
          'Tot Tiket K3',
          'Tiket Not Ach K3',
          'Tiket K3 HI'
        ]
      },
      { label: 'PIC', cols: ['PIC'] }
    ];
  } else {
    HEADER_MAP = [
      { label: 'STO',   cols: ['STO'] },
      { label: 'WITEL', cols: ['WITEL'] },
      {
        label: 'TTR INDIBIZ 4H',
        grp: 'grp-indibiz-4h',
        cols: [
          '% TTR INDIBIZ 4H',
          'Tot Tiket INDIBIZ 4H',
          'Tiket Not Ach INDIBIZ 4H',
          'Tiket INDIBIZ 4H HI'
        ]
      },
      {
        label: 'TTR INDIBIZ 24H',
        grp: 'grp-indibiz-24h',
        cols: [
          '% TTR INDIBIZ 24H',
          'Tot Tiket INDIBIZ 24H',
          'Tiket Not Ach INDIBIZ 24H',
          'Tiket INDIBIZ 24H HI'
        ]
      },
      {
        label: 'TTR RESELLER 6H',
        grp: 'grp-reseller-6h',
        cols: [
          '% TTR RESELLER 6H',
          'Tot Tiket RESELLER 6H',
          'Tiket Not Ach RESELLER 6H',
          'Tiket RESELLER 6H HI'
        ]
      },
      {
        label: 'TTR RESELLER 36H',
        grp: 'grp-reseller-36h',
        cols: [
          '% TTR RESELLER 36H',
          'Tot Tiket RESELLER 36H',
          'Tiket Not Ach RESELLER 36H',
          'Tiket RESELLER 36H HI'
        ]
      },
      { label: 'PIC', cols: ['PIC'] }
    ];
  }

  // CREATE HEADER ROWS
  const trGroup = document.createElement('tr'); trGroup.className='ttr-group-row';
  const trSub   = document.createElement('tr'); trSub.className='ttr-sub-row';

  HEADER_MAP.forEach(block => {
    if(block.cols.length === 1){
      const th = document.createElement('th');
      th.textContent = block.label;
      th.rowSpan = 2;
      th.className = block.label==='STO'?'col-sto grp-start':block.label==='WITEL'?'col-witel grp-end':'grp-start grp-end';
      trGroup.appendChild(th);
      return;
    }

    const thGroup = document.createElement('th');
    thGroup.colSpan = block.cols.length;
    thGroup.textContent = block.label;
    const grpClass = block.grp || '';
    thGroup.className = grpClass ? `${grpClass} grp-start grp-end` : '';
    trGroup.appendChild(thGroup);

    block.cols.forEach((h, idx) => {
      const thSub = document.createElement('th');
      thSub.innerHTML = formatHeaderLabel(h);
      if(grpClass) thSub.classList.add(grpClass);
      if(idx===0) thSub.classList.add('grp-start');
      if(idx===block.cols.length-1) thSub.classList.add('grp-end');
      trSub.appendChild(thSub);
    });
  });

  thead.appendChild(trGroup);
  thead.appendChild(trSub);

  // BODY
  ttrRawData
    .filter(r => (!fw || r.WITEL===fw) && (!fs || r.STO===fs) && (!fp || r.PIC===fp))
    .forEach(r => {
      const tr = document.createElement('tr');
      ttrHeaders.forEach((h, idx) => {
        const td = document.createElement('td');

        if(h.includes('%')) td.classList.add('col-percent');
        if(h.toLowerCase().includes('tiket')) td.classList.add('col-ticket');

        const grp = groupMap[h];
        if(grp){
          td.classList.add(grp);
          if(groupBounds[grp]?.start === idx) td.classList.add('grp-start');
          if(groupBounds[grp]?.end === idx) td.classList.add('grp-end');
        }
        if(h==='STO') td.classList.add('col-sto');
        if(h==='WITEL') td.classList.add('col-witel');

        const value = h.includes('%') ? fmtPercent(r[h]) : h.toLowerCase().includes('tiket') ? fmtInt(r[h]) : fmt(r[h]);
        const endpoint = getDetailEndpoint(currentType, h);

        if(endpoint && Number(r[h])>0){
          td.innerHTML = `<span class="text-primary fw-bold" onclick="openTTRDetail('${endpoint}','${r.STO}','${h}')" style="cursor:pointer">${value}</span>`;
        } else if(isAlertCell(currentType, h, r)){
          td.innerHTML = `<span class="text-danger fw-bold">${value}</span>`;
        } else td.textContent = value;

        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
}

/* =====================================================
   OPEN DETAIL TTR MODAL (GLOBAL MODAL)
===================================================== */
async function openTTRDetail(endpoint, sto, header) {

  const modal = document.getElementById('global-modal');
  const title = modal.querySelector('.modal-title');
  const body  = modal.querySelector('.modal-body');

  title.textContent = `${header} – STO ${sto}`;
  body.innerHTML = `<div class="text-center py-5">
    <span class="spinner-border"></span>
  </div>`;

  new bootstrap.Modal(modal).show();

  const res  = await fetch(`${API_URL}?type=${endpoint}&sto=${encodeURIComponent(sto)}`);
  const json = await res.json();

  if (!json.data || !json.data.length) {
    body.innerHTML = `<div class="text-center py-4 text-muted">Tidak ada data</div>`;
    return;
  }

  body.innerHTML = `
    <div class="table-responsive">
      <table class="table table-sm table-bordered table-dark align-middle">
        <thead>
          <tr>${json.headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${json.data.map(r => `
            <tr>${json.headers.map(h => `<td>${r[h] ?? ''}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
