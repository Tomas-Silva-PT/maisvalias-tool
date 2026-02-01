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
                    "Data": dataAquisicao.toISODate()!,
                    "Valor": valorAquisicao, // Corresponde ao valor da ordem de compra do ativo (ou seja, quanto é que o vendedor recebeu pela tua compra)
                    "Despesas": Math.round(despesasAquisicao * 100) / 100,
                    "Moeda Original": buy.netAmountCurrency,
                    "Taxa de Câmbio": Math.round((buy.exchangeRate || 1) * 1000) / 1000,
                },
                "Realização": {
                    "Data": dataRealizacao.toISODate()!,
                    "Valor": valorRealizacao, // Corresponde ao valor da ordem de venda do ativo (ou seja, quanto é que o comprador pagou pela tua venda)
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
