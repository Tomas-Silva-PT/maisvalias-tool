var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Currency } from "../../../models/currency.js";
class PTCapitalGainsFormatter {
    constructor() { }
    format(statement_1, year_1) {
        return __awaiter(this, arguments, void 0, function* (statement, year, currency = "EUR") {
            // Obter transacoes referentes às compras e vendas
            const transactions = statement.getTransactions();
            const buyTransactions = transactions.filter((t) => t.type === "Buy");
            const sellTransactions = transactions.filter((t) => t.type === "Sell");
            buyTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            sellTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            // FIFO
            // Fazer compensação das vendas com as compras
            const compensations = [];
            for (let sell of sellTransactions) {
                let remainingSharesForCompensation = sell.shares;
                for (let buy of buyTransactions) {
                    if (buy.asset.isin !== sell.asset.isin)
                        continue;
                    // Verificar se a compra ocorreu depois da venda, nesse caso, ignorar
                    if (new Date(buy.date) > new Date(sell.date))
                        continue;
                    // Calcular nº de ações da compra já compensada anteriormente
                    const alreadyCompensated = compensations
                        .filter((c) => c.buy.equals(buy))
                        .reduce((sum, c) => sum + c.shares, 0);
                    // Calcular nº de ações da compra que faltam compensar
                    const availableShares = buy.shares - alreadyCompensated;
                    if (availableShares < Number.EPSILON)
                        continue;
                    // Calcular nº de ações da venda que podem ser compensadas
                    const sharesToCompensate = Math.min(availableShares, remainingSharesForCompensation);
                    remainingSharesForCompensation -= sharesToCompensate;
                    compensations.push({
                        buy: buy,
                        sell: sell,
                        shares: sharesToCompensate,
                    });
                    // Verificar se todas as ações da venda foram compensadas
                    if (remainingSharesForCompensation < Number.EPSILON)
                        break;
                }
            }
            // Formatar as compensações no formato das mais valias do IRS PT, referentes ao ano especificado
            let capitalGains = [];
            const currencyConverter = new Currency();
            for (const compensation of compensations) {
                // Verificar se a venda ocorreu no ano especificado
                if (year && new Date(compensation["sell"].date).getFullYear() !== year)
                    continue;
                // Converter o montante da venda para a moeda da declaração
                let sellNetAmount = 0;
                if (compensation["sell"].netAmountCurrency === currency) {
                    sellNetAmount = compensation["sell"].netAmount;
                }
                else if (compensation["sell"].exchangeRate) {
                    sellNetAmount =
                        compensation["sell"].netAmount * compensation["sell"].exchangeRate;
                }
                else {
                    sellNetAmount = yield currencyConverter.convert(compensation["sell"].netAmount, compensation["sell"].netAmountCurrency, currency, compensation["sell"].date);
                }
                // Converter os custos da venda para a moeda da declaração
                let sellFeesAmount = 0;
                if (compensation["sell"].fees) {
                    for (let fee of compensation["sell"].fees) {
                        if (fee.currency === currency) {
                            sellFeesAmount += fee.amount;
                        }
                        else if (fee.exchangeRate) {
                            sellFeesAmount += fee.amount * fee.exchangeRate;
                        }
                        else {
                            sellFeesAmount += yield currencyConverter.convert(fee.amount, fee.currency, currency, compensation["sell"].date);
                        }
                    }
                }
                let sellCompensationFeesAmount = (sellFeesAmount * compensation["shares"]) / compensation["sell"].shares;
                // Converter os impostos da venda para a moeda da declaração
                let sellTaxesAmount = 0;
                if (compensation["sell"].taxes) {
                    for (let tax of compensation["sell"].taxes) {
                        if (tax.currency === currency) {
                            sellTaxesAmount += tax.amount;
                        }
                        else if (tax.exchangeRate) {
                            sellTaxesAmount += tax.amount * tax.exchangeRate;
                        }
                        else {
                            sellTaxesAmount += yield currencyConverter.convert(tax.amount, tax.currency, currency, compensation["sell"].date);
                        }
                    }
                }
                let sellCompensationTaxesAmount = (sellTaxesAmount * compensation["shares"]) /
                    compensation["sell"].shares;
                // Calcular o montante bruto da venda
                let sellGrossAmount = sellNetAmount + sellFeesAmount + sellTaxesAmount;
                // Cálculo do valor de realização (valor de venda)
                let sellUnitValue = sellGrossAmount / compensation["sell"].shares;
                let realizedValue = sellUnitValue * compensation["shares"];
                // Converter o montante da compra para a moeda da declaração
                let buyNetAmount = 0;
                if (compensation["buy"].netAmountCurrency === currency) {
                    buyNetAmount = compensation["buy"].netAmount;
                }
                else if (compensation["buy"].exchangeRate) {
                    buyNetAmount +=
                        compensation["buy"].netAmount * compensation["buy"].exchangeRate;
                }
                else {
                    buyNetAmount = yield currencyConverter.convert(compensation["buy"].netAmount, compensation["buy"].netAmountCurrency, currency, compensation["sell"].date);
                }
                // Converter os custos da compra para a moeda da declaração
                let buyFeesAmount = 0;
                if (compensation["buy"].fees) {
                    for (let fee of compensation["buy"].fees) {
                        if (fee.currency === currency) {
                            buyFeesAmount += fee.amount;
                        }
                        else if (fee.exchangeRate) {
                            buyFeesAmount += fee.amount * fee.exchangeRate;
                        }
                        else {
                            buyFeesAmount += yield currencyConverter.convert(fee.amount, fee.currency, currency, compensation["buy"].date);
                        }
                    }
                }
                let buyCompensationFeesAmount = (buyFeesAmount * compensation["shares"]) / compensation["buy"].shares;
                // Converter os impostos da compra para a moeda da declaração
                let buyTaxesAmount = 0;
                if (compensation["buy"].taxes) {
                    for (let tax of compensation["buy"].taxes) {
                        if (tax.currency === currency) {
                            buyTaxesAmount += tax.amount;
                        }
                        else if (tax.exchangeRate) {
                            buyTaxesAmount += tax.amount * tax.exchangeRate;
                        }
                        else {
                            buyTaxesAmount += yield currencyConverter.convert(tax.amount, tax.currency, currency, compensation["buy"].date);
                        }
                    }
                }
                let buyCompensationTaxesAmount = (buyTaxesAmount * compensation["shares"]) / compensation["buy"].shares;
                // Calcular o montante bruto da compra
                let buyGrossAmount = buyNetAmount + buyFeesAmount + buyTaxesAmount;
                // Cálculo do valor de aquisição (valor de compra)
                let buyUnitValue = buyGrossAmount / compensation["buy"].shares;
                let acquiredValue = buyUnitValue * compensation["shares"];
                let code;
                code = "";
                switch (compensation["buy"].asset.assetType) {
                    case "EQUITY":
                        code = "G01";
                        break;
                    case "ETF":
                        code = "G20";
                        break;
                }
                let countryDomiciled = compensation["buy"].asset.countryDomiciled;
                // Para ações domiciliadas em Portugal e adquiridas em corretoras estrangeiras, o país da fonte deve ser o da corretora
                if ((countryDomiciled === null || countryDomiciled === void 0 ? void 0 : countryDomiciled.code) === "620") {
                    countryDomiciled = compensation["buy"].broker.country;
                }
                let capitalGain = {
                    Ticker: compensation["sell"].asset.ticker,
                    "País da fonte": `${countryDomiciled === null || countryDomiciled === void 0 ? void 0 : countryDomiciled.code} - ${countryDomiciled === null || countryDomiciled === void 0 ? void 0 : countryDomiciled.namePt}`,
                    Código: code,
                    "Ano de Aquisição": new Date(compensation["buy"].date).getFullYear(),
                    "Mês de Aquisição": new Date(compensation["buy"].date).getMonth() + 1,
                    "Dia de Aquisição": new Date(compensation["buy"].date).getDay(),
                    "Valor de Aquisição": Math.round(acquiredValue * 100) / 100,
                    "Ano de Realização": new Date(compensation["sell"].date).getFullYear(),
                    "Mês de Realização": new Date(compensation["sell"].date).getMonth() + 1,
                    "Dia de Realização": new Date(compensation["sell"].date).getDay(),
                    "Valor de Realização": Math.round(realizedValue * 100) / 100,
                    "Despesas e Encargos": Math.round((sellCompensationFeesAmount + buyCompensationFeesAmount) * 100) / 100,
                    "Imposto retido no estrangeiro": Math.round((sellCompensationTaxesAmount + buyCompensationTaxesAmount) * 100) / 100,
                    "País da Contraparte": `${compensation["sell"].broker.country.code} - ${compensation["sell"].broker.country.namePt}`,
                };
                capitalGains.push(capitalGain);
            }
            return capitalGains;
        });
    }
}
export { PTCapitalGainsFormatter };
