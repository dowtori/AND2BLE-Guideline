(function () {
  var lang = document.documentElement.lang === 'ko' ? 'ko' : 'ja';

  var T = {
    ja: {
      copied: 'コピーしました！',
      copiedAll: 'ハッシュタグ3つをコピーしました！',
      copyFail: 'コピーできませんでした。長押しでコピーしてください',
      before: function (d) { return '投稿開始まであと ' + d + ' 日'; },
      startsToday: '本日から投稿スタート！',
      during: function (d) { return d === 0 ? '本日が投稿最終日です！' : '投稿期間中・締切まであと ' + d + ' 日'; },
      ended: '投稿期間は終了しました',
      okTitle: '認定例', ngTitle: '非認定例',
      open: '原本リンクを開く ↗',
      play: '▶ 動画で見る', back: '写真に戻る',
      progress: function (a, b) { return a === b ? '準備OK！投稿しましょう 🎉' : a + ' / ' + b + ' 完了'; }
    },
    ko: {
      copied: '복사했어요!',
      copiedAll: '해시태그 3개를 복사했어요!',
      copyFail: '복사하지 못했어요. 길게 눌러서 복사해 주세요',
      before: function (d) { return '업로드 시작까지 ' + d + '일'; },
      startsToday: '오늘부터 업로드 시작!',
      during: function (d) { return d === 0 ? '오늘이 업로드 마지막 날이에요!' : '업로드 기간 · 마감까지 ' + d + '일'; },
      ended: '업로드 기간이 끝났어요',
      okTitle: '인정 예시', ngTitle: '미인정 예시',
      open: '원본 링크 열기 ↗',
      play: '▶ 영상으로 보기', back: '사진으로 돌아가기',
      progress: function (a, b) { return a === b ? '준비 완료! 업로드해 주세요 🎉' : a + ' / ' + b + ' 완료'; }
    }
  }[lang];

  /* ---------- toast ---------- */
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  var toastTimer;
  function showToast(msg, bad) {
    toast.textContent = msg;
    toast.style.background = bad ? 'var(--ng)' : '';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  /* ---------- copy ---------- */
  function copyText(text, msg) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      showToast(ok ? msg : T.copyFail, !ok);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { showToast(msg); }, fallback);
    } else { fallback(); }
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-copy]');
    if (!el) return;
    copyText(el.getAttribute('data-copy'), el.hasAttribute('data-copy-all') ? T.copiedAll : T.copied);
  });

  /* ---------- status (JST) ---------- */
  var status = document.querySelector('.status');
  if (status) {
    var DAY = 86400000;
    var start = Date.UTC(2026, 10, 8, 15, 0, 0);   // 2026-11-09 00:00 JST
    var end = Date.UTC(2026, 10, 15, 15, 0, 0);    // 2026-11-16 00:00 JST
    var now = Date.now();
    var todayJst = Math.floor((now + 9 * 3600000) / DAY);
    var label, cls;
    if (now < start) {
      var d = Math.floor((start + 9 * 3600000) / DAY) - todayJst;
      label = d <= 0 ? T.startsToday : T.before(d); cls = 'before';
    } else if (now < end) {
      label = T.during(Math.floor((end + 9 * 3600000) / DAY) - 1 - todayJst); cls = 'during';
    } else { label = T.ended; cls = 'ended'; }
    status.classList.add(cls);
    status.querySelector('.txt').textContent = label;
  }

  /* ---------- tabs ---------- */
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var btns = tabs.querySelectorAll('button');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) {
          var on = x === b;
          x.setAttribute('aria-selected', on);
          document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
        });
      });
    });
  });

  /* ---------- checklist ---------- */
  var list = document.querySelector('.checklist');
  if (list) {
    var boxes = list.querySelectorAll('input[type=checkbox]');
    var prog = document.querySelector('.progress');
    function upd() {
      var n = 0; boxes.forEach(function (b) { if (b.checked) n++; });
      prog.querySelector('.track i').style.width = (n / boxes.length * 100) + '%';
      prog.querySelector('.txt').textContent = T.progress(n, boxes.length);
      prog.classList.toggle('done', n === boxes.length);
    }
    boxes.forEach(function (b) { b.addEventListener('change', upd); });
    upd();
  }

  /* ---------- mirroring examples (accordion, lazy iframes) ---------- */
  var EX = {
    ok: [
      { who: '@rhythmyolo', tt: 'https://www.tiktok.com/@rhythmyolo/video/7585450544035056904', ig: 'DSc4W_YgSld' },
      { who: '@ryunosuke.000523', tt: 'https://www.tiktok.com/@ryunosuke.000523/video/7585368004892855559', ig: 'DSbP968j5NG' },
      { who: '@ssayah03', tt: 'https://www.tiktok.com/@ssayah03/video/7584784383089954055', ig: 'DSXMj9RkoBT' }
    ],
    ng: [
      { who: '@yki0308', tt: 'https://www.tiktok.com/@yki0308/video/7582954812061289749', ig: 'DSKfS_AgVuR' },
      { who: '@micchory__', tt: 'https://www.tiktok.com/@micchory__/video/7582896895983586568', ig: 'DSMK2LOk0P6' },
      { who: '@kazumi___', tt: 'https://www.tiktok.com/@kazumi___/video/7583683667055234322', ig: 'DSPiGHTk9gU' }
    ]
  };
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // 썸네일 비교 카드: 예시마다 TikTok · Instagram 대표 이미지를 나란히 보여주고, 누르면 그 자리에서 영상으로 바꾼다.
  function thumbsHtml(kind, i, x) {
    var k = kind + (i + 1);
    return '<figure><img src="images/ex/' + k + '-tt.jpg" alt="TikTok ' + esc(x.who) + '" loading="lazy"><figcaption>TikTok</figcaption></figure>' +
      '<span class="tcard-vs">' + (kind === 'ok' ? '≠' : '=') + '</span>' +
      '<figure><img src="images/ex/' + k + '-ig.jpg" alt="Instagram ' + esc(x.who) + '" loading="lazy"><figcaption>Instagram</figcaption></figure>';
  }
  function videosHtml(x) {
    var id = x.tt.split('/video/')[1];
    return '<div class="tcard-vid"><div class="ex-frame tt"><iframe src="https://www.tiktok.com/player/v1/' + id + '?rel=0" title="TikTok ' + esc(x.who) + '" allow="fullscreen; encrypted-media" allowfullscreen></iframe></div>' +
      '<a class="ex-link" href="' + x.tt + '" target="_blank" rel="noopener">' + T.open + '</a></div>' +
      '<div class="tcard-vid"><div class="ex-frame ig"><iframe src="https://www.instagram.com/reel/' + x.ig + '/embed" title="Instagram ' + esc(x.who) + '" allowfullscreen></iframe></div>' +
      '<a class="ex-link" href="https://www.instagram.com/reels/' + x.ig + '/" target="_blank" rel="noopener">' + T.open + '</a></div>';
  }
  document.querySelectorAll('[data-tcards]').forEach(function (box) {
    var kind = box.getAttribute('data-tcards');
    var title = kind === 'ok' ? T.okTitle : T.ngTitle;
    box.innerHTML = EX[kind].map(function (x, i) {
      return '<div class="tcard ' + kind + '" data-kind="' + kind + '" data-i="' + i + '">' +
        '<div class="tcard-top"><span class="badge ' + kind + '">' + (kind === 'ok' ? '✓ OK' : '✕ NG') + '</span><b>' + title + ' ' + (i + 1) + '</b><small>' + esc(x.who) + '</small></div>' +
        '<div class="tcard-pair">' + thumbsHtml(kind, i, x) + '</div>' +
        '<button type="button" class="tcard-play">' + T.play + '</button></div>';
    }).join('');
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.tcard-play');
    if (!b) return;
    var card = b.closest('.tcard'), kind = card.getAttribute('data-kind'), i = +card.getAttribute('data-i'), x = EX[kind][i];
    var pair = card.querySelector('.tcard-pair');
    var playing = card.classList.toggle('playing');
    pair.innerHTML = playing ? videosHtml(x) : thumbsHtml(kind, i, x);
    b.textContent = playing ? T.back : T.play;
  });

  /* ---------- floating nav: active section ---------- */
  var links = document.querySelectorAll('.fnav a');
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('on'); });
          var a = map[en.target.id]; if (a) a.classList.add('on');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }
})();
