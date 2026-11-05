/**
 * AND2BLE French Kissing 신청 폼 → Google 시트 저장용 Apps Script
 *
 * 저장 위치: 아래 SPREADSHEET_ID 시트의 gid=1002 탭
 * (https://docs.google.com/spreadsheets/d/1T1i3U-lNK0yE0dv0L_adKKv5OOw5NY-BT8PGSDDyWYU/edit?gid=1002)
 *
 * 기존 Apps Script 를 그대로 쓰는 경우 (웹 앱 주소가 바뀌지 않음)
 * 1. 기존 Apps Script 편집기에서 내용을 이 코드로 통째로 바꾸고 저장한다.
 * 2. [배포] → [배포 관리] → 연필(수정) → 버전: [새 버전] → [배포]
 *    → 다른 시트에 접근하는 권한을 새로 묻으면 허용한다.
 */

var SPREADSHEET_ID = '1T1i3U-lNK0yE0dv0L_adKKv5OOw5NY-BT8PGSDDyWYU';
var SHEET_GID = 1002; // 응답이 들어올 탭 (주소의 gid 값)
var HEADERS = ['제출 시각', '언어', '이름', '이메일', '연락처', '참여 방식', 'TikTok', 'Instagram', '업로드 예정일', '기프트카드'];

function getTargetSheet_() {
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
    var sh = getTargetSheet_();
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
  var sh = getTargetSheet_();
  Logger.log('연결된 탭: ' + sh.getName());
}

// [한 번만 실행] 이미 들어와 있는 응답의 제출 시각을 한국 시간(+9시간)으로 고친다.
// 두 번 실행되지 않도록 실행 기록을 남긴다.
function fixPastTimes() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('KST_FIXED') === 'yes') {
    Logger.log('이미 고쳤습니다. 다시 실행하지 않아요.');
    return;
  }
  var sh = getTargetSheet_();
  var last = sh.getLastRow();
  if (last < 2) { Logger.log('고칠 응답이 없어요.'); return; }
  var range = sh.getRange(2, 1, last - 1, 1);
  var vals = range.getValues();
  var n = 0;
  for (var i = 0; i < vals.length; i++) {
    var v = vals[i][0];
    if (v instanceof Date) {
      vals[i][0] = Utilities.formatDate(new Date(v.getTime() + 9 * 3600 * 1000), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
      n++;
    }
  }
  range.setValues(vals);
  props.setProperty('KST_FIXED', 'yes');
  Logger.log(n + '개 응답의 시각을 한국 시간으로 고쳤어요.');
}

// 수식으로 해석될 수 있는 값(=, +, -, @ 로 시작)은 텍스트로 저장한다.
function safe(v) {
  v = String(v == null ? '' : v).slice(0, 500);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
