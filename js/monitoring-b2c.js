/* =====================================================
   MONITORING B2C HI (B2B STYLE)
===================================================== */

/* ===== UI POLISH ===== */
(function injectB2CStyle(){
  if (document.getElementById('b2c-ui-polish')) return;

  const style = document.createElement('style');
  style.id = 'b2c-ui-polish';
  style.textContent = `
    td.clickable{
      cursor:pointer;
      transition:background .15s ease,color .15s ease,transform .08s ease;
    }
    td.clickable:hover{ background:rgba(255,255,255,.06); }
    td.clickable:active{ transform:scale(.97); }

    #monitoring-b2c-body tr:hover td{
      background:rgba(255,255,255,.045);
    }

    #monitoring-b2c-body td.zero{
      color:rgba(255,255,255,.35);
      font-weight:500;
    }

    #monitoring-b2c-body tr.total-row td{
      background:#0f172a!important;
      font-weight:800;
      border-top:2px solid #38bdf8;
    }
  `;
  document.head.appendChild(style);
})();

function initMonitoringB2C(API_URL){

  window.API_URL = API_URL;

  const tbody      = document.getElementById('monitoring-b2c-body');
  const lastUpdate = document.getElementById('monitoring-b2c-update');

  window.filterSto   = document.getElementById('filterSto');
  window.filterWitel = document.getElementById('filterWitel');
  window.filterHsa   = document.getElementById('filterHsa');

  window.B2C_ACTIVE_FILTER = { sto:'', witel:'', hsa:'' };

  tbody.innerHTML = `<tr><td colspan="28" class="text-center">Loading...</td></tr>`;

  fetch(API_URL + '?type=monitoring_b2c')
    .then(res=>res.json())
    .then(resData=>{

      const data = resData.data || [];
      tbody.innerHTML = '';

      const setSto=new Set(), setWitel=new Set(), setHsa=new Set();

      data.forEach(row=>{

        const tr=document.createElement('tr');
        tr.dataset.sto=row[0];
        tr.dataset.witel=row[1];
        tr.dataset.hsa=row[2];

        setSto.add(row[0]);
        setWitel.add(row[1]);
        setHsa.add(row[2]);

        tr.innerHTML = `
<td>${row[0]}</td>
<td>${row[1]}</td>
<td>${row[2]}</td>
<td>${row[3]}</td>

<td class="clickable total_reg">${row[4]}</td>
<td class="clickable total_hvc">${row[5]}</td>

<td class="clickable closed_reg">${row[6]}</td>
<td class="clickable closed_hvc">${row[7]}</td>

<td class="clickable open_reg">${row[8]}</td>
<td class="clickable open_hvc">${row[9]}</td>

<td class="clickable ttr3_ok">${row[10]}</td>
<td class="clickable ttr3_nok">${row[11]}</td>

<td class="clickable ttr6_ok">${row[12]}</td>
<td class="clickable ttr6_nok">${row[13]}</td>

<td class="clickable ttr12_ok">${row[14]}</td>
<td class="clickable ttr12_nok">${row[15]}</td>

<td class="clickable manja_ok">${row[16]}</td>
<td class="clickable manja_nok">${row[17]}</td>

<td class="clickable ttr36_ok">${row[18]}</td>
<td class="clickable ttr36_nok">${row[19]}</td>

<td class="clickable gaul_reg">${row[20]}</td>
<td class="clickable gaul_hvc">${row[21]}</td>

<td class="clickable sqm_total">${row[22]}</td>
<td class="clickable sqm_open">${row[23]}</td>

<td class="clickable ffg">${row[24]}</td>   <!-- ✅ FFG -->
<td>${row[25]}</td>
<td>${row[26]}</td>
`;

        tbody.appendChild(tr);

        tr.querySelectorAll('td').forEach(td=>{
          if(td.textContent==='0') td.classList.add('zero');
        });

        bindB2CClicks(tr);
      });

      buildDropdown(filterSto,setSto,'All STO');
      buildDropdown(filterWitel,setWitel,'All Witel');
      buildDropdown(filterHsa,setHsa,'All HSA');

      [filterSto,filterWitel,filterHsa]
        .forEach(el=>el?.addEventListener('change',applyB2CFilter));

      if(resData.lastUpdate){
        lastUpdate.textContent =
          new Date(resData.lastUpdate).toLocaleString('id-ID');
      }

      renderB2CTotalRow();
    });
}


/* ================= TOTAL ================= */
function renderB2CTotalRow(){

  const tbody=document.getElementById('monitoring-b2c-body');
  tbody.querySelector('.total-row')?.remove();

  const total=new Array(28).fill(0);

  tbody.querySelectorAll('tr').forEach(tr=>{
    if(tr.style.display==='none') return;
    if(tr.classList.contains('total-row')) return;

    tr.querySelectorAll('td').forEach((td,i)=>{
      if(i>=4){
        total[i]+=Number(td.textContent)||0;
      }
    });
  });

  const tr=document.createElement('tr');
  tr.className='total-row';

  tr.innerHTML=`
    <td colspan="4" class="text-center">TOTAL</td>
    ${total.slice(4).map((v,i)=>`
      <td class="clickable total-cell" data-index="${i+4}">${v}</td>
    `).join('')}
  `;

  tbody.appendChild(tr);

  tr.querySelectorAll('.total-cell').forEach(td=>{
    td.addEventListener('click',()=>openTotalDetailB2C(td.dataset.index));
  });
}

/* ================= FILTER ================= */
function applyB2CFilter(){

  const sto=filterSto.value||'';
  const witel=filterWitel.value||'';
  const hsa=filterHsa.value||'';

  B2C_ACTIVE_FILTER={sto,witel,hsa};

  document.querySelectorAll('#monitoring-b2c-body tr')
    .forEach(tr=>{
      if(tr.classList.contains('total-row')) return;

      const show=
        (!sto||tr.dataset.sto===sto) &&
        (!witel||tr.dataset.witel===witel) &&
        (!hsa||tr.dataset.hsa===hsa);

      tr.style.display=show?'':'none';
    });

  renderB2CTotalRow();
}

/* ================= CLICK MAP ================= */
function bindB2CClicks(tr){

  const map={
    '.ttr3_ok':'ttr3_ok',
    '.ttr3_nok':'ttr3_nok',
    '.ttr6_ok':'ttr6_ok',
    '.ttr6_nok':'ttr6_nok',
    '.ttr12_ok':'ttr12_ok',
    '.ttr12_nok':'ttr12_nok',
    '.ttrManja_ok':'ttrManja_ok',
    '.ttrManja_nok':'ttrManja_nok',
    '.ttr36_ok':'ttr36_ok',
    '.ttr36_nok':'ttr36_nok',
    '.gaul_reg':'gaul_reg',
    '.gaul_hvc':'gaul_hvc',
    '.total_reg':'total_reg',
    '.total_hvc':'total_hvc',
    '.closed_reg':'closed_reg',
    '.closed_hvc':'closed_hvc',
    '.open_reg':'open_reg',
    '.open_hvc':'open_hvc',
    '.ffg':'ffg' // ✅ TAMBAH FFG
  };

  Object.keys(map).forEach(cls=>{
    const td=tr.querySelector(cls);
    if(td){
      td.addEventListener('click',()=>openDetailB2C(tr,map[cls]));
    }
  });
}

/* ================= MODAL DETAIL ================= */
function openDetailB2C(tr,mode){

  const modal=new bootstrap.Modal(
    document.getElementById('global-modal')
  );

  const body=document.querySelector('#global-modal .modal-body');
  const title=document.querySelector('#global-modal .modal-title');

  title.textContent=`Detail ${mode.toUpperCase()} - ${tr.dataset.sto}`;
  body.innerHTML=`<div class="text-center p-4">Loading...</div>`;
  modal.show();

  fetch(API_URL+`?type=monitoring_b2c_detail&sto=${tr.dataset.sto}&mode=${mode}`)
    .then(r=>r.json())
    .then(res=>{

      const rows=res.data||[];
      if(!rows.length){
        body.innerHTML=`<div class="text-center text-muted">Tidak ada data</div>`;
        return;
      }

      let html=`
      <div class="table-responsive">
      <table class="table table-dark table-striped table-sm">
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
          <th>GUARANTEE</th>
          <th>GAUL</th>
          <th>OLD TIKET</th>
        </tr>
      </thead><tbody>`;

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
          <td>${r['convert waktu']}</td>
          <td>${r.KATAGORI}</td>
          <td>${r['GUARANTE STATUS']}</td>
          <td>${r.GAUL}</td>
          <td>${r['OLD TIKET']}</td>
        </tr>`;
      });

      body.innerHTML=html+`</tbody></table></div>`;
    });
}

/* =====================================================
   DETAIL TOTAL B2C (ALL STO / FILTERED)
===================================================== */
function openTotalDetailB2C(colIndex){

  const f = window.B2C_ACTIVE_FILTER || {};

  const params = {
    type: 'monitoring_b2c_total_detail'
  };

  if (f.sto)   params.sto   = f.sto;
  if (f.witel) params.witel = f.witel;
  if (f.hsa)   params.hsa   = f.hsa;

  const modal = new bootstrap.Modal(
    document.getElementById('global-modal')
  );

  const modalBody  = document.querySelector('#global-modal .modal-body');
  const modalTitle = document.querySelector('#global-modal .modal-title');

  modalTitle.textContent = 'Detail TOTAL Tiket B2C';
  modalBody.innerHTML = renderModalSpinner();
  modal.show();

  /* ===== MAPPING KOLOM TOTAL B2C ===== */
  const map = {
    5:{mode:'REG'},
    6:{mode:'HVC'},

    7:{mode:'REG',status_closed:'Y'},
    8:{mode:'HVC',status_closed:'Y'},

    9:{mode:'REG',status_closed:'N'},
    10:{mode:'HVC',status_closed:'N'},

    11:{ttr_type:'3JAM',ttr_result:'Y'},
    12:{ttr_type:'3JAM',ttr_result:'N'},

    13:{ttr_type:'6JAM',ttr_result:'Y'},
    14:{ttr_type:'6JAM',ttr_result:'N'},

    15:{ttr_type:'12JAM',ttr_result:'Y'},
    16:{ttr_type:'12JAM',ttr_result:'N'},

    17:{ttr_type:'MANJA',ttr_result:'Y'},
    18:{ttr_type:'MANJA',ttr_result:'N'},

    19:{ttr_type:'36JAM',ttr_result:'Y'},
    20:{ttr_type:'36JAM',ttr_result:'N'},

    21:{gaul:'Y'},
    22:{sqm:'Y'},
    23:{alert:'Y'}
  };

  const qs = new URLSearchParams({
    ...params,
    ...(map[colIndex] || {})
  }).toString();

  fetch(API_URL + '?' + qs)
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
        <table class="table table-dark table-striped table-sm">
        <thead>
          <tr>
            <th>INCIDENT</th>
            <th>SUMMARY</th>
            <th>REPORTED DATE</th>
            <th>SERVICE TYPE</th>
            <th>STO</th>
            <th>WITEL</th>
            <th>STATUS</th>
            <th>KATEGORI</th>
            <th>TTR</th>
            <th>GAUL</th>
          </tr>
        </thead>
        <tbody>`;

      rows.forEach(r => {
        html += `
          <tr>
            <td>${r.INCIDENT || '-'}</td>
            <td>${r.SUMMARY || '-'}</td>
            <td>${r['REPORTED DATE'] || '-'}</td>
            <td>${r['SERVICE TYPE'] || '-'}</td>
            <td>${r.STO || '-'}</td>
            <td>${r.WITEL || '-'}</td>
            <td>${r.STATUS || '-'}</td>
            <td>${r.KATEGORI || '-'}</td>
            <td>${r.TTR || '-'}</td>
            <td>${r.GAUL || '-'}</td>
          </tr>`;
      });

      modalBody.innerHTML = html + '</tbody></table></div>';
    })
    .catch(err=>{
      modalBody.innerHTML =
        `<div class="text-danger text-center py-4">Gagal load data</div>`;
      console.error(err);
    });
}

/* ================= DROPDOWN ================= */
function buildDropdown(el,set,label){
  if(!el) return;
  el.innerHTML=`<option value="">${label}</option>`;
  [...set].filter(v=>v).sort()
    .forEach(v=>el.innerHTML+=`<option>${v}</option>`);
}
