// 상세 가이드: 플랫폼 선택(TikTok / Instagram / 둘 다)에 따라 필요한 설명만 보여 준다.
// 선택 카드 · 상단 고정 바 · 체크리스트 위 선택지 세 곳이 서로 연동된다.
(function () {
  var KEY = 'and2ble_plat';
  var inputs = document.querySelectorAll('[data-plat-input]');

  var ja = document.documentElement.lang !== 'ko';
  var NAME = ja ? { tt: 'TikTok', ig: 'Instagram', both: 'TikTok・Instagram 両方' }
                : { tt: 'TikTok', ig: 'Instagram', both: 'TikTok·Instagram 둘 다' };
  var MSG = ja ? {
    none: '選ぶと、下の説明がその投稿先用に切り替わります',
    now: function (n) { return '<b>' + n + '用の説明に切り替えました</b>必要な説明だけを下に表示しています'; },
    toast: function (n) { return n + '用の説明に切り替えました'; }
  } : {
    none: '고르면 아래 설명이 그 플랫폼에 맞게 바뀌어요',
    now: function (n) { return '<b>' + n + ' 기준 안내로 바뀌었어요</b>필요한 내용만 아래에 보여 드려요'; },
    toast: function (n) { return n + ' 기준 안내로 바뀌었어요'; }
  };
  var now = document.querySelector('.pick-now');
  var toast = document.querySelector('.toast');
  var toastTimer;

  function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  // 선택이 바뀐 걸 확실히 보여 준다: 상태 문구, 카드 반짝임, 하단 알림
  function feedback(v) {
    replay(now, 'flash');
    document.querySelectorAll('.wrap > section.card, .start-reward').forEach(function (el) {
      if (el.offsetParent !== null) replay(el, 'plat-swap');
    });
    if (toast) {
      toast.textContent = MSG.toast(NAME[v]);
      toast.style.background = '';
      toast.classList.add('plat', 'show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('show', 'plat'); }, 2000);
    }
  }

  function apply(v, save) {
    if (!v) return;
    document.body.setAttribute('data-plat', v);
    inputs.forEach(function (i) { i.checked = i.value === v; });
    if (now) now.innerHTML = MSG.now(NAME[v]);
    if (save) { try { localStorage.setItem(KEY, v); } catch (e) {} feedback(v); }
    document.dispatchEvent(new Event('platchange'));
  }
  if (now) now.textContent = MSG.none;

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
