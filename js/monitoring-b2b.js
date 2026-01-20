/* =====================================================
   MONITORING B2B HI
   SOURCE : GOOGLE SHEET (ARRAY BASED)
===================================================== */

function initMonitoringB2B(API_URL) {

  const tbody      = document.getElementById('monitoring-b2b-body');
  const lastUpdate = document.getElementById('monitoring-b2b-update');

  const filterWitel = document.getElementById('filterWitel');
  const filterSto   = document.getElementById('filterSto');
  const filterHsa   = document.getElementById('filterHsa');

  tbody.innerHTML = `
    <tr>
      <td colspan="23" class="text-center text-muted">
        Memuat data...
      </td>
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

        /* ================= DATASET FOR FILTER ================= */
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

      /* ================= BUILD DROPDOWN ================= */
      buildDropdown(filterWitel, setWitel, 'All Witel');
      buildDropdown(filterSto, setSto, 'All STO');
      buildDropdown(filterHsa, setHsa, 'All HSA');

      /* ================= FILTER EVENT ================= */
      [filterWitel, filterSto, filterHsa].forEach(el => {
        if (el) el.addEventListener('change', applyB2BDropdownFilter);
      });

      /* ================= LAST UPDATE ================= */
      if (resData.lastUpdate) {
        lastUpdate.textContent =
          new Date(resData.lastUpdate).toLocaleString('id-ID');
      }

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
   BUILD DROPDOWN (STYLE ASGAR)
===================================================== */
function buildDropdown(el, setData, label) {
  if (!el) return;

  el.innerHTML = `<option value="">${label}</option>`;

  [...setData]
    .filter(v => v)
    .sort()
    .forEach(v => {
      el.innerHTML += `<option value="${v}">${v}</option>`;
    });
}

/* =====================================================
   APPLY FILTER
===================================================== */
function applyB2BDropdownFilter() {

  const sto   = document.getElementById('filterSto').value;
  const witel = document.getElementById('filterWitel').value;
  const hsa   = document.getElementById('filterHsa').value;

  document
    .querySelectorAll('#monitoring-b2b-body tr')
    .forEach(tr => {

      const match =
        (!sto || tr.dataset.sto === sto) &&
        (!witel || tr.dataset.witel === witel) &&
        (!hsa || tr.dataset.hsa === hsa);

      tr.style.display = match ? '' : 'none';
    });
}

/* =====================================================
   HIGHLIGHT NILAI ❌ (TTR)
===================================================== */
function highlightBadCellsB2B() {
  document
    .querySelectorAll('.table-b2b-monitoring td')
    .forEach(td => {

      const val = Number(td.innerText);

      /* kolom TTR ✔ / ✖ */
      if (!isNaN(val) && val > 0 && td.cellIndex >= 12 && td.cellIndex <= 18) {
        td.classList.add('value-bad');
      }
    });
}
