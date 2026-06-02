/**
 * generate_design.js
 * DESIGN.md を読み込んで Word ファイルを自動生成するスクリプト
 *
 * 使い方：
 *   node scripts/generate_design.js
 *
 * 出力：
 *   基本設計書_徳本上人スタンプラリーアプリ.docx（スクリプトと同じフォルダ）
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, Footer, PageNumber, ImageRun
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────
// 設定
// ─────────────────────────────────────────
const DESIGN_MD_PATH = path.join(__dirname, '..', 'DESIGN.md');  // プロジェクトルートのDESIGN.md
const OUTPUT_PATH = path.join(__dirname, '設計書_徳本上人スタンプラリーアプリ.docx');
const PURPLE = "5B4FCF";

// ─────────────────────────────────────────
// DESIGN.md を読み込む
// ─────────────────────────────────────────
if (!fs.existsSync(DESIGN_MD_PATH)) {
  console.error('❌ DESIGN.md が見つかりません：', DESIGN_MD_PATH);
  process.exit(1);
}
const md = fs.readFileSync(DESIGN_MD_PATH, 'utf-8');
const lines = md.split('\n');
console.log('✅ DESIGN.md を読み込みました（' + lines.length + '行）');

// ─────────────────────────────────────────
// Markdown パーサー（シンプル版）
// ─────────────────────────────────────────

// メタ情報（バージョン・作成日・ステータス）を抽出
function extractMeta(lines) {
  const meta = { version: '1.0', created: '', updated: '', status: '' };
  for (const line of lines) {
    if (line.match(/^\*\*バージョン/)) meta.version = line.replace(/\*\*.*?：\*\*\s*/, '').trim();
    if (line.match(/^\*\*作成日/))     meta.created = line.replace(/\*\*.*?：\*\*\s*/, '').trim();
    if (line.match(/^\*\*更新日/))     meta.updated = line.replace(/\*\*.*?：\*\*\s*/, '').trim();
    if (line.match(/^\*\*ステータス/)) meta.status  = line.replace(/\*\*.*?：\*\*\s*/, '').trim();
  }
  return meta;
}

// Markdown テーブルをパース → 2次元配列
function parseTable(lines, startIdx) {
  const rows = [];
  let i = startIdx;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) break;
    if (line.match(/^\|[-| :]+\|$/)) { i++; continue; } // セパレータ行をスキップ
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    rows.push(cells);
    i++;
  }
  return { rows, nextIdx: i };
}

// Markdown 箇条書きをパース → 文字列配列
function parseBullets(lines, startIdx) {
  const items = [];
  let i = startIdx;
  while (i < lines.length) {
    const line = lines[i];
    if (line.match(/^[-*] /)) {
      items.push(line.replace(/^[-*] /, '').trim());
      i++;
    } else if (line.trim() === '' && i + 1 < lines.length && lines[i + 1].match(/^[-*] /)) {
      i++;
    } else {
      break;
    }
  }
  return { items, nextIdx: i };
}

// コードブロックをパース → 文字列配列
function parseCodeBlock(lines, startIdx) {
  const codeLines = [];
  let i = startIdx + 1; // ``` の次から
  while (i < lines.length) {
    if (lines[i].trim() === '```') { i++; break; }
    codeLines.push(lines[i]);
    i++;
  }
  return { codeLines, nextIdx: i };
}

// ─────────────────────────────────────────
// Word 要素ビルダー
// ─────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function th(text, widthDxa) {
  return new TableCell({
    borders, width: { size: widthDxa, type: WidthType.DXA },
    shading: { fill: PURPLE, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text: String(text), bold: true, color: "FFFFFF", size: 22, font: "Arial" })]
    })]
  });
}

function td(text, widthDxa, shade = false) {
  return new TableCell({
    borders, width: { size: widthDxa, type: WidthType.DXA },
    shading: { fill: shade ? "F3F0FD" : "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text: String(text || ''), size: 20, font: "Arial" })]
    })]
  });
}

function buildTable(rows) {
  if (rows.length < 2) return null;
  const headers = rows[0];
  const dataRows = rows.slice(1);
  const totalWidth = 8960;
  const colWidth = Math.floor(totalWidth / headers.length);
  const widths = headers.map((_, i) => i === headers.length - 1 ? totalWidth - colWidth * (headers.length - 1) : colWidth);

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ children: headers.map((h, i) => th(h, widths[i])) }),
      ...dataRows.map((r, ri) => new TableRow({
        children: r.map((c, i) => td(c, widths[i], ri % 2 === 1))
      }))
    ]
  });
}

function partTitle(text) {
  return new Paragraph({
    spacing: { before: 480, after: 240 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 12, color: PURPLE, space: 4 },
      top: { style: BorderStyle.SINGLE, size: 12, color: PURPLE, space: 4 },
    },
    children: [new TextRun({ text, bold: true, size: 40, color: PURPLE, font: "Arial" })]
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: PURPLE, space: 4 } },
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 32, color: PURPLE, font: "Arial" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, color: "333333", font: "Arial" })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, color: "555555", font: "Arial" })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text: String(text || ''), size: 20, font: "Arial", ...opts })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text: String(text), size: 20, font: "Arial" })]
  });
}

function note(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    indent: { left: 360 },
    children: [new TextRun({ text: String(text), size: 18, color: "7C6FCD", font: "Arial", italics: true })]
  });
}

function codeLine(text) {
  return new Paragraph({
    spacing: { before: 0, after: 0 },
    shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
    indent: { left: 360, right: 360 },
    children: [new TextRun({ text: String(text), size: 18, font: "Courier New", color: "CDD6F4" })]
  });
}

function pageBreak() {
  return new Paragraph({ pageBreakBefore: true });
}

function emptyLine() {
  return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun("")] });
}

// ─────────────────────────────────────────
// 画像挿入ヘルパー
// ─────────────────────────────────────────
function insertImage(imagePath, widthEmu, heightEmu) {
  if (!fs.existsSync(imagePath)) return null;
  const imageBuffer = fs.readFileSync(imagePath);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 160 },
    children: [new ImageRun({
      data: imageBuffer,
      transformation: { width: widthEmu, height: heightEmu },
      type: 'png',
    })]
  });
}

// ─────────────────────────────────────────
// DESIGN.md → Word要素に変換
// ─────────────────────────────────────────
function parseMarkdownToWordElements(lines) {
  const elements = [];
  let i = 0;
  let h1Count = 0;
  let skipNextCodeBlock = false;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 空行
    if (trimmed === '' || trimmed === '---') { i++; continue; }

    // 見出し1（# ）→ 部タイトル
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      const text = trimmed.replace(/^# /, '');
      // アプリタイトル行はスキップ（表紙で使う）
      if (text.includes('スタンプラリーアプリ')) { i++; continue; }
      elements.push(pageBreak());
      elements.push(partTitle(text));
      h1Count++;
      i++;
      continue;
    }

    // 見出し2（## ）
    if (trimmed.startsWith('## ')) {
      const text = trimmed.replace(/^## /, '');
      if (h1Count > 0) elements.push(pageBreak());
      elements.push(h1(text));
      h1Count++;
      i++;
      continue;
    }

    // 見出し3（### ）
    if (trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^### /, '');
      elements.push(h2(text));
      // 画面遷移フローの見出し直後に図を挿入
      if (text.includes('画面遷移フロー')) {
        const flowImagePath = path.join(__dirname, 'flow_diagram.png');
        const img = insertImage(flowImagePath, 595, 768); // SVG縦横比(720:930)に合わせたサイズ・本文幅いっぱい
        if (img) { elements.push(img); skipNextCodeBlock = true; }

      }
      i++;
      continue;
    }

    // 見出し4（#### ）
    if (trimmed.startsWith('#### ')) {
      const text = trimmed.replace(/^#### /, '');
      elements.push(h3(text));
      i++;
      continue;
    }

    // コードブロック
    if (trimmed === '```') {
      const { codeLines, nextIdx } = parseCodeBlock(lines, i);
      if (skipNextCodeBlock) {
        skipNextCodeBlock = false;
      } else {
        codeLines.forEach(l => elements.push(codeLine(l)));
        elements.push(emptyLine());
      }
      i = nextIdx;
      continue;
    }

    // テーブル
    if (trimmed.startsWith('|')) {
      const { rows, nextIdx } = parseTable(lines, i);
      const table = buildTable(rows);
      if (table) elements.push(table);
      elements.push(emptyLine());
      i = nextIdx;
      continue;
    }

    // 箇条書き
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const { items, nextIdx } = parseBullets(lines, i);
      items.forEach(item => elements.push(bullet(item)));
      i = nextIdx;
      continue;
    }

    // 注記（> で始まる行）
    if (trimmed.startsWith('>')) {
      const text = trimmed.replace(/^>\s*/, '');
      elements.push(note(text));
      i++;
      continue;
    }

    // メタ情報行（**バージョン** など）はスキップ
    if (trimmed.startsWith('**') && trimmed.includes('：')) { i++; continue; }

    // イタリック体の注記行
    if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
      elements.push(p(trimmed.replace(/^\*|\*$/g, ''), { italics: true, color: "888888" }));
      i++;
      continue;
    }

    // 通常テキスト（太字マークダウンを除去して表示）
    if (trimmed.length > 0) {
      const text = trimmed.replace(/\*\*(.*?)\*\*/g, '$1');
      elements.push(p(text));
    }

    i++;
  }

  return elements;
}

// ─────────────────────────────────────────
// 表紙を生成
// ─────────────────────────────────────────
function buildCoverPage(meta) {
  return [
    new Paragraph({ spacing: { before: 1440 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 720, after: 120 },
      children: [new TextRun({ text: "徳本上人", size: 48, bold: true, color: PURPLE, font: "Arial" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [new TextRun({ text: "名号碑スタンプラリーアプリ", size: 40, bold: true, color: "333333", font: "Arial" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
      children: [new TextRun({ text: "基本・詳細設計書", size: 36, color: "666666", font: "Arial" })]
    }),
    new Paragraph({
      spacing: { before: 480, after: 0 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: PURPLE, space: 4 } },
      children: [new TextRun({ text: "" })]
    }),
    (() => {
      const L = 2400, R = 4000, TOTAL = 6400;
      const metaRows = [
        ["バージョン", meta.version],
        ["作成日",     meta.created],
        ["更新日",     meta.updated],
        ["ステータス", meta.status],
      ];
      return new Table({
        width: { size: TOTAL, type: WidthType.DXA },
        columnWidths: [L, R],
        rows: metaRows.map(([label, value]) => new TableRow({
          children: [
            new TableCell({
              borders,
              width: { size: L, type: WidthType.DXA },
              shading: { fill: "EDE9FC", type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 160, right: 120 },
              children: [new Paragraph({
                children: [new TextRun({ text: label, bold: true, size: 18, font: "Arial", color: PURPLE })]
              })]
            }),
            new TableCell({
              borders,
              width: { size: R, type: WidthType.DXA },
              shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 160, right: 120 },
              children: [new Paragraph({
                children: [new TextRun({ text: value, size: 18, font: "Arial", color: "444444" })]
              })]
            }),
          ]
        }))
      });
    })(),
    pageBreak(),
  ];
}

// ─────────────────────────────────────────
// メイン処理
// ─────────────────────────────────────────
const meta = extractMeta(lines);
console.log('📋 メタ情報：', meta);

const bodyElements = parseMarkdownToWordElements(lines);
console.log('📝 Word要素数：', bodyElements.length);

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: PURPLE },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "333333" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: "555555" },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "徳本上人 名号碑スタンプラリーアプリ 基本設計書　", size: 16, color: "999999", font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999", font: "Arial" }),
          ]
        })]
      })
    },
    children: [
      ...buildCoverPage(meta),
      ...bodyElements,
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log('✅ Wordファイルを生成しました：', OUTPUT_PATH);
}).catch(err => {
  console.error('❌ 生成エラー：', err);
});
