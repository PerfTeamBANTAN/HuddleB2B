/* =====================================================
   MONITORING B2B HI
===================================================== */

window.B2B_ACTIVE_FILTER = { sto:'', witel:'', hsa:'' };

/* ===== UI POLISH (JS INJECT STYLE) ===== */
(function injectB2BStyle(){
  if (document.getElementById('b2b-ui-polish')) return;

  const style = document.createElement('style');
  style.id = 'b2b-ui-polish';
  style.textContent = `
    td.clickable{ cursor:pointer; transition:.15s; }
    td.clickable:hover{ background:rgba(255,255,255,.06); }
    td.zero{ color:rgba(255,255,255,.35); }
    #monitoring-b2b-body tr.total-row td{
      background:#0f172a !important;
      font-weight:800;
      border-top:2px solid #38bdf8;
    }
  `;
  document.head.appendChild(style);
})();

function initMonitoringB2B(API_URL){

  window.API_URL = API_URL;

  const tbody      = document.getElementById('monitoring-b2b-body');
  const lastUpdate = document.getElementById('monitoring-b2b-update');

  window.filterWitel = document.getElementById('filterWitel');
  window.filterSto   = document.getElementById('filterSto');
  window.filterHsa   = document.getElementById('filterHsa');

  tbody.innerHTML = `<tr><td colspan="23" class="text-center">Memuat data...</td></tr>`;

  fetch(API_URL + '?type=monitoring_b2b')
    .then(r=>r.json())
    .then(res=>{

      const data = res.data || [];
      tbody.innerHTML = '';

      const setSto=new Set(), setWitel=new Set(), setHsa=new Set();

      data.forEach(row=>{
        if(!Array.isArray(row)) return;

        const tr=document.createElement('tr');
        tr.dataset.sto=row[0]||'';
        tr.dataset.witel=row[1]||'';
        tr.dataset.hsa=row[2]||'';

        setSto.add(row[0]); setWitel.add(row[1]); setHsa.add(row[2]);

        tr.innerHTML=`
          <td>${row[0]||'-'}</td>
          <td>${row[1]||'-'}</td>
          <td>${row[2]||'-'}</td>
          <td>${row[3]||'-'}</td>
          <td>${row[4]||'0%'}</td>
          ${row.slice(5,23).map(v=>`<td class="clickable">${v||0}</td>`).join('')}
        `;

        tbody.appendChild(tr);

        tr.querySelectorAll('td').forEach(td=>{
          if(td.textContent.trim()==='0') td.classList.add('zero');
        });

        tr.children[5]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI'));
        tr.children[6]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'DATIN'));
        tr.children[7]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','Y'));
        tr.children[8]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'DATIN','Y'));
        tr.children[9]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','N'));
        tr.children[10]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'DATIN','N'));

        tr.children[11]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','4JAM','Y'));
        tr.children[12]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','4JAM','N'));
        tr.children[13]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','24JAM','Y'));
        tr.children[14]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','24JAM','N'));
        tr.children[15]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','6JAM','Y'));
        tr.children[16]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','6JAM','N'));
        tr.children[17]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','36JAM','Y'));
        tr.children[18]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','36JAM','N'));

        tr.children[19]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'HSI','','','','Y'));
        tr.children[20]?.addEventListener('click',()=>openDetailHI(API_URL,tr,'DATIN','','','','Y'));

        tr.children[21]?.addEventListener('click',()=>openDetailSQMHI(API_URL,tr));
        tr.children[22]?.addEventListener('click',()=>openDetailAlertHI(API_URL,tr));
      });

      buildDropdown(filterWitel,setWitel,'All Witel');
      buildDropdown(filterSto,setSto,'All STO');
      buildDropdown(filterHsa,setHsa,'All HSA');

      [filterWitel,filterSto,filterHsa]
        .forEach(el=>el.addEventListener('change',applyB2BDropdownFilter));

      if(res.lastUpdate){
        lastUpdate.textContent=new Date(res.lastUpdate).toLocaleString('id-ID');
      }

      highlightBadCellsB2B();
      renderB2BTotalRow();
    });
}

/* ================= TOTAL ================= */

function renderB2BTotalRow(){
  const tbody=document.getElementById('monitoring-b2b-body');
  tbody.querySelector('.total-row')?.remove();

  const total=Array(23).fill(0);

  tbody.querySelectorAll('tr').forEach(tr=>{
    if(tr.style.display==='none'||tr.classList.contains('total-row')) return;
    tr.querySelectorAll('td').forEach((td,i)=>{
      if(i>=5) total[i]+=parseInt(td.textContent)||0;
    });
  });

  const tr=document.createElement('tr');
  tr.className='total-row';

  tr.innerHTML=`
    <td colspan="4" class="text-center">TOTAL</td>
    <td></td>
    ${total.slice(5).map((v,i)=>`
      <td class="clickable total-cell" data-index="${i+5}">${v}</td>
    `).join('')}
  `;

  tbody.appendChild(tr);

  tr.querySelectorAll('.total-cell').forEach(td=>{
    td.addEventListener('click',()=>openTotalDetail(td.dataset.index));
  });
}

/* ================= FILTER ================= */

function applyB2BDropdownFilter(){

  const sto=filterSto.value||'';
  const witel=filterWitel.value||'';
  const hsa=filterHsa.value||'';

  B2B_ACTIVE_FILTER={sto,witel,hsa};

  document.querySelectorAll('#monitoring-b2b-body tr')
    .forEach(tr=>{
      if(tr.classList.contains('total-row')) return;
      const show=
        (!sto||tr.dataset.sto===sto)&&
        (!witel||tr.dataset.witel===witel)&&
        (!hsa||tr.dataset.hsa===hsa);
      tr.style.display=show?'':'none';
    });

  renderB2BTotalRow();
}


/* =====================================================
   SPINNER MODAL
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

/* ================= TOTAL DETAIL ================= */

function openTotalDetail(colIndex){

  const modal=new bootstrap.Modal(document.getElementById('global-modal'));
  const body=document.querySelector('#global-modal .modal-body');
  const title=document.querySelector('#global-modal .modal-title');

  title.textContent='Detail TOTAL Tiket HI (Gabungan)';
  body.innerHTML=renderModalSpinner();
  modal.show();

  const map={
    5:{mode:'HSI'},6:{mode:'DATIN'},
    7:{mode:'HSI',status_closed:'Y'},
    8:{mode:'DATIN',status_closed:'Y'},
    9:{mode:'HSI',status_closed:'N'},
    10:{mode:'DATIN',status_closed:'N'},
    11:{mode:'HSI',ttr_type:'4JAM',ttr_result:'Y'},
    12:{mode:'HSI',ttr_type:'4JAM',ttr_result:'N'},
    13:{mode:'HSI',ttr_type:'24JAM',ttr_result:'Y'},
    14:{mode:'HSI',ttr_type:'24JAM',ttr_result:'N'},
    15:{mode:'HSI',ttr_type:'6JAM',ttr_result:'Y'},
    16:{mode:'HSI',ttr_type:'6JAM',ttr_result:'N'},
    17:{mode:'HSI',ttr_type:'36JAM',ttr_result:'Y'},
    18:{mode:'HSI',ttr_type:'36JAM',ttr_result:'N'},
    19:{mode:'HSI',gaul:'Y'},
    20:{mode:'DATIN',gaul:'Y'}
  };

  const {sto,witel,hsa}=B2B_ACTIVE_FILTER;
  const qs=new URLSearchParams({
    type:'total_hi_all_detail',
    ...(map[colIndex]||{}),
    sto,witel,hsa
  }).toString();

  fetch(API_URL+'?'+qs)
    .then(r=>r.json())
    .then(res=>{
      if(!res.data?.length){
        body.innerHTML='<div class="text-center py-4">Tidak ada data</div>';
        return;
      }
      let html='<div class="table-responsive"><table class="table table-dark table-sm"><tbody>';
      res.data.forEach(r=>{
        html+=`<tr><td>${r.INCIDENT}</td><td>${r.SUMMARY}</td></tr>`;
      });
      body.innerHTML=html+'</tbody></table></div>';
    });
}

/* ================= UTIL ================= */

function buildDropdown(el,set,label){
  el.innerHTML=`<option value="">${label}</option>`;
  [...set].filter(v=>v).sort().forEach(v=>el.innerHTML+=`<option>${v}</option>`);
}

function highlightBadCellsB2B(){
  document.querySelectorAll('#monitoring-b2b-body tr').forEach(tr=>{
    const td=tr.children[4];
    if(!td) return;
    const v=parseFloat(td.textContent.replace('%','').replace(',','.'));
    if(v>2.3){ td.style.color='#ff4d4f'; td.style.fontWeight='800'; }
  });
}
