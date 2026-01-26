/* =====================================================
   MONITORING B2C FINAL (B2B STYLE)
===================================================== */

/* ===== UI STYLE ===== */
(function injectB2CStyle(){
  if(document.getElementById('b2c-style')) return;
  const s=document.createElement('style');
  s.id='b2c-style';
  s.textContent=`
    td.clickable{cursor:pointer;}
    td.clickable:hover{background:rgba(255,255,255,.08);}
    td.zero{opacity:.4}
    tr.total-row td{
      background:#0f172a!important;
      font-weight:bold;
      border-top:2px solid #38bdf8;
    }
  `;
  document.head.appendChild(s);
})();

function initMonitoringB2C(API_URL){

  window.API_URL = API_URL;

  const tbody=document.getElementById('monitoring-b2c-body');
  const lastUpdate=document.getElementById('monitoring-b2c-update');

  const filterSto=document.getElementById('filterSto');
  const filterWitel=document.getElementById('filterWitel');
  const filterHsa=document.getElementById('filterHsa');

  tbody.innerHTML=`<tr><td colspan="30" class="text-center">Loading...</td></tr>`;

  fetch(API_URL+'?type=monitoring_b2c')
    .then(r=>r.json())
    .then(res=>{
      const data=res.data||[];
      tbody.innerHTML='';

      const setSto=new Set(), setWitel=new Set(), setHsa=new Set();

      data.forEach(row=>{
        const tr=document.createElement('tr');
        tr.dataset.sto=row[0];
        tr.dataset.witel=row[1];
        tr.dataset.hsa=row[2];

        setSto.add(row[0]);
        setWitel.add(row[1]);
        setHsa.add(row[2]);

        tr.innerHTML=`
          <td>${row[0]}</td>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>

          <td>${row[4]}</td><td>${row[5]}</td>
          <td>${row[6]}</td><td>${row[7]}</td>
          <td>${row[8]}</td><td>${row[9]}</td>

          <td class="clickable ttr3_ok">${row[10]}</td>
          <td class="clickable ttr3_nok">${row[11]}</td>

          <td class="clickable ttr6_ok">${row[12]}</td>
          <td class="clickable ttr6_nok">${row[13]}</td>

          <td class="clickable ttr12_ok">${row[14]}</td>
          <td class="clickable ttr12_nok">${row[15]}</td>

          <td class="clickable ttrManja_ok">${row[16]}</td>
          <td class="clickable ttrManja_nok">${row[17]}</td>

          <td class="clickable ttr36_ok">${row[18]}</td>
          <td class="clickable ttr36_nok">${row[19]}</td>

          <td class="clickable gaul_reg">${row[20]}</td>
          <td class="clickable gaul_hvc">${row[21]}</td>

          <td>${row[22]}</td>
          <td>${row[23]}</td>
          <td>${row[24]}</td>
          <td>${row[25]}</td>
          <td>${row[26]}</td>
          <td>${row[27]}</td>
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

      [filterSto,filterWitel,filterHsa].forEach(el=>{
        el.onchange=applyB2CFilter;
      });

      lastUpdate.textContent=new Date(res.lastUpdate).toLocaleString('id-ID');

      renderB2CTotalRow();
    });
}

/* ================= FILTER ================= */
function applyB2CFilter(){
  const sto=filterSto.value;
  const witel=filterWitel.value;
  const hsa=filterHsa.value;

  document.querySelectorAll('#monitoring-b2c-body tr').forEach(tr=>{
    let show=true;
    if(sto && tr.dataset.sto!==sto) show=false;
    if(witel && tr.dataset.witel!==witel) show=false;
    if(hsa && tr.dataset.hsa!==hsa) show=false;
    tr.style.display=show?'':'none';
  });

  renderB2CTotalRow();
}

/* ================= TOTAL ================= */
function renderB2CTotalRow(){
  document.querySelector('.total-row')?.remove();

  const rows=[...document.querySelectorAll('#monitoring-b2c-body tr')]
    .filter(tr=>tr.style.display!=='none');

  const total=new Array(28).fill(0);

  rows.forEach(tr=>{
    tr.querySelectorAll('td').forEach((td,i)=>{
      if(i>=4){
        total[i]+=Number(td.textContent)||0;
      }
    });
  });

  const tr=document.createElement('tr');
  tr.className='total-row';

  let html=`<td colspan="4">TOTAL</td>`;
  for(let i=4;i<28;i++){
    html+=`<td>${total[i]}</td>`;
  }
  tr.innerHTML=html;
  document.getElementById('monitoring-b2c-body').appendChild(tr);
}

/* ================= CLICK ================= */
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
    '.gaul_hvc':'gaul_hvc'
  };

  Object.keys(map).forEach(cls=>{
    const td=tr.querySelector(cls);
    if(td){
      td.onclick=()=>openDetailB2C(tr,map[cls]);
    }
  });
}

/* ================= MODAL ================= */
function openDetailB2C(tr,mode){

  const modalEl=document.getElementById('global-modal');
  const modal=new bootstrap.Modal(modalEl);
  const body=modalEl.querySelector('.modal-body');
  const title=modalEl.querySelector('.modal-title');

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
          <td>${r.KATEGORI}</td>
          <td>${r.GAUL}</td>
          <td>${r['OLD TIKET']}</td>
        </tr>`;
      });

      body.innerHTML=html+`</tbody></table></div>`;
    });
}

/* ================= DROPDOWN ================= */
function buildDropdown(el,set,label){
  el.innerHTML=`<option value="">${label}</option>`;
  [...set].sort().forEach(v=>{
    el.innerHTML+=`<option value="${v}">${v}</option>`;
  });
}
