function f2(val) {
  const n = Number(val);
  return isNaN(n) ? '-' : n.toFixed(2);
}

function initDistrictBanten(apiUrl) {
  const row = document.getElementById('district-banten-row');
  if (!row) return;

  row.innerHTML = `
    <div class="text-light text-center w-100">
      <div class="spinner-border mb-2"></div>
      <div>Loading data District BANTEN...</div>
    </div>
  `;

  fetch(apiUrl)
    .then(r => r.json())
    .then(rows => {
      const map = {};

      rows.forEach(r => {
        const ind = String(r.indikator || '').trim();
        const witel = String(r.witel || '').trim().toUpperCase();
        if (!ind || !witel) return;

        if (!map[ind]) {
          map[ind] = { target: r.target, banten: '-', tangerang: '-' };
        }

        if (witel === 'BANTEN') map[ind].banten = f2(r.ach);
        if (witel === 'TANGERANG') map[ind].tangerang = f2(r.ach);
      });

      row.innerHTML = '';

      Object.keys(map).forEach(ind => {
        const d = map[ind];

        row.innerHTML += `
          <div class="badge-card">
            <div class="badge-card-header">${ind}</div>
            <div class="badge-card-body">
              <div class="row-item target">
                <span>Target</span><span>${f2(d.target)}</span>
              </div>
              <div class="row-item banten">
                <span>Banten</span><span>${d.banten}</span>
              </div>
              <div class="row-item tangerang">
                <span>Tangerang</span><span>${d.tangerang}</span>
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch(() => {
      row.inner means `Data gagal dimuat`;
    });
}
