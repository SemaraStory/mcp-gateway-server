import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Inisialisasi Server MCP Utama
const mcpServer = new Server(
  {
    name: "mcp-graph-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // Kita biarkan kosong dulu agar server berhasil konek sukses
    },
  }
);

let transport = null;

// Endpoint jabat tangan awal SSE
app.get("/sse", async (req, res) => {
  // Membuat transport sse resmi yang langsung mengarah ke endpoint pesan
  transport = new SSEServerTransport("/messages", res);
  
  try {
    await mcpServer.connect(transport);
  } catch (error) {
    console.error("Gagal menghubungkan transport MCP:", error);
    if (!res.headersSent) {
      res.status(500).send("MCP Connection Error");
    }
  }
});

// Endpoint untuk menerima instruksi dari Qwen
app.post("/messages", express.json(), async (req, res) => {
  if (transport) {
    await transport.handleMessage(req, res);
  } else {
    res.status(400).send("Transport belum diinisialisasi melalui /sse");
  }
});

app.listen(PORT, () => {
  console.log(`Server MCP stabil aktif di port ${PORT}`);
});
