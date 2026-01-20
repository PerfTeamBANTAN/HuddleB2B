/* =====================================================
   MONITORING B2B HI - ARRAY BASED (GOOGLE SHEET)
===================================================== */

function initMonitoringB2B(API_URL) {

  const tbody = document.getElementById('monitoring-b2b-body');
  const lastUpdate = document.getElementById('monitoring-b2b-update');

  const filterWitel = document.getElementById('filterWitel');
  const filterSto   = document.getElementById('filterSto');
  const filterHsa   = document.getElementById('filterHsa');

  fetch(API_URL + '?type=monitoring_b2b')
    .then(res => res.json())
    .then(resData => {

      const data = resData.data || [];
      tbody.innerHTML = '';

      const setWitel = new Set();
      const setSto   = new Set();
      const setHsa   = new Set();

      data.forEach(row => {

        /* SAFE GUARD */
        if (!Array.isArray(row)) return;

        setSto.add(row[0] || '-');
        setWitel.add(row[1] || '-');
        setHsa.add(row[2] || '-');

        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td>${row[0] || '-'}</td>
          <td>${row[1] || '-'}</td>
          <td>${row[2] || '-'}</td>
          <td>${row[3] || '-'}</td>
          <td>${row[4] || '0%'}</td>

          <td>${row[5] || 0}</td>
          <td>${row[6] || 0}</td>

          <td>${row[7] || 0}</td>
          <td>${row[8] || 0}</td>

          <td>${row[9] || 0}</td>
          <td>${row[10] || 0}</td>

          <td>${row[11] || 0}</td>
          <td>${row[12] || 0}</td>
          <td>${row[13] || 0}</td>
          <td>${row[14] || 0}</td>

          <td>${row[15] || 0}</td>
          <td>${row[16] || 0}</td>
          <td>${row[17] || 0}</td>
          <td>${row[18] || 0}</td>

          <td>${row[19] || 0}</td>
          <td>${row[20] || 0}</td>

          <td>${row[21] || 0}</td>
          <td>${row[22] || 0}</td>
        `;

        tbody.appendChild(tr);
      });

      buildDropdown(filterWitel, setWitel, 'Semua Witel');
      buildDropdown(filterSto, setSto, 'Semua STO');
      buildDropdown(filterHsa, setHsa, 'Semua HSA');

      [filterWitel, filterSto, filterHsa].forEach(el => {
        if (el) el.addEventListener('change', applyB2BDropdownFilter);
      });

      lastUpdate.textContent = new Date(resData.lastUpdate).toLocaleString('id-ID');

      highlightBadCellsB2B();
    })
    .catch(err => {
      console.error(err);
      tbody.innerHTML = `
        <tr>
          <td colspan="23" class="text-danger text-center">
            Gagal memuat data
          </td>
        </tr>`;
    });
}

/* =====================================================
   DROPDOWN FILTER
===================================================== */
function buildDropdown(el, setData, label) {
  if (!el) return;
  el.innerHTML = `<option value="">${label}</option>`;
  [...setData].sort().forEach(v => {
    el.innerHTML += `<option value="${v}">${v}</option>`;
  });
}

function applyB2BDropdownFilter() {
  const sto   = document.getElementById('filterSto')?.value || '';
  const witel = document.getElementById('filterWitel')?.value || '';
  const hsa   = document.getElementById('filterHsa')?.value || '';

  document.querySelectorAll('#monitoring-b2b-body tr').forEach(tr => {
    const cSto   = tr.children[0].innerText;
    const cWitel = tr.children[1].innerText;
    const cHsa   = tr.children[2].innerText;

    const show =
      (!sto || sto === cSto) &&
      (!witel || witel === cWitel) &&
      (!hsa || hsa === cHsa);

    tr.style.display = show ? '' : 'none';
  });
}

/* =====================================================
   HIGHLIGHT ❌
===================================================== */
function highlightBadCellsB2B() {
  document.querySelectorAll('.table-b2b-monitoring td')
    .forEach(td => {
      const val = Number(td.innerText);
      if (!isNaN(val) && val > 0 && td.cellIndex >= 12 && td.cellIndex <= 18) {
        td.classList.add('value-bad');
      }
    });
}
