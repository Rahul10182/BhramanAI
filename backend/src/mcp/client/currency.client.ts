import { BaseMCPClient } from './mcp.client.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CurrencyMCPClient extends BaseMCPClient {
    constructor() {
        // Points to the compiled output of the server file you provided
        const serverPath = path.resolve(__dirname, '../../../../mcp-servers/currency-mcp/dist/server.js');
        super('currency', 'node', [serverPath]);
    }

    /**
     * Calls the 'convert_currency' tool on the MCP server.
     * Arguments match the Zod schema defined in convertCurrency.tool.ts
     */
    public async convertCurrency(amount: number, from: string, to: string) {
        return this.callTool('convert_currency', { 
            amount, 
            from, 
            to 
        });
    }
}