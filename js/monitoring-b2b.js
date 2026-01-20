/* =====================================================
   MONITORING B2B HI
===================================================== */

function initMonitoringB2B(API_URL) {

  const tbody      = document.getElementById('monitoring-b2b-body');
  const lastUpdate = document.getElementById('monitoring-b2b-update');

  window.filterWitel = document.getElementById('filterWitel');
  window.filterSto   = document.getElementById('filterSto');
  window.filterHsa   = document.getElementById('filterHsa');

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

        /* ===== TOTAL ===== */
        tr.querySelector('.hi-hsi')?.addEventListener('click', () => {
          openDetailHI(API_URL, tr, 'HSI');
        });

        tr.querySelector('.hi-datin')?.addEventListener('click', () => {
          openDetailHI(API_URL, tr, 'DATIN');
        });

        /* ===== CLOSED ===== */
        tr.querySelector('.hi-closed-hsi')?.addEventListener('click', () => {
          openDetailHI(API_URL, tr, 'HSI', 'Y');
        });

        tr.querySelector('.hi-closed-datin')?.addEventListener('click', () => {
          openDetailHI(API_URL, tr, 'DATIN', 'Y');
        });

        /* ===== OPEN ===== */
        tr.querySelector('.hi-open-hsi')?.addEventListener('click', () => {
          openDetailHI(API_URL, tr, 'HSI', 'N');
        });

        tr.querySelector('.hi-open-datin')?.addEventListener('click', () => {
          openDetailHI(API_URL, tr, 'DATIN', 'N');
        });

      });

      buildDropdown(filterWitel, setWitel, 'All Witel');
      buildDropdown(filterSto, setSto, 'All STO');
      buildDropdown(filterHsa, setHsa, 'All HSA');

      [filterWitel, filterSto, filterHsa]
        .forEach(el => el?.addEventListener('change', applyB2BDropdownFilter));

      if (resData.lastUpdate) {
        lastUpdate.textContent =
          new Date(resData.lastUpdate).toLocaleString('id-ID');
      }

      highlightBadCellsB2B();
    });
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
    </div>
  `;
}

/* =====================================================
   MODAL DETAIL HI
===================================================== */
function openDetailHI(API_URL, tr, mode, statusClosed = '') {

  const modal = new bootstrap.Modal(
    document.getElementById('global-modal')
  );

  const modalBody  = document.querySelector('#global-modal .modal-body');
  const modalTitle = document.querySelector('#global-modal .modal-title');

  const labelStatus =
    statusClosed === 'Y' ? 'CLOSED' :
    statusClosed === 'N' ? 'OPEN' : 'ALL';

  modalTitle.textContent =
    `Detail Tiket HI ${mode} (${labelStatus}) – ${tr.dataset.sto}`;

  modalBody.innerHTML = renderModalSpinner('Mengambil detail tiket HI...');
  modal.show();

  fetch(
    API_URL +
    `?type=detail_hi` +
    `&mode=${mode}` +
    `&status_closed=${statusClosed}` +
    `&sto=${tr.dataset.sto}` +
    `&witel=${tr.dataset.witel}` +
    `&hsa=${tr.dataset.hsa}`
  )
    .then(res => res.json())
    .then(resData => {

      const rows = resData.data || [];

      if (!rows.length) {
        modalBody.innerHTML = `
          <div class="text-center text-muted py-4">
            Tidak ada data
          </div>`;
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
            </thead>
            <tbody>`;

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

      html += '</tbody></table></div>';
      modalBody.innerHTML = html;
    })
    .catch(() => {
      modalBody.innerHTML = `
        <div class="text-center text-danger py-4">
          Gagal memuat data
        </div>`;
    });
}

/* =====================================================
   FILTER & HIGHLIGHT
===================================================== */

function buildDropdown(el, setData, label) {
  if (!el) return;
  el.innerHTML = `<option value="">${label}</option>`;
  [...setData].filter(v => v).sort()
    .forEach(v => el.innerHTML += `<option>${v}</option>`);
}

function applyB2BDropdownFilter() {
  const sto   = filterSto.value;
  const witel = filterWitel.value;
  const hsa   = filterHsa.value;

  document.querySelectorAll('#monitoring-b2b-body tr')
    .forEach(tr => {
      tr.style.display =
        (!sto || tr.dataset.sto === sto) &&
        (!witel || tr.dataset.witel === witel) &&
        (!hsa || tr.dataset.hsa === hsa)
          ? '' : 'none';
    });
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
