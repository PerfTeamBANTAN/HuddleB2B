/* =========================================================
   district-banten.js (FIXED)
========================================================= */

function initDistrictBanten(API_URL) {
  loadDistrictBantenKPI(API_URL);
  loadDistrictBantenTable(API_URL);
}

/* ================= JSONP ================= */
function loadJSONP(url, cbName, onSuccess, onError) {
  const script = document.createElement('script');

  window[cbName] = res => {
    try {
      onSuccess(res);
    } catch (e) {
      console.error(e);
      onError && onError(e);
    } finally {
      delete window[cbName];
      script.remove();
    }
  };

  script.src = url;
  script.onerror = () => {
    delete window[cbName];
    script.remove();
    onError && onError(new Error('JSONP error'));
  };

  document.body.appendChild(script);
}

function showLoading(show) {
  document.getElementById('loading-overlay')
    ?.classList.toggle('d-none', !show);
}

/* ================= KPI ================= */
function loadDistrictBantenKPI(API_URL) {
  showLoading(true);

  const cb = 'cb_kpi_' + Date.now();

  loadJSONP(
    `${API_URL}?type=kpi&callback=${cb}`,
    cb,
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
          </div>
        `;
        row.appendChild(card);
      });

      document.getElementById('last-update').innerHTML =
        `<i class="fa fa-clock me-1"></i> Last update: ${new Date(res.lastUpdate).toLocaleString('id-ID')}`;

      showLoading(false);
    },
    () => showLoading(false)
  );
}

/* ================= TABLE ================= */
function loadDistrictBantenTable(API_URL) {
  showLoading(true);

  const cb = 'cb_table_' + Date.now();

  loadJSONP(
    `${API_URL}?type=table&callback=${cb}`,
    cb,
    res => {
      const thead = document.getElementById('district-banten-table-head');
      const tbody = document.getElementById('district-banten-table-body');

      thead.innerHTML = '';
      tbody.innerHTML = '';

      if (!res.data?.length) {
        tbody.innerHTML =
          `<tr><td class="text-center text-muted">Tidak ada data</td></tr>`;
        showLoading(false);
        return;
      }

      const headers = Object.keys(res.data[0]);
      headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        thead.appendChild(th);
      });

      res.data.forEach(r => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
          const td = document.createElement('td');
          td.textContent = r[h] ?? '-';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      showLoading(false);
    },
    () => showLoading(false)
  );
}
