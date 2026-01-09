function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const contentArea = document.getElementById('content-area');
  if (!container) return;

  contentArea.classList.add('show-grid');

  // helper convert angka Indonesia → JS number
  const toNumber = val =>
    Number(String(val).replace(',', '.')) || 0;

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = '';

      const grouped = {};

      data.forEach(row => {
        const indikator = row.indikator.trim();
        const witel = row.witel.trim().toLowerCase();

        if (!grouped[indikator]) grouped[indikator] = {};
        grouped[indikator][witel] = row;
      });

      Object.keys(grouped).forEach(indikator => {
        const rows = grouped[indikator];

        const target    = toNumber(rows['banten']?.target);
        const banten    = toNumber(rows['banten']?.ach);
        const tangerang = toNumber(rows['tangerang']?.ach);

        // RULE KPI
        const isLowerBetter = indikator.toLowerCase().includes('gangguan');

        const isGood = val =>
          isLowerBetter ? val <= target : val >= target;

        const valueClass = val =>
          isGood(val) ? 'value-good' : 'value-bad';

        const cardClass =
          isGood(banten) ? 'card-good' : 'card-bad';

        const card = document.createElement('div');
        card.className = `badge-card ${cardClass}`;

        card.innerHTML = `
          <div class="badge-card-header">${indikator}</div>
          <div class="badge-card-body">
            <div class="row-item">
              <span class="target">Target</span>
              <span>${target.toFixed(2)}</span>
            </div>
            <div class="row-item">
              <span class="banten">Banten</span>
              <span class="${valueClass(banten)}">${banten.toFixed(2)}</span>
            </div>
            <div class="row-item">
              <span class="tangerang">Tangerang</span>
              <span class="${valueClass(tangerang)}">${tangerang.toFixed(2)}</span>
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
