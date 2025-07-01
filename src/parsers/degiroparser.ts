import { Transaction } from "../models/transaction";
import { Parser } from "./parser";
import { Degiro } from "../models/brokers/degiro";
import { Tax } from "../models/tax";
import { Fee } from "../models/fee";
import { DateTime } from "luxon";

class DegiroParser implements Parser {

    accountResume: [string, string][][] = [];

    loadAccountResume(fileData: string) {
        const data = fileData;
        const rows = data.split("\n").map((row) => row.split(","));
        const headers = rows.shift();

        if (!headers) {
            throw new Error("[Account resume] Invalid file data: no headers found");
        }

        rows.forEach((row) => {
            const record = headers.map((h, i) => [h, row[i]] as [string, string]);
            this.accountResume.push(record);
        });
    }

    parse(fileData: string): Transaction[] {
        const transactions: Transaction[] = [];
        const data = fileData;
        const rows = data.split("\n").map((row) => row.split(","));
        const headers = rows.shift();

        if (!headers) {
            throw new Error("[Parse] Invalid file data: no headers found");
        }

        if (!this.accountResume) {
            throw new Error("[Parse] Missing Account Resume");
        }

        rows.forEach((row) => {
            // const record = Object.fromEntries(headers.map((h, i) => [h, row[i]]));
            const record = headers.map((h, i) => [h, row[i]]);

            let date = record[0][1];
            let time = record[1][1];

            if (!date || !time) return;

            const dutchDate = DateTime.fromFormat(`${date} ${time}`, "dd-MM-yyyy HH:mm", { zone: "Europe/Amsterdam" });
            const utcDate = dutchDate.setZone("UTC");

            date = utcDate.toISODate()!;
            time = utcDate.toISOTime()!.split(".")[0];

            const product = record[2][1]; // A Degiro não fornece o Ticker...infelizmente... :(
            const isin = record[3][1];
            const shares = parseFloat(record[6][1]);
            const type = shares > 0 ? "Buy" : "Sell";
            const price = parseFloat(record[7][1]);
            const assetCurrency = record[8][1];
            const netAmountCurrency = record[12][1];
            const exchangeRate = parseFloat(record[13][1]) || 1;
            let feeAmount = Math.abs(parseFloat(record[14][1]) || 0);
            const feeCurrency = record[15][1];
            const feeExchangeRate = feeCurrency === netAmountCurrency ? 1 : feeCurrency === assetCurrency ? exchangeRate : 0; // Se o custo for na mesma moeda do ativo, utiliza-se a mesma taxa de câmbio. Senão, é necessário obter a taxa de câmbio através de uma API.
            

            // Obter o total custo da transação (porque a Degiro esconde taxas como a AutoFX...enfim)
            // console.log("Account Resume: " + JSON.stringify(this.accountResume));
            let findDescription = "";
            if (type === "Buy") {
                findDescription = "Levantamento de divisa";
            }
            else {
                findDescription = "Crédito de divisa";
            }
            let totalAmount = Math.abs(parseFloat(this.accountResume.find((row) => {
                // console.log("[ROW] Date: " + row[0][1] + " Time: " + row[1][1] + " ISIN: " + row[4][1] + " Description: " + row[5][1] + " Amount: " + row[8][1]);
                // console.log("[TRANSACTION] Date: " + record[0][1] + " Time: " + record[1][1] + " ISIN: " + isin + " Description: " + findDescription);
                // console.log("Equals: " + row[0][1] === record[0][1] && row[1][1] === record[1][1] && row[4][1] === isin && row[5][1] === findDescription)
                return row[0][1] === record[0][1] && row[1][1] === record[1][1] && row[4][1] === isin && row[5][1] === findDescription;
            })?.[8][1] || "0"));
            if(totalAmount) {
                feeAmount += Math.abs(totalAmount - Math.abs(parseFloat(record[11][1]))); 
            }
            let netAmount = type === "Buy" ? Math.abs(parseFloat(record[11][1])) + Math.abs(feeAmount) || 0 : Math.abs(parseFloat(record[11][1])) - Math.abs(feeAmount) || 0;

            if (Math.abs(netAmount) < Number.EPSILON) {
                throw new Error("Invalid file data: zero as an amount is not allowed");
            }

            const fees = feeAmount ? [new Fee("Custos de transação", feeAmount, feeCurrency, feeExchangeRate)] : [];



            const transaction = new Transaction(
                utcDate,
                type,
                product,
                isin,
                Math.abs(shares),
                assetCurrency,
                Math.abs(netAmount),
                netAmountCurrency,
                new Degiro(),
                undefined,
                fees,
                exchangeRate
            );
            if (transaction.type || !date || !time) transactions.push(transaction);
        });

        // Adicionar dividendos
        this.accountResume.forEach((record) => {
            let dutchDate = record[0][1];
            let dutchTime = record[1][1];
            const dateValue = record[2][1];
            const product = record[3][1];
            const isin = record[4][1];
            const description = record[5][1];
            const exchangeRate = parseFloat(record[6][1]);
            const amountCurrency = record[7][1];
            const amount = parseFloat(record[8][1]);
            const balanceCurrency = record[9][1];
            const balance = parseFloat(record[10][1]);
            const orderId = record[11][1];

            if (!dutchDate || !dutchTime) return;

            const dutchDateTime = DateTime.fromFormat(`${dutchDate} ${dutchTime}`, "dd-MM-yyyy HH:mm", { zone: "Europe/Amsterdam" });
            const utcDate = dutchDateTime.setZone("UTC");

            const date = utcDate.toISODate()!;
            const time = utcDate.toISOTime()!.split(".")[0];

            if (description !== 'Dividendo') {
                return;
            }
            const type = 'Dividend';

            let netAmount = amount;
            const netAmountCurrency = amountCurrency;
            const taxes: Tax[] = [];

            // Find tax
            const match = this.accountResume.find((row) => {
                const get = (key: string) => row.find(([k]) => k === key)?.[1];
                return (
                    get("Descrição") === "Imposto sobre dividendo" &&
                    get("Data") === dutchDate &&
                    get("Hora") === dutchTime
                );
            });
            if (match) {
                const taxAmount = Math.abs(parseFloat(match[8][1]));
                netAmount -= taxAmount;
                const taxCurrency = match[7][1];
                const taxExchangeRate = parseFloat(match[6][1]);
                taxes.push(new Tax("Imposto sobre dividendo", taxAmount, taxCurrency, taxExchangeRate));
            }


            const transaction = new Transaction(
                utcDate,
                type,
                product,
                isin,
                0,
                "",
                netAmount,
                netAmountCurrency,
                new Degiro(),
                taxes,
                undefined,
                exchangeRate
            );
            if (transaction.type || !date || !time) transactions.push(transaction);
        });

        // console.log("Transactions: " + JSON.stringify(transactions));

        return transactions;
    }
}

export { DegiroParser };