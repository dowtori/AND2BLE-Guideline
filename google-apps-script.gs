/**
 * AND2BLE French Kissing 신청 폼 → Google 시트 저장용 Apps Script
 *
 * 저장 위치: 아래 SPREADSHEET_ID 시트
 *   - 기본 모집 페이지(ja.html / ko.html)        → gid=1002 탭
 *   - TikTok 모집 페이지(ja-tt.html / ko-tt.html)   → 'TikTok 모집' 탭
 *   - Instagram 모집 페이지(ja-ig.html / ko-ig.html) → 'Instagram 모집' 탭
 *   TikTok / Instagram 탭은 없으면 첫 신청이 들어올 때 자동으로 만들어진다.
 * (https://docs.google.com/spreadsheets/d/1T1i3U-lNK0yE0dv0L_adKKv5OOw5NY-BT8PGSDDyWYU/edit?gid=1002)
 *
 * 기존 Apps Script 를 그대로 쓰는 경우 (웹 앱 주소가 바뀌지 않음)
 * 1. 기존 Apps Script 편집기에서 내용을 이 코드로 통째로 바꾸고 저장한다.
 * 2. [배포] → [배포 관리] → 연필(수정) → 버전: [새 버전] → [배포]
 *    → 다른 시트에 접근하는 권한을 새로 묻으면 허용한다.
 */

var SPREADSHEET_ID = '1T1i3U-lNK0yE0dv0L_adKKv5OOw5NY-BT8PGSDDyWYU';
var SHEET_GID = 1002; // 응답이 들어올 탭 (주소의 gid 값)
// 플랫폼 전용 모집 페이지에서 온 신청이 들어갈 탭 이름 (페이지가 보내는 source 값 기준)
var SOURCE_TABS = { tt: 'TikTok 모집', ig: 'Instagram 모집' };
var HEADERS = ['제출 시각', '언어', '이름', '이메일', '연락처', '참여 방식', 'TikTok', 'Instagram', '업로드 예정일', '기프트카드'];

function getTargetSheet_(source) {
  var name = SOURCE_TABS[source];
  if (name) {
    var ss0 = SpreadsheetApp.openById(SPREADSHEET_ID);
    return ss0.getSheetByName(name) || ss0.insertSheet(name);
  }
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === SHEET_GID) return sheets[i];
  }
  throw new Error('gid ' + SHEET_GID + ' 탭을 찾을 수 없습니다.');
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var sh = getTargetSheet_(d.source);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
    }
    sh.appendRow([
      // 스크립트 시간대 설정과 상관없이 항상 한국 시간으로 기록한다.
      Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
      safe(d.lang),
      safe(d.name),
      safe(d.email),
      "'" + String(d.contact || ''), // 전화번호 앞자리 0 이 사라지지 않게 텍스트로 저장
      safe(d.platformLabel || d.platform),
      safe(d.tiktok),
      safe(d.instagram),
      safe(d.postDate),
      safe(d.giftCard)
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 편집기에서 한 번 실행해 보면 권한 허용 + 탭 연결을 미리 확인할 수 있다.
function testTarget() {
  Logger.log('기본 탭: ' + getTargetSheet_().getName());
  Logger.log('TikTok 탭: ' + getTargetSheet_('tt').getName());
  Logger.log('Instagram 탭: ' + getTargetSheet_('ig').getName());
}

// [한 번만 실행] 2~24행(11/5 오후 6시 이전에 들어온 23건)의 제출 시각이 9시간 앞서 있어서,
// 화면에 보이는 시각에서 정확히 9시간을 뺀다. 시간대 설정에 기대지 않고 글자 그대로 계산한다.
function fixTimesMinus9() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('KST_FIXED_2') === 'yes') { Logger.log('이미 고쳤어요. 다시 실행하지 않아요.'); return; }
  var FIRST = 2, LAST = 24;
  var sh = getTargetSheet_();
  if (String(sh.getRange(LAST, 3).getValue()).indexOf('すーの') === -1) {
    Logger.log('24행이 すーの 가 아니라서 멈췄어요. 행이 바뀌었으면 알려주세요.'); return;
  }
  var range = sh.getRange(FIRST, 1, LAST - FIRST + 1, 1);
  var shown = range.getDisplayValues();
  var out = [], bad = [];
  for (var i = 0; i < shown.length; i++) {
    var m = String(shown[i][0]).match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?\s*(오전|오후)\s*(\d{1,2}):(\d{2}):(\d{2})/);
    if (!m) { bad.push(FIRST + i); out.push([shown[i][0]]); continue; }
    var h = +m[5] % 12 + (m[4] === '오후' ? 12 : 0);
    var t = Date.UTC(+m[1], +m[2] - 1, +m[3], h, +m[6], +m[7]) - 9 * 3600 * 1000;
    var d = new Date(t), p = function (x) { return ('0' + x).slice(-2); };
    out.push([d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) + ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds())]);
  }
  if (bad.length) { Logger.log('읽지 못한 행: ' + bad.join(', ') + ' → 아무것도 바꾸지 않았어요.'); return; }
  range.setValues(out);
  props.setProperty('KST_FIXED_2', 'yes');
  Logger.log(out.length + '건을 9시간 앞당겼어요. 첫 줄: ' + out[0][0] + ' / 마지막 줄: ' + out[out.length - 1][0]);
}

// 수식으로 해석될 수 있는 값(=, +, -, @ 로 시작)은 텍스트로 저장한다.
function safe(v) {
  v = String(v == null ? '' : v).slice(0, 500);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
