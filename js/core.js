/* ================= JSONP HELPER ================= */
function loadJSONP(url, callbackName, onSuccess, onError) {
  window[callbackName] = function (res) {
    try {
      onSuccess(res);
    } catch (e) {
      console.error(e);
      onError && onError(e);
    } finally {
      delete window[callbackName];
      script.remove();
    }
  };

  const script = document.createElement('script');
  script.src = url;
  script.onerror = () => {
    onError && onError(new Error('JSONP load failed'));
    delete window[callbackName];
    script.remove();
  };

  document.body.appendChild(script);
}

/* ================= FORMATTER ================= */
function formatNumber(val, decimals = 2) {
  if (typeof val !== 'number') return val ?? '-';
  return Number.isInteger(val) ? val : val.toFixed(decimals);
}

/* ================= SAFE COMPARE ================= */
function toStr(v) {
  return v == null ? '' : String(v).trim();
}
