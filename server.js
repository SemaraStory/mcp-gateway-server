import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const app = express();
// Railway akan memberikan PORT otomatis melalui process.env.PORT
const PORT = process.env.PORT || 8000;

// 1. Inisialisasi Server MCP
const mcpServer = new Server(
  {
    name: "mcp-graph-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // Tempat menaruh fungsi kustom Anda nanti
    },
  }
);

let transport = null;

// 2. Jalur endpoint utama untuk koneksi awal MCP
app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await mcpServer.connect(transport);
});

// 3. Jalur endpoint untuk menerima pesan/instruksi dari Qwen
app.post("/messages", async (req, res) => {
  if (transport) {
    await transport.handleMessage(req, res);
  } else {
    res.status(400).send("Koneksi transport belum siap");
  }
});

// Start server web
app.listen(PORT, () => {
  console.log(`Server MCP aktif dan berjalan di port ${PORT}`);
});
