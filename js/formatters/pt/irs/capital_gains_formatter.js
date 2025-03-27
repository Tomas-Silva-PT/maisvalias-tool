import { Currency } from "./Currency";

class PTCapitalGainsFormatter {
    constructor() {}

    format(statement, year, currency = "EUR") {
        // Obter transacoes referentes às compras e vendas
        const transactions = statement.getTransactions();
        const buyTransactions = transactions.filter(t => t.type === "Buy");
        const sellTransactions = transactions.filter(t => t.type === "Sell");
        
        buyTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        sellTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // FIFO
        
        // Fazer compensação das vendas com as compras
        const compensations = [];
        sellTransactions.forEach(sell => {
            let remainingShares = sell.shares;
            
            for (const buy of buyTransactions) {
                if (buy.asset.isin !== sell.asset.isin) continue;
                // Verificar se a compra ocorreu depois da venda, nesse caso, ignorar
                if (new Date(buy.date) > new Date(sell.date)) continue;

                // Calcular nº de ações da compra já compensada anteriormente
                const alreadyCompensated = compensations
                    .filter(c => c.buy.equals(buy))
                    .reduce((sum, c) => sum + c.shares, 0);

                // Calcular nº de ações da compra que faltam compensar
                const availableShares = buy.shares - alreadyCompensated;
                if (availableShares <= 0) continue;

                // Calcular nº de ações da venda que podem ser compensadas
                const sharesToCompensate = Math.min(availableShares, remainingShares);
                remainingShares -= sharesToCompensate;

                compensations.push({ buy, sell, shares: sharesToCompensate });

                // Verificar se todas as ações da venda foram compensadas
                if (remainingShares === 0) break;
            }
        });

        // Formatar as compensações no formato das mais valias do IRS PT, referentes ao ano especificado
        const capitalGains = [];
        const currencyConverter = new Currency();

        compensations.forEach(({ buy, sell, shares }) => {
            // Verificar se a venda ocorreu no ano especificado
            if (new Date(sell.date).getFullYear() !== parseInt(year)) return;

            // Converter o montante da venda para a moeda da declaração
            const sellNetAmount = sell.netAmountCurrency === currency
                ? sell.netAmount
                : currencyConverter.convert(sell.netAmount, sell.netAmountCurrency, currency, sell.date);

            // Converter os custos da venda para a moeda da declaração
            const sellFeesAmount = sell.fees.reduce((sum, fee) => sum + (fee.currency === currency
                ? fee.amount
                : currencyConverter.convert(fee.amount, fee.currency, currency, sell.date)), 0) * shares / sell.shares;
            
            // Converter os impostos da venda para a moeda da declaração
            const sellTaxesAmount = sell.taxes.reduce((sum, tax) => sum + (tax.currency === currency
                ? tax.amount
                : currencyConverter.convert(tax.amount, tax.currency, currency, sell.date)), 0) * shares / sell.shares;

            const sellGrossAmount = sellNetAmount - sellFeesAmount - sellTaxesAmount;
            const sellUnitValue = sellGrossAmount / sell.shares;
            const realizedValue = sellUnitValue * shares;

            const buyNetAmount = buy.netAmountCurrency === currency
                ? buy.netAmount
                : currencyConverter.convert(buy.netAmount, buy.netAmountCurrency, currency, buy.date);

            const buyFeesAmount = buy.fees.reduce((sum, fee) => sum + (fee.currency === currency
                ? fee.amount
                : currencyConverter.convert(fee.amount, fee.currency, currency, buy.date)), 0) * shares / buy.shares;

            const buyTaxesAmount = buy.taxes.reduce((sum, tax) => sum + (tax.currency === currency
                ? tax.amount
                : currencyConverter.convert(tax.amount, tax.currency, currency, buy.date)), 0) * shares / buy.shares;

            const buyGrossAmount = buyNetAmount + buyFeesAmount + buyTaxesAmount;
            const buyUnitValue = buyGrossAmount / buy.shares;
            const acquiredValue = buyUnitValue * shares;

            const code = buy.asset.assetType === "EQUITY" ? "G01" : "G20";
            const countryDomiciled = buy.asset.countryDomiciled;

            capitalGains.push({
                Ticker: sell.asset.ticker,
                "País da fonte": `${countryDomiciled.code} - ${countryDomiciled.name_pt}`,
                "Código": code,
                "Ano de Aquisição": new Date(buy.date).getFullYear(),
                "Mês de Aquisição": new Date(buy.date).getMonth() + 1,
                "Valor de Aquisição": acquiredValue,
                "Ano de Realização": new Date(sell.date).getFullYear(),
                "Mês de Realização": new Date(sell.date).getMonth() + 1,
                "Valor de Realização": realizedValue,
                "Despesas e Encargos": sellFeesAmount + buyFeesAmount,
                "Imposto retido no estrangeiro": sellTaxesAmount + buyTaxesAmount,
                "País da Contraparte": `${sell.broker.country.code} - ${sell.broker.country.name_pt}`
            });
        });

        return capitalGains;
    }
}

export { PTCapitalGainsFormatter };