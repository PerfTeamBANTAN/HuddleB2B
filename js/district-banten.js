/* =========================================================
   district-banten.js
========================================================= */

function initDistrictBanten() {
  const API_URL = getApiUrl();
  if (!API_URL) return;

  loadDistrictBantenKPI(API_URL);
  loadDistrictBantenTable(API_URL);
}

/* ================= KPI ================= */
function loadDistrictBantenKPI(API_URL) {
  toggleLoading('loading-overlay', true);

  loadJSONP(
    `${API_URL}?type=kpi`,
    res => {
      const row = document.getElementById('district-banten-row');
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
          </div>`;
        row.appendChild(card);
      });

      document.getElementById('last-update').innerHTML =
        `<i class="fa fa-clock me-1"></i> Last update: ${new Date(res.lastUpdate).toLocaleString('id-ID')}`;

      toggleLoading('loading-overlay', false);
    },
    () => toggleLoading('loading-overlay', false)
  );
}

/* ================= TABLE ================= */
function loadDistrictBantenTable(API_URL) {
  toggleLoading('loading-overlay', true);

  loadJSONP(
    `${API_URL}?type=table`,
    res => {
      const thead = document.getElementById('district-banten-table-head');
      const tbody = document.getElementById('district-banten-table-body');

      thead.innerHTML = '';
      tbody.innerHTML = '';

      if (!res.data?.length) {
        tbody.innerHTML =
          `<tr><td class="text-center text-muted">Tidak ada data</td></tr>`;
        toggleLoading('loading-overlay', false);
        return;
      }

      const headers = Object.keys(res.data[0]);
      headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        thead.appendChild(th);
      });

      res.data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
          const td = document.createElement('td');
          td.textContent = row[h] ?? '-';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      toggleLoading('loading-overlay', false);
    },
    () => toggleLoading('loading-overlay', false)
  );
}
