async function initTTRHSI(API_URL) {

  const row = document.getElementById('ttr-row');
  const overlay = document.getElementById('ttr-loading-overlay');
  const tableHead = document.getElementById('ttr-table-head');
  const tableBody = document.getElementById('ttr-table-body');
  const lastUpdate = document.getElementById('ttr-last-update');

  overlay.classList.remove('d-none');

  try {
    /* ================= KPI CARD ================= */
    const kpiRes = await fetch(API_URL + '?type=kpi');
    const kpiJson = await kpiRes.json();

    row.innerHTML = '';

    kpiJson.data
      .filter(d => d.indikator.toUpperCase().includes('TTR'))
      .forEach(d => {

        const isGood = d.ach <= d.target;

        const card = document.createElement('div');
        card.className = `badge-card ${isGood ? 'card-good' : 'card-bad'}`;

        card.innerHTML = `
          <div class="badge-card-header">
            ${d.indikator} - ${d.witel}
          </div>

          <div class="badge-card-body">
            <div class="row-item">
              <span>Target</span>
              <span>${d.target}</span>
            </div>

            <div class="row-item">
              <span>Actual</span>
              <span class="${isGood ? 'value-good' : 'value-bad'}">
                ${d.ach}
              </span>
            </div>
          </div>
        `;

        row.appendChild(card);
      });

    /* ================= TABLE (DEFAULT HSI) ================= */
    await loadTTRTable(API_URL, 'ttr_hsi_table');

    lastUpdate.innerHTML =
      `<i class="fa fa-clock me-1"></i> Last update: ${new Date().toLocaleString()}`;

  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `
      <tr>
        <td class="text-center text-danger">
          Gagal memuat data
        </td>
      </tr>
    `;
  } finally {
    overlay.classList.add('d-none');
  }

  /* ================= FILTER ================= */
  document.getElementById('ttr-filter-service')
    ?.addEventListener('change', e => {
      const type =
        e.target.value === 'DATIN'
          ? 'ttr_datin_table'
          : 'ttr_hsi_table';

      loadTTRTable(API_URL, type);
    });
}

/* =====================================================
   LOAD TABLE FUNCTION
===================================================== */
async function loadTTRTable(API_URL, type) {

  const tableHead = document.getElementById('ttr-table-head');
  const tableBody = document.getElementById('ttr-table-body');

  tableHead.innerHTML = '';
  tableBody.innerHTML = `
    <tr>
      <td class="text-center text-muted">
        Memuat data...
      </td>
    </tr>
  `;

  const res = await fetch(API_URL + '?type=' + type);
  const json = await res.json();

  /* HEADER */
  json.headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    tableHead.appendChild(th);
  });

  /* BODY */
  tableBody.innerHTML = '';

  json.data.forEach(r => {
    const tr = document.createElement('tr');

    json.headers.forEach(h => {
      const td = document.createElement('td');
      td.textContent = r[h] ?? '-';
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}
