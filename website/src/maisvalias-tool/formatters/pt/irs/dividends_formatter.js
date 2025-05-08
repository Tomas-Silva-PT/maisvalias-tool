var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Currency } from "../../../models/currency.js";
class PTDividendsFormatter {
    constructor() { }
    format(statement_1, year_1) {
        return __awaiter(this, arguments, void 0, function* (statement, year, currency = "EUR") {
            // Obter transacoes referentes aos dividendos do ano a declarar
            const transactions = statement.getTransactions();
            const dividendTransactions = transactions.filter((t) => t.type === "Dividend" && (!year || t.date.startsWith(year.toString())));
            const dividends = [];
            const dividendsByAsset = {};
            // Agrupar dividendos por ativo e ano
            dividendTransactions.forEach((transaction) => {
                if (!dividendsByAsset[transaction.asset.isin]) {
                    dividendsByAsset[transaction.asset.isin] = {};
                }
                if (!dividendsByAsset[transaction.asset.isin][transaction.date.substring(0, 4)]) {
                    dividendsByAsset[transaction.asset.isin][transaction.date.substring(0, 4)] = [];
                }
                dividendsByAsset[transaction.asset.isin][transaction.date.substring(0, 4)].push(transaction);
            });
            const currencyConverter = new Currency();
            // console.log("dividendsByAsset", dividendsByAsset);
            let listDividendsByAsset = Object.values(dividendsByAsset);
            for (let listAssetDividends of listDividendsByAsset) {
                let listDividendsByAssetAndYear = Object.values(listAssetDividends);
                for (let listDividends of listDividendsByAssetAndYear) {
                    let totalNetAmount = 0;
                    let totalFeesAmount = 0;
                    let totalTaxAmount = 0;
                    let totalGrossAmount = 0;
                    for (let transaction of listDividends) {
                        const fees = transaction.fees;
                        const taxes = transaction.taxes;
                        for (let fee of fees) {
                            if (fee.currency === currency) {
                                totalFeesAmount += fee.amount;
                            }
                            else {
                                totalFeesAmount += yield currencyConverter.convert(fee.amount, fee.currency, currency, transaction.date);
                            }
                        }
                        for (let tax of taxes) {
                            if (tax.currency === currency) {
                                totalTaxAmount += tax.amount;
                            }
                            else {
                                totalTaxAmount += yield currencyConverter.convert(tax.amount, tax.currency, currency, transaction.date);
                            }
                        }
                        if (transaction.netAmountCurrency === currency) {
                            totalNetAmount += transaction.netAmount;
                        }
                        else {
                            totalNetAmount += yield currencyConverter.convert(transaction.netAmount, transaction.netAmountCurrency, currency, transaction.date);
                        }
                    }
                    // Calcular rendimento bruto
                    // Devido às limitações em JavaScript de "float-point" errors, o valor do rendimento bruto deve ser arredondado para 2 casas decimais
                    totalFeesAmount = parseFloat(totalFeesAmount.toFixed(2));
                    totalTaxAmount = parseFloat(totalTaxAmount.toFixed(2));
                    const totalExpenses = parseFloat((totalFeesAmount + totalTaxAmount).toFixed(2));
                    totalGrossAmount = totalNetAmount + totalExpenses;
                    totalGrossAmount = parseFloat(totalGrossAmount.toFixed(2));
                    const dividendTransaction = listDividends[0];
                    const countryDomiciled = dividendTransaction.asset.countryDomiciled;
                    // if(dividendTransaction.asset.ticker == "MDT") {
                    //   console.log("totalFeesAmount", totalFeesAmount);
                    //   console.log("totaltaxamount", totalTaxAmount);
                    // }
                    let entry = {
                        Ticker: dividendTransaction.asset.ticker,
                        "Ano rendimento": dividendTransaction.date.substring(0, 4),
                        "Código Rendimento": "E11 - Dividendos ou lucros - sem retenção em Portugal",
                        "País da fonte": `${countryDomiciled === null || countryDomiciled === void 0 ? void 0 : countryDomiciled.code} - ${countryDomiciled === null || countryDomiciled === void 0 ? void 0 : countryDomiciled.namePt}`,
                        "Rendimento Bruto": totalGrossAmount,
                        "Imposto Pago no Estrangeiro - No país da fonte": totalExpenses,
                    };
                    dividends.push(entry);
                }
            }
            // Como na AT a chave de cada linha é o país da fonte e o código de rendimento, temos de agrupar segundo isso
            // Se quiseres ignorar este facto para poderes mostrar os dividendos por ativo, comenta o seguinte bloco de código
            const dividendsForUser = dividends;
            let dividendsForIRS = dividends.reduce((acc, curr) => {
                let ref = acc.find((dividend) => dividend["Código Rendimento"] === curr["Código Rendimento"] && dividend["País da fonte"] === curr["País da fonte"] && dividend["Ano rendimento"] === curr["Ano rendimento"]);
                if (ref) {
                    ref["Rendimento Bruto"] += curr["Rendimento Bruto"];
                    ref["Imposto Pago no Estrangeiro - No país da fonte"] += curr["Imposto Pago no Estrangeiro - No país da fonte"];
                }
                else {
                    const { Ticker } = curr, rest = __rest(curr, ["Ticker"]);
                    acc.push(rest);
                }
                return acc;
            }, []);
            return {
                "toUser": dividendsForUser,
                "toIRS": dividendsForIRS
            };
        });
    }
}
export { PTDividendsFormatter };
