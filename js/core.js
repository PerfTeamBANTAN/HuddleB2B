/* =========================================================
   core.js
========================================================= */

window.APP = {
  API_URL: ''
};

/* ===================== SET API ===================== */
function setApiUrl(url) {
  if (!url) {
    console.error('[API] URL kosong');
    return;
  }
  APP.API_URL = url;
}

/* ===================== GET API ===================== */
function getApiUrl() {
  if (!APP.API_URL) {
    console.error('[API] API_URL belum di-set');
    return null;
  }
  return APP.API_URL;
}

/* ===================== JSONP ===================== */
function loadJSONP(url, onSuccess, onError) {
  const cb = 'cb_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const script = document.createElement('script');

  window[cb] = res => {
    try {
      onSuccess && onSuccess(res);
    } catch (e) {
      console.error('[JSONP CALLBACK ERROR]', e);
      onError && onError(e);
    } finally {
      delete window[cb];
      script.remove();
    }
  };

  script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + cb;

  script.onerror = () => {
    delete window[cb];
    script.remove();
    console.error('[JSONP LOAD ERROR]');
    onError && onError(new Error('JSONP Load Failed'));
  };

  document.body.appendChild(script);
}

/* ===================== LOADING ===================== */
function toggleLoading(id, show) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('d-none', !show);
}
