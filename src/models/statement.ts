import { DateTime } from "luxon";
import { Asset } from "./asset.js";
import { Country } from "./country.js";
import { Currency } from "./currency.js";
import { Fee } from "./fee.js";
import { Tax } from "./tax.js";
import { Transaction, transactionEquals } from "./transaction.js";
import { ExchangeRate } from "./yahoofinance.js";

type ExchangeRateToFetch = {
    currency: string;
    dates: DateTime[];
};

class Statement {
    transactions: Transaction[];
    baseCurrency: string;
    constructor(transactions = [], baseCurrency = "EUR") {
        this.transactions = transactions;
        this.baseCurrency = baseCurrency;
        this.sortTransactions();
    }

    pushExchangeRateToFetch(
        exchangesToFetch: ExchangeRateToFetch[],
        currency: string,
        date: DateTime
    ) {
        let rate = exchangesToFetch.find((r) => r.currency === currency);

        if (rate) {
            rate.dates.push(date);
        } else {
            exchangesToFetch.push({
                currency,
                dates: [date],
            });
        }
    }

    async fetchExchangeRates() {
        const exchangeRatesToFetch: ExchangeRateToFetch[] = [];
        const transactionsWithoutExchangeRate : Transaction[] = [];
        let taxesWithoutExchangeRate : Record<string, Tax>[] = [];
        let feesWithoutExchangeRate : Record<string, Fee>[] = [];

        for (const transaction of this.transactions) {
            const { currency, exchangeRate, date, taxes = [], fees = [] } = transaction;

            let currenciesToCheck : string[] = [];

            if (currency !== this.baseCurrency && (!exchangeRate || exchangeRate === 0 || exchangeRate === 1)) {
                currenciesToCheck.push(currency);
                transactionsWithoutExchangeRate.push(transaction);
            }

            for (const tax of taxes) {
                if (tax.currency !== this.baseCurrency) {
                    // console.log("Tax: " + JSON.stringify(tax));
                    currenciesToCheck.push(tax.currency);
                    let key = transaction.date;
                    let value = tax;
                    taxesWithoutExchangeRate.push({[key.toISODate()!]: value});
                }
            }

            for (const fee of fees) {
                if (fee.currency !== this.baseCurrency) {
                    // console.log("Fee: " + JSON.stringify(fee));
                    currenciesToCheck.push(fee.currency);
                    let key = transaction.date;
                    let value = fee;
                    feesWithoutExchangeRate.push({[key.toISODate()!]: value});
                }
            }

            // Remove duplicates
            currenciesToCheck.sort();
            currenciesToCheck = currenciesToCheck.filter(
                (currency, index) => currenciesToCheck.indexOf(currency) === index
            );

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
            const exchangeRates : ExchangeRate[] = await Currency.getExchangeRates(rateToFetch.currency, this.baseCurrency, rateToFetch.dates);
            //  console.log("Exchange Rates: ", JSON.stringify(exchangeRates));
            
            transactionsWithoutExchangeRate.filter((transaction) => transaction.currency === rateToFetch.currency).forEach((transaction) => {
                // console.log("Date transaction: ", transaction.date);
                transaction.exchangeRate = exchangeRates.find((rate) => rate.date.equals(transaction.date))?.close;
            });
            // console.log("Adding exchange rates to taxes");
            taxesWithoutExchangeRate.filter((tax) => Object.values(tax)[0].currency === rateToFetch.currency).forEach((tax) => {
                let taxObject = Object.values(tax)[0];
                let date = Object.keys(tax)[0];
                // console.log("Date tax: ", date);
                let trueExchangeRate = exchangeRates.find((rate) => rate.date === DateTime.fromISO(date));
                // console.log("True Exchange Rate: ", trueExchangeRate);
                taxObject.exchangeRate = trueExchangeRate?.close;
            });
            
            feesWithoutExchangeRate.filter((fee) => Object.values(fee)[0].currency === rateToFetch.currency).forEach((fee) => {
                let feeObject = Object.values(fee)[0];
                let date = Object.keys(fee)[0];
                // console.log("Date fee: ", date);
                let trueExchangeRate = exchangeRates.find((rate) => rate.date === DateTime.fromISO(date));
                // console.log("True Exchange Rate: ", trueExchangeRate);
                feeObject.exchangeRate = trueExchangeRate?.close;
            });
        }

        const end = performance.now();
        console.log(`[END] Fetching exchange rate... (took ${((end - start) / 1000).toFixed(3)} seconds)`);


        // console.log("Taxes without exchange rate:" + JSON.stringify(taxesWithoutExchangeRate));

        // console.log("Exchange Rates Found");
    }

    async fetchAssetTypes() {
        const isins : string[] = [];
        for (let transaction of this.transactions) {
            const isin = transaction.asset!!.isin;
            if (isins.includes(isin)) continue;
            isins.push(isin);
        }

        console.log("[START] Fetching asset types...");
        const start = performance.now();

        const assetTypes : Record<string, string> = await Asset.getAssetTypes(isins);

        const end = performance.now();
        console.log(`[END] Fetching asset types... (took ${((end - start) / 1000).toFixed(3)} seconds)`);

        for (let transaction of this.transactions) {
            const isin = transaction.asset!!.isin;
            const assetType = assetTypes[isin];
            transaction.asset!!.assetType = assetType;
        }
    }

    fetchCountries() {
        for (let transaction of this.transactions) {
            const isin = transaction.asset!!.isin;
            transaction.asset!!.countryDomiciled = new Country(isin.substring(0, 2));
        }
    }


    async fetchData(): Promise<void> {
        await this.fetchExchangeRates();
        await this.fetchAssetTypes();
        this.fetchCountries();
    }

    addTransaction(transaction: Transaction): void {
        if (!this.transactions.some((t) => transactionEquals(t, transaction) )) {
            this.transactions.push(transaction);
            this.sortTransactions();
        }
    }

    addTransactions(transactions: Transaction[]): void {
        transactions.forEach((transaction) => this.addTransaction(transaction));
    }

    sortTransactions(reverse: boolean = false) {
        this.transactions.sort((a, b) => {
            return reverse ? b.date.toMillis() - a.date.toMillis() : a.date.toMillis() - b.date.toMillis();
        });
    }

    getTransactions(): Transaction[] {
        return this.transactions;
    }
}

export { Statement };
