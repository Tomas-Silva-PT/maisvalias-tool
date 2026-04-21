import { Country } from "./country.js";
import { YahooFinance } from "./yahoofinance.js";

class Asset {
    name: string;
    ticker: string;
    isin: string;
    countryDomiciled?: Country;
    assetType: string;
    currency: string;

    constructor(name: string, ticker: string, isin: string, currency: string, assetType: AssetType = "") {
        this.name = name;
        this.ticker = ticker;
        this.isin = isin;
        this.assetType = assetType;
        this.currency = currency;
    }

    toString(): string {
        return `Asset(Ticker: ${this.ticker}, ISIN: ${this.isin}, Type: ${this.assetType})`;
    }

    equals(other: Asset): boolean {
        return this.isin === other.isin && this.currency === other.currency && this.ticker === other.ticker;
    }

    static async getAssetTypes(isins : string[]): Promise<Record<string, string>> {
        // Obter tipo de ativos usando Yahoo Finance
        let assetTypes : Record<string, string> = {};

        try {
            assetTypes = await YahooFinance.getAssetTypeBatch(isins);
        } catch (error) {
            console.error("Erro ao buscar dados do ativo:", error);
        }
        return assetTypes;
    }
}

type AssetType = "STOCK" | "ETF" | "CRYPTO" | "";

export { Asset, AssetType };