(function () {

  function format2(val) {
    var n = Number(val);
    if (isNaN(n)) return '-';
    return n.toFixed(2);
  }

  window.initDistrictBanten = function (apiUrl) {
    var row = document.getElementById('district-banten-row');
    if (!row) {
      console.error('district-banten-row not found');
      return;
    }

    row.innerHTML = `
      <div class="text-light text-center w-100">
        <div class="spinner-border mb-2"></div>
        <div>Loading data District BANTEN...</div>
      </div>
    `;

    fetch(apiUrl)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {

        var map = {};

        data.forEach(function (r) {
          var indikator = String(r.indikator || '').trim();
          var witel = String(r.witel || '').trim().toUpperCase();

          if (!indikator || !witel) return;

          if (!map[indikator]) {
            map[indikator] = {
              target: r.target,
              banten: '-',
              tangerang: '-'
            };
          }

          if (witel === 'BANTEN') {
            map[indikator].banten = format2(r.ach);
          }

          if (witel === 'TANGERANG') {
            map[indikator].tangerang = format2(r.ach);
          }
        });

        row.innerHTML = '';

        Object.keys(map).forEach(function (indikator) {
          var d = map[indikator];

          var card = `
            <div class="badge-card">
              <div class="badge-card-header">${indikator}</div>
              <div class="badge-card-body">
                <div class="row-item target">
                  <span>Target</span><span>${format2(d.target)}</span>
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

          row.insertAdjacentHTML('beforeend', card);
        });

      })
      .catch(function (err) {
        console.error(err);
        row.innerHTML = '<div class="text-danger">Gagal load data</div>';
      });
  };

})();
