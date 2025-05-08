var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Country } from "./country.js";
import { YahooFinance } from "./yahoofinance.js";
// import yf from "yahoo-finance2";
class Asset {
    constructor(ticker, isin, currency) {
        this.ticker = ticker;
        this.isin = isin;
        this.assetType = "";
        this.currency = currency;
    }
    fetchData(assetBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
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
                this.assetType = yield YahooFinance.getAssetType(this.isin);
            }
            catch (error) {
                console.error("Erro ao buscar dados do ativo:", error);
            }
            if (assetBuffer) {
                assetBuffer.add(this);
            }
        });
    }
    toString() {
        return `Asset(Ticker: ${this.ticker}, ISIN: ${this.isin})`;
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
        return this.assets.find(a => a.isin === isin && a.currency === currency && a.ticker === ticker);
    }
}
export { Asset, AssetBuffer };
