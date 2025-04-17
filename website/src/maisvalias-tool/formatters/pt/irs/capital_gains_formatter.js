import { Currency } from "../../../models/currency.js";

class PTCapitalGainsFormatter {
    constructor() {}

    async format(statement, year, currency = "EUR") {
        // Obter transacoes referentes às compras e vendas
        const transactions = statement.getTransactions();
        const buyTransactions = transactions.filter(t => t.type === "Buy");
        const sellTransactions = transactions.filter(t => t.type === "Sell");
        
        buyTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        sellTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // FIFO
        
        // Fazer compensação das vendas com as compras
        const compensations = [];
        for (let sell of sellTransactions) {
            let remainingSharesForCompensation = sell.shares;

            for (let buy of buyTransactions) {
                if (buy.asset.isin !== sell.asset.isin) continue;
                // Verificar se a compra ocorreu depois da venda, nesse caso, ignorar
                if (new Date(buy.date) > new Date(sell.date)) continue;

                // Calcular nº de ações da compra já compensada anteriormente
                const alreadyCompensated = compensations
                    .filter(c => c.buy.equals(buy))
                    .reduce((sum, c) => sum + c.shares, 0);

                // Calcular nº de ações da compra que faltam compensar
                const availableShares = buy.shares - alreadyCompensated;
                if (availableShares < Number.EPSILON) continue;

                // Calcular nº de ações da venda que podem ser compensadas
                const sharesToCompensate = Math.min(availableShares, remainingSharesForCompensation);
                remainingSharesForCompensation -= sharesToCompensate;

                compensations.push({ buy: buy, sell: sell, shares: sharesToCompensate });

                // Verificar se todas as ações da venda foram compensadas
                if (remainingSharesForCompensation < Number.EPSILON) break;    
            }
        }

        // Formatar as compensações no formato das mais valias do IRS PT, referentes ao ano especificado
        const capitalGains = [];
        const currencyConverter = new Currency();
        for (const compensation of compensations) {
            // Verificar se a venda ocorreu no ano especificado
            if (new Date(compensation["sell"].date).getFullYear() !== parseInt(year)) continue;

            // Converter o montante da venda para a moeda da declaração
            let sellNetAmount = 0;
            if (compensation["sell"].netAmountCurrency === currency) {
                sellNetAmount = compensation["sell"].netAmount;
            } else {
                sellNetAmount = await currencyConverter.convert(compensation["sell"].netAmount, compensation["sell"].netAmountCurrency, currency, compensation["sell"].date);
            }

            // Converter os custos da venda para a moeda da declaração
            let sellFeesAmount = 0;
            for (let fee of compensation["sell"].fees) {
                if (fee.currency === currency) {
                    sellFeesAmount += fee.amount;
                } else {
                    sellFeesAmount += await currencyConverter.convert(fee.amount, fee.currency, currency, compensation["sell"].date);
                }
            }
            let sellCompensationFeesAmount = sellFeesAmount * compensation["shares"] / compensation["sell"].shares;

            // Converter os impostos da venda para a moeda da declaração
            let sellTaxesAmount = 0;
            for (let tax of compensation["sell"].taxes) {
                if (tax.currency === currency) {
                    sellTaxesAmount += tax.amount;
                } else {
                    sellTaxesAmount += await currencyConverter.convert(tax.amount, tax.currency, currency, compensation["sell"].date);
                }
            }
            let sellCompensationTaxesAmount = sellTaxesAmount * compensation["shares"] / compensation["sell"].shares;

            // Calcular o montante bruto da venda
            let sellGrossAmount = sellNetAmount + sellFeesAmount + sellTaxesAmount;
            
            // Cálculo do valor de realização (valor de venda)
            let sellUnitValue = sellGrossAmount / compensation["sell"].shares;
            let realizedValue = sellUnitValue * compensation["shares"];

            // Converter o montante da compra para a moeda da declaração
            let buyNetAmount = 0;
            if (compensation["buy"].netAmountCurrency === currency) {
                buyNetAmount = compensation["buy"].netAmount;
            } else {
                buyNetAmount = await currencyConverter.convert(compensation["buy"].netAmount, compensation["buy"].netAmountCurrency, currency, compensation["sell"].date);
            }

            // Converter os custos da compra para a moeda da declaração
            let buyFeesAmount = 0;
            for (let fee of compensation["buy"].fees) {
                if (fee.currency === currency) {
                    buyFeesAmount += fee.amount;
                } else {
                    buyFeesAmount += await currencyConverter.convert(fee.amount, fee.currency, currency, compensation["buy"].date);
                }
            }
            let buyCompensationFeesAmount = buyFeesAmount * compensation["shares"] / compensation["buy"].shares;

            // Converter os impostos da compra para a moeda da declaração
            let buyTaxesAmount = 0;
            for (let tax of compensation["buy"].taxes) {
                if (tax.currency === currency) {
                    buyTaxesAmount += tax.amount;
                } else {
                    buyTaxesAmount += await currencyConverter.convert(tax.amount, tax.currency, currency, compensation["buy"].date);
                }
            }
            let buyCompensationTaxesAmount = buyTaxesAmount * compensation["shares"] / compensation["buy"].shares;

            // Calcular o montante bruto da compra
            let buyGrossAmount = buyNetAmount + buyFeesAmount + buyTaxesAmount;
            
            // Cálculo do valor de aquisição (valor de compra)
            let buyUnitValue = buyGrossAmount / compensation["buy"].shares;
            let acquiredValue = buyUnitValue * compensation["shares"];

            let code;
            switch(compensation["buy"].asset.assetType) {
                case "EQUITY":
                    code = "G01"
                    break;
                case "ETF":
                    code = "G20"
                    break;
            }

            let countryDomiciled = compensation["buy"].asset.countryDomiciled;

            capitalGains.push({
                "Ticker": compensation["sell"].asset.ticker,
                "País da fonte": `${countryDomiciled.code} - ${countryDomiciled.namePt}`,
                "Código": code,
                "Ano de Aquisição": new Date(compensation["buy"].date).getFullYear(),
                "Mês de Aquisição": new Date(compensation["buy"].date).getMonth() + 1,
                "Valor de Aquisição": acquiredValue,
                "Ano de Realização": new Date(compensation["sell"].date).getFullYear(),
                "Mês de Realização": new Date(compensation["sell"].date).getMonth() + 1,
                "Valor de Realização": realizedValue,
                "Despesas e Encargos": sellCompensationFeesAmount + buyCompensationFeesAmount,
                "Imposto retido no estrangeiro": sellCompensationTaxesAmount + buyCompensationTaxesAmount,
                "País da Contraparte": `${compensation["sell"].broker.country.code} - ${compensation["sell"].broker.country.namePt}`
            });

        }
        

        return capitalGains;
    }
}

export { PTCapitalGainsFormatter };