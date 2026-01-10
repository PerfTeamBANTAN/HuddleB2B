/* =========================================================
   district-banten.js
   Dashboard CX B2B District Banten
========================================================= */

const API_URL = 'https://script.google.com/macros/s/AKfycby8iFZkMY53F4pYQFuH00b6Av7NAwp5Rtrk3b1GfNd6hwJelmlSjcUGeZjXlnz_Zmr2/exec';

/* ===================== HELPER ===================== */
function loadJSONP(url, cbName, onSuccess, onError) {
  window[cbName] = function (res) {
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

  const script = document.createElement('script');
  script.src = url;
  script.onerror = () => {
    delete window[cbName];
    script.remove();
    onError && onError(new Error('JSONP load error'));
  };

  document.body.appendChild(script);
}

function formatNumber(val, d = 2) {
  if (typeof val !== 'number') return val ?? '-';
  return Number.isInteger(val) ? val : val.toFixed(d);
}

function showLoading(show) {
  document.getElementById('loading-overlay')
    ?.classList.toggle('d-none', !show);
}

/* ===================== LOAD KPI ===================== */
function loadDistrictBantenKPI() {
  showLoading(true);

  const cb = 'cb_kpi_' + Date.now();

  loadJSONP(
    `${API_URL}?type=kpi&callback=${cb}`,
    cb,
    res => {
      const row = document.getElementById('district-banten-row');
      row.innerHTML = '';

      (res.data || []).forEach(kpi => {
        const div = document.createElement('div');
        div.className = 'card-kpi';
        div.innerHTML = `
          <div class="kpi-title">${kpi.label}</div>
          <div class="kpi-value">${formatNumber(kpi.value)}</div>
        `;
        row.appendChild(div);
      });

      document.getElementById('last-update').innerHTML =
        `<i class="fa fa-clock me-1"></i> Last update: ${res.lastUpdate || '-'}`;

      showLoading(false);
    },
    err => {
      console.error('KPI error', err);
      showLoading(false);
    }
  );
}

/* ===================== LOAD TABLE ===================== */
function loadDistrictBantenTable() {
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

      if (!res.data || !res.data.length) {
        tbody.innerHTML =
          `<tr><td class="text-center text-muted">Data kosong</td></tr>`;
        showLoading(false);
        return;
      }

      // header
      Object.keys(res.data[0]).forEach(k => {
        const th = document.createElement('th');
        th.textContent = k;
        thead.appendChild(th);
      });

      // body
      res.data.forEach(r => {
        const tr = document.createElement('tr');
        Object.values(r).forEach(v => {
          const td = document.createElement('td');
          td.textContent = formatNumber(v);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      showLoading(false);
    },
    err => {
      console.error('Table error', err);
      showLoading(false);
    }
  );
}

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  loadDistrictBantenKPI();
  loadDistrictBantenTable();
});
