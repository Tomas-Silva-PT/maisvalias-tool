import { Country } from "./country.js";
import yf from "yahoo-finance2";

class Asset {
    constructor(ticker, isin, currency) {
        this.ticker = ticker;
        this.isin = isin;
        this.countryDomiciled = "";
        this.assetType = "";
        this.currency = currency;
    }

    async fetchData(assetBuffer) {
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
            const assetInfo = await yf.search(this.isin);
            this.assetType = assetInfo?.quotes[0]?.quoteType || "";
        } catch (error) {
            console.error("Erro ao buscar dados do ativo:", error);
        }

        if (assetBuffer) {
            assetBuffer.add(this);
        }
    }

    toString() {
        return `Asset(Ticker: ${this.ticker}, ISIN: ${this.isin})`;
    }

    toDict() {
        return {
            ticker: this.ticker,
            isin: this.isin,
            country_domiciled: this.countryDomiciled,
            asset_type: this.assetType,
            currency: this.currency
        };
    }

    fromDict(data) {
        this.ticker = data.ticker;
        this.isin = data.isin;
        this.countryDomiciled = data.country_domiciled;
        this.assetType = data.asset_type;
        this.currency = data.currency;
    }

    equals(other) {
        return this.isin === other.isin && this.currency === other.currency && this.ticker === other.ticker;
    }
}

class AssetBuffer {
    constructor() {
        this.assets = [];
    }

    add(asset) {
        this.assets.push(asset);
    }

    get(isin, ticker, currency) {
        return this.assets.find(a => a.isin === isin && a.currency === currency && a.ticker === ticker) || null;
    }
}

export { Asset, AssetBuffer };