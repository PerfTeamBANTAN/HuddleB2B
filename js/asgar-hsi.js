/* =========================================================
   asgar-hsi.js (FIXED)
========================================================= */

function initAsgarHSI(API_URL) {
  loadAsgarKPI(API_URL);
  loadAsgarTable(API_URL);
}

/* ================= KPI ================= */
function loadAsgarKPI(API_URL) {
  const cb = 'cb_asgar_kpi_' + Date.now();

  loadJSONP(
    `${API_URL}?type=kpi&callback=${cb}`,
    cb,
    res => {
      const row = document.getElementById('asgar-hsi-row');
      row.innerHTML = '';

      res.data.forEach(kpi => {
        const card = document.createElement('div');
        card.className = 'badge-card card-good';
        card.innerHTML = `
          <div class="badge-card-header">${kpi.label}</div>
          <div class="badge-card-body">
            <div class="row-item">
              <span>Value</span>
              <span>${kpi.value}</span>
            </div>
          </div>
        `;
        row.appendChild(card);
      });

      document.getElementById('asgar-last-update').innerHTML =
        `<i class="fa fa-clock me-1"></i> Last update: ${new Date(res.lastUpdate).toLocaleString('id-ID')}`;
    }
  );
}

/* ================= TABLE ================= */
function loadAsgarTable(API_URL) {
  const cb = 'cb_asgar_table_' + Date.now();

  loadJSONP(
    `${API_URL}?type=asgar_table&callback=${cb}`,
    cb,
    res => {
      const head = document.getElementById('asgar-hsi-table-head');
      const body = document.getElementById('asgar-hsi-table-body');

      head.innerHTML = '';
      body.innerHTML = '';

      if (!res.data?.length) {
        body.innerHTML =
          `<tr><td class="text-center text-muted">Tidak ada data</td></tr>`;
        return;
      }

      const headers = Object.keys(res.data[0]);
      headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        head.appendChild(th);
      });

      res.data.forEach(r => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
          const td = document.createElement('td');
          td.textContent = r[h] ?? '-';
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
    }
  );
}
