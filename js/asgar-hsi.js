/* =========================================================
   asgar-hsi.js
   Assurance Guarantee HSI B2B
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
    onError && onError(new Error('JSONP error'));
  };

  document.body.appendChild(script);
}

function formatNumber(val, d = 2) {
  if (typeof val !== 'number') return val ?? '-';
  return Number.isInteger(val) ? val : val.toFixed(d);
}

function showLoading(show) {
  document.getElementById('asgar-loading-overlay')
    ?.classList.toggle('d-none', !show);
}

/* ===================== LOAD KPI ===================== */
function loadAsgarKPI() {
  showLoading(true);

  const cb = 'cb_asgar_kpi_' + Date.now();

  loadJSONP(
    `${API_URL}?type=kpi&callback=${cb}`,
    cb,
    res => {
      const row = document.getElementById('asgar-hsi-row');
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

      document.getElementById('asgar-last-update').innerHTML =
        `<i class="fa fa-clock me-1"></i> Last update: ${res.lastUpdate || '-'}`;

      showLoading(false);
    },
    err => {
      console.error(err);
      showLoading(false);
    }
  );
}

/* ===================== LOAD TABLE ===================== */
function loadAsgarTable() {
  showLoading(true);

  const cb = 'cb_asgar_table_' + Date.now();

  loadJSONP(
    `${API_URL}?type=asgar_table&callback=${cb}`,
    cb,
    res => {
      const head = document.getElementById('asgar-hsi-table-head');
      const body = document.getElementById('asgar-hsi-table-body');

      head.innerHTML = '';
      body.innerHTML = '';

      if (!res.data || !res.data.length) {
        body.innerHTML =
          `<tr><td class="text-center text-muted">Data kosong</td></tr>`;
        showLoading(false);
        return;
      }

      Object.keys(res.data[0]).forEach(k => {
        const th = document.createElement('th');
        th.textContent = k;
        head.appendChild(th);
      });

      res.data.forEach(r => {
        const tr = document.createElement('tr');
        Object.values(r).forEach(v => {
          const td = document.createElement('td');
          td.textContent = formatNumber(v);
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });

      showLoading(false);
    },
    err => {
      console.error(err);
      showLoading(false);
    }
  );
}

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  loadAsgarKPI();
  loadAsgarTable();
});
