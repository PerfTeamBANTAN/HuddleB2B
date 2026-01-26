/* =====================================================
   MONITORING B2C HI
===================================================== */

/* ===== UI POLISH ===== */
(function injectB2CStyle(){
  if (document.getElementById('b2c-ui-polish')) return;

  const style = document.createElement('style');
  style.id = 'b2c-ui-polish';
  style.textContent = `
    #monitoring-b2c-body td{
      font-variant-numeric:tabular-nums;
    }
    #monitoring-b2c-body td.zero{
      color:rgba(255,255,255,.35);
      font-weight:500;
    }
    #monitoring-b2c-body tr:hover td{
      background:rgba(255,255,255,.045);
    }
    #monitoring-b2c-update{
      opacity:.85;
      transition:.15s;
    }
    #monitoring-b2c-update:hover{opacity:1;}
    #monitoring-b2c-body tr.total-row td{
      background:#0f172a !important;
      font-weight:800;
      border-top:2px solid #38bdf8;
    }
  `;
  document.head.appendChild(style);
})();

function initMonitoringB2C(API_URL){

  window.API_URL = API_URL;

  const tbody      = document.getElementById('monitoring-b2b-body');
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
    .then(res=>res.json())
    .then(resData=>{

      const data = resData.data || [];
      tbody.innerHTML = '';

      const setSto   = new Set();
      const setWitel = new Set();
      const setHsa   = new Set();

      data.forEach(row=>{
        if(!Array.isArray(row)) return;

        const tr = document.createElement('tr');
        tr.dataset.sto   = row[0] || '';
        tr.dataset.witel = row[1] || '';
        tr.dataset.hsa   = row[2] || '';

        setSto.add(row[0]);
        setWitel.add(row[1]);
        setHsa.add(row[2]);

        tr.innerHTML = `
          <td>${row[0]||'-'}</td>
          <td>${row[1]||'-'}</td>
          <td>${row[2]||'-'}</td>
          <td>${row[3]||'-'}</td>

          <td>${row[4]||0}</td>
          <td>${row[5]||0}</td>

          <td>${row[6]||0}</td>
          <td>${row[7]||0}</td>

          <td>${row[8]||0}</td>
          <td>${row[9]||0}</td>

          <td>${row[10]||0}</td>
          <td>${row[11]||0}</td>

          <td>${row[12]||0}</td>
          <td>${row[13]||0}</td>

          <td>${row[14]||0}</td>
          <td>${row[15]||0}</td>

          <td>${row[16]||0}</td>
          <td>${row[17]||0}</td>

          <td>${row[18]||0}</td>
          <td>${row[19]||0}</td>

          <td>${row[20]||0}</td>
          <td>${row[21]||0}</td>

          <td>${row[22]||0}</td>
          <td>${row[23]||0}</td>

          <td>${row[24]||0}</td>
          <td>${row[25]||0}</td>

          <td>${row[26]||0}</td>
          <td>${row[27]||0}</td>
        `;

        tbody.appendChild(tr);

        tr.querySelectorAll('td').forEach(td=>{
          if(td.textContent.trim()==='0') td.classList.add('zero');
        });
      });

      buildDropdown(filterSto,setSto,'All STO');
      buildDropdown(filterWitel,setWitel,'All Witel');
      buildDropdown(filterHsa,setHsa,'All HSA');

      [filterSto,filterWitel,filterHsa]
        .forEach(el=>el?.addEventListener('change',applyB2CDropdownFilter));

      if(resData.lastUpdate){
        lastUpdate.textContent =
          new Date(resData.lastUpdate).toLocaleString('id-ID');
      }

      renderB2CTotalRow();
    });
}

/* =====================================================
   TOTAL ROW
===================================================== */
function renderB2CTotalRow(){

  const tbody = document.getElementById('monitoring-b2b-body');
  tbody.querySelector('.total-row')?.remove();

  const total = Array(28).fill(0);

  tbody.querySelectorAll('tr').forEach(tr=>{
    if(tr.style.display==='none') return;
    if(tr.classList.contains('total-row')) return;

    const tds = tr.querySelectorAll('td');
    for(let i=4;i<=27;i++){
      total[i]+=Number(tds[i]?.innerText.replace(/[^\d]/g,''))||0;
    }
  });

  const tr = document.createElement('tr');
  tr.className='total-row';

  tr.innerHTML=`
    <td colspan="4" class="text-center">TOTAL</td>
    ${total.slice(4).map(v=>`<td>${v}</td>`).join('')}
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

  const sto   = filterSto.value||'';
  const witel = filterWitel.value||'';
  const hsa   = filterHsa.value||'';

  B2C_ACTIVE_FILTER={sto,witel,hsa};

  document.querySelectorAll('#monitoring-b2b-body tr')
    .forEach(tr=>{
      if(tr.classList.contains('total-row')) return;

      const show =
        (!sto   || tr.dataset.sto===sto) &&
        (!witel || tr.dataset.witel===witel) &&
        (!hsa   || tr.dataset.hsa===hsa);

      tr.style.display = show?'':'none';
    });

  renderB2CTotalRow();
}

/* =====================================================
   HELPER
===================================================== */
function buildDropdown(el,setData,label){
  if(!el) return;
  el.innerHTML=`<option value="">${label}</option>`;
  [...setData].filter(v=>v).sort()
    .forEach(v=>el.innerHTML+=`<option>${v}</option>`);
}

