// 상세 가이드: 플랫폼 선택(TikTok / Instagram / 둘 다)에 따라 필요한 설명만 보여 준다.
(function () {
  var KEY = 'and2ble_plat';
  var radios = document.querySelectorAll('input[name="plat"]');

  function apply(v) {
    if (v) document.body.setAttribute('data-plat', v);
    document.dispatchEvent(new Event('platchange'));
  }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}

  radios.forEach(function (r) {
    if (r.value === saved) r.checked = true;
    r.addEventListener('change', function () {
      try { localStorage.setItem(KEY, r.value); } catch (e) {}
      apply(r.value);
    });
  });
  if (saved) apply(saved);
})();

// 업로드 방법: 두 곳 다 보일 때는 TikTok / Instagram 탭으로 나눠서 하나씩 보여 준다.
(function () {
  var up = document.getElementById('upload');
  if (!up) return;
  var btns = up.querySelectorAll('[data-up]');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      up.setAttribute('data-tab', b.getAttribute('data-up'));
      btns.forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    });
  });
})();
