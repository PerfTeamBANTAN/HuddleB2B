function parseNumber(val) {
  if (!val) return null;
  const n = Number(String(val).replace('%', '').replace(',', '.'));
  return isNaN(n) ? null : n;
}

function getCardStatus(target, banten, tangerang) {
  const t = parseNumber(target);
  const b = parseNumber(banten);
  const tg = parseNumber(tangerang);

  if (t === null || (b === null && tg === null)) return 'card-warning';

  if ((b !== null && b < t) || (tg !== null && tg < t)) {
    return 'card-danger';
  }

  return 'card-success';
}

function initDistrictBanten(apiUrl) {
  const row = document.getElementById('district-banten-row');
  if (!row) return;

  row.innerHTML = `
    <div class="text-center text-light w-100">
      <div class="spinner-border mb-2"></div>
      <div>Loading data District BANTEN...</div>
    </div>
  `;

  fetch(apiUrl)
    .then(r => r.json())
    .then(rows => {
      const indikatorMap = {};

      rows.forEach(r => {
        const ind = String(r.indikator || '').trim();
        const witel = String(r.witel || '').trim().toUpperCase();
        if (!ind || !witel) return;

        if (!indikatorMap[ind]) {
          indikatorMap[ind] = { target: r.target, banten: null, tangerang: null };
        }

        if (witel === 'BANTEN') indikatorMap[ind].banten = r.ach;
        if (witel === 'TANGERANG') indikatorMap[ind].tangerang = r.ach;
      });

      row.innerHTML = '';

      Object.entries(indikatorMap).forEach(([indikator, d]) => {
        const statusClass = getCardStatus(d.target, d.banten, d.tangerang);

        const card = document.createElement('div');
        card.innerHTML = `
          <div class="badge-card ${statusClass}">
            <div class="badge-card-header">${indikator}</div>
            <div class="badge-card-body">
              <div class="row-item target">
                <span>Target</span><span>${d.target ?? '-'}</span>
              </div>
              <div class="row-item banten">
                <span>Banten</span><span>${d.banten ?? '-'}</span>
              </div>
              <div class="row-item tangerang">
                <span>Tangerang</span><span>${d.tangerang ?? '-'}</span>
              </div>
            </div>
          </div>
        `;

        row.appendChild(card);
      });
    })
    .catch(() => {
      row.innerHTML = `<div class="text-danger">Gagal load data.</div>`;
    });
}
