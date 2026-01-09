function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const contentArea = document.getElementById('content-area');

  if (!container) {
    console.error('Container district-banten-row tidak ditemukan');
    return;
  }

  contentArea.classList.add('show-grid');

  // ===== LOADING =====
  container.innerHTML = `
    <div class="loading-wrapper">
      <div class="spinner-border text-light"></div>
      <div class="loading-text">Memuat data District Banten...</div>
    </div>
  `;

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      console.log('DATA API:', data);

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML =
          '<div class="text-warning text-center">Data tidak tersedia</div>';
        return;
      }

      container.innerHTML = '';

      // ===== GROUP PER INDIKATOR =====
      const map = {};

      data.forEach(row => {
        const indikator = row.indikator.trim();

        if (!map[indikator]) {
          map[indikator] = {
            target: Number(row.target),
            banten: null,
            tangerang: null
          };
        }

        if (row.witel === 'BANTEN') {
          map[indikator].banten = Number(row.ach);
        }

        if (row.witel === 'TANGERANG') {
          map[indikator].tangerang = Number(row.ach);
        }
      });

      // ===== RENDER CARD =====
      Object.keys(map).forEach(indikator => {
        const d = map[indikator];

        if (d.banten === null || d.tangerang === null) return;

        const lowerBetter = indikator === 'Q Gangguan HSI';

        const isGood = val =>
          lowerBetter ? val <= d.target : val >= d.target;

        const card = document.createElement('div');
        card.className = `badge-card ${
          isGood(d.banten) ? 'card-good' : 'card-bad'
        }`;

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
    })
    .catch(err => {
      console.error('FETCH ERROR:', err);
      container.innerHTML =
        '<div class="text-danger text-center">Gagal memuat data</div>';
    });
}
