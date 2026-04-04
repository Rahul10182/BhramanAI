import { BaseMCPClient } from './mcp.client.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CurrencyMCPClient extends BaseMCPClient {
    constructor() {
        // 1. Path to the compiled server code
        const serverPath = path.resolve(__dirname, '../../../../mcp-servers/currency-mcp/dist/server.js');
        
        // 2. Path to the server's specific .env file
        const envPath = path.resolve(__dirname, '../../../../mcp-servers/currency-mcp/.env');

        // 3. Pass the native Node --env-file flag before the script path!
        super('currency', 'node', [
            `--env-file=${envPath}`, 
            serverPath
        ]);
    }

    public async convertCurrency(amount: number, from: string, to: string) {
        return this.callTool('convert_currency', { 
            amount, 
            from, 
            to 
        });
    }
}