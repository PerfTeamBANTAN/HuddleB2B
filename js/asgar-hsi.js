function doGet(e) {
  const type = String(e?.parameter?.type || 'kpi');
  const cb = e?.parameter?.callback;

  const sh = SpreadsheetApp
    .openById('SPREADSHEET_ID_KAMU')
    .getSheetByName('B2B');

  if (!sh) {
    return output({ error: 'Sheet B2B not found' }, cb);
  }

  const values = sh.getDataRange().getValues();
  const header = values.shift();

  const idx = h => header.indexOf(h);

  let result;

  if (type === 'kpi') {
    result = {
      data: [
        { label: 'TOTAL DATA', value: values.length }
      ],
      lastUpdate: new Date().toISOString()
    };
  }

  else if (type === 'table') {
    result = {
      data: values.map(r => ({
        STO: r[idx('STO')],
        WITEL: r[idx('WITEL')],
        HI: r[idx('HI')]
      }))
    };
  }

  else if (type === 'asgar_table') {
    result = {
      data: values.map(r => ({
        STO: r[idx('STO')],
        KPI: r[idx('KPI')]
      }))
    };
  }

  return output(result, cb);
}

function output(obj, cb) {
  if (cb) {
    return ContentService
      .createTextOutput(`${cb}(${JSON.stringify(obj)})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
