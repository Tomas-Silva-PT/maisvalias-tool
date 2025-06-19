import { CapitalGainToExcel } from "../../models/capitalgain.js";
import { RealizedTransaction } from "../../models/transaction.js";

class ExcelCapitalGainsFormatter {
    constructor() { }

    format(transactions: RealizedTransaction[]): CapitalGainToExcel[] {

        let capitalGains: CapitalGainToExcel[] = [];

        for (const realizedTransaction of transactions) {
            const buy = realizedTransaction.buy;
            const sell = realizedTransaction.sell;
            const realizedValue = realizedTransaction.realizedValue;
            const acquiredValue = realizedTransaction.acquiredValue;

            const ticker = sell.asset.ticker;
            const isin = sell.asset.isin;
            const dataAquisicao = buy.date
            const valorAquisicao = acquiredValue;
            const despesasAquisicao = Math.round((realizedTransaction.buyFees + realizedTransaction.buyTaxes) * 100) / 100;
            const taxaCambioAquisicao = buy.netAmountCurrency === "EUR" ? 1 : Math.round((buy.exchangeRate || 1) * 1000) / 1000
            const moedaOriginalAquisicao = buy.netAmountCurrency;
            const dataRealizacao = sell.date
            const valorRealizacao = realizedValue;
            const despesasRealizacao = Math.round((realizedTransaction.sellFees + realizedTransaction.sellTaxes) * 100) / 100;
            const taxaCambioRealizacao = sell.netAmountCurrency === "EUR" ? 1 : Math.round((sell.exchangeRate || 1) * 1000) / 1000
            const moedaOriginalRealizacao = sell.netAmountCurrency;
            const balance = Math.round((realizedValue - acquiredValue - despesasAquisicao - despesasRealizacao) * 100) / 100;

            const capitalGain: CapitalGainToExcel = {
                "Ticker": ticker,
                "ISIN": isin,
                "Data de Aquisição": dataAquisicao,
                "Valor de Aquisição": valorAquisicao,
                "Despesas de Aquisição": despesasAquisicao,
                "Moeda Original de Aquisição": moedaOriginalAquisicao,
                "Taxa de Câmbio de Aquisição": taxaCambioAquisicao,
                "Data de Realização": dataRealizacao,
                "Valor de Realização": valorRealizacao,
                "Despesas de Realização": despesasRealizacao,
                "Moeda Original de Realização": moedaOriginalRealizacao,
                "Taxa de Câmbio de Realização": taxaCambioRealizacao,
                "Balanço": balance,
            };

            capitalGains.push(capitalGain);

        }

        return capitalGains;

    }
}

export { ExcelCapitalGainsFormatter };
