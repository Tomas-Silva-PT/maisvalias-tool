var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { YahooFinance } from "./yahoofinance.js";
class Asset {
    constructor(ticker, isin, currency) {
        this.ticker = ticker;
        this.isin = isin;
        this.assetType = "";
        this.currency = currency;
    }
    toString() {
        return `Asset(Ticker: ${this.ticker}, ISIN: ${this.isin})`;
    }
    equals(other) {
        return this.isin === other.isin && this.currency === other.currency && this.ticker === other.ticker;
    }
    static getAssetTypes(isins) {
        return __awaiter(this, void 0, void 0, function* () {
            // Obter tipo de ativos usando Yahoo Finance
            let assetTypes = {};
            const BATCH_SIZE = 7;
            try {
                for (let i = 0; i < isins.length; i += BATCH_SIZE) {
                    const batch = isins.slice(i, i + BATCH_SIZE);
                    const batchResult = yield YahooFinance.getAssetTypeBatch(batch);
                    Object.assign(assetTypes, batchResult);
                }
                // console.log("Asset Types: " + JSON.stringify(assetTypes));
            }
            catch (error) {
                console.error("Erro ao buscar dados do ativo:", error);
            }
            return assetTypes;
        });
    }
}
export { Asset };
