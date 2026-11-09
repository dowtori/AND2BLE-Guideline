// ja.html / ko.html(간단 가이드 + 신청 페이지)을 바탕으로 플랫폼 전용 페이지를 만든다.
//   ja-tt.html, ja-ig.html, ko-tt.html, ko-ig.html
// ja.html / ko.html 을 고친 뒤에는 이 스크립트를 다시 실행하면 전용 페이지도 같이 맞춰진다.
//   node tools/build-platform-pages.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const L = {
  ja: {
    name: { tt: 'TikTok', ig: 'Instagram' },
    title: p => `AND2BLE Dance Challenge｜${p}`,
    ogTitle: p => `AND2BLE『French Kissing』ダンスチャレンジ｜${p}`,
    ogDesc: p => `参加ガイド・投稿期間 11/9〜11/15・${p}`,
    where: { tt: 'TikTok', ig: 'Instagram リール' },
    reward: '¥5,000 相当',
    rewardLead: p => `${p} に投稿すると、下のリワードを受け取れます。`,
    only: p => `<b>${p} に投稿する方向けのページです</b>`
  },
  ko: {
    name: { tt: 'TikTok', ig: 'Instagram' },
    title: p => `AND2BLE Dance Challenge | ${p}`,
    ogTitle: p => `AND2BLE『French Kissing』댄스 챌린지 | ${p}`,
    ogDesc: p => `참여 가이드 · 업로드 기간 11/9 ~ 11/15 · ${p}`,
    where: { tt: 'TikTok', ig: 'Instagram 릴스' },
    reward: '¥5,000 상당',
    rewardLead: p => `${p}에 업로드하면 아래 리워드를 받을 수 있어요.`,
    only: p => `<b>${p}에 올리는 분을 위한 페이지예요</b>`
  }
};

const VAL = { tt: 'tiktok', ig: 'instagram' };

for (const lang of ['ja', 'ko']) {
  const src = fs.readFileSync(path.join(root, `${lang}.html`), 'utf8').split('\r\n').join('\n');
  const t = L[lang];
  for (const plat of ['tt', 'ig']) {
    const p = t.name[plat];
    let s = src;
    const rep = (re, to, what) => {
      if (!re.test(s)) throw new Error(`${lang}-${plat}: not found: ${what}`);
      s = s.replace(re, to);
    };

    // head
    rep(/<title>[^<]*<\/title>/, `<title>${t.title(p)}</title>`, 'title');
    rep(/(<meta property="og:title" content=")[^"]*/, `$1${t.ogTitle(p)}`, 'og:title');
    rep(/(<meta property="og:description" content=")[^"]*/, `$1${t.ogDesc(p)}`, 'og:description');
    rep(/(<meta property="og:url" content="[^"]*\/)(ja|ko)\.html/, `$1$2-${plat}.html`, 'og:url');
    rep(/<link rel="stylesheet" href="guide\.css\?v=[^"]*">/, '<link rel="stylesheet" href="guide.css?v=20261109b">', 'guide.css');

    // 언어 전환은 같은 플랫폼 페이지로
    rep(/href="ja\.html" data-lang/, `href="ja-${plat}.html" data-lang`, 'lang ja');
    rep(/href="ko\.html" data-lang/, `href="ko-${plat}.html" data-lang`, 'lang ko');

    // 히어로 아래: 어떤 플랫폼용 페이지인지 표시
    rep(/(<\/header>\n)/, `$1\n    <p class="plat-only ${plat}">${t.only(p)}</p>\n`, 'hero end');

    // 요약: 플랫폼 / 리워드
    let row = 0;
    rep(/<div class="sum-row"><dt>([^<]*)<\/dt><dd>[\s\S]*?<\/dd><\/div>/g, (m, dt) => {
      row++;
      if (row === 2) return `<div class="sum-row"><dt>${dt}</dt><dd>${t.where[plat]}</dd></div>`;
      if (row === 3) return `<div class="sum-row"><dt>${dt}</dt><dd>${t.reward}</dd></div>`;
      return m;
    }, 'summary rows');


    // 리워드: 해당 플랫폼 한 줄만
    rep(/(<section class="card" id="reward">[\s\S]*?<p class="lead">)[^<]*(<\/p>)/, `$1${t.rewardLead(p)}$2`, 'reward lead');
    rep(/<div class="reward-list">[\s\S]*?<span class="red-note">[\s\S]*?<\/span>\n    <\/div>/, m => {
      const rows = m.match(/      <div class="reward[^"]*">[\s\S]*?\n      <\/div>/g);
      const keep = rows[plat === 'tt' ? 0 : 1].replace(/<span class="n">\d<\/span>/, '<span class="n">✓</span>');
      return `<div class="reward-list">\n${keep}\n    </div>`;
    }, 'reward list');

    // 미러링 안내 섹션은 전용 페이지에도 그대로 둔다

    // 신청 폼: 시트에서 TikTok / Instagram 탭으로 나눠 저장되도록 출처 표시
    rep(/<form id="applyForm"/, `<form id="applyForm" data-source="${plat}"`, 'form source');

    // 신청 폼: 참여 방식은 이 플랫폼 하나로 고정
    rep(/            <label class="choice"><input type="radio" name="platform" value="(tiktok|instagram|both)">[\s\S]*?<\/label>\n/g, (m, v) => {
      if (v !== VAL[plat]) return '';
      return m.replace(`value="${v}">`, `value="${v}" checked>`);
    }, 'platform choices');
    rep(/          <div class="both-note" data-both-note hidden>[\s\S]*?<\/div>\n/, '', 'both note');

    // 동의 항목: 해시태그는 공통, Instagram 음원 항목은 Instagram만, 미러링 항목은 삭제
    rep(/(<label class="agree">[\s\S]*?<ul>\n)([\s\S]*?)(            <\/ul>)/, (m, a, items, z) => {
      const li = items.match(/              <li>[\s\S]*?<\/li>\n/g);
      const keep = plat === 'tt' ? [li[0]] : [li[0], li[1]];
      return a + keep.join('') + z;
    }, 'agree items');

    fs.writeFileSync(path.join(root, `${lang}-${plat}.html`), s);
    console.log('wrote', `${lang}-${plat}.html`);
  }
}
