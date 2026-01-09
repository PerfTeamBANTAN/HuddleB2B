function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const contentArea = document.getElementById('content-area');
  if (!container) return;

  contentArea.classList.add('show-grid');

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = '';

      // GROUP DATA PER INDIKATOR
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

      Object.keys(map).forEach(indikator => {
        const d = map[indikator];

        // RULE KPI
        const lowerBetter = indikator === 'Q Gangguan HSI';

        const isGood = val =>
          lowerBetter ? val <= d.target : val >= d.target;

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
              <span class="banten">Banten</span>
              <span class="${isGood(d.banten) ? 'value-good' : 'value-bad'}">
                ${d.banten.toFixed(2)}
              </span>
            </div>
            <div class="row-item">
              <span class="tangerang">Tangerang</span>
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
      console.error(err);
      container.innerHTML =
        '<div class="text-danger text-center">Gagal memuat data</div>';
    });
}
