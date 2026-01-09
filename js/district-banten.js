function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const wrapper = document.getElementById('district-banten-wrapper');
  const loading = document.getElementById('loading-overlay');
  const lastUpdateEl = document.getElementById('last-update');

  if (!container || !wrapper) return;

  container.innerHTML = '';
  loading.style.display = 'flex';

  const callbackName = 'jsonp_cb_' + Date.now();

  window[callbackName] = function (res) {
    try {
      const { data, lastUpdate } = res;

      // === FORMAT WAKTU ===
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
        card.className = `badge-card ${isGood(v.BANTEN) ? 'card-good' : 'card-bad'}`;

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

    } catch (e) {
      container.innerHTML =
        '<div class="text-danger">Gagal memuat data</div>';
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
