import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Inisialisasi Server MCP
const mcpServer = new Server(
  {
    name: "mcp-graph-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // Fitur/alat kosong untuk inisialisasi awal
    },
  }
);

let transport = null;

// Jalur endpoint utama untuk koneksi awal MCP (SSE)
app.get("/sse", async (req, res) => {
  // Wajib memaksa header agar bertipe text/event-stream demi kecocokan dengan Qwen
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  transport = new SSEServerTransport("/messages", res);
  await mcpServer.connect(transport);
});

// Jalur endpoint untuk menerima pesan/instruksi dari Qwen
app.post("/messages", express.json(), async (req, res) => {
  if (transport) {
    await transport.handleMessage(req, res);
  } else {
    res.status(400).send("Koneksi transport belum siap");
  }
});

// Menangani error global agar tidak crash
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Terjadi kesalahan internal pada server MCP");
});

app.listen(PORT, () => {
  console.log(`Server MCP aktif dan berjalan di port ${PORT}`);
});
