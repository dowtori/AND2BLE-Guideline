// 상세 가이드: 플랫폼 선택(TikTok / Instagram / 둘 다)에 따라 필요한 설명만 보여 준다.
// 선택 카드 · 상단 고정 바 · 체크리스트 위 선택지 세 곳이 서로 연동된다.
(function () {
  var KEY = 'and2ble_plat';
  var inputs = document.querySelectorAll('[data-plat-input]');

  function apply(v, save) {
    if (!v) return;
    document.body.setAttribute('data-plat', v);
    inputs.forEach(function (i) { i.checked = i.value === v; });
    if (save) { try { localStorage.setItem(KEY, v); } catch (e) {} }
    document.dispatchEvent(new Event('platchange'));
  }

  inputs.forEach(function (i) {
    i.addEventListener('change', function () { if (i.checked) apply(i.value, true); });
  });

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved) apply(saved, false);

  // 상단 고정 바: 원래 선택 카드와 체크리스트 위 선택지가 둘 다 화면 밖일 때만 보인다.
  var bar = document.getElementById('platSticky');
  var watch = [document.getElementById('pick'), document.getElementById('pick2')].filter(Boolean);
  if (bar && watch.length && 'IntersectionObserver' in window) {
    var seen = {};
    var pastFirst = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        seen[en.target.id] = en.isIntersecting;
        if (en.target.id === 'pick') pastFirst = !en.isIntersecting && en.boundingClientRect.top < 0;
      });
      var anyVisible = watch.some(function (el) { return seen[el.id]; });
      bar.classList.toggle('show', pastFirst && !anyVisible);
    });
    watch.forEach(function (el) { io.observe(el); });
  }
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
