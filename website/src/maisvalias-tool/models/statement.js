var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Asset } from "./asset.js";
import { Country } from "./country.js";
import { Currency } from "./currency.js";
class Statement {
    constructor(transactions = [], baseCurrency = "EUR") {
        this.transactions = transactions;
        this.baseCurrency = baseCurrency;
        this.sortTransactions();
    }
    pushExchangeRateToFetch(exchangesToFetch, currency, date) {
        let rate = exchangesToFetch.find((r) => r.currency === currency);
        if (rate) {
            rate.fromDate = date < rate.fromDate ? date : rate.fromDate;
            rate.toDate = date > rate.toDate ? date : rate.toDate;
        }
        else {
            exchangesToFetch.push({
                currency,
                fromDate: date,
                toDate: date,
            });
        }
    }
    fetchExchangeRates() {
        return __awaiter(this, void 0, void 0, function* () {
            const exchangeRatesToFetch = [];
            const transactionsWithoutExchangeRate = [];
            let taxesWithoutExchangeRate = [];
            let feesWithoutExchangeRate = [];
            for (const transaction of this.transactions) {
                const { netAmountCurrency, exchangeRate, date, taxes = [], fees = [] } = transaction;
                let currenciesToCheck = [];
                if (netAmountCurrency !== this.baseCurrency && (!exchangeRate || exchangeRate !== 1)) {
                    currenciesToCheck.push(netAmountCurrency);
                    transactionsWithoutExchangeRate.push(transaction);
                }
                for (const tax of taxes) {
                    if (tax.currency !== this.baseCurrency) {
                        // console.log("Tax: " + JSON.stringify(tax));
                        currenciesToCheck.push(tax.currency);
                        let key = transaction.date;
                        let value = tax;
                        taxesWithoutExchangeRate.push({ [key]: value });
                    }
                }
                for (const fee of fees) {
                    if (fee.currency !== this.baseCurrency) {
                        // console.log("Fee: " + JSON.stringify(fee));
                        currenciesToCheck.push(fee.currency);
                        let key = transaction.date;
                        let value = fee;
                        feesWithoutExchangeRate.push({ [key]: value });
                    }
                }
                // Remove duplicates
                currenciesToCheck.sort();
                currenciesToCheck = currenciesToCheck.filter((currency, index) => currenciesToCheck.indexOf(currency) === index);
                for (const currency of currenciesToCheck) {
                    this.pushExchangeRateToFetch(exchangeRatesToFetch, currency, date);
                }
            }
            // console.log("Exchange rates to fetch:", JSON.stringify(exchangeRatesToFetch));
            // console.log("Taxes without exchange rate:" + JSON.stringify(taxesWithoutExchangeRate));
            // console.log("Fees without exchange rate:" + JSON.stringify(feesWithoutExchangeRate));
            // console.log("Transactions without exchange rate:" + JSON.stringify(transactionsWithoutExchangeRate));
            console.log(`[START] Fetching exchange rate...`);
            const start = performance.now();
            for (const rateToFetch of exchangeRatesToFetch) {
                const exchangeRates = yield Currency.getExchangeRates(rateToFetch.currency, this.baseCurrency, rateToFetch.fromDate, rateToFetch.toDate);
                //  console.log("Exchange Rates: ", JSON.stringify(exchangeRates));
                transactionsWithoutExchangeRate.filter((transaction) => transaction.netAmountCurrency === rateToFetch.currency).forEach((transaction) => {
                    var _a;
                    // console.log("Date transaction: ", transaction.date);
                    transaction.exchangeRate = (_a = exchangeRates.find((rate) => rate.date === transaction.date)) === null || _a === void 0 ? void 0 : _a.close;
                });
                // console.log("Adding exchange rates to taxes");
                taxesWithoutExchangeRate.filter((tax) => Object.values(tax)[0].currency === rateToFetch.currency).forEach((tax) => {
                    let taxObject = Object.values(tax)[0];
                    let date = Object.keys(tax)[0];
                    // console.log("Date tax: ", date);
                    let trueExchangeRate = exchangeRates.find((rate) => rate.date === date);
                    // console.log("True Exchange Rate: ", trueExchangeRate);
                    taxObject.exchangeRate = trueExchangeRate === null || trueExchangeRate === void 0 ? void 0 : trueExchangeRate.close;
                });
                feesWithoutExchangeRate.filter((fee) => Object.values(fee)[0].currency === rateToFetch.currency).forEach((fee) => {
                    let feeObject = Object.values(fee)[0];
                    let date = Object.keys(fee)[0];
                    // console.log("Date fee: ", date);
                    let trueExchangeRate = exchangeRates.find((rate) => rate.date === date);
                    // console.log("True Exchange Rate: ", trueExchangeRate);
                    feeObject.exchangeRate = trueExchangeRate === null || trueExchangeRate === void 0 ? void 0 : trueExchangeRate.close;
                });
            }
            const end = performance.now();
            console.log(`[END] Fetching exchange rate... (took ${((end - start) / 1000).toFixed(3)} seconds)`);
            // console.log("Taxes without exchange rate:" + JSON.stringify(taxesWithoutExchangeRate));
            // console.log("Exchange Rates Found");
        });
    }
    fetchAssetTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            const isins = [];
            for (let transaction of this.transactions) {
                const isin = transaction.asset.isin;
                if (isins.includes(isin))
                    continue;
                isins.push(isin);
            }
            console.log("[START] Fetching asset types...");
            const start = performance.now();
            const assetTypes = yield Asset.getAssetTypes(isins);
            const end = performance.now();
            console.log(`[END] Fetching asset types... (took ${((end - start) / 1000).toFixed(3)} seconds)`);
            for (let transaction of this.transactions) {
                const isin = transaction.asset.isin;
                const assetType = assetTypes[isin];
                transaction.asset.assetType = assetType;
            }
        });
    }
    fetchCountries() {
        for (let transaction of this.transactions) {
            const isin = transaction.asset.isin;
            transaction.asset.countryDomiciled = new Country(isin.substring(0, 2));
        }
    }
    fetchData() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchExchangeRates();
            yield this.fetchAssetTypes();
            this.fetchCountries();
        });
    }
    addTransaction(transaction) {
        if (!this.transactions.some((t) => t.equals(transaction))) {
            this.transactions.push(transaction);
            this.sortTransactions();
        }
    }
    addTransactions(transactions) {
        transactions.forEach((transaction) => this.addTransaction(transaction));
    }
    sortTransactions(reverse = false) {
        this.transactions.sort((a, b) => {
            if (a.date !== b.date)
                return reverse
                    ? b.date.localeCompare(a.date)
                    : a.date.localeCompare(b.date);
            return reverse
                ? b.time.localeCompare(a.time)
                : a.time.localeCompare(b.time);
        });
    }
    getTransactions() {
        return this.transactions;
    }
}
export { Statement };
