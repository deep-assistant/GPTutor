const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 8080;
const docsDir = __dirname;

const mimeTypes = {
  ".html": "text/html",
  ".yaml": "text/yaml",
  ".yml": "text/yaml",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath = path.join(docsDir, req.url === "/" ? "index.html" : req.url);

  if (!filePath.startsWith(docsDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content, "utf-8");
  });
});

server.listen(port, () => {
  console.log("🎉 GPTutor API Documentation Server");
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log("");
  console.log("📋 Available pages:");
  console.log(`  🏠 Welcome page:     http://localhost:${port}/`);
  console.log(`  📖 API Docs (Light): http://localhost:${port}/index.html`);
  console.log(`  🌙 API Docs (Dark):  http://localhost:${port}/dark.html`);
  console.log(
    `  🧪 Interactive Test: http://localhost:${port}/test-examples.html`
  );
  console.log(`  📄 OpenAPI Spec:     http://localhost:${port}/openapi.yaml`);
  console.log(
    `  📚 Detailed Guide:   http://localhost:${port}/CHAT_COMPLETIONS_API.md`
  );
  console.log("");
  console.log("✨ Features:");
  console.log("  • Beautiful Scalar UI with light/dark themes");
  console.log("  • Interactive Try-it functionality");
  console.log("  • Comprehensive API documentation");
  console.log("  • Real-time testing interface");
  console.log("");
  console.log("Press Ctrl+C to stop");
});

process.on("SIGINT", () => {
  console.log("\n👋 Shutting down documentation server...");
  server.close(() => {
    console.log("✅ Server stopped");
    process.exit(0);
  });
});
