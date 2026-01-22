/* =====================================================
   MONITORING B2B HI
===================================================== */

/* ===== UI POLISH (JS INJECT STYLE) ===== */
(function injectB2BStyle(){
  if (document.getElementById('b2b-ui-polish')) return;

  const style = document.createElement('style');
  style.id = 'b2b-ui-polish';
  style.textContent = `
    td.clickable{
      cursor:pointer;
      transition:background .15s ease,color .15s ease,transform .08s ease;
    }
    td.clickable:hover{ background:rgba(255,255,255,.06); }
    td.clickable:active{
      transform:scale(.97);
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);
    }

    #monitoring-b2b-body tr:hover td{
      background:rgba(255,255,255,.045);
    }

    #monitoring-b2b-body td{
      font-variant-numeric:tabular-nums;
    }
    #monitoring-b2b-body td.zero{
      color:rgba(255,255,255,.35);
      font-weight:500;
    }

    .modal table tbody tr:hover td{
      background:rgba(255,255,255,.05);
    }

    #monitoring-b2b-update{
      opacity:.85;
      transition:opacity .15s ease;
    }
    #monitoring-b2b-update:hover{ opacity:1; }

    #monitoring-b2b-body tr.total-row td{
      background:#0f172a !important;
      font-weight:800;
      border-top:2px solid #38bdf8;
    }
  `;
  document.head.appendChild(style);
})();

function initMonitoringB2B(API_URL) {

  window.API_URL = API_URL;

  const tbody      = document.getElementById('monitoring-b2b-body');
  const lastUpdate = document.getElementById('monitoring-b2b-update');

  window.filterWitel = document.getElementById('filterWitel');
  window.filterSto   = document.getElementById('filterSto');
  window.filterHsa   = document.getElementById('filterHsa');

  window.B2B_ACTIVE_FILTER = { sto:'', witel:'', hsa:'' };

  tbody.innerHTML = `
    <tr>
      <td colspan="23" class="text-center text-muted">Memuat data...</td>
    </tr>`;

  fetch(API_URL + '?type=monitoring_b2b')
    .then(res => res.json())
    .then(resData => {

      const data = resData.data || [];
      tbody.innerHTML = '';

      const setWitel = new Set();
      const setSto   = new Set();
      const setHsa   = new Set();

      data.forEach(row => {
        if (!Array.isArray(row)) return;

        const tr = document.createElement('tr');
        tr.dataset.sto   = row[0] || '';
        tr.dataset.witel = row[1] || '';
        tr.dataset.hsa   = row[2] || '';

        setSto.add(row[0]);
        setWitel.add(row[1]);
        setHsa.add(row[2]);

        tr.innerHTML = `
          <td>${row[0] || '-'}</td>
          <td>${row[1] || '-'}</td>
          <td>${row[2] || '-'}</td>
          <td>${row[3] || '-'}</td>
          <td>${row[4] || '0%'}</td>

          <td class="hi-hsi clickable">${row[5] || 0}</td>
          <td class="hi-datin clickable">${row[6] || 0}</td>

          <td class="hi-closed-hsi clickable">${row[7] || 0}</td>
          <td class="hi-closed-datin clickable">${row[8] || 0}</td>

          <td class="hi-open-hsi clickable">${row[9] || 0}</td>
          <td class="hi-open-datin clickable">${row[10] || 0}</td>

          <td class="ttr-4-ok clickable">${row[11] || 0}</td>
          <td class="ttr-4-nok clickable">${row[12] || 0}</td>
          <td class="ttr-24-ok clickable">${row[13] || 0}</td>
          <td class="ttr-24-nok clickable">${row[14] || 0}</td>

          <td class="ttr-6-ok clickable">${row[15] || 0}</td>
          <td class="ttr-6-nok clickable">${row[16] || 0}</td>
          <td class="ttr-36-ok clickable">${row[17] || 0}</td>
          <td class="ttr-36-nok clickable">${row[18] || 0}</td>

          <td class="gaul-hsi clickable">${row[19] || 0}</td>
          <td class="gaul-datin clickable">${row[20] || 0}</td>

          <td class="clickable">${row[21] || 0}</td>
          <td class="clickable">${row[22] || 0}</td>
        `;

        tbody.appendChild(tr);

        tr.querySelectorAll('td').forEach(td=>{
          if (td.textContent.trim() === '0') td.classList.add('zero');
        });

        tr.querySelector('.hi-hsi')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI'));
        tr.querySelector('.hi-datin')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'DATIN'));
        tr.querySelector('.hi-closed-hsi')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','Y'));
        tr.querySelector('.hi-closed-datin')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'DATIN','Y'));
        tr.querySelector('.hi-open-hsi')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','N'));
        tr.querySelector('.hi-open-datin')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'DATIN','N'));

        tr.querySelector('.ttr-4-ok')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','4JAM','Y'));
        tr.querySelector('.ttr-4-nok')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','4JAM','N'));
        tr.querySelector('.ttr-24-ok')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','24JAM','Y'));
        tr.querySelector('.ttr-24-nok')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','24JAM','N'));

        /* === FIX: 6JAM & 36JAM = DATIN === */
        tr.querySelector('.ttr-6-ok')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'DATIN','','6JAM','Y'));
        tr.querySelector('.ttr-6-nok')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'DATIN','','6JAM','N'));
        tr.querySelector('.ttr-36-ok')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'DATIN','','36JAM','Y'));
        tr.querySelector('.ttr-36-nok')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'DATIN','','36JAM','N'));

        tr.querySelector('.gaul-hsi')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','','','Y'));
        tr.querySelector('.gaul-datin')?.addEventListener('click',()=>openDetailHI(API_URL,tr,'DATIN','','','','Y'));

        tr.querySelectorAll('td')[21]?.addEventListener('click',()=>openDetailSQMHI(API_URL,tr));
        tr.querySelectorAll('td')[22]?.addEventListener('click',()=>openDetailAlertHI(API_URL,tr));
      });

      buildDropdown(filterWitel,setWitel,'All Witel');
      buildDropdown(filterSto,setSto,'All STO');
      buildDropdown(filterHsa,setHsa,'All HSA');

      [filterWitel,filterSto,filterHsa]
        .forEach(el=>el?.addEventListener('change',applyB2BDropdownFilter));

      if (resData.lastUpdate) {
        lastUpdate.textContent =
          new Date(resData.lastUpdate).toLocaleString('id-ID');
      }

      highlightBadCellsB2B();
      renderB2BTotalRow();
    });
}

/* =====================================================
   TOTAL ROW
===================================================== */
function renderB2BTotalRow(){
  const tbody = document.getElementById('monitoring-b2b-body');
  tbody.querySelector('.total-row')?.remove();

  const total = Array(23).fill(0);

  tbody.querySelectorAll('tr').forEach(tr=>{
    if (tr.style.display === 'none') return;
    if (tr.classList.contains('total-row')) return;

    const tds = tr.querySelectorAll('td');
    for(let i=5;i<=22;i++){
      total[i] += Number(
        tds[i]?.innerText.replace(/[^\d]/g,'')
      ) || 0;
    }
  });

  const tr = document.createElement('tr');
  tr.className = 'total-row';

  tr.innerHTML = `
    <td colspan="4" class="text-center">TOTAL</td>
    <td></td>
    ${total.slice(5).map((v,i)=>`
      <td class="clickable total-cell" data-index="${i+5}">
        ${v}
      </td>
    `).join('')}
  `;

  tbody.appendChild(tr);

  tr.querySelectorAll('td').forEach(td=>{
    if(td.textContent.trim()==='0') td.classList.add('zero');
  });

  tr.querySelectorAll('.total-cell').forEach(td=>{
    td.addEventListener('click',()=>{
      openTotalDetail(td.dataset.index);
    });
  });
}

/* =====================================================
   FILTER
===================================================== */
function applyB2BDropdownFilter(){

  const sto   = filterSto.value || '';
  const witel = filterWitel.value || '';
  const hsa   = filterHsa.value || '';

  B2B_ACTIVE_FILTER = { sto, witel, hsa };

  document.querySelectorAll('#monitoring-b2b-body tr')
    .forEach(tr=>{
      if(tr.classList.contains('total-row')) return;

      const show =
        (!sto   || tr.dataset.sto   === sto) &&
        (!witel || tr.dataset.witel === witel) &&
        (!hsa   || tr.dataset.hsa   === hsa);

      tr.style.display = show ? '' : 'none';
    });

  renderB2BTotalRow();
}

/* =====================================================
   LOADING SPINNER
===================================================== */

function renderModalSpinner(text = 'Memuat data...') {
  return `
    <div class="d-flex flex-column justify-content-center align-items-center"
         style="min-height:260px;">
      <div class="spinner-border text-info mb-3"
           style="width:3.5rem;height:3.5rem;"></div>
      <div class="text-muted fw-semibold">${text}</div>
    </div>`;
}


/* =====================================================
   MODAL DETAIL HI
===================================================== */
function openDetailHI(
  API_URL, tr, mode,
  statusClosed = '', ttrType = '', ttrResult = '', gaul = ''
) {

  const modal = new bootstrap.Modal(
    document.getElementById('global-modal')
  );

  const modalBody  = document.querySelector('#global-modal .modal-body');
  const modalTitle = document.querySelector('#global-modal .modal-title');

  modalTitle.textContent =
    `Detail Tiket HI ${mode} – ${tr.dataset.sto}${gaul === 'Y' ? ' (GAUL)' : ''}`;

  modalBody.innerHTML = renderModalSpinner();
  modal.show();

  fetch(
    API_URL +
    `?type=detail_hi` +
    `&mode=${mode}` +
    `&status_closed=${statusClosed}` +
    `&ttr_type=${ttrType}` +
    `&ttr_result=${ttrResult}` +
    `&gaul=${gaul}` +
    `&sto=${tr.dataset.sto}` +
    `&witel=${tr.dataset.witel}` +
    `&hsa=${tr.dataset.hsa}`
  )
    .then(res => res.json())
    .then(resData => {

      const rows = resData.data || [];
      if (!rows.length) {
        modalBody.innerHTML =
          `<div class="text-center text-muted py-4">Tidak ada data</div>`;
        return;
      }

      let html = `
        <div class="table-responsive">
        <table class="table table-dark table-striped table-sm align-middle">
        <thead>
          <tr>
            <th>INCIDENT</th>
            <th>SUMMARY</th>
            <th>REPORTED DATE</th>
            <th>SERVICE TYPE</th>
            <th>WITEL</th>
            <th>WORKZONE</th>
            <th>STATUS</th>
            <th>CONVERT WAKTU</th>
            <th>KATEGORI</th>
            <th>GAUL HSI</th>
            <th>IN LAMA HSI</th>
          </tr>
        </thead><tbody>`;

      rows.forEach(r => {
        html += `
          <tr>
            <td>${r.INCIDENT}</td>
            <td>${r.SUMMARY}</td>
            <td>${r['REPORTED DATE']}</td>
            <td>${r['SERVICE TYPE']}</td>
            <td>${r.WITEL}</td>
            <td>${r.WORKZONE}</td>
            <td>${r.STATUS}</td>
            <td>${r['convert waktu']}</td>
            <td>${r.KATAGORI}</td>
            <td>${r['GAUL HSI']}</td>
            <td>${r['IN LAMA HSI']}</td>
          </tr>`;
      });

      modalBody.innerHTML = html + '</tbody></table></div>';
    });
}

/* =====================================================
   DETAIL SQM & ALERT
===================================================== */
function openDetailSQMHI(API_URL, tr) {
  openGenericDetail(API_URL, tr, 'sqm_jadi_tiket_hi_detail',
    `Detail SQM Jadi Tiket HI – ${tr.dataset.sto}`);
}

function openDetailAlertHI(API_URL, tr) {
  openGenericDetail(API_URL, tr, 'alert_jadi_tiket_hi_detail',
    `Detail Alert Jadi Tiket HI – ${tr.dataset.sto}`);
}

function openGenericDetail(API_URL, tr, type, title) {

  const modal = new bootstrap.Modal(
    document.getElementById('global-modal')
  );

  const modalBody  = document.querySelector('#global-modal .modal-body');
  const modalTitle = document.querySelector('#global-modal .modal-title');

  modalTitle.textContent = title;
  modalBody.innerHTML = renderModalSpinner();
  modal.show();

  fetch(API_URL + `?type=${type}&sto=${tr.dataset.sto}`)
    .then(res => res.json())
    .then(resData => {

      const rows = resData.data || [];
      const headers = resData.headers || [];

      if (!rows.length) {
        modalBody.innerHTML =
          `<div class="text-center text-muted py-4">Tidak ada data</div>`;
        return;
      }

      let html = `
        <div class="table-responsive">
        <table class="table table-dark table-striped table-sm">
        <thead><tr>`;

      headers.forEach(h => html += `<th>${h}</th>`);
      html += '</tr></thead><tbody>';

      rows.forEach(r => {
        html += '<tr>';
        headers.forEach(h => html += `<td>${r[h] ?? '-'}</td>`);
        html += '</tr>';
      });

      modalBody.innerHTML = html + '</tbody></table></div>';
    });
}

/* =====================================================
   DETAIL TOTAL (ALL STO / FILTERED)
===================================================== */
function openTotalDetail(colIndex){

  const f = window.B2B_ACTIVE_FILTER || {};

const params = {
  type: 'total_hi_all_detail'
};

if (f.sto)   params.sto   = f.sto;
if (f.witel) params.witel = f.witel;
if (f.hsa) params.hsa     = f.hsa;


  const modal = new bootstrap.Modal(
    document.getElementById('global-modal')
  );

  const modalBody  = document.querySelector('#global-modal .modal-body');
  const modalTitle = document.querySelector('#global-modal .modal-title');

  modalTitle.textContent = 'Detail TOTAL Tiket HI';
  modalBody.innerHTML = renderModalSpinner();
  modal.show();

  const map = {
    5:{mode:'HSI'},6:{mode:'DATIN'},
    7:{mode:'HSI',status_closed:'Y'},8:{mode:'DATIN',status_closed:'Y'},
    9:{mode:'HSI',status_closed:'N'},10:{mode:'DATIN',status_closed:'N'},
    11:{mode:'HSI',ttr_type:'4JAM',ttr_result:'Y'},
    12:{mode:'HSI',ttr_type:'4JAM',ttr_result:'N'},
    13:{mode:'HSI',ttr_type:'24JAM',ttr_result:'Y'},
    14:{mode:'HSI',ttr_type:'24JAM',ttr_result:'N'},
    15:{mode:'DATIN',ttr_type:'6JAM',ttr_result:'Y'},
    16:{mode:'DATIN',ttr_type:'6JAM',ttr_result:'N'},
    17:{mode:'DATIN',ttr_type:'36JAM',ttr_result:'Y'},
    18:{mode:'DATIN',ttr_type:'36JAM',ttr_result:'N'},
    19:{mode:'HSI',gaul:'Y'},
    20:{mode:'DATIN',gaul:'Y'}
  };

  const qs = new URLSearchParams({
  ...params,
  ...(map[colIndex] || {})
}).toString();

  fetch(API_URL + '?' + qs)
    .then(res=>res.json())
    .then(resData=>{
      const rows = resData.data || [];
      if(!rows.length){
        modalBody.innerHTML =
          `<div class="text-center text-muted py-4">Tidak ada data</div>`;
        return;
      }

      let html = `
        <div class="table-responsive">
        <table class="table table-dark table-striped table-sm">
        <thead><tr>
          <th>INCIDENT</th><th>SUMMARY</th><th>REPORTED DATE</th>
          <th>SERVICE TYPE</th><th>WITEL</th><th>WORKZONE</th>
          <th>STATUS</th><th>KATEGORI</th><th>FLAG</th><th>GAUL</th>
        </tr></thead><tbody>`;

      rows.forEach(r=>{
        html+=`
          <tr>
            <td>${r.INCIDENT}</td>
            <td>${r.SUMMARY}</td>
            <td>${r['REPORTED DATE']}</td>
            <td>${r['SERVICE TYPE']}</td>
            <td>${r.WITEL}</td>
            <td>${r.WORKZONE}</td>
            <td>${r.STATUS}</td>
            <td>${r.KATAGORI}</td>
            <td>${r['FLAG HSI']}</td>
            <td>${r['FLAG HSI']==='Y'?r['GAUL HSI']:r['GAUL DATIN']}</td>
          </tr>`;
      });

      modalBody.innerHTML = html + '</tbody></table></div>';
    });
}


/* =====================================================
  HIGHLIGHT
===================================================== */
function buildDropdown(el, setData, label) {
  if (!el) return;
  el.innerHTML = `<option value="">${label}</option>`;
  [...setData].filter(v => v).sort()
    .forEach(v => el.innerHTML += `<option>${v}</option>`);
}

function highlightBadCellsB2B() {
  document.querySelectorAll('#monitoring-b2b-body tr')
    .forEach(tr => {
      const tds = tr.querySelectorAll('td');
      const qhsiCell = tds[4];
      if (!qhsiCell) return;

      const v = parseFloat(
        qhsiCell.innerText.replace('%','').replace(',','.')
      );
      if (!isNaN(v) && v > 2.3) {
        qhsiCell.style.color = '#ff4d4f';
        qhsiCell.style.fontWeight = '800';
      }
    });
}
