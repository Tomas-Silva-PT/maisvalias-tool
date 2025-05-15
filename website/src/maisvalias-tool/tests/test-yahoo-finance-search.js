var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { YahooFinance } from "../models/yahoofinance.js";
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const assetType = yield YahooFinance.getAssetType('XDWD');
            if (!assetType) {
                throw Error('Not found');
            }
            console.log('Asset type fetched successfully:', assetType);
            process.exit(0); // Success
        }
        catch (error) {
            console.error('Failed to fetch asset type:', error);
            process.exit(1); // Failure
        }
    });
}
testConnection();
