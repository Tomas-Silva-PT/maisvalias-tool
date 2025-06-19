import { CapitalGainForUser } from "../../models/capitalgain.js";
import { RealizedTransaction } from "../../models/transaction.js";

class CapitalGainsFormatter {
    constructor() { }

    format(transactions: RealizedTransaction[]): CapitalGainForUser[] {

        let capitalGains: CapitalGainForUser[] = [];

        for (const realizedTransaction of transactions) {
            const buy = realizedTransaction.buy;
            const sell = realizedTransaction.sell;
            const realizedValue = realizedTransaction.realizedValue;
            const acquiredValue = realizedTransaction.acquiredValue;

            let code: string = "";
            switch (realizedTransaction.buy.asset.assetType) {
                case "EQUITY":
                    code = "G01";
                    break;
                case "ETF":
                    code = "G20";
                    break;
            }

            let countryDomiciled = buy.asset.countryDomiciled;
            // Para ações domiciliadas em Portugal e adquiridas em corretoras estrangeiras, o país da fonte deve ser o da corretora
            if (countryDomiciled?.code === "620") {
                countryDomiciled = buy.broker.country;
            }

            const ticker = sell.asset.ticker;
            const dataAquisicao = buy.date
            const valorAquisicao = acquiredValue;
            const despesasAquisicao = realizedTransaction.buyFees + realizedTransaction.buyTaxes;
            const dataRealizacao = sell.date
            const valorRealizacao = realizedValue;
            const despesasRealizacao = realizedTransaction.sellFees + realizedTransaction.sellTaxes;

            const capitalGain: CapitalGainForUser = {
                transaction: realizedTransaction,
                "Ticker": ticker,
                "Aquisição": {
                    "Data": dataAquisicao,
                    "Valor": valorAquisicao,
                    "Despesas": Math.round(despesasAquisicao * 100) / 100,
                    "Moeda Original": buy.netAmountCurrency,
                    "Taxa de Câmbio": Math.round((buy.exchangeRate || 1) * 1000) / 1000,
                },
                "Realização": {
                    "Data": dataRealizacao,
                    "Valor": valorRealizacao,
                    "Despesas": Math.round(despesasRealizacao * 100) / 100,
                    "Moeda Original": sell.netAmountCurrency,
                    "Taxa de Câmbio": Math.round((sell.exchangeRate || 1) * 1000) / 1000,
                },
                "Balanço": Math.round((realizedValue - acquiredValue - despesasAquisicao - despesasRealizacao) * 100) / 100,
            };

            capitalGains.push(capitalGain);

        }

        return capitalGains;

    }
}

export { CapitalGainsFormatter };
