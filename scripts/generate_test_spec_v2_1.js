/**
 * ============================================================
 * テスト仕様書 v2.1 生成スクリプト
 *
 * 実行方法：node scripts/generate_test_spec_v2_1.js
 * 出力先：scripts/テスト仕様書_v2.1.docx
 * ============================================================
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign, PageBreak,
  heading1, heading2, bodyText, noteText, warnText, spacer,
  simpleTable, prepTable,
  HEADER_COLOR, SUBHEADER_COLOR,
  headerCell, subHeaderCell, normalCell,
  borders, cellMargins,
  createDocument, fs
} = require('./test_spec_design');

const FONT = "Yu Gothic";

// ============================================================
// リスト形式テストケース用ヘルパー関数
// ============================================================

/** テストケースID見出し */
function tcHeading(text) {
  return new Paragraph({
    spacing: { before: 300, after: 80 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: "2E5F8A", space: 4 } },
    indent: { left: 160 },
    children: [new TextRun({ text, bold: true, size: 20, font: FONT, color: "2E5F8A" })]
  });
}

/** ラベル付きテキスト行（「画面：S13 スポット新規追加」など） */
function fieldLine(label, value) {
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    children: [
      new TextRun({ text: `${label}：`, bold: true, size: 18, font: FONT }),
      new TextRun({ text: value || "", size: 18, font: FONT })
    ]
  });
}

/** ラベルのみ（手順・確認項目などのセクション見出し） */
function sectionLabel(label) {
  return new Paragraph({
    spacing: { before: 60, after: 20 },
    children: [new TextRun({ text: `${label}：`, bold: true, size: 18, font: FONT })]
  });
}

/** インデントしたリスト項目（level: 0=1段、1=2段） */
function listItem(text, level) {
  const lv = level || 0;
  return new Paragraph({
    spacing: { before: 15, after: 15 },
    indent: { left: lv === 0 ? 320 : 640 },
    children: [new TextRun({ text, size: lv === 0 ? 18 : 16, font: FONT, color: lv === 1 ? "444444" : "000000" })]
  });
}

/** 優先度行（高=赤、中=橙、低=緑） */
function priorityLine(value) {
  const color = value === "高" ? "CC0000" : value === "中" ? "AA6600" : "006600";
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    children: [
      new TextRun({ text: "優先度：", bold: true, size: 18, font: FONT }),
      new TextRun({ text: value, bold: true, size: 18, font: FONT, color })
    ]
  });
}

/** テストケース区切り線 */
function tcSeparator() {
  return new Paragraph({
    spacing: { before: 100, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 1 } },
    children: [new TextRun("")]
  });
}

/**
 * テストケース段落を生成する
 *
 * tc: {
 *   id, screen, type, perspective, precondition,
 *   steps: string[],
 *   checks: (string | { text: string, subSteps: string[] })[],
 *   priority
 * }
 */
function tcParagraphs(tc) {
  const result = [];

  result.push(tcHeading(tc.id));
  result.push(fieldLine("画面", tc.screen));
  result.push(fieldLine("種別", tc.type));
  result.push(fieldLine("テスト観点", tc.perspective));
  result.push(fieldLine("事前条件", tc.precondition));

  result.push(sectionLabel("手順"));
  tc.steps.forEach(function(step) { result.push(listItem(step, 0)); });

  result.push(sectionLabel("確認項目"));
  tc.checks.forEach(function(check) {
    if (typeof check === "string") {
      result.push(listItem(check, 0));
    } else {
      result.push(listItem(check.text, 0));
      if (check.subSteps) {
        check.subSteps.forEach(function(sub) { result.push(listItem(sub, 1)); });
      }
    }
  });

  result.push(priorityLine(tc.priority));
  result.push(tcSeparator());

  return result;
}

/** ページブレーク */
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ============================================================
// テストケースデータ定義
// ============================================================

// ----- S13: スポット新規追加（9件） -----

var s13Cases = [
  {
    id: "TC-S13-01",
    screen: "S13 スポット新規追加",
    type: "正常系",
    perspective: "スポット新規追加画面を開ける",
    precondition: "管理者アカウント（is_admin = true）でログイン済み",
    steps: [
      "① 管理ページ（/admin）→「新規追加」ボタンをタップして開く"
    ],
    checks: [
      "① ヘッダーに「スポット新規追加」が表示されること",
      "② 「管理ページに戻る」ボタンが表示されること",
      "③ 「スポット名 *」入力欄が表示され、空欄であること",
      "④ 「都道府県 *」ドロップダウンが表示され、「選択してください」の状態であること",
      "⑤ 「所在地」入力欄が表示され、空欄であること",
      "⑥ 「エリア」ドロップダウンが表示され、「未設定」の状態であること",
      "⑦ 「解説テキスト」テキストエリアが表示され、空欄であること",
      "⑧ 「アクセス情報」テキストエリアが表示され、空欄であること",
      "⑨ 「現地確認済み」ドロップダウンが表示され、「未確認」の状態であること",
      "⑩ 「追加する」ボタンが表示されること"
    ],
    priority: "高"
  },
  {
    id: "TC-S13-02",
    screen: "S13 スポット新規追加",
    type: "正常系",
    perspective: "必須項目（スポット名・都道府県）のみ入力して追加できる",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / スポット新規追加画面（S13）を開いている",
    steps: [
      "① スポット名に「テスト碑（必須）」と入力する",
      "② 都道府県で「東京都」を選択する",
      "③ 「追加する」ボタンをタップする"
    ],
    checks: [
      "① 管理ページ（/admin）に戻ること",
      {
        text: "② Supabase で新しいスポットが追加されていること（以下の手順で確認）",
        subSteps: [
          "1. ブラウザで https://supabase.com を開く",
          "2. 「Sign In」をクリックしてログインする",
          "3. 該当プロジェクトをクリックして開く",
          "4. 左メニューの「Table Editor」をクリックする",
          "5. テーブル一覧から「monuments」をクリックする",
          "6. 「テスト碑（必須）」の行が追加されていることを確認する",
          "7. 該当行の status カラムが「approved」になっていることを確認する"
        ]
      }
    ],
    priority: "高"
  },
  {
    id: "TC-S13-03",
    screen: "S13 スポット新規追加",
    type: "正常系",
    perspective: "全項目を入力して追加できる",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / スポット新規追加画面（S13）を開いている",
    steps: [
      "① スポット名に「テスト碑」と入力する",
      "② 都道府県で「東京都」を選択する",
      "③ 所在地に「テスト所在地1番地」と入力する",
      "④ エリアで「関東・東京」を選択する",
      "⑤ 解説テキストに「テスト解説」と入力する",
      "⑥ アクセス情報に「テストアクセス」と入力する",
      "⑦ 現地確認済みで「確認済み」を選択する",
      "⑧ 「追加する」ボタンをタップする"
    ],
    checks: [
      "① 管理ページ（/admin）に戻ること",
      "② スポット管理タブの一覧に「テスト碑」が表示されること",
      {
        text: "③ Supabase で全項目が正しく保存されていること（以下の手順で確認）",
        subSteps: [
          "1. ブラウザで https://supabase.com を開く",
          "2. 「Sign In」をクリックしてログインする",
          "3. 該当プロジェクトをクリックして開く",
          "4. 左メニューの「Table Editor」をクリックする",
          "5. テーブル一覧から「monuments」をクリックする",
          "6. 「テスト碑」の行をクリックして詳細を確認する",
          "7. 各カラム（name・prefecture・address・area_id・description・access_info・is_verified）に入力した値が保存されていることを確認する"
        ]
      }
    ],
    priority: "中"
  },
  {
    id: "TC-S13-04",
    screen: "S13 スポット新規追加",
    type: "異常系",
    perspective: "碑の名称を未入力で追加するとエラーになる",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / スポット新規追加画面（S13）を開いている",
    steps: [
      "① 全ての入力欄が空欄・デフォルト状態であることを確認する",
      "② 「追加する」ボタンをタップする"
    ],
    checks: [
      "① ブラウザの標準バリデーションメッセージが表示されること（例：「このフィールドを入力してください」）",
      "② 画面遷移が発生しないこと"
    ],
    priority: "高"
  },
  {
    id: "TC-S13-05",
    screen: "S13 スポット新規追加",
    type: "異常系",
    perspective: "都道府県を未選択で追加するとエラーになる",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / スポット新規追加画面（S13）を開いている",
    steps: [
      "① 碑の名称に「テスト碑（必須）」と入力する",
      "② 都道府県を「選択してください」のまま変更しない",
      "③ 「追加する」ボタンをタップする"
    ],
    checks: [
      "① ブラウザの標準バリデーションメッセージが表示されること（例：「このフィールドを選択してください」）",
      "② 画面遷移が発生しないこと"
    ],
    priority: "高"
  },
  {
    id: "TC-S13-06",
    screen: "S13 スポット新規追加",
    type: "正常系",
    perspective: "入力途中で戻るボタンをタップすると確認ダイアログが表示される",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / スポット新規追加画面（S13）を開いて何か入力している",
    steps: [
      "① スポット名に「テスト碑」と入力する（追加はしない）",
      "② 「管理ページに戻る」ボタンをタップする",
      "③ 確認ダイアログで「破棄して戻る」をタップする"
    ],
    checks: [
      "① 手順②で「入力内容が保存されていません。破棄して戻りますか？」ダイアログが表示されること",
      "② 「入力に戻る」をタップするとダイアログが閉じて入力を続けられること",
      "③ 「破棄して戻る」をタップすると管理ページ（/admin）に戻ること"
    ],
    priority: "中"
  },
  {
    id: "TC-S13-07",
    screen: "S13 スポット新規追加",
    type: "異常系",
    perspective: "未ログインでアクセスするとログイン画面にリダイレクトされる",
    precondition: "ログアウト済み",
    steps: [
      "① ブラウザで /admin/monuments/new に直接アクセスする"
    ],
    checks: [
      "① /login にリダイレクトされること"
    ],
    priority: "高"
  },
  {
    id: "TC-S13-08",
    screen: "S13 スポット新規追加",
    type: "異常系",
    perspective: "管理者でないユーザーがアクセスすると権限エラー画面が表示される",
    precondition: "一般ユーザーアカウント（register@example.com / test1234）でログイン済み",
    steps: [
      "① ブラウザで /admin/monuments/new に直接アクセスする"
    ],
    checks: [
      "① 「このページにはアクセス権限がありません」が表示されること",
      "② 「OK」をタップするとマップ画面（/map）に遷移すること"
    ],
    priority: "高"
  },
  {
    id: "TC-S13-09",
    screen: "S13 スポット新規追加",
    type: "正常系",
    perspective: "何も入力せずに戻るボタンをタップすると確認ダイアログなしで管理ページへ戻る",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / スポット新規追加画面（S13）を開いて何も入力していない",
    steps: [
      "① 「管理ページに戻る」ボタンをタップする"
    ],
    checks: [
      "① 確認ダイアログが表示されないこと",
      "② 管理ページ（/admin）に戻ること"
    ],
    priority: "低"
  }
];

// ----- S12: スポット申請フォーム（10件） -----

var s12Cases = [
  {
    id: "TC-S12-01",
    screen: "S12 スポット申請フォーム",
    type: "正常系",
    perspective: "スポット申請フォームの初期表示を確認できること（GPS成功時）",
    precondition: "register@example.com / test1234 でログイン済み / GPS（位置情報）の使用を「許可」した状態",
    steps: [
      "① マップ画面の「スポットを申請」ボタンをタップする",
      "② GPS取得が完了するまで待つ"
    ],
    checks: [
      "① 「マップに戻る」ボタンが表示されること",
      "② 「新しいスポットを申請」の見出しが表示されること",
      "③ 「スポット名 *」フィールドが空欄で表示されること",
      "④ 現在地欄に「現在地を取得しました」が表示されること",
      "⑤ 「地図上で指定する」リンクが表示されること",
      "⑥ 都道府県が「選択してください」で表示されること",
      "⑦ 所在地フィールドが空欄で表示されること",
      "⑧ エリアが「選択してください」で表示されること",
      "⑨ 解説フィールドが空欄で表示されること",
      "⑩ アクセス情報フィールドが空欄で表示されること",
      "⑪ 「カメラで撮影」「写真を選択」ボタンが表示されること",
      "⑫ 「申請する」ボタンが表示されること"
    ],
    priority: "高"
  },
  {
    id: "TC-S12-02",
    screen: "S12 スポット申請フォーム",
    type: "正常系",
    perspective: "GPS取得失敗時に地図ピッカーが表示され、地図タップで位置を指定できること",
    precondition: "register@example.com / test1234 でログイン済み / GPS（位置情報）の使用を「拒否」した状態",
    steps: [
      "① マップ画面の「スポットを申請」ボタンをタップする",
      "② Google Mapsが表示されるまで待つ",
      "③ 地図上の任意の場所をタップする"
    ],
    checks: [
      "① 「現在地を取得できませんでした。地図上でスポットの場所をタップして指定してください。」のエラーメッセージが表示されること",
      "② Google Mapsが自動的に表示されること",
      "③ 地図の下に「地図をタップすると位置が決まります」が表示されること",
      "④ 地図をタップすると赤いマーカーが立つこと",
      "⑤ 地図の下に「選択済み（緯度, 経度）」が表示されること"
    ],
    priority: "高"
  },
  {
    id: "TC-S12-03",
    screen: "S12 スポット申請フォーム",
    type: "正常系",
    perspective: "必要項目を入力して申請が完了できること（テスト申請碑A）",
    precondition: "register@example.com / test1234 でログイン済み / GPS（位置情報）の使用を「許可」した状態",
    steps: [
      "① マップ画面の「スポットを申請」をタップする",
      "② GPS取得が完了するまで待つ",
      "③ スポット名に「テスト申請碑A」を入力する",
      "④ 都道府県で「大阪府」を選択する",
      "⑤ 所在地に「テスト所在地2番地」を入力する",
      "⑥ 「申請する」をタップする"
    ],
    checks: [
      "① 「申請を受け付けました」が表示されること",
      "② 「管理者の確認後、スポットとして公開されます。」が表示されること",
      "③ 「戻る」ボタンが表示されること",
      "④ 「戻る」をタップするとマップ画面に戻ること"
    ],
    priority: "高"
  },
  {
    id: "TC-S12-04",
    screen: "S12 スポット申請フォーム",
    type: "正常系",
    perspective: "スポット一覧から申請フォームを開き、申請が完了できること（テスト申請碑B）",
    precondition: "register@example.com / test1234 でログイン済み / GPS（位置情報）の使用を「許可」した状態",
    steps: [
      "① スポット一覧画面の「新しいスポットを申請する」をタップする",
      "② GPS取得が完了するまで待つ",
      "③ スポット名に「テスト申請碑B」を入力する",
      "④ 都道府県で「和歌山県」を選択する",
      "⑤ 所在地に「テスト所在地3番地」を入力する",
      "⑥ 「申請する」をタップする"
    ],
    checks: [
      "① 「申請を受け付けました」が表示されること",
      "② 「管理者の確認後、スポットとして公開されます。」が表示されること",
      "③ 「戻る」ボタンが表示されること",
      "④ 「戻る」をタップするとスポット一覧画面に戻ること"
    ],
    priority: "高"
  },
  {
    id: "TC-S12-05",
    screen: "S12 スポット申請フォーム",
    type: "異常系",
    perspective: "未ログイン状態でアクセスするとログイン画面にリダイレクトされること",
    precondition: "ログアウト済み（未ログイン状態）",
    steps: [
      "① トップ画面の「ログインせずに地図を見る」をタップしてマップ画面に遷移する",
      "② マップ画面の「スポットを申請」をタップする"
    ],
    checks: [
      "① ログイン画面（/login）にリダイレクトされること"
    ],
    priority: "中"
  },
  {
    id: "TC-S12-06",
    screen: "S12 スポット申請フォーム",
    type: "異常系",
    perspective: "スポット名未入力で送信するとエラーメッセージが表示されること",
    precondition: "register@example.com / test1234 でログイン済み / GPS（位置情報）の使用を「許可」した状態",
    steps: [
      "① マップ画面の「スポットを申請」をタップする",
      "② GPS取得が完了するまで待つ",
      "③ スポット名を空欄のまま「申請する」をタップする"
    ],
    checks: [
      "① 「スポット名を入力してください」のエラーメッセージが表示されること"
    ],
    priority: "高"
  },
  {
    id: "TC-S12-07",
    screen: "S12 スポット申請フォーム",
    type: "異常系",
    perspective: "場所未指定のまま送信するとエラーメッセージが表示されること",
    precondition: "register@example.com / test1234 でログイン済み / GPS（位置情報）の使用を「拒否」した状態",
    steps: [
      "① マップ画面の「スポットを申請」をタップする",
      "② スポット名に「テスト」と入力する",
      "③ 地図上でタップせずに「申請する」をタップする"
    ],
    checks: [
      "① 「場所を指定してください（GPS取得か地図上でタップ）」のエラーメッセージが表示されること"
    ],
    priority: "高"
  },
  {
    id: "TC-S12-08",
    screen: "S12 スポット申請フォーム",
    type: "正常系",
    perspective: "入力途中で戻るボタンをタップすると破棄確認ダイアログが表示されること",
    precondition: "register@example.com / test1234 でログイン済み / GPS（位置情報）の使用を「許可」した状態",
    steps: [
      "① マップ画面の「スポットを申請」をタップする",
      "② GPS取得が完了するまで待つ",
      "③ スポット名に「テスト」と入力する",
      "④ 「マップに戻る」をタップする"
    ],
    checks: [
      "① 「入力内容が消えます。破棄して戻りますか？」のダイアログが表示されること",
      "② 「入力に戻る」ボタンが表示されること",
      "③ 「破棄して戻る」ボタンが表示されること",
      "④ 「入力に戻る」をタップするとダイアログが閉じてフォームに戻ること"
    ],
    priority: "高"
  },
  {
    id: "TC-S12-09",
    screen: "S12 スポット申請フォーム",
    type: "正常系",
    perspective: "破棄確認ダイアログで「破棄して戻る」をタップすると元のページに戻ること",
    precondition: "TC-S12-08 を実施済み（ダイアログが表示されている状態）",
    steps: [
      "① TC-S12-08の手順①〜④を実施してダイアログを表示する",
      "② 「破棄して戻る」をタップする"
    ],
    checks: [
      "① マップ画面に遷移すること"
    ],
    priority: "高"
  },
  {
    id: "TC-S12-10",
    screen: "S12 スポット申請フォーム",
    type: "正常系",
    perspective: "何も入力せずに戻るボタンをタップするとダイアログなしで元のページに戻ること",
    precondition: "register@example.com / test1234 でログイン済み / GPS（位置情報）の使用を「許可」した状態",
    steps: [
      "① マップ画面の「スポットを申請」をタップする",
      "② GPS取得が完了するまで待つ",
      "③ 何も入力せずに「マップに戻る」をタップする"
    ],
    checks: [
      "① 破棄確認ダイアログが表示されずに、マップ画面に遷移すること"
    ],
    priority: "中"
  }
];

// ----- S11: スポット編集（6件） -----

var s11Cases = [
  {
    id: "TC-S11-01",
    screen: "S11 スポット編集",
    type: "正常系",
    perspective: "編集画面を開くとテスト碑の情報が各フィールドに表示されること",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / S13のテストで「テスト碑」が登録済み",
    steps: [
      "① 管理ページの「スポット管理」タブを開く",
      "② 「テスト碑」の行をタップして編集画面に遷移する"
    ],
    checks: [
      "① 「管理ページに戻る」ボタンが表示されること",
      "② 「スポット編集」の見出しが表示されること",
      "③ スポット名フィールドに「テスト碑」が入力されていること",
      "④ 都道府県が「東京都」で表示されること",
      "⑤ 所在地フィールドに「テスト所在地1番地」が入力されていること",
      "⑥ 位置情報に「位置指定済み（緯度, 経度）」が表示されること",
      "⑦ エリアが「関東・東京」で表示されること",
      "⑧ 解説テキストフィールドに「テスト解説」が入力されていること",
      "⑨ アクセス情報フィールドに「テストアクセス」が入力されていること",
      "⑩ 現地確認済みが「確認済み」で表示されること",
      "⑪ 「保存する」ボタンが表示されること"
    ],
    priority: "高"
  },
  {
    id: "TC-S11-02",
    screen: "S11 スポット編集",
    type: "正常系",
    perspective: "各項目を変更して保存すると管理ページに戻り、変更が保存されること",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / TC-S11-01を実施済み（テスト碑の編集画面を開いている）",
    steps: [
      "① スポット名を「テスト碑（修正）」に変更する",
      "② 都道府県を「神奈川県」に変更する",
      "③ 所在地を「テスト所在地1番地（修正）」に変更する",
      "④ 「保存する」をタップする"
    ],
    checks: [
      "① 管理ページ（/admin）に戻ること",
      {
        text: "② Supabase で変更が保存されていること（以下の手順で確認）",
        subSteps: [
          "1. ブラウザで https://supabase.com を開く",
          "2. 「Sign In」をクリックしてログインする",
          "3. 該当プロジェクトをクリックして開く",
          "4. 左メニューの「Table Editor」をクリックする",
          "5. テーブル一覧から「monuments」をクリックする",
          "6. 「テスト碑（修正）」の行をクリックして詳細を確認する",
          "7. name・prefecture・address が変更後の値になっていることを確認する"
        ]
      }
    ],
    priority: "高"
  },
  {
    id: "TC-S11-03",
    screen: "S11 スポット編集",
    type: "異常系",
    perspective: "スポット名を空欄にして保存するとブラウザの標準バリデーションメッセージが表示されること",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / TC-S11-01を実施済み（テスト碑の編集画面を開いている）",
    steps: [
      "① スポット名フィールドの内容を全て削除して空欄にする",
      "② 「保存する」をタップする"
    ],
    checks: [
      "① ブラウザの標準バリデーションメッセージが表示されること（例：「このフィールドを入力してください」）",
      "② 保存されずにフォームが表示されたままであること"
    ],
    priority: "中"
  },
  {
    id: "TC-S11-04",
    screen: "S11 スポット編集",
    type: "正常系",
    perspective: "変更後に戻るボタンをタップすると破棄確認ダイアログが表示されること",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / TC-S11-01を実施済み（テスト碑の編集画面を開いている）",
    steps: [
      "① スポット名を「テスト」と変更する",
      "② 「管理ページに戻る」をタップする"
    ],
    checks: [
      "① 「変更が保存されていません。破棄して戻りますか？」のダイアログが表示されること",
      "② 「編集に戻る」ボタンが表示されること",
      "③ 「破棄して戻る」ボタンが表示されること",
      "④ 「編集に戻る」をタップするとダイアログが閉じてフォームに戻ること"
    ],
    priority: "高"
  },
  {
    id: "TC-S11-05",
    screen: "S11 スポット編集",
    type: "正常系",
    perspective: "破棄確認ダイアログで「破棄して戻る」をタップすると管理ページに戻ること",
    precondition: "TC-S11-04を実施済み（ダイアログが表示されている状態）",
    steps: [
      "① TC-S11-04の手順①〜②を実施してダイアログを表示する",
      "② 「破棄して戻る」をタップする"
    ],
    checks: [
      "① 管理ページ（/admin）に遷移すること"
    ],
    priority: "高"
  },
  {
    id: "TC-S11-06",
    screen: "S11 スポット編集",
    type: "正常系",
    perspective: "何も変更せずに戻るボタンをタップするとダイアログなしで管理ページに戻ること",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / TC-S11-01を実施済み（テスト碑の編集画面を開いている）",
    steps: [
      "① 何も変更せずに「管理ページに戻る」をタップする"
    ],
    checks: [
      "① 破棄確認ダイアログが表示されずに、管理ページ（/admin）に遷移すること"
    ],
    priority: "中"
  }
];

// ----- S10: 管理ページ（7件） -----

var s10Cases = [
  {
    id: "TC-S10-01",
    screen: "S10 管理ページ",
    type: "正常系",
    perspective: "管理ページの初期表示を確認できること",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / S13・S12・S11のテストを実施済み（テスト碑（修正）が登録済み・テスト申請碑A・Bが承認待ち）",
    steps: [
      "① 管理ページ（/admin）を開く"
    ],
    checks: [
      "① 「管理ページ」の見出しが表示されること",
      "② 「スポット管理」タブが選択された状態で表示されること",
      "③ 「承認待ち」タブに「2」のバッジが表示されること",
      "④ 検索欄が表示されること",
      "⑤ エリアフィルター（すべて、和歌山県、近畿・中部、関東・東京、東北）が表示されること",
      "⑥ 「未入力項目がある碑だけ表示」チェックボックスが表示されること",
      "⑦ 「新規追加」ボタンが表示されること",
      "⑧ スポット一覧に「テスト碑（修正）」が表示されること",
      "⑨ 「テスト碑（修正）」の行に「編集」「削除」ボタンが表示されること"
    ],
    priority: "高"
  },
  {
    id: "TC-S10-02",
    screen: "S10 管理ページ",
    type: "正常系",
    perspective: "承認待ちタブに申請2件が表示されること",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / S12のテストで「テスト申請碑A」「テスト申請碑B」が申請済み",
    steps: [
      "① 「承認待ち」タブをタップする"
    ],
    checks: [
      "① 「テスト申請碑A」が表示されること",
      "② 「テスト申請碑A」に「承認」「却下」ボタンが表示されること",
      "③ 「テスト申請碑B」が表示されること",
      "④ 「テスト申請碑B」に「承認」「却下」ボタンが表示されること"
    ],
    priority: "高"
  },
  {
    id: "TC-S10-03",
    screen: "S10 管理ページ",
    type: "正常系",
    perspective: "申請を却下すると承認待ちタブから消えること（テスト申請碑A）",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / TC-S10-02を実施済み（承認待ちタブを開いている）",
    steps: [
      "① 「テスト申請碑A」の「却下」をタップする"
    ],
    checks: [
      "① 承認待ちタブから「テスト申請碑A」が消えること",
      "② 「承認待ち」タブのバッジが「1」になること",
      {
        text: "③ Supabase で却下されていること（以下の手順で確認）",
        subSteps: [
          "1. ブラウザで https://supabase.com を開く",
          "2. 「Sign In」をクリックしてログインする",
          "3. 該当プロジェクトをクリックして開く",
          "4. 左メニューの「Table Editor」をクリックする",
          "5. テーブル一覧から「monuments」をクリックする",
          "6. 「テスト申請碑A」の行の status カラムが「rejected」になっていることを確認する"
        ]
      }
    ],
    priority: "高"
  },
  {
    id: "TC-S10-04",
    screen: "S10 管理ページ",
    type: "正常系",
    perspective: "申請を承認すると承認待ちタブから消え、スポット管理タブの「承認待ち」バッジが消えること（テスト申請碑B）",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / TC-S10-03を実施済み（承認待ちタブに「テスト申請碑B」1件が残っている）",
    steps: [
      "① 「テスト申請碑B」の「承認」をタップする"
    ],
    checks: [
      "① 承認待ちタブから「テスト申請碑B」が消えること",
      "② 「承認待ち」タブのバッジが消えること",
      "③ スポット管理タブの「テスト申請碑B」から「承認待ち」バッジが消えること",
      {
        text: "④ Supabase で status カラムが「approved」になっていること（以下の手順で確認）",
        subSteps: [
          "1. ブラウザで https://supabase.com を開く",
          "2. 「Sign In」をクリックしてログインする",
          "3. 該当プロジェクトをクリックして開く",
          "4. 左メニューの「Table Editor」をクリックする",
          "5. テーブル一覧から「monuments」をクリックする",
          "6. 「テスト申請碑B」の行の status カラムが「approved」になっていることを確認する"
        ]
      }
    ],
    priority: "高"
  },
  {
    id: "TC-S10-05",
    screen: "S10 管理ページ",
    type: "正常系",
    perspective: "スポットを削除すると一覧から消え、DBからも削除されること（テスト碑（修正））",
    precondition: "管理者アカウント（is_admin = true）でログイン済み / スポット管理タブを開いている",
    steps: [
      "① 「テスト碑（修正）」の「削除」をタップする",
      "② 確認ダイアログに「このスポットを削除しますか？」「「テスト碑（修正）」」が表示されることを確認する",
      "③ 「削除する」をタップする"
    ],
    checks: [
      "① スポット管理タブの一覧から「テスト碑（修正）」が消えること",
      {
        text: "② Supabase からも削除されていること（以下の手順で確認）",
        subSteps: [
          "1. ブラウザで https://supabase.com を開く",
          "2. 「Sign In」をクリックしてログインする",
          "3. 該当プロジェクトをクリックして開く",
          "4. 左メニューの「Table Editor」をクリックする",
          "5. テーブル一覧から「monuments」をクリックする",
          "6. 「テスト碑（修正）」の行が存在しないことを確認する"
        ]
      }
    ],
    priority: "高"
  },
  {
    id: "TC-S10-06",
    screen: "S10 管理ページ",
    type: "異常系",
    perspective: "未ログイン状態でアクセスするとログイン画面にリダイレクトされること",
    precondition: "ログアウト済み（未ログイン状態）",
    steps: [
      "① ブラウザのアドレスバーに /admin を直接入力してアクセスする"
    ],
    checks: [
      "① ログイン画面（/login）にリダイレクトされること"
    ],
    priority: "中"
  },
  {
    id: "TC-S10-07",
    screen: "S10 管理ページ",
    type: "異常系",
    perspective: "一般ユーザーでアクセスすると権限エラー画面が表示されること",
    precondition: "register@example.com / test1234 でログイン済み（is_admin = false）",
    steps: [
      "① ブラウザのアドレスバーに /admin を直接入力してアクセスする"
    ],
    checks: [
      "① 「このページにはアクセス権限がありません」が表示されること",
      "② 「OK」ボタンが表示されること",
      "③ 「OK」をタップするとマップ画面（/map）に遷移すること"
    ],
    priority: "中"
  }
];

// ============================================================
// 各セクションのコンテンツ生成
// ============================================================

// --- 表紙 ---
var section0 = [
  spacer(), spacer(), spacer(), spacer(), spacer(), spacer(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 160 },
    children: [new TextRun({ text: "徳本上人 名号碑スタンプラリーアプリ", size: 28, font: "Arial", color: "2E5F8A" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120 },
    children: [new TextRun({ text: "テスト仕様書", bold: true, size: 56, font: "Arial", color: "2E5F8A" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 480 },
    children: [new TextRun({ text: "管理・申請機能 追加テスト", size: 28, font: "Arial", color: "2E5F8A" })]
  }),
  new Table({
    width: { size: 5200, type: WidthType.DXA },
    columnWidths: [1600, 3600],
    rows: [
      ["バージョン", "v1.0"],
      ["作成日", "2026年6月9日"],
      ["ステータス", "ドラフト"],
      ["対象画面", "S10 / S11 / S12 / S13"]
    ].map(function(row) {
      return new TableRow({
        children: [
          subHeaderCell(row[0], 1600),
          normalCell(row[1], 3600)
        ]
      });
    })
  }),
  pageBreak()
];

var section1 = [
  heading1("1. テスト概要"),
  simpleTable(
    ["項目", "内容"],
    [
      ["テスト目的", "設計書 v2.0・v2.1 で追加した管理・申請機能が、設計書の仕様通りに動作することを確認する"],
      ["テスト種別", "システムテスト（メイン）"],
      ["テスト対象", "S10 管理ページ / S11 スポット編集 / S12 スポット申請フォーム / S13 スポット新規追加"],
      ["テスト対象外", "単体テスト（関数・コンポーネント単体のテスト）"],
      ["実施環境", "スマートフォン（iOS / Android）・PC ブラウザ"]
    ],
    [2400, 6400]
  ),
  spacer(),
  heading2("1-1. テスト実行順序"),
  bodyText("以下の順序でテストを実施してください。前のテストで作ったデータを次のテストで使い回すため、順序通りに実施することが重要です。"),
  simpleTable(
    ["実行順", "テストケースID", "画面", "備考"],
    [
      ["1番目", "TC-S13-xx", "S13 スポット新規追加", "テスト用の承認済みスポットを作る"],
      ["2番目", "TC-S12-xx", "S12 スポット申請フォーム", "承認待ちスポットを2件作る"],
      ["3番目", "TC-S11-xx", "S11 スポット編集", "S13で作ったスポットを編集する"],
      ["4番目", "TC-S10-xx", "S10 管理ページ", "承認・却下・削除を自由にテストする"]
    ],
    [1200, 2000, 2800, 2800]
  ),
  spacer()
];

var section2 = [
  heading1("2. テスト環境"),
  simpleTable(
    ["項目", "内容"],
    [
      ["テスト対象 URL", "https://tokuhon-stamp-rally.vercel.app/"],
      ["使用ブラウザ", "Safari（iOS）/ Chrome（Android・PC）"],
      ["使用デバイス", "スマートフォン（iOS / Android）・PC"],
      ["Supabase ダッシュボード URL", "https://supabase.com（要ログイン）"]
    ],
    [2400, 6400]
  ),
  spacer()
];

var section3 = [
  heading1("3. ダミーデータ一覧"),
  bodyText("テストで使用するデータは以下に統一します。テスト実施前に必ず確認してください。"),
  simpleTable(
    ["用途", "値"],
    [
      ["一般ユーザー メールアドレス", "register@example.com"],
      ["一般ユーザー パスワード", "test1234"],
      ["管理者アカウント", "is_admin = true のアカウント（別途確認）"],
      ["テスト碑（必須）スポット名（S13-02：必須項目のみのテスト用）", "テスト碑（必須）"],
      ["テスト碑 スポット名（S13-03以降・S11編集対象）", "テスト碑"],
      ["テスト碑 都道府県", "東京都"],
      ["テスト碑 所在地", "テスト所在地1番地"],
      ["テスト申請碑A スポット名（S12申請・S10却下テスト用）", "テスト申請碑A"],
      ["テスト申請碑A 都道府県", "大阪府"],
      ["テスト申請碑A 所在地", "テスト所在地2番地"],
      ["テスト申請碑B スポット名（S12申請・S10承認テスト用）", "テスト申請碑B"],
      ["テスト申請碑B 都道府県", "和歌山県"],
      ["テスト申請碑B 所在地", "テスト所在地3番地"],
      ["S11編集後 スポット名（変更後の値）", "テスト碑（修正）"],
      ["S11編集後 都道府県（変更後の値）", "神奈川県"],
      ["S11編集後 所在地（変更後の値）", "テスト所在地1番地（修正）"]
    ],
    [3600, 5200]
  ),
  spacer()
];

var section4 = [
  heading1("4. 事前準備手順"),
  heading2("4-1. テスト開始前の準備"),
  bodyText("S13（スポット新規追加）が最初のテストのため、事前にスポットデータを準備する必要はありません。"),
  bodyText("ただし、テスト開始前に register@example.com が Supabase に登録済みであることを以下の手順で確認してください。"),
  prepTable([
    "ブラウザで https://supabase.com を開く",
    "「Sign In」をクリックしてログインする",
    "該当プロジェクトをクリックして開く",
    "左メニューの「Authentication」をクリックする",
    "「Users」タブをクリックする",
    "register@example.com が一覧に表示されていることを確認する"
  ]),
  spacer(),
  heading2("4-2. テスト後のクリーンアップ（後片付け）"),
  bodyText("全テスト完了後に以下の手順でテストデータを削除してください。再テスト時は S13 から始めてください。"),
  noteText("※ テスト碑（修正）は TC-S10-05 で削除済みのため後片付け不要です。"),
  spacer(),
  bodyText("【アプリから削除する】"),
  prepTable([
    "管理者アカウントでログインして管理ページ（/admin）を開く",
    "スポット管理タブで「テスト碑（必須）」の行の「削除」をタップする",
    "確認ダイアログで「削除する」をタップする",
    "同様の手順で「テスト申請碑B」も削除する"
  ]),
  spacer(),
  bodyText("【Supabase から手動削除する（テスト申請碑A：却下済みのためアプリから削除不可）】"),
  prepTable([
    "ブラウザで https://supabase.com を開く",
    "「Sign In」をクリックしてログインする",
    "該当プロジェクトをクリックして開く",
    "左メニューの「Table Editor」をクリックする",
    "テーブル一覧から「monuments」をクリックする",
    "「テスト申請碑A」の行を探す",
    "該当行の左端のチェックボックスにチェックを入れる",
    "上部の「Delete rows」をクリックする",
    "確認ダイアログで「Delete」をクリックする",
    "「テスト申請碑A」の行が消えていることを確認する"
  ]),
  spacer()
];

var section5 = [
  heading1("5. テストケース一覧"),

  heading2("S13 スポット新規追加"),
].concat(s13Cases.reduce(function(acc, tc) { return acc.concat(tcParagraphs(tc)); }, [])).concat([

  heading2("S12 スポット申請フォーム"),
]).concat(s12Cases.reduce(function(acc, tc) { return acc.concat(tcParagraphs(tc)); }, [])).concat([

  heading2("S11 スポット編集"),
]).concat(s11Cases.reduce(function(acc, tc) { return acc.concat(tcParagraphs(tc)); }, [])).concat([

  heading2("S10 管理ページ"),
]).concat(s10Cases.reduce(function(acc, tc) { return acc.concat(tcParagraphs(tc)); }, []));

// ============================================================
// ドキュメント生成・出力
// ============================================================

var allContent = section0.concat(section1).concat(section2).concat(section3).concat(section4).concat(section5);

var doc = createDocument("（管理・申請機能 追加分） v1.0", allContent);

var totalCases = s13Cases.length + s12Cases.length + s11Cases.length + s10Cases.length;

Packer.toBuffer(doc).then(function(buf) {
  var outputPath = "scripts/テスト仕様書（管理・申請機能　追加分）_v1.0.docx";
  fs.writeFileSync(outputPath, buf);
  console.log("✅ " + outputPath + " を生成しました");
  console.log("   テストケース合計：" + totalCases + "件");
  console.log("   S13: " + s13Cases.length + "件 / S12: " + s12Cases.length + "件 / S11: " + s11Cases.length + "件 / S10: " + s10Cases.length + "件");
}).catch(function(err) {
  console.error("❌ エラーが発生しました:", err);
  process.exit(1);
});
