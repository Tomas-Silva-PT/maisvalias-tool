// import { Statement } from "../../models/statement.js";
// import { Transaction } from "../../models/transaction.js";
 import { Currency } from "../../models/currency.js";

class PTDividendsFormatter {
    constructor() {}

    format(statement, year, currency = "EUR") {
        // Obter transacoes referentes aos dividendos do ano a declarar
        const transactions = statement.getTransactions();
        const dividendTransactions = transactions.filter(t => t.type === "Dividend" && t.date.startsWith(year));
        const dividends = [];
        const dividendsByAsset = {};

        // Agrupar dividendos por ativo
        dividendTransactions.forEach(transaction => {
            if (!dividendsByAsset[transaction.asset.isin]) {
                dividendsByAsset[transaction.asset.isin] = [];
            }
            dividendsByAsset[transaction.asset.isin].push(transaction);
        });

        Object.values(dividendsByAsset).forEach(dividendTransactions => {
            let totalNetAmount = 0;
            let totalFeesAmount = 0;
            let totalTaxAmount = 0;
            const currencyConverter = new Currency();

            dividendTransactions.forEach(transaction => {
                totalNetAmount += transaction.netAmountCurrency === currency
                    ? transaction.netAmount
                    : currencyConverter.convert(transaction.netAmount, transaction.netAmountCurrency, currency, transaction.date);

                transaction.fees.forEach(fee => {
                    totalFeesAmount += fee.currency === currency
                        ? fee.amount
                        : currencyConverter.convert(fee.amount, fee.currency, currency, transaction.date);
                });

                transaction.taxes.forEach(tax => {
                    totalTaxAmount += tax.currency === currency
                        ? tax.amount
                        : currencyConverter.convert(tax.amount, tax.currency, currency, transaction.date);
                });
            });

            const dividendTransaction = dividendTransactions[0];
            const countryDomiciled = dividendTransaction.asset.countryDomiciled;

            dividends.push({
                Ticker: dividendTransaction.asset.ticker,
                "Código Rendimento": "E11 - Dividendos ou lucros - sem retenção em Portugal",
                "País da fonte": `${countryDomiciled.code} - ${countryDomiciled.name_pt}`,
                "Rendimento Bruto": totalNetAmount,
                "Imposto Pago no Estrangeiro - No país da fonte": totalFeesAmount + totalTaxAmount
            });
        });

        return dividends;
    }
}

export { PTDividendsFormatter };
