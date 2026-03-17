import * as dotenv from 'dotenv';
dotenv.config();

interface ExchangeRateResponse {
  result: 'success' | 'error';
  'error-type'?: string;
  conversion_rate?: number;
  conversion_result?: number;
}

export class ForexProvider {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.EXCHANGERATE_API_KEY || '';
    if (!this.apiKey) {
      throw new Error("EXCHANGERATE_API_KEY environment variable is missing.");
    }
  }

  async convertCurrency(from: string, to: string, amount: number): Promise<{ rate: number, result: number }> {
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();

    const url = `https://v6.exchangerate-api.com/v6/${this.apiKey}/pair/${fromCode}/${toCode}/${amount}`;

    const response = await fetch(url);
    const data = await response.json() as ExchangeRateResponse;
    
    if (data.result === 'error') {
      throw new Error(`API Error: ${data['error-type']}`);
    }

    if (data.result === 'success') {
      return {
        rate: data.conversion_rate!,
        result: data.conversion_result!
      };
    }

    throw new Error("Unexpected response from the exchange rate API.");
  }
}