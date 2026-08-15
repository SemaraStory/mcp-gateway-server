import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

const app = express();
const PORT = process.env.PORT || 3000;

// Inisialisasi Server
const server = new McpServer({
  name: "Cloud-Gateway",
  version: "1.0.0"
});

// Tool 1: Cek Status Server
server.tool(
  "check_gateway_status",
  "Mengecek status apakah cloud gateway aktif",
  {},
  async () => {
    return {
      content: [{ type: "text", text: "Cloud MCP Gateway aktif dan berjalan lancar di Glitch!" }]
    };
  }
);

// Jalur komunikasi SSE untuk Qwen
let transport = null;

app.get("/sse", async (req, res) => {
  console.log("Qwen terhubung");
  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);
});

app.post("/message", async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("Koneksi SSE belum dimulai");
  }
});

app.get("/", (req, res) => {
  res.send("Server MCP Berjalan!");
});

app.listen(PORT, () => {
  console.log(`Server aktif di port ${PORT}`);
});
