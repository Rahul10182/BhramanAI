import 'dotenv/config'; 
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  convertCurrencySchema, 
  handleConvertCurrency 
} from "./tools/convertCurrency.tool.js";

// Initialize the new higher-level McpServer
const server = new McpServer({
  name: "currency-mcp",
  version: "1.0.0",
});

// Register the tool using the modern, simplified syntax
server.tool("convert_currency", convertCurrencySchema, handleConvertCurrency);

// Start the server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Currency MCP Server is running and listening on stdio.");
}

run().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});