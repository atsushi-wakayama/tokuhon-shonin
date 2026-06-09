/**
 * ============================================================
 * テスト結果記録 生成スクリプト
 *
 * 実行方法：node scripts/generate_test_result.js
 * 出力先：scripts/テスト結果記録_管理・申請機能_v1.0.xlsx
 * ============================================================
 */

const ExcelJS = require('exceljs');
const path = require('path');

const workbook = new ExcelJS.Workbook();

// ============================================================
// カラー定数
// ============================================================
const COLOR = {
  headerBg:   '1F4E79',  // 濃い青（タイトル行）
  headerFont: 'FFFFFF',  // 白
  subBg:      'D5E8F0',  // 水色（サブヘッダー）
  highBg:     'FFE0E0',  // 薄い赤（優先度：高）
  midBg:      'FFF5CC',  // 薄い黄（優先度：中）
  lowBg:      'E8F5E9',  // 薄い緑（優先度：低）
  okBg:       'E2EFDA',  // 薄い緑（OK）
  ngBg:       'FFDCE1',  // 薄い赤（NG）
  titleBg:    '1F4E79',  // タイトル背景
  noteBg:     'FFF2CC',  // 薄い黄（注意事項）
  border:     'BFBFBF',  // 枠線
};

function fill(argb) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function border() {
  const b = { style: 'thin', color: { argb: COLOR.border } };
  return { top: b, bottom: b, left: b, right: b };
}

// ============================================================
// テストケースデータ（32件）
// ============================================================

const testCases = [
  // S13（9件）
  { id: 'TC-S13-01', screen: 'S13', type: '正常系', perspective: 'スポット新規追加画面を開ける', priority: '高' },
  { id: 'TC-S13-02', screen: 'S13', type: '正常系', perspective: '必須項目（スポット名・都道府県）のみ入力して追加できる', priority: '高' },
  { id: 'TC-S13-03', screen: 'S13', type: '正常系', perspective: '全項目を入力して追加できる', priority: '中' },
  { id: 'TC-S13-04', screen: 'S13', type: '異常系', perspective: '碑の名称を未入力で追加するとエラーになる', priority: '高' },
  { id: 'TC-S13-05', screen: 'S13', type: '異常系', perspective: '都道府県を未選択で追加するとエラーになる', priority: '高' },
  { id: 'TC-S13-06', screen: 'S13', type: '正常系', perspective: '入力途中で戻るボタンをタップすると確認ダイアログが表示される', priority: '中' },
  { id: 'TC-S13-07', screen: 'S13', type: '異常系', perspective: '未ログインでアクセスするとログイン画面にリダイレクトされる', priority: '高' },
  { id: 'TC-S13-08', screen: 'S13', type: '異常系', perspective: '管理者でないユーザーがアクセスすると権限エラー画面が表示される', priority: '高' },
  { id: 'TC-S13-09', screen: 'S13', type: '正常系', perspective: '何も入力せずに戻るボタンをタップすると確認ダイアログなしで管理ページへ戻る', priority: '低' },
  // S12（10件）
  { id: 'TC-S12-01', screen: 'S12', type: '正常系', perspective: 'スポット申請フォームの初期表示を確認できること（GPS成功時）', priority: '高' },
  { id: 'TC-S12-02', screen: 'S12', type: '正常系', perspective: 'GPS取得失敗時に地図ピッカーが表示され、地図タップで位置を指定できること', priority: '高' },
  { id: 'TC-S12-03', screen: 'S12', type: '正常系', perspective: '必要項目を入力して申請が完了できること（テスト申請碑A）', priority: '高' },
  { id: 'TC-S12-04', screen: 'S12', type: '正常系', perspective: 'スポット一覧から申請フォームを開き、申請が完了できること（テスト申請碑B）', priority: '高' },
  { id: 'TC-S12-05', screen: 'S12', type: '異常系', perspective: '未ログイン状態でアクセスするとログイン画面にリダイレクトされること', priority: '中' },
  { id: 'TC-S12-06', screen: 'S12', type: '異常系', perspective: 'スポット名未入力で送信するとエラーメッセージが表示されること', priority: '高' },
  { id: 'TC-S12-07', screen: 'S12', type: '異常系', perspective: '場所未指定のまま送信するとエラーメッセージが表示されること', priority: '高' },
  { id: 'TC-S12-08', screen: 'S12', type: '正常系', perspective: '入力途中で戻るボタンをタップすると破棄確認ダイアログが表示されること', priority: '高' },
  { id: 'TC-S12-09', screen: 'S12', type: '正常系', perspective: '破棄確認ダイアログで「破棄して戻る」をタップすると元のページに戻ること', priority: '高' },
  { id: 'TC-S12-10', screen: 'S12', type: '正常系', perspective: '何も入力せずに戻るボタンをタップするとダイアログなしで元のページに戻ること', priority: '中' },
  // S11（6件）
  { id: 'TC-S11-01', screen: 'S11', type: '正常系', perspective: '編集画面を開くとテスト碑の情報が各フィールドに表示されること', priority: '高' },
  { id: 'TC-S11-02', screen: 'S11', type: '正常系', perspective: '各項目を変更して保存すると管理ページに戻り、変更が保存されること', priority: '高' },
  { id: 'TC-S11-03', screen: 'S11', type: '異常系', perspective: 'スポット名を空欄にして保存するとブラウザの標準バリデーションメッセージが表示されること', priority: '中' },
  { id: 'TC-S11-04', screen: 'S11', type: '正常系', perspective: '変更後に戻るボタンをタップすると破棄確認ダイアログが表示されること', priority: '高' },
  { id: 'TC-S11-05', screen: 'S11', type: '正常系', perspective: '破棄確認ダイアログで「破棄して戻る」をタップすると管理ページに戻ること', priority: '高' },
  { id: 'TC-S11-06', screen: 'S11', type: '正常系', perspective: '何も変更せずに戻るボタンをタップするとダイアログなしで管理ページに戻ること', priority: '中' },
  // S10（7件）
  { id: 'TC-S10-01', screen: 'S10', type: '正常系', perspective: '管理ページの初期表示を確認できること', priority: '高' },
  { id: 'TC-S10-02', screen: 'S10', type: '正常系', perspective: '承認待ちタブに申請2件が表示されること', priority: '高' },
  { id: 'TC-S10-03', screen: 'S10', type: '正常系', perspective: '申請を却下すると承認待ちタブから消えること（テスト申請碑A）', priority: '高' },
  { id: 'TC-S10-04', screen: 'S10', type: '正常系', perspective: '申請を承認すると承認待ちタブから消え、スポット管理タブの「承認待ち」バッジが消えること（テスト申請碑B）', priority: '高' },
  { id: 'TC-S10-05', screen: 'S10', type: '正常系', perspective: 'スポットを削除すると一覧から消え、DBからも削除されること（テスト碑（修正））', priority: '高' },
  { id: 'TC-S10-06', screen: 'S10', type: '異常系', perspective: '未ログイン状態でアクセスするとログイン画面にリダイレクトされること', priority: '中' },
  { id: 'TC-S10-07', screen: 'S10', type: '異常系', perspective: '一般ユーザーでアクセスすると権限エラー画面が表示されること', priority: '中' },
];

// ============================================================
// タブ1：テスト結果一覧
// ============================================================

const sheet1 = workbook.addWorksheet('テスト結果一覧');

// タイトル行
sheet1.mergeCells('A1:I1');
const titleCell1 = sheet1.getCell('A1');
titleCell1.value = '🏯  徳本上人 名号碑スタンプラリーアプリ　テスト結果記録（管理・申請機能 追加分）v1.0';
titleCell1.font = { name: 'Yu Gothic', bold: true, size: 13, color: { argb: COLOR.headerFont } };
titleCell1.fill = fill(COLOR.titleBg);
titleCell1.alignment = { vertical: 'middle', horizontal: 'left' };
sheet1.getRow(1).height = 28;

// 情報行
sheet1.mergeCells('A2:I2');
const infoCell = sheet1.getCell('A2');
infoCell.value = 'テスト実施日：　　　　　　　　実施環境：iOS Safari（スマートフォン）/ Chrome（Android・PC）　　URL：https://tokuhon-stamp-rally.vercel.app/';
infoCell.font = { name: 'Yu Gothic', size: 10 };
infoCell.fill = fill('F2F2F2');

// 記入方法行
sheet1.mergeCells('A3:I3');
const ruleCell = sheet1.getCell('A3');
ruleCell.value = '【結果の記入方法】　✅ OK（期待通り）　　✗ NG（期待と異なる）　　□ 未実施';
ruleCell.font = { name: 'Yu Gothic', size: 10 };
ruleCell.fill = fill('FFFBE6');

// ヘッダー行
const headers = ['テストID', '画面', '種別', 'テスト観点（要約）', '優先度', '結果', 'エビデンスファイル名', '実施日', '備考・バグ内容'];
const headerRow = sheet1.getRow(4);
headers.forEach(function(h, i) {
  var cell = headerRow.getCell(i + 1);
  cell.value = h;
  cell.font = { name: 'Yu Gothic', bold: true, size: 10, color: { argb: COLOR.headerFont } };
  cell.fill = fill(COLOR.headerBg);
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border = border();
});
headerRow.height = 22;

// カラム幅
sheet1.getColumn(1).width = 14;   // テストID
sheet1.getColumn(2).width = 8;    // 画面
sheet1.getColumn(3).width = 10;   // 種別
sheet1.getColumn(4).width = 48;   // テスト観点
sheet1.getColumn(5).width = 9;    // 優先度
sheet1.getColumn(6).width = 10;   // 結果
sheet1.getColumn(7).width = 28;   // エビデンス
sheet1.getColumn(8).width = 12;   // 実施日
sheet1.getColumn(9).width = 30;   // 備考

// データ行
var prevScreen = '';
testCases.forEach(function(tc, i) {
  var row = sheet1.getRow(i + 5);
  row.height = 18;

  // 画面区切り線（前の画面と変わったとき）
  if (tc.screen !== prevScreen && i > 0) {
    for (var col = 1; col <= 9; col++) {
      sheet1.getRow(i + 5).getCell(col).border = {
        top: { style: 'medium', color: { argb: '1F4E79' } },
        bottom: { style: 'thin', color: { argb: COLOR.border } },
        left: { style: 'thin', color: { argb: COLOR.border } },
        right: { style: 'thin', color: { argb: COLOR.border } }
      };
    }
  }
  prevScreen = tc.screen;

  // 優先度の背景色
  var priorityBg = tc.priority === '高' ? COLOR.highBg : tc.priority === '中' ? COLOR.midBg : COLOR.lowBg;

  var cells = [tc.id, tc.screen, tc.type, tc.perspective, tc.priority, '', '', '', ''];
  cells.forEach(function(val, j) {
    var cell = row.getCell(j + 1);
    cell.value = val;
    cell.font = { name: 'Yu Gothic', size: 10 };
    cell.border = border();
    cell.alignment = { vertical: 'middle', wrapText: j === 3 };
    if (j === 4) {
      cell.fill = fill(priorityBg);
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });
});

// 合計行
var totalRow = sheet1.getRow(testCases.length + 5);
sheet1.mergeCells('A' + (testCases.length + 5) + ':E' + (testCases.length + 5));
var totalCell = totalRow.getCell(1);
totalCell.value = '合計：' + testCases.length + '件　（S13:9件 / S12:10件 / S11:6件 / S10:7件）';
totalCell.font = { name: 'Yu Gothic', bold: true, size: 10, color: { argb: COLOR.headerFont } };
totalCell.fill = fill(COLOR.headerBg);
totalCell.alignment = { vertical: 'middle', horizontal: 'center' };

// ============================================================
// タブ2：バグ一覧
// ============================================================

const sheet2 = workbook.addWorksheet('バグ一覧');

// タイトル
sheet2.mergeCells('A1:H1');
var bugTitle = sheet2.getCell('A1');
bugTitle.value = '🐛  バグ一覧';
bugTitle.font = { name: 'Yu Gothic', bold: true, size: 13, color: { argb: COLOR.headerFont } };
bugTitle.fill = fill('C00000');
bugTitle.alignment = { vertical: 'middle', horizontal: 'left' };
sheet2.getRow(1).height = 28;

// ヘッダー
var bugHeaders = ['バグID', '発見テストID', '画面', 'バグ内容（何が起きたか）', '期待動作', '優先度', '対応状況', '備考'];
var bugHeaderRow = sheet2.getRow(2);
bugHeaders.forEach(function(h, i) {
  var cell = bugHeaderRow.getCell(i + 1);
  cell.value = h;
  cell.font = { name: 'Yu Gothic', bold: true, size: 10, color: { argb: COLOR.headerFont } };
  cell.fill = fill('C00000');
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border = border();
});
bugHeaderRow.height = 22;

sheet2.getColumn(1).width = 10;
sheet2.getColumn(2).width = 14;
sheet2.getColumn(3).width = 8;
sheet2.getColumn(4).width = 38;
sheet2.getColumn(5).width = 30;
sheet2.getColumn(6).width = 9;
sheet2.getColumn(7).width = 12;
sheet2.getColumn(8).width = 20;

// 空行を10行用意
for (var r = 3; r <= 12; r++) {
  var br = sheet2.getRow(r);
  br.height = 18;
  for (var c = 1; c <= 8; c++) {
    br.getCell(c).border = border();
    br.getCell(c).font = { name: 'Yu Gothic', size: 10 };
  }
}

// ============================================================
// タブ3：実施メモ
// ============================================================

const sheet3 = workbook.addWorksheet('実施メモ');

// タイトル
sheet3.mergeCells('A1:B1');
var memoTitle = sheet3.getCell('A1');
memoTitle.value = '📋  テスト実施メモ・引き継ぎ情報';
memoTitle.font = { name: 'Yu Gothic', bold: true, size: 13, color: { argb: COLOR.headerFont } };
memoTitle.fill = fill(COLOR.titleBg);
memoTitle.alignment = { vertical: 'middle', horizontal: 'left' };
sheet3.getRow(1).height = 28;

sheet3.getColumn(1).width = 28;
sheet3.getColumn(2).width = 55;

var memoData = [
  ['テスト実施日', ''],
  ['テスト対象URL', 'https://tokuhon-stamp-rally.vercel.app/'],
  ['実施環境', 'iOS Safari（スマートフォン）'],
  ['テスト実行順序', 'S13 → S12 → S11 → S10'],
  ['テストアカウント（一般）', 'register@example.com / test1234'],
  ['テストアカウント（管理者）', 'is_admin = true のアカウント（別途確認）'],
  ['', ''],
  ['⚠️ 重要な注意点', ''],
  ['テスト実行順序について', '必ず S13 → S12 → S11 → S10 の順に実施すること。前のテストで作ったデータを次のテストで使うため。'],
  ['テスト後の後片付け', 'テスト仕様書 4-2「テスト後のクリーンアップ」を参照すること'],
  ['', ''],
  ['📁 エビデンス保存先', ''],
  ['フォルダ構成', 'テストエビデンス/TC-SXX-XX/01_画面名.PNG'],
];

memoData.forEach(function(row, i) {
  var r = sheet3.getRow(i + 2);
  r.height = row[0].startsWith('⚠️') || row[0].startsWith('📁') ? 22 : 18;

  var c1 = r.getCell(1);
  var c2 = r.getCell(2);

  c1.value = row[0];
  c2.value = row[1];

  c1.font = { name: 'Yu Gothic', bold: true, size: 10 };
  c2.font = { name: 'Yu Gothic', size: 10 };

  if (row[0].startsWith('⚠️') || row[0].startsWith('📁')) {
    c1.fill = fill(COLOR.noteBg);
    c2.fill = fill(COLOR.noteBg);
    sheet3.mergeCells('A' + (i + 2) + ':B' + (i + 2));
    c1.font = { name: 'Yu Gothic', bold: true, size: 10, color: { argb: '7F4F00' } };
  } else if (row[0] !== '') {
    c1.fill = fill(COLOR.subBg);
    c1.alignment = { vertical: 'middle' };
    c2.alignment = { vertical: 'middle', wrapText: true };
    c1.border = border();
    c2.border = border();
  }
});

// ============================================================
// ファイル出力
// ============================================================

var outputPath = path.join('scripts', 'テスト結果記録_管理・申請機能_v1.0.xlsx');
workbook.xlsx.writeFile(outputPath).then(function() {
  console.log('✅ ' + outputPath + ' を生成しました');
  console.log('   テストケース合計：' + testCases.length + '件');
}).catch(function(err) {
  console.error('❌ エラーが発生しました:', err);
  process.exit(1);
});
