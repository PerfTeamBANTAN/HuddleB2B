function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const wrapper = document.getElementById('district-banten-wrapper');
  const loading = document.getElementById('loading-overlay');
  const lastUpdateEl = document.getElementById('last-update');

  if (!container || !wrapper) return;

  container.innerHTML = '';
  loading.style.display = 'flex';

  const callbackName = 'jsonp_kpi_' + Date.now();

  window[callbackName] = function (res) {
    try {
      const { data, lastUpdate } = res;

      // ================= LAST UPDATE =================
      const d = new Date(lastUpdate);
      lastUpdateEl.innerHTML =
        `<i class="fa fa-clock me-1"></i> Last update: ` +
        d.toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

      // ================= KPI PROCESS =================
      const map = {};

      data.forEach(r => {
        if (!map[r.indikator]) {
          map[r.indikator] = {
            target: r.target,
            BANTEN: null,
            TANGERANG: null
          };
        }
        map[r.indikator][r.witel] = r.ach;
      });

      Object.entries(map).forEach(([indikator, v]) => {
        const lowerBetter = indikator === 'Q Gangguan HSI';
        const isGood = val =>
          lowerBetter ? val <= v.target : val >= v.target;

        const card = document.createElement('div');
        card.className =
          `badge-card ${isGood(v.BANTEN) ? 'card-good' : 'card-bad'}`;

        card.innerHTML = `
          <div class="badge-card-header">${indikator}</div>
          <div class="badge-card-body">
            <div class="row-item">
              <span>Target</span>
              <span>${v.target.toFixed(2)}</span>
            </div>
            <div class="row-item">
              <span>Banten</span>
              <span class="${isGood(v.BANTEN) ? 'value-good' : 'value-bad'}">
                ${v.BANTEN.toFixed(2)}
              </span>
            </div>
            <div class="row-item">
              <span>Tangerang</span>
              <span class="${isGood(v.TANGERANG) ? 'value-good' : 'value-bad'}">
                ${v.TANGERANG.toFixed(2)}
              </span>
            </div>
          </div>
        `;
        container.appendChild(card);
      });

      // ================= LOAD TABLE =================
      loadDistrictBantenTable(API_URL);

    } catch (e) {
      container.innerHTML =
        '<div class="text-danger">Gagal memuat data KPI</div>';
    } finally {
      loading.style.display = 'none';
      delete window[callbackName];
      script.remove();
    }
  };

  const script = document.createElement('script');
  script.src = `${API_URL}?callback=${callbackName}`;
  document.body.appendChild(script);
}

/* =========================================================
   ================= TABLE ALERT ===========================
   ========================================================= */

function loadDistrictBantenTable(API_URL) {
  const thead = document.getElementById('district-banten-table-head');
  const tbody = document.getElementById('district-banten-table-body');

  if (!thead || !tbody) return;

  thead.innerHTML = '';
  tbody.innerHTML =
    `<tr><td colspan="10" class="text-center text-muted">Memuat data...</td></tr>`;

  const cb = 'jsonp_table_' + Date.now();

  window[cb] = function (res) {
    try {
      // ================= HEADER =================
      res.headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        thead.appendChild(th);
      });

      // ================= BODY =================
      tbody.innerHTML = '';
      res.data.forEach(row => {
        const tr = document.createElement('tr');

        res.headers.forEach(h => {
          const td = document.createElement('td');
          const val = row[h];

          td.textContent = val ?? '-';

          // Highlight STATUS
          if (h.toUpperCase().includes('STATUS')) {
            td.classList.add(
              val === 'PENDING' ? 'text-warning' : 'text-success'
            );
          }

          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

    } catch (e) {
      tbody.innerHTML =
        `<tr><td colspan="10" class="text-danger text-center">
          Gagal memuat data tabel
        </td></tr>`;
    } finally {
      delete window[cb];
      script.remove();
    }
  };

  const script = document.createElement('script');
  script.src = `${API_URL}?type=table&callback=${cb}`;
  document.body.appendChild(script);
}
