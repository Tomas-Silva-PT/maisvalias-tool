import { BrokerParser } from "../../parser.js";
import { BrokerRecord, BrokerSection } from "../../../models/brokerRecord.js";
import { Transaction, TransactionType } from "../../../models/transaction.js";
import { Asset, AssetType } from "../../../models/asset.js";
import { DateTime } from "luxon";
import { Fee } from "../../../models/fee.js";
import { Tax } from "../../../models/tax.js";
import { TradeRepublic } from "../../../models/brokers/traderepublic.js";

class TradeRepublicParser2026_v1 implements BrokerParser {

    canParse(sections: BrokerSection[]): boolean {
        console.log("Checking if file can be parsed with TradeRepublicParser2026_v1...");
        if (!sections.length || !sections[0].rows.length) return false;

        // pega numa linha representativa
        const sample = Object.fromEntries(sections[0].rows.find(row => row[4][1] === "BUY" || row[2][1] === "SELL" || row[2][1] === "INTEREST_PAYMENT") || []);
        console.log("Sample found: " + JSON.stringify(sample));
        if (!sample) return false;

        // valida headers base (estrutura do ficheiro)
        // Date;Ticker;Type;Quantity;Price per share;Total Amount;Currency;FX Rate
        const headers = Object.keys(sample);
        const hasRequiredHeaders = headers.includes("datetime") &&
            headers.includes("type") &&
            headers.includes("symbol") &&
            headers.includes("shares") &&
            headers.includes("price") &&
            headers.includes("amount") &&
            headers.includes("fee") &&
            headers.includes("tax") &&
            headers.includes("fx_rate");

        console.log("Has required headers: " + hasRequiredHeaders);
        if (!hasRequiredHeaders) return false;

        // heuristica para a data
        // 2024-08-09T13:23:02.982565Z
        const hDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/;
        console.log("Has valid date format: " + hDate.test(sample["datetime"]));
        if (!hDate.test(sample["datetime"])) return false;

        //  heurística para o montante:
        // 5.000000
        const hAmount = /\.\d+$/.test(sample["amount"]);
        console.log("Has valid amount format: " + hAmount);
        if (!hAmount) return false;

        // heuristica para a quantidade:
        // 0.1942950000
        const hQuantity = /^\d+\.\d+$/.test(sample["shares"]);
        console.log("Has valid quantity format: " + !(sample["shares"] && !hQuantity));
        if (sample["shares"] && !hQuantity) return false;

        // heuristica taxa de câmbio:
        // 0.7047210000
        const hExchangeRate = /^\d+\.\d+$/.test(sample["fx_rate"]);
        console.log("Has valid exchange rate format: " + !(sample["fx_rate"] && !hExchangeRate));
        if (sample["fx_rate"] && !hExchangeRate) return false;

        return true;
    }


    parse(sections: BrokerSection[]): Transaction[] {
        const transactions: Transaction[] = [];
        const section = sections[0];
        const rows: BrokerRecord[] = section.rows.map(r => Object.fromEntries(r));

        rows.forEach((record) => {
            if (!record["datetime"]) return;
            const utcDate = DateTime.fromISO(record["datetime"], { zone: "utc" });

            let type: TransactionType;
            if (record["type"].toLowerCase() === "buy") type = "Buy";
            else if (record["type"].toLowerCase() === "sell") type = "Sell";
            else if (record["type"].toLowerCase() === "dividend") type = "Dividend";
            else if (record["type"].toLowerCase() === "interest_payment") type = "Interest";
            else return;

            const ticker = "";
            const isin = record["symbol"];
            const shares = Math.abs(parseFloat(record["shares"].replace(/,/g, "")));
            let amount = Math.abs(parseFloat(record["amount"].replace(/,/g, "")));
            if (type === "Buy") amount += Math.abs(parseFloat(record["fee"].replace(/,/g, "") || "0")) + Math.abs(parseFloat(record["tax"].replace(/,/g, "") || "0"));
            if (type === "Sell") amount -= Math.abs(parseFloat(record["fee"].replace(/,/g, "") || "0")) + Math.abs(parseFloat(record["tax"].replace(/,/g, "") || "0"));
            const amountCurrency = record["currency"];
            const assetCurrency = record["currency"];

            const fees: Fee[] = [];
            if (record["fee"] && parseFloat(record["fee"]) !== 0) {
                fees.push(new Fee("Fee", Math.abs(parseFloat(record["fee"].replace(/,/g, ""))), record["currency"]));
            }

            const taxes: Tax[] = [];
            if (record["tax"] && parseFloat(record["tax"]) !== 0) {
                taxes.push(new Tax("Tax", Math.abs(parseFloat(record["tax"].replace(/,/g, ""))), record["currency"]));
            }

            let exchangeRate = 1; // Porque a TR fornece os valores já convertidos para a moeda de referência, então assumimos que a taxa de câmbio é 1.

            const asset_class = record["asset_class"];

            let assetType: AssetType;
            switch (asset_class) {
                case "STOCK":
                    assetType = "STOCK";
                    break;
                case "FUND":
                    assetType = "ETF";
                    break;
                case "CRYPTO":
                    assetType = "CRYPTO";
                    break;
                default:
                    assetType = "";
            }

            const transaction: Transaction = {
                date: utcDate,
                type: type,
                asset: new Asset(ticker, isin, assetCurrency, assetType),
                shares: shares,
                amount: amount,
                currency: amountCurrency,
                broker: new TradeRepublic(),
                taxes: taxes,
                fees: fees,
                exchangeRate: exchangeRate
            };
            console.log("Parsed transaction: " + JSON.stringify(transaction));
            if (transaction.type) transactions.push(transaction);
        });

        return transactions;
    }

    // parse(sections: BrokerSection[]): Transaction[] {
    //     const transactions: Transaction[] = [];
    //     const section = sections[0];
    //     const rows: BrokerRecord[] = section.rows.map(r => Object.fromEntries(r));

    //     const transactionSection = this.extractTransactionSection(rows);
    //     const groups = this.extractTransactions(transactionSection);

    //     groups.forEach(group => {
    //         const tx = this.parseTransaction(group);
    //         if (tx) transactions.push(tx);
    //     });

    //     return transactions;
    // }

    // // -------------------------
    // // Extração da seção de transações do extrato, ignorando outras partes como resumo de saldo, etc. O extrato da TR tem uma seção clara de "ACCOUNT TRANSACTIONS" que termina antes da seção "BALANCE OVERVIEW", então usamos isso para isolar as linhas relevantes para parsing.
    // // -------------------------

    // private extractTransactionSection(rows: BrokerRecord[]): BrokerRecord[] {
    //     let start = -1;
    //     let end = -1;

    //     for (let i = 0; i < rows.length; i++) {
    //         const text = rows[i]["raw"];

    //         if (text.includes("ACCOUNT TRANSACTIONS")) start = i;
    //         if (text.includes("BALANCE OVERVIEW")) {
    //             end = i;
    //             break;
    //         }
    //     }

    //     if (start === -1 || end === -1) return [];

    //     return rows.slice(start + 1, end);
    // }

    // // -------------------------
    // // Detetação das transações agrupando as linhas do extrato. Cada transação na TR começa com uma linha de data (ex: "15 Mar") seguida por uma linha de ano (ex: "2024"), e depois detalhes da transação. Agrupamos as linhas com base nesse padrão para depois extrair os dados de cada transação.
    // // -------------------------

    // private isDayMonth(line: string): boolean {
    //     return /^\d{1,2} [A-Za-z]{3}$/.test(line);
    // }

    // private isYearLine(line: string): boolean {
    //     return /^\d{4}/.test(line);
    // }

    // private extractTransactions(rows: BrokerRecord[]): BrokerRecord[][] {
    //     const transactions: BrokerRecord[][] = [];
    //     let i = 0;

    //     while (i < rows.length) {
    //         const current = rows[i]["raw"];
    //         const next = rows[i + 1]?.["raw"];

    //         // Detecta o início de uma transação pelo padrão de data (dia e mês) seguido por uma linha de ano.
    //         const isStartOfTransaction = this.isDayMonth(current) && next && this.isYearLine(next);
    //         if (isStartOfTransaction) {
    //             const transaction = [rows[i], rows[i + 1]];
    //             i += 2;

    //             // Enquanto a linha atual não for o início de uma nova transação (ou seja, não for um padrão de data), continuamos adicionando as linhas ao grupo atual.
    //             const isSameTransaction = (line: string) => !this.isDayMonth(line);
    //             while (i < rows.length && isSameTransaction(rows[i]["raw"])) {
    //                 transaction.push(rows[i]);
    //                 i++;
    //             }

    //             // Adiciona a transação à lista de transações detetadas.
    //             transactions.push(transaction);
    //         } else {
    //             i++;
    //         }
    //     }

    //     return transactions;
    // }

    // // -------------------------
    // // Extração dos dados de uma transação para o formato padrão Transaction
    // // -------------------------

    // private parseTransaction(group: BrokerRecord[]): Transaction | null {
    //     const texts = group.map(r => r["raw"]);
    //     const fullText = texts.join(" ");

    //     // DATE
    //     const [dayMonth, yearLine] = texts;
    //     const dateStr = `${dayMonth} ${yearLine.slice(0, 4)}`;

    //     const date = DateTime.fromFormat(
    //         dateStr,
    //         "d LLL yyyy",
    //         { zone: "utc" }
    //     );

    //     // TYPE
    //     const type = this.detectType(fullText);
    //     if (!type) return null;

    //     // ISIN
    //     const isin = this.extractISIN(fullText);

    //     // AMOUNTS
    //     const amounts = this.extractAmounts(fullText);

    //     // SHARES (optional)
    //     const shares = this.extractShares(fullText);

    //     // Asset (ticker unknown)
    //     const asset = new Asset("", isin || "", "EUR");

    //     const transaction: Transaction = {
    //         date,
    //         type,
    //         asset,
    //         shares,
    //         amount: amounts[0] || 0,
    //         currency: "EUR",
    //         broker: new TradeRepublic(),
    //         fees: [] as Fee[], // Não conseguimos extrair comissões do extrato da TR, então deixamos vazio por enquanto. Se no futuro encontrarmos um padrão para isso, podemos implementar a extração de taxas aqui.
    //         taxes: [] as Tax[],
    //         exchangeRate: 1
    //     };

    //     return transaction;
    // }

    // // -------------------------
    // // Funções auxiliares para detetar o tipo de transação, extrair ISIN, valores monetários e quantidade de ações a partir do texto completo da transação. Essas funções usam expressões regulares simples para identificar os padrões relevantes no texto extraído do extrato.
    // // -------------------------

    // private detectType(text: string): TransactionType | null {
    //     const t = text.toLowerCase();

    //     if (t.includes("buy trade")) return "Buy";
    //     if (t.includes("sell trade")) return "Sell";
    //     if (t.includes("cash dividend")) return "Dividend";
    //     if (t.includes("interest payment")) return "Interest";

    //     return null;
    // }

    // private extractISIN(text: string): string | null {
    //     const match = text.match(/[A-Z]{2}[A-Z0-9]{10}/);
    //     return match ? match[0] : null;
    // }

    // private extractAmounts(text: string): number[] {
    //     const matches = text.match(/€[\d.]+/g) || [];
    //     return matches.map(v => parseFloat(v.replace("€", "")));
    // }

    // private extractShares(text: string): number {
    //     const match = text.match(/quantity:\s*([\d.]+)/i);
    //     return match ? parseFloat(match[1]) : 0;
    // }
}

export { TradeRepublicParser2026_v1 };