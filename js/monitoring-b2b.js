/* =====================================================
   MONITORING B2B HI - AGGREGATE TABLE + DROPDOWN FILTER
===================================================== */

function initMonitoringB2B(API_URL) {

  const tbody      = document.getElementById('monitoring-b2b-body');
  const lastUpdate = document.getElementById('monitoring-b2b-update');

  const filterWitel = document.getElementById('filterWitel');
  const filterSto   = document.getElementById('filterSto');
  const filterHsa   = document.getElementById('filterHsa');

  fetch(API_URL + '?sheet=MONITORING_B2B')
    .then(res => res.json())
    .then(data => {

      tbody.innerHTML = '';

      const setWitel = new Set();
      const setSto   = new Set();
      const setHsa   = new Set();

      /* ===============================
         BUILD TABLE & COLLECT FILTER
      =============================== */
      data.forEach(row => {

        if (row.WITEL) setWitel.add(row.WITEL);
        if (row.STO)   setSto.add(row.STO);
        if (row.HSA)   setHsa.add(row.HSA);

        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td class="sticky-col">${row.STO || '-'}</td>
          <td class="sticky-col-2">${row.WITEL || '-'}</td>
          <td>${row.HSA || 0}</td>
          <td>${row.OSA || 0}</td>
          <td>${row.Q_HSI || '0%'}</td>

          <td>${row.TOTAL_HI_HSI || 0}</td>
          <td>${row.TOTAL_HI_DATIN || 0}</td>

          <td>${row.CLOSED_HSI || 0}</td>
          <td>${row.CLOSED_DATIN || 0}</td>

          <td>${row.OPEN_HSI || 0}</td>
          <td>${row.OPEN_DATIN || 0}</td>

          <td>${row.INDI_4_OK || 0}</td>
          <td>${row.INDI_4_BAD || 0}</td>
          <td>${row.INDI_24_OK || 0}</td>
          <td>${row.INDI_24_BAD || 0}</td>

          <td>${row.RES_6_OK || 0}</td>
          <td>${row.RES_6_BAD || 0}</td>
          <td>${row.RES_36_OK || 0}</td>
          <td>${row.RES_36_BAD || 0}</td>

          <td>${row.GAUL_HSI || 0}</td>
          <td>${row.GAUL_DATIN || 0}</td>

          <td>${row.SQM_JADI_HI || 0}</td>
          <td>${row.ALERT_JADI_HI || 0}</td>
        `;

        tbody.appendChild(tr);
      });

      /* ===============================
         BUILD DROPDOWN FILTER
      =============================== */
      buildDropdown(filterWitel, setWitel, 'Semua Witel');
      buildDropdown(filterSto,   setSto,   'Semua STO');
      buildDropdown(filterHsa,   setHsa,   'Semua HSA');

      /* ===============================
         FILTER EVENT
      =============================== */
      [filterWitel, filterSto, filterHsa]
        .filter(el => el)
        .forEach(el =>
          el.addEventListener('change', applyB2BDropdownFilter)
        );

      /* ===============================
         LAST UPDATE
      =============================== */
      lastUpdate.textContent = new Date().toLocaleString('id-ID');

      /* ===============================
         HIGHLIGHT ❌
      =============================== */
      highlightBadCellsB2B();
    })
    .catch(err => {
      console.error('Monitoring B2B error:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="23" class="text-center text-danger">
            Gagal memuat data
          </td>
        </tr>
      `;
    });
}

/* =====================================================
   BUILD DROPDOWN HELPER
===================================================== */
function buildDropdown(selectEl, dataSet, label) {
  if (!selectEl) return;

  selectEl.innerHTML = `<option value="">${label}</option>`;

  [...dataSet]
    .sort()
    .forEach(val => {
      selectEl.innerHTML += `<option value="${val}">${val}</option>`;
    });
}

/* =====================================================
   APPLY DROPDOWN FILTER
===================================================== */
function applyB2BDropdownFilter() {

  const witel = document.getElementById('filterWitel')?.value || '';
  const sto   = document.getElementById('filterSto')?.value || '';
  const hsa   = document.getElementById('filterHsa')?.value || '';

  document.querySelectorAll('#monitoring-b2b-body tr')
    .forEach(tr => {

      const vSto   = tr.children[0].innerText;
      const vWitel = tr.children[1].innerText;
      const vHsa   = tr.children[2].innerText;

      const show =
        (!witel || vWitel === witel) &&
        (!sto   || vSto === sto) &&
        (!hsa   || vHsa === hsa);

      tr.style.display = show ? '' : 'none';
    });
}

/* =====================================================
   HIGHLIGHT ❌ CELL (AUTO RED)
===================================================== */
function highlightBadCellsB2B() {

  const table = document.querySelector('.table-b2b-monitoring');
  if (!table) return;

  const badIndexes = [];

  table.querySelectorAll('thead tr:last-child th')
    .forEach((th, i) => {
      if (th.classList.contains('bad')) badIndexes.push(i);
    });

  table.querySelectorAll('tbody tr').forEach(tr => {
    tr.querySelectorAll('td').forEach((td, i) => {
      if (badIndexes.includes(i)) {
        const v = Number(td.innerText);
        if (!isNaN(v) && v > 0) {
          td.classList.add('value-bad');
        }
      }
    });
  });
}
