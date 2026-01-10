function openTiketHIModal(API_URL, sto, witel) {
  const title = document.getElementById('modalTiketHITitle');
  const head = document.getElementById('tiket-hi-head');
  const body = document.getElementById('tiket-hi-body');

  title.textContent = `Detail Tiket HI – ${witel} / ${sto}`;
  head.innerHTML = '';
  body.innerHTML = `<tr><td>Loading...</td></tr>`;

  const cols = [
    'Incident','Summary','Report Date','Service Type','WITEL',
    'LABOR TEKNISI','TTR (Report Date s/d Resolved Date)',
    'Flag GAUL','Old Tiket'
  ];

  const cb = 'jsonp_tiket_' + Date.now();

  loadJSONP(
    `${API_URL}?type=tiket_hi_detail&sto=${encodeURIComponent(sto)}&callback=${cb}`,
    cb,
    res => {
      head.innerHTML = cols.map(c => `<th>${c}</th>`).join('');
      body.innerHTML = res.data?.length
        ? res.data.map(r =>
            `<tr>${cols.map(c => `<td>${r[c] ?? '-'}</td>`).join('')}</tr>`
          ).join('')
        : `<tr><td colspan="${cols.length}" class="text-center">Tidak ada data</td></tr>`;
    }
  );

  new bootstrap.Modal(document.getElementById('modalTiketHI')).show();
}
