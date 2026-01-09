function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const wrapper = document.getElementById('district-banten-wrapper');

  if (!container || !wrapper) return;

  container.innerHTML = '';

  // === LAST UPDATE ELEMENT ===
  let lastUpdateEl = document.querySelector('.last-update');
  if (!lastUpdateEl) {
    lastUpdateEl = document.createElement('div');
    lastUpdateEl.className = 'last-update';
    lastUpdateEl.textContent = 'Last update: -';
    wrapper.prepend(lastUpdateEl);
  }

  const callbackName = 'jsonp_cb_' + Date.now();

  window[callbackName] = function (res) {
    try {
      console.log('DATA API:', res);

      const { data, lastUpdate } = res;

      // ===== FORMAT WAKTU INDONESIA =====
      const d = new Date(lastUpdate);
      lastUpdateEl.textContent =
        'Last update: ' +
        d.toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

      // ===== GROUP DATA =====
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

      // ===== RENDER CARD =====
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

    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="text-danger">Gagal memuat data</div>';
    } finally {
      delete window[callbackName];
      script.remove();
    }
  };

  const script = document.createElement('script');
  script.src = `${API_URL}?callback=${callbackName}`;
  document.body.appendChild(script);
}
