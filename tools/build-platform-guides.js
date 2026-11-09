// guide-ja.html / guide-ko.html 을 바탕으로 플랫폼 전용 가이드(TikTok만 / Instagram만)를 만든다.
// 상세 가이드를 고친 뒤에는 이 스크립트를 다시 실행하면 전용 가이드도 같이 맞춰진다.
//   node tools/build-platform-guides.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const L = {
  ja: {
    name: { tt: 'TikTok', ig: 'Instagram' },
    title: p => `AND2BLE ${p} 投稿ガイド`,
    ogTitle: p => `AND2BLE『French Kissing』${p} 投稿ガイド`,
    release: p => `${p} 投稿ガイド`,
    only: p => `<b>${p} に投稿する方向けのガイドです</b>${p} に必要な説明だけをまとめています。`,
    navLabel: 'やること',
    navFrom: '投稿SNS'
  },
  ko: {
    name: { tt: 'TikTok', ig: 'Instagram' },
    title: p => `AND2BLE ${p} 업로드 가이드`,
    ogTitle: p => `AND2BLE『French Kissing』${p} 업로드 가이드`,
    release: p => `${p} 업로드 가이드`,
    only: p => `<b>${p}에 올리는 분을 위한 가이드예요</b>${p}에 필요한 내용만 모았어요.`,
    navLabel: '할 일',
    navFrom: '내 플랫폼'
  }
};

function must(s, re, what) { if (!re.test(s)) throw new Error('not found: ' + what); }

for (const lang of ['ja', 'ko']) {
  const src = fs.readFileSync(path.join(root, `guide-${lang}.html`), 'utf8');
  const t = L[lang];
  for (const plat of ['tt', 'ig']) {
    const p = t.name[plat];
    let s = src;
    const rep = (re, to, what) => { must(s, re, what); s = s.replace(re, to); };

    rep(/<title>[^<]*<\/title>/, `<title>${t.title(p)}</title>`, 'title');
    rep(/(<meta property="og:title" content=")[^"]*/, `$1${t.ogTitle(p)}`, 'og:title');
    rep(/(<meta property="og:url" content="[^"]*\/)guide-(ja|ko)\.html/, `$1guide-${plat}-$2.html`, 'og:url');
    rep(/<body class="guide">/, `<body class="guide" data-plat="${plat}" data-plat-lock>`, 'body');
    rep(/<div class="plat-sticky" id="platSticky">[\s\S]*?<\/div><\/div>\n/, '', 'sticky bar');
    rep(/href="guide-ja\.html" data-lang/, `href="guide-${plat}-ja.html" data-lang`, 'lang ja');
    rep(/href="guide-ko\.html" data-lang/, `href="guide-${plat}-ko.html" data-lang`, 'lang ko');
    rep(/(<div class="release">)[^<]*(<\/div>)/, `$1${t.release(p)}$2`, 'release');
    rep(/  <section class="picker" id="pick">[\s\S]*?<\/section>\n/, `  <p class="plat-only ${plat}">${t.only(p)}</p>\n`, 'picker');
    rep(/    <div class="picker-inline" id="pick2">[\s\S]*?<\/div>\n    <\/div>\n/, '', 'checklist picker');
    rep(new RegExp('<a href="#pick">(<svg[^]*?</svg>)' + t.navFrom + '</a>'), `<a href="#start">$1${t.navLabel}</a>`, 'fnav');

    fs.writeFileSync(path.join(root, `guide-${plat}-${lang}.html`), s);
    console.log('wrote', `guide-${plat}-${lang}.html`);
  }
}
