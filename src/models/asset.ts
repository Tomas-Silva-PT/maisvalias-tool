import { Country } from "./country.js";
import { YahooFinance } from "./yahoofinance.js";

class Asset {
    ticker: string;
    isin: string;
    countryDomiciled?: Country;
    assetType: string;
    currency: string;

    constructor(ticker: string, isin: string, currency: string) {
        this.ticker = ticker;
        this.isin = isin;
        this.assetType = "";
        this.currency = currency;
    }

    toString(): string {
        return `Asset(Ticker: ${this.ticker}, ISIN: ${this.isin})`;
    }

    equals(other: Asset): boolean {
        return this.isin === other.isin && this.currency === other.currency && this.ticker === other.ticker;
    }

    static async getAssetTypes(isins : string[]): Promise<Record<string, string>> {
        // Obter tipo de ativos usando Yahoo Finance
        let assetTypes : Record<string, string> = {};
        const BATCH_SIZE = 7;
        try {
            for(let i = 0; i < isins.length; i += BATCH_SIZE) {
                const batch = isins.slice(i, i + BATCH_SIZE);
                const batchResult = await YahooFinance.getAssetTypeBatch(batch);
                Object.assign(assetTypes, batchResult);
            }
            
            // console.log("Asset Types: " + JSON.stringify(assetTypes));
        } catch (error) {
            console.error("Erro ao buscar dados do ativo:", error);
        }
        return assetTypes;
    }
}

export { Asset };