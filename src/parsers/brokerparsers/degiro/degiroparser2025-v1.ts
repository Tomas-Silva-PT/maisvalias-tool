import { Transaction } from "../../../models/transaction";
import { Degiro } from "../../../models/brokers/degiro";
import { Tax } from "../../../models/tax";
import { Fee } from "../../../models/fee";
import { DateTime } from "luxon";
import { Asset } from "../../../models/asset";
import { BrokerRecordRow, BrokerSection } from "../../../models/brokerRecord";
import { IDegiroParser } from "./degiroparser";

class DegiroParser2025_v1 implements IDegiroParser {

    accountResume: BrokerRecordRow[] = [];

    loadAccountResume(records: BrokerSection[]) {
        this.accountResume = records[0].rows;
    }

    parseCapitalGain(record: BrokerRecordRow): Transaction | null {
        let date = record[0][1];
        let time = record[1][1];
        let productName = record[2][1];
        let isin = record[3][1];
        let exchangeOfReference = record[4][1];
        let exchange = record[5][1];
        let shares = parseFloat(record[6][1].replace(",", ".")) || 0;
        let price = parseFloat(record[7][1].replace(",", ".")) || 0;
        let assetCurrency = record[8][1];
        let grossAmount = Math.abs(parseFloat(record[9][1].replace(",", ".")) || 0);
        let grossAmountCurrency = record[10][1];
        let netAmount = Math.abs(parseFloat(record[11][1].replace(",", ".")) || 0); // EUR
        let exchangeRate = parseFloat(record[12][1].replace(",", ".")) || 1;
        let autoFXFee = Math.abs(parseFloat(record[13][1].replace(",", ".")) || 0); // EUR
        let feeAmount = Math.abs(parseFloat(record[14][1].replace(",", ".")) || 0); // EUR
        let totalAmount = Math.abs(parseFloat(record[15][1].replace(",", ".")) || 0); // EUR


        if (!date || !time) return null;
        const dutchDate = DateTime.fromFormat(`${date} ${time}`, "dd-MM-yyyy HH:mm", { zone: "Europe/Amsterdam" });
        const utcDate = dutchDate.setZone("UTC");

        date = utcDate.toISODate()!;
        time = utcDate.toISOTime()!.split(".")[0];

        const type = shares > 0 ? "Buy" : "Sell";

        const fees: Fee[] = [];
        if (autoFXFee != 0) fees.push(new Fee("Auto FX", autoFXFee, "EUR"));
        if (feeAmount != 0) fees.push(new Fee("Custos de transação e/ou taxas de terceiros", feeAmount, "EUR"));

        let totalNetAmount = Math.abs(netAmount);
        if (type === "Buy") {
            totalNetAmount = totalNetAmount + (autoFXFee + feeAmount);
        } else {
            totalNetAmount = totalNetAmount - (autoFXFee + feeAmount);
        }


        const transaction: Transaction = {
            date: utcDate,
            type: type,
            asset: new Asset("", isin, assetCurrency),
            shares: Math.abs(shares),
            amount: totalNetAmount,
            currency: "EUR",
            broker: new Degiro(),
            taxes: undefined,
            fees: fees,
            exchangeRate: 1
        };
        if (transaction.type || !date || !time) return transaction;
        return null;
    }

    parseDividend(record: BrokerRecordRow): Transaction | null {
        let date = record[0][1]; // Dutch Date
        let time = record[1][1]; // Dutch Time
        let dateValue = record[2][1];
        let product = record[3][1];
        let isin = record[4][1];
        let description = record[5][1];
        let exchangeRate = parseFloat(record[6][1].replace(",", ".")) || 1;
        let changeCurrency = record[7][1];
        let changeAmount = Math.abs(parseFloat(record[8][1].replace(",", ".")) || 0);
        let balanceCurrency = record[9][1];
        let balance = parseFloat(record[10][1].replace(",", ".")) || 0;
        let orderId = record[11][1];

        if (!date || !time) return null;

        const dutchDate = DateTime.fromFormat(`${date} ${time}`, "dd-MM-yyyy HH:mm", { zone: "Europe/Amsterdam" });
        const utcDate = dutchDate.setZone("UTC");

        date = utcDate.toISODate()!;
        time = utcDate.toISOTime()!.split(".")[0];

        if (description !== 'Dividendo') {
            return null;
        }
        const type = 'Dividend';

        let netAmount = changeAmount;

        const taxes: Tax[] = [];

        // Find tax
        const match = this.accountResume.find((row) => {
            return row[0][1] == record[0][1] && row[1][1] == record[1][1] && row[5][1] == "Imposto sobre dividendo"
        });
        // console.log("Matching tax for dividend: ", match);
        if (match) {
            const taxAmount = Math.abs(parseFloat(match[8][1].replace(",", ".")));
            netAmount -= taxAmount;
            const taxCurrency = match[7][1];
            const taxExchangeRate = parseFloat(match[6][1].replace(",", ".")) || 1;
            taxes.push(new Tax("Imposto sobre dividendo", taxAmount, taxCurrency, taxExchangeRate));
        }

        const transaction: Transaction = {
            date: utcDate,
            type: type,
            asset: new Asset("", isin, changeCurrency),
            // shares: 0, // In dividend transaction the shares are not relevant
            amount: Math.abs(netAmount),
            currency: changeCurrency,
            broker: new Degiro(),
            taxes: taxes,
            fees: undefined,
            exchangeRate: exchangeRate
        };
        if (transaction.type || !date || !time) return transaction;
        return null;
    }

    parseInterest(record: BrokerRecordRow): Transaction | null {
        return null;
    }

    parse(sections: BrokerSection[]): Transaction[] {
        const transactions: Transaction[] = [];

        if (!this.accountResume) {
            throw new Error("[Parse] Missing Account Resume");
        }

        const section = sections[0];
        section.rows.forEach((record) => {
            let transaction = this.parseCapitalGain(record);
            if (transaction) transactions.push(transaction);
        });

        // Adicionar dividendos
        this.accountResume.forEach((record) => {
            let transaction = this.parseDividend(record);
            if (transaction) transactions.push(transaction);

        });

        return transactions;
    }

    canParse(sections: BrokerSection[]): boolean {
        console.log("Checking if file can be parsed with DegiroParser2025_v1...");
        if (!sections.length || !sections[0].rows.length) return false;

        // pega numa linha representativa
        const sample = Object.fromEntries(sections[0].rows[0]);
        console.log("Sample found: " + JSON.stringify(sample));
        if (!sample) return false;

        // valida headers base (estrutura do ficheiro)
        const headers = Object.keys(sample);
        const hasRequiredHeaders = headers.includes("Data") &&
            headers.includes("Hora") &&
            headers.includes("ISIN") &&
            headers.includes("Quantidade") &&
            headers.includes("Valor EUR") &&
            headers.includes("Taxa de Câmbio") &&
            headers.includes("Total EUR");

        console.log("Has required headers: " + hasRequiredHeaders);
        if (!hasRequiredHeaders) return false;

        // heuristica para a data
        // 26-06-2025
        const hDate = /^\d{2}-\d{2}-\d{4}$/;
        console.log("Has valid date format: " + hDate.test(sample["Data"]));
        if (!hDate.test(sample["Data"])) return false;

        // heurística para o montante:
        // 1,1716
        const hAmount = /^-?\d+,\d+$/.test(sample["Valor EUR"]);
        console.log("Has valid amount format: " + hAmount);
        if (!hAmount) return false;

        // heuristica para a quantidade:
        // -1
        const hQuantity = /^-?\d+$/.test(sample["Quantidade"]);
        console.log("Has valid quantity format: " + !(sample["Quantidade"] && !hQuantity));
        if (sample["Quantidade"] && !hQuantity) return false;

        // heuristica taxa de câmbio:
        // 1,218
        const hExchangeRate = /^\d+,\d+$/.test(sample["Taxa de Câmbio"]);
        console.log("Has valid exchange rate format: " + !(sample["Taxa de Câmbio"] && !hExchangeRate));
        if (sample["Taxa de Câmbio"] && !hExchangeRate) return false;

        return true;
    }
}

export { DegiroParser2025_v1 };