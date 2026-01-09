function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const wrapper = document.getElementById('district-banten-wrapper');

  if (!container || !wrapper) return;

  container.innerHTML = `
    <div class="loading-wrapper">
      <div class="spinner-border text-light"></div>
      <div class="loading-text">Memuat data...</div>
    </div>
  `;

  const callbackName = 'cbDistrictBanten_' + Date.now();

  window[callbackName] = function (res) {
    try {
      const data = res.data;
      const lastUpdate = new Date(res.lastUpdate);

      const formatted =
        lastUpdate.toLocaleDateString('id-ID') +
        ' ' +
        lastUpdate.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });

      // LAST UPDATE
      let lastEl = document.getElementById('last-update');
      if (!lastEl) {
        lastEl = document.createElement('div');
        lastEl.id = 'last-update';
        lastEl.className = 'text-light mb-2';
        lastEl.style.fontSize = '13px';
        wrapper.insertBefore(lastEl, wrapper.children[1]);
      }
      lastEl.innerHTML = `<i class="fa fa-clock"></i> Last update: ${formatted}`;

      container.innerHTML = '';

      const map = {};

      data.forEach(r => {
        if (!map[r.indikator]) {
          map[r.indikator] = {
            target: r.target,
            banten: null,
            tangerang: null
          };
        }
        if (r.witel === 'BANTEN') map[r.indikator].banten = r.ach;
        if (r.witel === 'TANGERANG') map[r.indikator].tangerang = r.ach;
      });

      Object.keys(map).forEach(indikator => {
        const d = map[indikator];
        if (d.banten == null || d.tangerang == null) return;

        const lowerBetter = indikator === 'Q Gangguan HSI';
        const isGood = v => (lowerBetter ? v <= d.target : v >= d.target);

        const card = document.createElement('div');
        card.className = `badge-card ${isGood(d.banten) ? 'card-good' : 'card-bad'}`;

        card.innerHTML = `
          <div class="badge-card-header">${indikator}</div>
          <div class="badge-card-body">
            <div class="row-item">
              <span>Target</span>
              <span>${d.target.toFixed(2)}</span>
            </div>
            <div class="row-item">
              <span>Banten</span>
              <span class="${isGood(d.banten) ? 'value-good' : 'value-bad'}">
                ${d.banten.toFixed(2)}
              </span>
            </div>
            <div class="row-item">
              <span>Tangerang</span>
              <span class="${isGood(d.tangerang) ? 'value-good' : 'value-bad'}">
                ${d.tangerang.toFixed(2)}
              </span>
            </div>
          </div>
        `;

        container.appendChild(card);
      });

    } catch (e) {
      container.innerHTML =
        '<div class="text-danger text-center">Data tidak tersedia</div>';
    } finally {
      delete window[callbackName];
    }
  };

  const script = document.createElement('script');
  script.src = `${API_URL}?callback=${callbackName}`;
  document.body.appendChild(script);
}
