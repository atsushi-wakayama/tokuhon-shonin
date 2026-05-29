/**
 * ============================================================
 * テスト仕様書 デザイン定義ファイル
 * ファイル名: test_spec_design.js
 *
 * 【使い方】
 * 新しいチャットでこのファイルを添付して、以下のように伝える：
 *
 *   「このデザイン定義ファイルを使って、以下のテストケースを
 *    テスト仕様書（Word）に追加してください」
 *
 * 【含まれるもの】
 *   - カラー・サイズ定数
 *   - セル生成関数（headerCell / subHeaderCell / normalCell / priorityCell）
 *   - 段落生成関数（heading1 / heading2 / bodyText / noteText / warnText / spacer）
 *   - テーブル生成関数（testCaseTable / simpleTable / prepTable / caseListTable）
 *   - ページ設定・フォント設定
 *   - ドキュメント生成の雛形（doc オブジェクト）
 *
 * 【含まれないもの】
 *   - テストケースのデータ（s03Cases / s02Cases など）
 *   - ファイル出力処理（Packer.toBuffer）
 *   ※ これらは新しいチャットで追加してもらう
 *
 * 【依存ライブラリ】
 *   npm install -g docx
 * ============================================================
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageBreak, Header
} = require('docx');
const fs = require('fs');

// ============================================================
// カラー・サイズ定数
// ============================================================
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

const TABLE_WIDTH = 8800;   // テストケーステーブルの全幅（DXA）
const COL1 = 2000;          // 左列（項目名）幅
const COL2 = 6800;          // 右列（内容）幅

const HEADER_COLOR    = "2E5F8A";  // テーブルヘッダー：濃い青
const SUBHEADER_COLOR = "D5E8F0";  // テーブルサブヘッダー：水色
const PRIORITY_HIGH   = "FFE0E0";  // 優先度「高」：薄い赤
const PRIORITY_MID    = "FFF5CC";  // 優先度「中」：薄い黄
const PRIORITY_LOW    = "E8F5E9";  // 優先度「低」：薄い緑

// ============================================================
// セル生成関数
// ============================================================

/** テーブルのヘッダーセル（濃い青背景・白文字） */
function headerCell(text, width, span) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: HEADER_COLOR, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: span || 1,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 18, font: "Arial" })]
    })]
  });
}

/** テーブルのサブヘッダーセル（水色背景・黒文字太字） */
function subHeaderCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: SUBHEADER_COLOR, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 18, font: "Arial" })]
    })]
  });
}

/** 通常のデータセル（白背景または指定色） */
function normalCell(text, width, color) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: color || "FFFFFF", type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({
      children: [new TextRun({ text: text || "", size: 18, font: "Arial" })]
    })]
  });
}

/** 優先度セル（高→赤 / 中→黄 / 低→緑） */
function priorityCell(text, width) {
  let color = "FFFFFF";
  if (text === "高") color = PRIORITY_HIGH;
  else if (text === "中") color = PRIORITY_MID;
  else if (text === "低") color = PRIORITY_LOW;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: color, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 18, font: "Arial" })]
    })]
  });
}

// ============================================================
// 段落生成関数
// ============================================================

/** 大見出し（青色・下線あり） */
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E5F8A", space: 1 } },
    children: [new TextRun({ text, bold: true, size: 32, font: "Arial", color: "2E5F8A" })]
  });
}

/** 中見出し（青色） */
function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, size: 26, font: "Arial", color: "2E5F8A" })]
  });
}

/** 本文テキスト */
function bodyText(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 18, font: "Arial" })]
  });
}

/** 注記テキスト（赤色・斜体） */
function noteText(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 16, font: "Arial", color: "CC0000", italics: true })]
  });
}

/** 警告テキスト（オレンジ色・斜体） */
function warnText(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 16, font: "Arial", color: "CC6600", italics: true })]
  });
}

/** 空行スペーサー */
function spacer() {
  return new Paragraph({ spacing: { before: 100, after: 100 }, children: [new TextRun("")] });
}

// ============================================================
// テーブル生成関数
// ============================================================

/**
 * テストケース詳細テーブル
 *
 * tc オブジェクトの形式：
 * {
 *   id: "TC-S03-01",
 *   screen: "S03 新規登録",
 *   type: "正常系",
 *   precondition: "...",
 *   perspective: "...",
 *   steps: ["①...", "②..."],
 *   expected: ["..."],
 *   verify: ["①...", "②..."],
 *   priority: "高"
 * }
 */
function testCaseTable(tc) {
  const rows = [
    new TableRow({ children: [headerCell("テストケース", TABLE_WIDTH, 2)] }),
    new TableRow({ children: [subHeaderCell("テストID", COL1),    normalCell(tc.id, COL2)] }),
    new TableRow({ children: [subHeaderCell("画面", COL1),        normalCell(tc.screen, COL2)] }),
    new TableRow({ children: [subHeaderCell("種別", COL1),        normalCell(tc.type, COL2)] }),
    new TableRow({ children: [subHeaderCell("事前条件", COL1),    normalCell(tc.precondition, COL2)] }),
    new TableRow({ children: [subHeaderCell("テスト観点", COL1),  normalCell(tc.perspective, COL2)] }),
  ];

  tc.steps.forEach((step, i) => {
    rows.push(new TableRow({
      children: [
        i === 0 ? subHeaderCell("手順", COL1) : normalCell("", COL1, SUBHEADER_COLOR),
        normalCell(step, COL2)
      ]
    }));
  });

  tc.expected.forEach((exp, i) => {
    rows.push(new TableRow({
      children: [
        i === 0 ? subHeaderCell("期待結果", COL1) : normalCell("", COL1, SUBHEADER_COLOR),
        normalCell(exp, COL2)
      ]
    }));
  });

  tc.verify.forEach((v, i) => {
    rows.push(new TableRow({
      children: [
        i === 0 ? subHeaderCell("確認方法", COL1) : normalCell("", COL1, SUBHEADER_COLOR),
        normalCell(v, COL2)
      ]
    }));
  });

  rows.push(new TableRow({
    children: [subHeaderCell("優先度", COL1), priorityCell(tc.priority, COL2)]
  }));

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [COL1, COL2],
    rows
  });
}

/**
 * 汎用2列テーブル（テスト概要・環境・ダミーデータなど）
 *
 * 使用例：
 * simpleTable(
 *   ["項目", "内容"],
 *   [["テスト目的", "..."], ["テスト種別", "..."]],
 *   [2400, 6400]
 * )
 */
function simpleTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ children: headers.map((h, i) => headerCell(h, colWidths[i])) }),
      ...rows.map(row => new TableRow({
        children: row.map((cell, i) => {
          if (i === 0) return subHeaderCell(cell, colWidths[i]);
          return normalCell(cell, colWidths[i]);
        })
      }))
    ]
  });
}

/**
 * 手順番号付きテーブル（クリーンアップ手順などに使用）
 *
 * 使用例：
 * prepTable(["手順1の内容", "手順2の内容", ...])
 */
function prepTable(steps) {
  const C1 = 600, C2 = 8200;
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [C1, C2],
    rows: [
      new TableRow({ children: [headerCell("#", C1), headerCell("手順", C2)] }),
      ...steps.map((step, i) => new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: C1, type: WidthType.DXA },
            shading: { fill: SUBHEADER_COLOR, type: ShadingType.CLEAR },
            margins: cellMargins,
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: String(i + 1), bold: true, size: 18, font: "Arial" })]
            })]
          }),
          normalCell(step, C2)
        ]
      }))
    ]
  });
}

/**
 * テストケース一覧テーブル（各画面末尾のサマリー表）
 *
 * 使用例：
 * caseListTable(s03Cases, [1600, 5400, 1000, 800])
 */
function caseListTable(cases, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        children: ["テストID", "内容", "種別", "優先度"].map((h, i) => headerCell(h, colWidths[i]))
      }),
      ...cases.map(tc => new TableRow({
        children: [
          subHeaderCell(tc.id, colWidths[0]),
          normalCell(tc.perspective, colWidths[1]),
          normalCell(tc.type, colWidths[2]),
          priorityCell(tc.priority, colWidths[3])
        ]
      })),
      new TableRow({
        children: [
          new TableCell({
            borders,
            columnSpan: 4,
            width: { size: total, type: WidthType.DXA },
            shading: { fill: SUBHEADER_COLOR, type: ShadingType.CLEAR },
            margins: cellMargins,
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: `合計　${cases.length}件`, bold: true, size: 18, font: "Arial" })]
            })]
          })
        ]
      })
    ]
  });
}

// ============================================================
// ドキュメント設定の雛形
// ============================================================

/**
 * Documentオブジェクトの生成
 *
 * 使い方：
 *   const doc = createDocument("v1.2", [...children]);
 *   Packer.toBuffer(doc).then(buf => fs.writeFileSync("output.docx", buf));
 *
 * @param {string} version - バージョン文字列（例："v1.2"）
 * @param {Array}  children - セクションに含めるコンテンツの配列
 */
function createDocument(version, children) {
  return new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 20 } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: "Arial", color: "2E5F8A" },
          paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 }
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial", color: "2E5F8A" },
          paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 }
        }
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },  // A4縦
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }  // 約2cm余白
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2E5F8A", space: 1 } },
            children: [new TextRun({
              text: `徳本上人 名号碑スタンプラリーアプリ　テスト仕様書 ${version}`,
              size: 16, font: "Arial", color: "666666"
            })]
          })]
        })
      },
      children
    }]
  });
}

// ============================================================
// 使用例（新しいチャットでの伝え方）
// ============================================================
//
// 【新しいチャットでの伝え方】
//
//   「test_spec_design.js のデザイン定義を使って、
//    以下のテストケースをWord形式のテスト仕様書に追加してください。
//
//    テストケース：
//    - TC-S10-01：〇〇画面で〇〇すると〇〇になる
//      事前条件：...
//      手順：①... ②...
//      期待結果：...
//      確認方法：...
//      優先度：高
//    」
//
// 【テストケースデータの形式（tc オブジェクト）】
//
// const newCases = [
//   {
//     id: "TC-S10-01",
//     screen: "S10 〇〇画面",
//     type: "正常系",           // 正常系 / 異常系 / 境界値（最小値）など
//     precondition: "なし",
//     perspective: "〇〇すると〇〇になる",
//     steps: ["①...", "②..."],
//     expected: ["期待結果の文章"],
//     verify: ["①確認方法1", "②確認方法2"],
//     priority: "高"            // 高 / 中 / 低
//   }
// ];
//
// ============================================================

module.exports = {
  // 定数
  TABLE_WIDTH, COL1, COL2,
  HEADER_COLOR, SUBHEADER_COLOR, PRIORITY_HIGH, PRIORITY_MID, PRIORITY_LOW,
  borders, cellMargins,
  // セル関数
  headerCell, subHeaderCell, normalCell, priorityCell,
  // 段落関数
  heading1, heading2, bodyText, noteText, warnText, spacer,
  // テーブル関数
  testCaseTable, simpleTable, prepTable, caseListTable,
  // ドキュメント生成
  createDocument,
  // docxライブラリ（再エクスポート）
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageBreak, Header,
  fs
};
