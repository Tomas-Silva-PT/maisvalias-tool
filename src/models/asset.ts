import { Country } from "./country.js";
import { YahooFinance } from "./yahoofinance.js";
// import yf from "yahoo-finance2";

class Asset {
    ticker: string;
    isin: string;
    countryDomiciled?: Country;
    assetType: string;
    currency: string;

    constructor(ticker : string, isin : string, currency : string) {
        this.ticker = ticker;
        this.isin = isin;
        this.assetType = "";
        this.currency = currency;
    }

    async fetchData(assetBuffer : AssetBuffer) : Promise<any> {
        if (assetBuffer) {
            const bufferedAsset = assetBuffer.get(this.isin, this.ticker, this.currency);
            if (bufferedAsset) {
                this.countryDomiciled = bufferedAsset.countryDomiciled;
                this.assetType = bufferedAsset.assetType;
                return;
            }
        }

        // Obter país de domicilio
        this.countryDomiciled = new Country(this.isin.substring(0, 2));
        
        // Obter tipo de ativo usando Yahoo Finance
        try {
            // const assetInfo = await yf.search(this.isin);
            // this.assetType = assetInfo?.quotes[0]?.quoteType || "";
            this.assetType = await YahooFinance.getAssetType(this.isin);
        } catch (error) {
            console.error("Erro ao buscar dados do ativo:", error);
        }

        if (assetBuffer) {
            assetBuffer.add(this);
        }
    }

    toString() : string {
        return `Asset(Ticker: ${this.ticker}, ISIN: ${this.isin})`;
    }

    equals(other : Asset) : boolean {
        return this.isin === other.isin && this.currency === other.currency && this.ticker === other.ticker;
    }
}

class AssetBuffer {
    assets: Asset[];
    constructor() {
        this.assets = [];
    }

    add(asset : Asset) {
        this.assets.push(asset);
    }

    get(isin : string, ticker : string, currency : string) : Asset | undefined {
        return this.assets.find(a => a.isin === isin && a.currency === currency && a.ticker === ticker);
    }
}

export { Asset, AssetBuffer };