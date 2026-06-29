/*
 * server.js
 * by Nekomakura
 *
 * runfileの初期設定:
 *   PORT=3000
 *   STATIC_ROOT=openfile
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// ────────────────────────────────────────────
// runfile の読み込み・パース
// ────────────────────────────────────────────
function loadRunfile() {
  const runfilePath = path.join(__dirname, "runfile");

  /** デフォルト値 */
  const config = {
    PORT: 3000,
    STATIC_ROOT: "openfile",
  };

  if (!fs.existsSync(runfilePath)) {
    console.warn("[warn] runfile が見つかりません。デフォルト設定を使用します。");
    return config;
  }

  const lines = fs.readFileSync(runfilePath, "utf8").split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue; // 空行・コメント行をスキップ

    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;

    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim();

    if (key === "PORT") {
      const p = parseInt(val, 10);
      if (!isNaN(p)) config.PORT = p;
    } else if (key === "STATIC_ROOT") {
      config.STATIC_ROOT = val;
    }
  }

  return config;
}

// ────────────────────────────────────────────
// MIME タイプ解決
// ────────────────────────────────────────────
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm":  "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".txt":  "text/plain; charset=utf-8",
  ".pdf":  "application/pdf",
};

function getMime(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

// ────────────────────────────────────────────
// ディレクトリトラバーサル防止
// ────────────────────────────────────────────
function isSafePath(rootDir, targetPath) {
  const relative = path.relative(rootDir, targetPath);
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

// ────────────────────────────────────────────
// レスポンスヘルパー
// ────────────────────────────────────────────
function sendError(res, code, message) {
  res.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(`${code} ${message}`);
}

function sendFile(res, filePath) {
  const mime = getMime(filePath);
  const stat = fs.statSync(filePath);

  res.writeHead(200, {
    "Content-Type": mime,
    "Content-Length": stat.size,
  });

  fs.createReadStream(filePath).pipe(res);
}

// ────────────────────────────────────────────
// メイン
// ────────────────────────────────────────────
const config = loadRunfile();
const PORT = config.PORT;
const STATIC_ROOT = path.resolve(__dirname, config.STATIC_ROOT);

console.log(`[info] 静的ファイルルート : ${STATIC_ROOT}`);
console.log(`[info] ポート             : ${PORT}`);

const server = http.createServer((req, res) => {
  // パスのデコード + クエリ文字列除去
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return sendError(res, 400, "Bad Request");
  }

  // 末尾スラッシュ → index.html にフォールバック
  if (urlPath.endsWith("/")) urlPath += "index.html";

  const targetPath = path.join(STATIC_ROOT, urlPath);

  // パストラバーサル対策
  if (!isSafePath(STATIC_ROOT, targetPath)) {
    return sendError(res, 403, "Forbidden");
  }

  // ディレクトリなら index.html
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
    const indexPath = path.join(targetPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return sendFile(res, indexPath);
    }
    return sendError(res, 403, "Directory listing is disabled");
  }

  // ファイルが存在しない → 404
  if (!fs.existsSync(targetPath)) {
    return sendError(res, 404, "Not Found");
  }

  console.log(`[${new Date().toISOString()}] ${req.method} ${urlPath}`);
  sendFile(res, targetPath);
});

server.listen(PORT, () => {
  console.log(`[info] サーバー起動 → http://localhost:${PORT}/`);
});

// Ctrl+C で graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[info] シャットダウンします...");
  server.close(() => process.exit(0));
});
