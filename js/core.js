/* =========================================================
   core.js
   Global utilities for B2B Dashboard
========================================================= */

/* ===================== GLOBAL CONFIG ===================== */
window.APP = {
  API_URL: null
};

/* ===================== SET API ===================== */
function setApiUrl(url) {
  APP.API_URL = url;
}

/* ===================== JSONP HELPER ===================== */
function loadJSONP(url, callbackName, onSuccess, onError) {
  if (!callbackName) {
    callbackName = 'cb_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  }

  const script = document.createElement('script');

  window[callbackName] = function (response) {
    try {
      onSuccess && onSuccess(response);
    } catch (err) {
      console.error('[JSONP callback error]', err);
      onError && onError(err);
    } finally {
      delete window[callbackName];
      script.remove();
    }
  };

  script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;

  script.onerror = () => {
    delete window[callbackName];
    script.remove();
    console.error('[JSONP load failed]');
    onError && onError(new Error('JSONP load error'));
  };

  document.body.appendChild(script);
}

/* ===================== FORMATTER ===================== */
function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value !== 'number') return value;
  return Number.isInteger(value)
    ? value
    : value.toFixed(decimals);
}

/* ===================== LOADING ===================== */
function toggleLoading(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('d-none', !show);
}

/* ===================== SAFE INNERHTML ===================== */
function safeHTML(el, html) {
  if (!el) return;
  el.innerHTML = html;
}

/* ===================== CLEAR ELEMENT ===================== */
function clearEl(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
}

/* ===================== LOG ===================== */
function debugLog(...args) {
  console.log('[B2B]', ...args);
}
