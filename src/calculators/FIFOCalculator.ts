import { Currency } from "../models/currency";
import { CapitalGainEvent } from "../models/taxevent";
import { MatchedTransaction, Transaction, transactionEquals } from "../models/transaction";
import { CapitalGainsCalculator } from "./CapitalGainsCalculator";
class FIFOCalculator implements CapitalGainsCalculator {
    async calculate(transactions: MatchedTransaction[], year?: number, currency: string = "EUR"): Promise<CapitalGainEvent[]> {
        const realizedTransactions: CapitalGainEvent[] = [];
        const currencyConverter = new Currency();

        for (const transaction of transactions) {
            const sellTransaction = transaction.sell;
            const buyTransaction = transaction.buy;
            const shares = transaction.shares;

            // Verificar se a venda ocorreu no ano especificado
            if (year && sellTransaction.date.year !== year)
                continue;

            // Converter o montante da venda para a moeda da declaração
            let sellNetAmount = 0;
            if (sellTransaction.currency === currency) {
                // console.log(`[SELL] Net amount used for ${sellTransaction.asset.ticker}`);
                sellNetAmount = sellTransaction.amount;
            } else if (sellTransaction.exchangeRate) {
                // console.log(`[SELL] Exchange rate used for ${sellTransaction.asset.ticker}: ${sellTransaction.exchangeRate}`);
                sellNetAmount =
                    sellTransaction.amount * sellTransaction.exchangeRate;
            } else {
                // console.log(`[SELL] Fetching exchange rate used for ${sellTransaction.asset.ticker}`);
                sellNetAmount = await currencyConverter.convert(
                    sellTransaction.amount,
                    sellTransaction.currency,
                    currency,
                    sellTransaction.date
                );
            }

            // Converter os custos da venda para a moeda da declaração
            let sellFeesAmount = 0;
            if (sellTransaction.fees) {
                for (let fee of sellTransaction.fees) {
                    if (fee.currency === currency) {
                        sellFeesAmount += fee.amount;
                    } else if (fee.exchangeRate) {
                        sellFeesAmount += fee.amount * fee.exchangeRate;
                    } else {
                        sellFeesAmount += await currencyConverter.convert(
                            fee.amount,
                            fee.currency,
                            currency,
                            sellTransaction.date
                        );
                    }
                }
            }

            let sellCompensationFeesAmount =
                (sellFeesAmount * shares) / sellTransaction.shares!!;

            // Converter os impostos da venda para a moeda da declaração
            let sellTaxesAmount = 0;
            if (sellTransaction.taxes) {
                for (let tax of sellTransaction.taxes) {
                    if (tax.currency === currency) {
                        sellTaxesAmount += tax.amount;
                    } else if (tax.exchangeRate) {
                        sellTaxesAmount += tax.amount * tax.exchangeRate;
                    } else {
                        sellTaxesAmount += await currencyConverter.convert(
                            tax.amount,
                            tax.currency,
                            currency,
                            sellTransaction.date
                        );
                    }
                }
            }

            let sellCompensationTaxesAmount =
                (sellTaxesAmount * shares) /
                sellTransaction.shares!!;

            // Calcular o montante bruto da venda - equivale ao montante que recebeu com a venda do ativo, antes de se retirar as comissões e outros encargos
            let sellGrossAmount = sellNetAmount + sellFeesAmount + sellTaxesAmount;

            // Cálculo do valor de realização (valor de venda)
            let sellUnitValue = sellGrossAmount / sellTransaction.shares!!;
            let realizedValue = sellUnitValue * shares; // não inclui despesas e encargos

            // Converter o montante da compra para a moeda da declaração
            let buyNetAmount = 0;
            if (buyTransaction.currency === currency) {
                // console.log(`[BUY] Net amount used for ${buyTransaction.asset.ticker}`);
                buyNetAmount = buyTransaction.amount;
            } else if (buyTransaction.exchangeRate) {
                // console.log(`[BUY] Exchange rate used for ${buyTransaction.asset.ticker}: ${buyTransaction.exchangeRate}`);
                buyNetAmount +=
                    buyTransaction.amount * buyTransaction.exchangeRate;
            } else {
                // console.log(`[BUY] Fetching exchange rate used for ${buyTransaction.asset.ticker}`);
                buyNetAmount = await currencyConverter.convert(
                    buyTransaction.amount,
                    buyTransaction.currency,
                    currency,
                    buyTransaction.date
                );
            }

            // Converter os custos da compra para a moeda da declaração
            let buyFeesAmount = 0;
            if (buyTransaction.fees) {
                for (let fee of buyTransaction.fees) {
                    if (fee.currency === currency) {
                        buyFeesAmount += fee.amount;
                    } else if (fee.exchangeRate) {
                        buyFeesAmount += fee.amount * fee.exchangeRate;
                    } else {
                        buyFeesAmount += await currencyConverter.convert(
                            fee.amount,
                            fee.currency,
                            currency,
                            buyTransaction.date
                        );
                    }
                }
            }

            let buyCompensationFeesAmount =
                (buyFeesAmount * shares) / buyTransaction.shares!!;

            // Converter os impostos da compra para a moeda da declaração
            let buyTaxesAmount = 0;
            if (buyTransaction.taxes) {
                for (let tax of buyTransaction.taxes) {
                    if (tax.currency === currency) {
                        buyTaxesAmount += tax.amount;
                    } else if (tax.exchangeRate) {
                        buyTaxesAmount += tax.amount * tax.exchangeRate;
                    } else {
                        buyTaxesAmount += await currencyConverter.convert(
                            tax.amount,
                            tax.currency,
                            currency,
                            buyTransaction.date
                        );
                    }
                }
            }
            let buyCompensationTaxesAmount =
                (buyTaxesAmount * shares) / buyTransaction.shares!!;

            // Calcular o montante bruto da compra - equivale ao montante que custou a comprar o ativo, sem contar com comissões ou outros encargos
            let buyGrossAmount = buyNetAmount - buyFeesAmount - buyTaxesAmount;

            // Cálculo do valor de aquisição (valor de compra)
            let buyUnitValue = buyGrossAmount / buyTransaction.shares!!;
            let acquiredValue = buyUnitValue * shares; // não inclui despesas e encargos

            realizedTransactions.push({
                kind: "capitalGain",
                buy: buyTransaction,
                sell: sellTransaction,
                buyFees: Math.round((buyCompensationFeesAmount) * 100) / 100,
                sellFees: Math.round((sellCompensationFeesAmount) * 100) / 100,
                buyTaxes: Math.round((buyCompensationTaxesAmount) * 100) / 100,
                sellTaxes: Math.round((sellCompensationTaxesAmount) * 100) / 100,
                realizedValue: Math.round(realizedValue * 100) / 100,
                acquiredValue: Math.round(acquiredValue * 100) / 100,
                currency: currency,
            });
        }

        // console.log("Realized transactions: " + JSON.stringify(realizedTransactions));

        return realizedTransactions;
    }

    match(transactions: Transaction[]): MatchedTransaction[] {
        const buyTransactions = transactions.filter((t) => t.type === "Buy");
        const sellTransactions = transactions.filter((t) => t.type === "Sell");

        // Order by the oldest to the most recent
        buyTransactions.sort(
            (a, b) => a.date.toMillis() - b.date.toMillis()
        );
        sellTransactions.sort(
            (a, b) => a.date.toMillis() - b.date.toMillis()
        );

        const compensations: MatchedTransaction[] = [];
        for (let sell of sellTransactions) {
            let remainingSharesForCompensation = sell.shares!!;

            for (let buy of buyTransactions) {
                if (buy.asset!!.isin !== sell.asset!!.isin) continue;
                // Verificar se a compra ocorreu depois da venda, nesse caso, ignorar
                if (buy.date.toMillis() > sell.date.toMillis()) continue;

                // Calcular nº de ações da compra já compensada anteriormente
                const alreadyCompensated = compensations
                    .filter((c) => transactionEquals(c.buy, buy))
                    .reduce((sum, c) => sum + c.shares, 0);

                // Calcular nº de ações da compra que faltam compensar
                const availableShares = buy.shares!! - alreadyCompensated;
                if (availableShares < Number.EPSILON) continue;

                // Calcular nº de ações da venda que podem ser compensadas
                const sharesToCompensate = Math.min(
                    availableShares,
                    remainingSharesForCompensation
                );
                remainingSharesForCompensation -= sharesToCompensate;

                compensations.push({
                    buy: buy,
                    sell: sell,
                    shares: sharesToCompensate,
                });

                // Verificar se todas as ações da venda foram compensadas
                if (remainingSharesForCompensation < Number.EPSILON) break;
            }
        }

        return compensations;

    }


}

export { FIFOCalculator };