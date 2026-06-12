/**
 * generate_bug_report.js
 * バグ修正報告書（管理・申請機能 追加分）を Word ファイルで生成するスクリプト
 *
 * 実行方法：node scripts/generate_bug_report.js
 * 出力先：scripts/バグ修正報告書_管理・申請機能_v1.0.docx
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  HeadingLevel, Footer, PageNumber,
} = require('docx');
const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, 'バグ修正報告書_管理・申請機能_v1.0.docx');

// ─────────────────────────────────────────
// デザイン定数（テスト仕様書に合わせる）
// ─────────────────────────────────────────
const FONT = 'Arial';
const HEADER_COLOR    = '2E5F8A';  // 濃い青
const SUBHEADER_COLOR = 'D5E8F0';  // 水色
const PRIORITY_HIGH   = 'FFE0E0';
const PRIORITY_MID    = 'FFF5CC';
const PRIORITY_LOW    = 'E8F5E9';
const DONE_COLOR      = 'E8F5E9';
const DONE_FONT       = '375623';
const DOC_COLOR       = 'EDF2FF';

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

const TABLE_WIDTH = 8800;
const COL1 = 2000;
const COL2 = 6800;

// ─────────────────────────────────────────
// セル生成関数
// ─────────────────────────────────────────

function headerCell(text, width, span) {
  return new TableCell({
    borders,
    width: { size: width || TABLE_WIDTH, type: WidthType.DXA },
    shading: { fill: HEADER_COLOR, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: span || 1,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 18, font: FONT })],
    })],
  });
}

function subHeaderCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width || COL1, type: WidthType.DXA },
    shading: { fill: SUBHEADER_COLOR, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 18, font: FONT })],
    })],
  });
}

function normalCell(text, width, bgColor) {
  const lines = String(text || '').split('\n');
  const runs = [];
  lines.forEach(function(line, i) {
    runs.push(new TextRun({ text: line, size: 18, font: FONT }));
    if (i < lines.length - 1) runs.push(new TextRun({ break: 1 }));
  });
  return new TableCell({
    borders,
    width: { size: width || COL2, type: WidthType.DXA },
    shading: { fill: bgColor || 'FFFFFF', type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: runs })],
  });
}

function centeredCell(text, width, bgColor, textColor) {
  return new TableCell({
    borders,
    width: { size: width || COL2, type: WidthType.DXA },
    shading: { fill: bgColor || 'FFFFFF', type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 18, font: FONT, color: textColor || '000000' })],
    })],
  });
}

function priorityCell(text, width) {
  let color = 'FFFFFF';
  if (text === '高') color = PRIORITY_HIGH;
  else if (text === '中') color = PRIORITY_MID;
  else if (text === '低') color = PRIORITY_LOW;
  return centeredCell(text, width, color, '000000');
}

// ─────────────────────────────────────────
// 段落生成関数
// ─────────────────────────────────────────

function heading1(text) {
  return new Paragraph({
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: HEADER_COLOR, space: 1 } },
    children: [new TextRun({ text, bold: true, size: 32, font: FONT, color: HEADER_COLOR })],
  });
}

function heading2(text) {
  return new Paragraph({
    spacing: { before: 300, after: 100 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: HEADER_COLOR, space: 4 } },
    indent: { left: 160 },
    children: [new TextRun({ text, bold: true, size: 24, font: FONT, color: HEADER_COLOR })],
  });
}

function bodyText(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 18, font: FONT })],
  });
}

function spacer() {
  return new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun('')] });
}

// ─────────────────────────────────────────
// バグデータ
// ─────────────────────────────────────────
const bugs = [
  {
    id: 'BUG-001/003',
    screen: 'S11・S12・S13',
    summary: 'ラベル「所在地」の表記統一',
    priority: '低',
    symptom: '「所在地」フィールドのラベルが画面によって「住所」「所在地（住所）」と異なっていた。',
    cause: '各画面を個別に実装した際に、正式ラベル名の統一が徹底されていなかった。',
    fix: 'S13（新規追加）・S11（編集）：「住所」→「所在地」に変更\nS12（申請フォーム）：「所在地（住所）」→「所在地」に変更',
    files: 'app/(main)/admin/monuments/new/CreateForm.tsx\napp/(main)/admin/monuments/[id]/edit/EditForm.tsx\napp/(main)/monuments/submit/SubmitForm.tsx',
  },
  {
    id: 'BUG-002',
    screen: 'S11・S13',
    summary: 'ラベル「スポット名」の表記統一',
    priority: '低',
    symptom: 'S11（スポット編集）・S13（スポット新規追加）で「碑の名称」と表示されていた。S12では「スポット名」と正しく表示されていた。',
    cause: '各画面を個別に実装した際に、正式ラベル名の統一が徹底されていなかった。',
    fix: 'S13・S11：「碑の名称」→「スポット名」に変更',
    files: 'app/(main)/admin/monuments/new/CreateForm.tsx\napp/(main)/admin/monuments/[id]/edit/EditForm.tsx',
  },
  {
    id: 'BUG-004',
    screen: 'S10',
    summary: 'スポット件数表示のUX改善',
    priority: '低',
    symptom: 'スポット管理タブのフィルター件数が「67件」のみ表示されており、何の件数か一目で分からなかった。また文字が小さかった。',
    cause: '実装時にラベルテキストを省略していた。',
    fix: '表示を「スポット ○○件」に変更\n文字サイズを text-xs → text-sm に変更（約13px → 約14px）',
    files: 'app/(main)/admin/AdminClient.tsx',
  },
  {
    id: 'BUG-005',
    screen: 'S13',
    summary: 'S13 スポット新規追加に地図ピッカーを追加',
    priority: '高',
    symptom: 'スポット新規追加画面（S13）に位置情報の入力フィールドがなく、追加したスポットが地図上に表示されなかった。また位置情報（location）がNULL不可のため DB 保存に失敗するケースがあった（テスト中に緊急対処済み）。',
    cause: 'S13 の実装時に地図ピッカーの追加が漏れていた。S12（申請フォーム）では実装済みだったが S13 への反映を失念した。',
    fix: '「地図上で位置を指定する」リンクを追加。タップすると地図が開き、タップで位置を指定できるようにした（S11・S12 と同様の実装）\nactions.ts に latitude / longitude を受け取り、POINT 形式で DB に保存する処理を追加',
    files: 'app/(main)/admin/monuments/new/CreateForm.tsx\napp/(main)/admin/monuments/new/actions.ts',
  },
];

const docs = [
  {
    id: 'DOC-001',
    target: 'DESIGN.md（ブラウザバック・リダイレクト仕様表）',
    summary: 'S11・S13 のリダイレクト仕様の記述を補完',
    content: 'S13 の「ログイン済みだが管理者ではない」欄に「→ /admin にリダイレクト」のみ記載されていたが、実際は /admin 遷移後に「このページにはアクセス権限がありません」が表示され、OK で /map に戻る動作。記述を補完した。\nS11 にも同様の条件行が欠落していたため追加。\nエラーケース表（E-02）の記述も合わせて修正。',
  },
  {
    id: 'DOC-002',
    target: 'DESIGN.md（画面遷移フロー 4-2・エラーケース表）',
    summary: 'ボタン名・ラベル名の正式表記に修正',
    content: '画面遷移フロー（4-2）のボタン名が実際の実装と異なっていたため修正。\n・S04 マップ：「新しいスポットを申請」→「スポットを申請」\n・S05 スポット一覧：「新しいスポットを申請」→「新しいスポットを申請する」\nS13 エラーケース表 E-03 のラベル名「碑の名称」→「スポット名」に修正（BUG-002 との整合）。',
  },
];

const modifiedFiles = [
  { file: 'app/(main)/admin/monuments/new/CreateForm.tsx',        detail: 'BUG-002：ラベル「碑の名称」→「スポット名」 / BUG-001/003：ラベル「住所」→「所在地」 / BUG-005：地図ピッカーの追加' },
  { file: 'app/(main)/admin/monuments/new/actions.ts',            detail: 'BUG-005：latitude / longitude を受け取り DB に保存する処理を追加' },
  { file: 'app/(main)/admin/monuments/[id]/edit/EditForm.tsx',    detail: 'BUG-002：ラベル「碑の名称」→「スポット名」 / BUG-001/003：ラベル「住所」→「所在地」' },
  { file: 'app/(main)/monuments/submit/SubmitForm.tsx',           detail: 'BUG-003：ラベル「所在地（住所）」→「所在地」' },
  { file: 'app/(main)/admin/AdminClient.tsx',                     detail: 'BUG-004：件数表示「○○件」→「スポット ○○件」・文字サイズ拡大' },
  { file: 'DESIGN.md',                                            detail: 'DOC-001：S11・S13 のリダイレクト仕様記述を補完 / DOC-002：ボタン名・ラベル名を正式表記に修正' },
];

// ─────────────────────────────────────────
// 文書構築
// ─────────────────────────────────────────
const children = [];

// ── タイトル ──
children.push(
  new Paragraph({ spacing: { before: 600, after: 200 }, children: [new TextRun('')] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
    children: [new TextRun({ text: '徳本上人 名号碑スタンプラリーアプリ', bold: true, size: 40, font: FONT, color: HEADER_COLOR })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
    children: [new TextRun({ text: 'バグ修正報告書', bold: true, size: 56, font: FONT, color: HEADER_COLOR })],
  }),
);

// ── 基本情報テーブル ──
children.push(
  new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    rows: [
      new TableRow({ children: [
        subHeaderCell('バージョン', 2000), normalCell('v1.0', 2200),
        subHeaderCell('作成日', 2400),     normalCell('2026年6月12日', 2200),
      ]}),
      new TableRow({ children: [
        subHeaderCell('テスト実施日', 2000), normalCell('2026年6月11日', 2200),
        subHeaderCell('テスト環境', 2400),   normalCell('iOS Safari（スマートフォン）/ Chrome（PC）', 2200),
      ]}),
      new TableRow({ children: [
        subHeaderCell('テスト URL', 2000),
        normalCell('https://tokuhon-stamp-rally.vercel.app/', TABLE_WIDTH - 2000, undefined),
      ]}),
      new TableRow({ children: [
        subHeaderCell('バグ修正実施', 2000), normalCell('Claude Code による修正', 2200),
        subHeaderCell('修正完了件数', 2400), normalCell('7件（コードバグ 5件 + 設計書修正 2件）　すべて修正完了', 2200),
      ]}),
    ],
  }),
  spacer(),
);

// ── 1. バグ修正サマリー ──
children.push(heading1('1. バグ修正サマリー'));
children.push(bodyText('今回のテスト工程（管理・申請機能 追加分）で発見されたバグは合計 5 件、設計書の記述不備は 2 件です。すべて Claude Code で修正を完了しました。'));
children.push(spacer());

// サマリーテーブル
const summaryRows = [
  new TableRow({ children: [
    headerCell('バグ ID', 1400), headerCell('対象画面', 1400), headerCell('概要', 3400), headerCell('優先度', 1200), headerCell('対応状況', 1400),
  ]}),
];
bugs.forEach(function(b) {
  summaryRows.push(new TableRow({ children: [
    centeredCell(b.id, 1400),
    centeredCell(b.screen, 1400),
    normalCell(b.summary, 3400),
    priorityCell(b.priority, 1200),
    centeredCell('✅ 修正完了', 1400, DONE_COLOR, DONE_FONT),
  ]}));
});
docs.forEach(function(d) {
  summaryRows.push(new TableRow({ children: [
    centeredCell(d.id, 1400),
    centeredCell('設計書', 1400),
    normalCell(d.summary, 3400),
    centeredCell('ー', 1200),
    centeredCell('✅ 修正完了', 1400, DONE_COLOR, DONE_FONT),
  ]}));
});

children.push(new Table({ width: { size: TABLE_WIDTH, type: WidthType.DXA }, rows: summaryRows }));
children.push(spacer());

// ── 2. バグ修正詳細 ──
children.push(heading1('2. バグ修正詳細'));
children.push(bodyText('各バグの症状・原因・修正内容を以下に記載します。'));

bugs.forEach(function(b) {
  children.push(spacer());
  children.push(heading2(b.id + '：' + b.summary));
  children.push(new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    rows: [
      new TableRow({ children: [subHeaderCell('バグ ID', COL1),    normalCell(b.id + '　　対象画面：' + b.screen, COL2)] }),
      new TableRow({ children: [subHeaderCell('優先度', COL1),     priorityCell(b.priority, COL2)] }),
      new TableRow({ children: [subHeaderCell('対応状況', COL1),   centeredCell('✅ 修正完了', COL2, DONE_COLOR, DONE_FONT)] }),
      new TableRow({ children: [subHeaderCell('症状', COL1),       normalCell(b.symptom, COL2)] }),
      new TableRow({ children: [subHeaderCell('原因', COL1),       normalCell(b.cause, COL2)] }),
      new TableRow({ children: [subHeaderCell('修正内容', COL1),   normalCell(b.fix, COL2)] }),
      new TableRow({ children: [subHeaderCell('修正ファイル', COL1), normalCell(b.files, COL2)] }),
    ],
  }));
});

// 設計書修正
children.push(spacer());
children.push(heading2('設計書の記述修正（DOC）'));

docs.forEach(function(d) {
  children.push(spacer());
  children.push(new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    rows: [
      new TableRow({ children: [subHeaderCell('修正 ID', COL1),  normalCell(d.id, COL2)] }),
      new TableRow({ children: [subHeaderCell('対象', COL1),     normalCell(d.target, COL2)] }),
      new TableRow({ children: [subHeaderCell('修正内容', COL1), normalCell(d.content, COL2)] }),
    ],
  }));
});

children.push(spacer());

// ── 3. 修正ファイル一覧 ──
children.push(heading1('3. 修正ファイル一覧'));
children.push(bodyText('今回の修正で変更したファイルの一覧です。'));
children.push(spacer());

const fileRows = [
  new TableRow({ children: [headerCell('ファイル', 3800), headerCell('修正内容', TABLE_WIDTH - 3800)] }),
];
modifiedFiles.forEach(function(f) {
  fileRows.push(new TableRow({ children: [
    normalCell(f.file, 3800),
    normalCell(f.detail, TABLE_WIDTH - 3800),
  ]}));
});
children.push(new Table({ width: { size: TABLE_WIDTH, type: WidthType.DXA }, rows: fileRows }));
children.push(spacer());

// ── 4. 備考・今後の課題 ──
children.push(heading1('4. 備考・今後の課題'));
children.push(spacer());

const remarkRows = [
  new TableRow({ children: [headerCell('項目', 2400), headerCell('内容', TABLE_WIDTH - 2400)] }),
  new TableRow({ children: [
    normalCell('既知の問題（未対応）', 2400),
    normalCell('GPS距離チェックは現在オフ（useCheckIn.ts でコメントアウト中）。本番リリース前に有効化が必要（半径 150〜200m を推奨）。', TABLE_WIDTH - 2400),
  ]}),
  new TableRow({ children: [
    normalCell('既知の問題（未対応）', 2400),
    normalCell('Google Maps は DEMO_MAP_ID を使用中。本番前に正式な Map ID の作成を推奨。', TABLE_WIDTH - 2400),
  ]}),
  new TableRow({ children: [
    normalCell('今後の対応', 2400),
    normalCell('BUG-005 の対処として location カラムを NULL 許容に変更済み。位置情報なしのスポットは地図に表示されないため、既存データへの座標入力を推奨。', TABLE_WIDTH - 2400),
  ]}),
];
children.push(new Table({ width: { size: TABLE_WIDTH, type: WidthType.DXA }, rows: remarkRows }));

// ─────────────────────────────────────────
// ドキュメント生成
// ─────────────────────────────────────────
const doc = new Document({
  sections: [{
    properties: {
      page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: '徳本上人 名号碑スタンプラリーアプリ　バグ修正報告書 v1.0　　', font: FONT, size: 16, color: '888888' }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: '888888' }),
            new TextRun({ text: ' / ', font: FONT, size: 16, color: '888888' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: '888888' }),
          ],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then(function(buffer) {
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log('✅ 生成完了：' + OUTPUT_PATH);
}).catch(function(err) {
  console.error('❌ エラー：', err);
});
