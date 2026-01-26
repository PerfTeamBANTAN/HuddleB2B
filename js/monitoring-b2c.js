/* =====================================================
   MONITORING B2C HI (FINAL – B2B STYLE)
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
    td.clickable:active{
      transform:scale(.97);
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);
    }

    #monitoring-b2c-body tr:hover td{
      background:rgba(255,255,255,.045);
    }

    #monitoring-b2c-body td{
      font-variant-numeric:tabular-nums;
    }
    #monitoring-b2c-body td.zero{
      color:rgba(255,255,255,.35);
      font-weight:500;
    }

    #monitoring-b2c-body tr.total-row td{
      background:#0f172a !important;
      font-weight:800;
      border-top:2px solid #38bdf8;
    }

    .modal table tbody tr:hover td{
      background:rgba(255,255,255,.05);
    }
  `;
  document.head.appendChild(style);
})();

/* =====================================================
   INIT
===================================================== */
function initMonitoringB2C(API_URL){

  window.API_URL = API_URL;

  const tbody      = document.getElementById('monitoring-b2c-body');
  const lastUpdate = document.getElementById('monitoring-b2c-update');

  window.filterWitel = document.getElementById('filterWitel');
  window.filterSto   = document.getElementById('filterSto');
  window.filterHsa   = document.getElementById('filterHsa');

  window.B2C_ACTIVE_FILTER = { sto:'', witel:'', hsa:'' };

  tbody.innerHTML = `
    <tr>
      <td colspan="28" class="text-center text-muted">Memuat data...</td>
    </tr>`;

  fetch(API_URL + '?type=monitoring_b2c')
    .then(res => res.json())
    .then(resData => {

      const data = resData.data || [];
      tbody.innerHTML = '';

      const setSto   = new Set();
      const setWitel = new Set();
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
          <td>${row[0]}</td>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>

          <td>${row[4]}</td>
          <td>${row[5]}</td>

          <td>${row[6]}</td>
          <td>${row[7]}</td>

          <td>${row[8]}</td>
          <td>${row[9]}</td>

          <td class="ttr3_ok clickable">${row[10]}</td>
          <td class="ttr3_nok clickable">${row[11]}</td>

          <td class="ttr6_ok clickable">${row[12]}</td>
          <td class="ttr6_nok clickable">${row[13]}</td>

          <td class="ttr12_ok clickable">${row[14]}</td>
          <td class="ttr12_nok clickable">${row[15]}</td>

          <td class="ttrManja_ok clickable">${row[16]}</td>
          <td class="ttrManja_nok clickable">${row[17]}</td>

          <td class="ttr36_ok clickable">${row[18]}</td>
          <td class="ttr36_nok clickable">${row[19]}</td>

          <td class="gaul_reg clickable">${row[20]}</td>
          <td class="gaul_hvc clickable">${row[21]}</td>

          <td>${row[22]}</td>
          <td>${row[23]}</td>
          <td>${row[24]}</td>
          <td>${row[25]}</td>
          <td>${row[26]}</td>
          <td>${row[27]}</td>
        `;

        tbody.appendChild(tr);

        tr.querySelectorAll('td').forEach(td=>{
          if(td.textContent.trim()==='0') td.classList.add('zero');
        });

        bindB2CClicks(tr);
      });

      buildDropdown(filterSto,setSto,'All STO');
      buildDropdown(filterWitel,setWitel,'All Witel');
      buildDropdown(filterHsa,setHsa,'All HSA');

      [filterSto,filterWitel,filterHsa]
        .forEach(el=>el?.addEventListener('change',applyB2CDropdownFilter));

      if (resData.lastUpdate) {
        lastUpdate.textContent =
          new Date(resData.lastUpdate).toLocaleString('id-ID');
      }

      renderB2CTotalRow();
    });
}

/* =====================================================
   CLICK HANDLER
===================================================== */
function bindB2CClicks(tr){

  const map = [
    'ttr3_ok','ttr3_nok',
    'ttr6_ok','ttr6_nok',
    'ttr12_ok','ttr12_nok',
    'ttrManja_ok','ttrManja_nok',
    'ttr36_ok','ttr36_nok',
    'gaul_reg','gaul_hvc'
  ];

  map.forEach(m=>{
    tr.querySelector('.'+m)
      ?.addEventListener('click',()=>openDetailB2C(API_URL,tr,m));
  });
}

/* =====================================================
   MODAL SPINNER
===================================================== */
function renderModalSpinner(text='Memuat data...'){
  return `
    <div class="d-flex flex-column justify-content-center align-items-center"
         style="min-height:260px;">
      <div class="spinner-border text-info mb-3"
           style="width:3.5rem;height:3.5rem;"></div>
      <div class="text-muted fw-semibold">${text}</div>
    </div>`;
}

/* =====================================================
   MODAL DETAIL B2C
===================================================== */
function openDetailB2C(API_URL, tr, mode){

  const modal = new bootstrap.Modal(
    document.getElementById('global-modal')
  );

  const modalBody  = document.querySelector('#global-modal .modal-body');
  const modalTitle = document.querySelector('#global-modal .modal-title');

  modalTitle.textContent =
    `Detail Tiket B2C ${mode.toUpperCase()} – ${tr.dataset.sto}`;

  modalBody.innerHTML = renderModalSpinner();
  modal.show();

  fetch(
    API_URL +
    `?type=monitoring_b2c_detail` +
    `&mode=${mode}` +
    `&sto=${tr.dataset.sto}` +
    `&witel=${tr.dataset.witel}` +
    `&hsa=${tr.dataset.hsa}`
  )
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
            <th>CUSTOMER TYPE</th>
            <th>GAUL</th>
            <th>IN LAMA HSI</th>
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
            <td>${r.CUSTOMER TYPE}</td>
            <td>${r.GAUL}</td>
            <td>${r['OLD TIKET']}</td>
          </tr>`;
      });

      modalBody.innerHTML = html+'</tbody></table></div>';
    });
}

/* =====================================================
   TOTAL ROW
===================================================== */
function renderB2CTotalRow(){
  const tbody = document.getElementById('monitoring-b2c-body');
  tbody.querySelector('.total-row')?.remove();

  const total = Array(28).fill(0);

  tbody.querySelectorAll('tr').forEach(tr=>{
    if(tr.style.display==='none') return;
    if(tr.classList.contains('total-row')) return;

    const tds = tr.querySelectorAll('td');
    for(let i=4;i<=27;i++){
      total[i]+=Number(tds[i]?.innerText)||0;
    }
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

  tr.querySelectorAll('td').forEach(td=>{
    if(td.textContent.trim()==='0') td.classList.add('zero');
  });
}

/* =====================================================
   FILTER
===================================================== */
function applyB2CDropdownFilter(){

  const sto   = filterSto.value || '';
  const witel = filterWitel.value || '';
  const hsa   = filterHsa.value || '';

  B2C_ACTIVE_FILTER = { sto, witel, hsa };

  document.querySelectorAll('#monitoring-b2c-body tr')
    .forEach(tr=>{
      if(tr.classList.contains('total-row')) return;

      const show =
        (!sto   || tr.dataset.sto   === sto) &&
        (!witel || tr.dataset.witel === witel) &&
        (!hsa   || tr.dataset.hsa   === hsa);

      tr.style.display = show ? '' : 'none';
    });

  renderB2CTotalRow();
}

/* =====================================================
   DROPDOWN BUILDER
===================================================== */
function buildDropdown(el, setData, label){
  if(!el) return;
  el.innerHTML = `<option value="">${label}</option>`;
  [...setData].filter(v=>v).sort()
    .forEach(v=>el.innerHTML+=`<option>${v}</option>`);
}
