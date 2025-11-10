const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3002;

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.redirect("/internal.html");
});

app.get("/internal-api.yaml", (req, res) => {
  const yamlPath = path.join(__dirname, "internal-api.yaml");

  if (fs.existsSync(yamlPath)) {
    res.setHeader("Content-Type", "application/x-yaml");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(yamlPath);
  } else {
    res.status(404).send("OpenAPI specification not found");
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "GPTutor Internal Documentation Server",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.url} not found`,
  });
});

app.listen(PORT, () => {
  console.log("🚀 GPTutor Internal Documentation Server запущен!");
  console.log(`📖 Документация доступна по адресу: http://localhost:${PORT}`);
  console.log(`🔧 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 OpenAPI spec: http://localhost:${PORT}/internal-api.yaml`);
  console.log("");
  console.log("Доступные endpoints:");
  console.log("  GET  /                    - Главная страница");
  console.log("  GET  /internal.html       - Внутренняя документация");
  console.log("  GET  /internal-api.yaml   - OpenAPI спецификация");
  console.log("  GET  /health              - Health check");
  console.log("");
  console.log("Для остановки сервера нажмите Ctrl+C");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Получен сигнал SIGINT, завершение работы...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Получен сигнал SIGTERM, завершение работы...");
  process.exit(0);
});












