import { BrokerParser } from "../parser.js";
import { BrokerRecord, BrokerRecordRow, BrokerSection } from "../../models/brokerRecord.js";
import { Transaction, TransactionType } from "../../models/transaction.js";
import { Asset } from "../../models/asset.js";
import { DateTime } from "luxon";
import { Fee } from "../../models/fee.js";
import { Tax } from "../../models/tax.js";
import { TradeRepublic } from "../../models/brokers/traderepublic.js";

class TradeRepublicParser implements BrokerParser {

    parse(sections: BrokerSection[]): Transaction[] {
        const transactions: Transaction[] = [];
        const section = sections[0];
        const rows: BrokerRecord[] = section.rows.map(r => Object.fromEntries(r));

        const transactionSection = this.extractTransactionSection(rows);
        const groups = this.extractTransactions(transactionSection);

        groups.forEach(group => {
            const tx = this.parseTransaction(group);
            if (tx) transactions.push(tx);
        });

        return transactions;
    }

    // -------------------------
    // Extração da seção de transações do extrato, ignorando outras partes como resumo de saldo, etc. O extrato da TR tem uma seção clara de "ACCOUNT TRANSACTIONS" que termina antes da seção "BALANCE OVERVIEW", então usamos isso para isolar as linhas relevantes para parsing.
    // -------------------------

    private extractTransactionSection(rows: BrokerRecord[]): BrokerRecord[] {
        let start = -1;
        let end = -1;

        for (let i = 0; i < rows.length; i++) {
            const text = rows[i]["raw"];

            if (text.includes("ACCOUNT TRANSACTIONS")) start = i;
            if (text.includes("BALANCE OVERVIEW")) {
                end = i;
                break;
            }
        }

        if (start === -1 || end === -1) return [];

        return rows.slice(start + 1, end);
    }

    // -------------------------
    // Detetação das transações agrupando as linhas do extrato. Cada transação na TR começa com uma linha de data (ex: "15 Mar") seguida por uma linha de ano (ex: "2024"), e depois detalhes da transação. Agrupamos as linhas com base nesse padrão para depois extrair os dados de cada transação.
    // -------------------------

    private isDayMonth(line: string): boolean {
        return /^\d{1,2} [A-Za-z]{3}$/.test(line);
    }

    private isYearLine(line: string): boolean {
        return /^\d{4}/.test(line);
    }

    private extractTransactions(rows: BrokerRecord[]): BrokerRecord[][] {
        const transactions: BrokerRecord[][] = [];
        let i = 0;

        while (i < rows.length) {
            const current = rows[i]["raw"];
            const next = rows[i + 1]?.["raw"];

            // Detecta o início de uma transação pelo padrão de data (dia e mês) seguido por uma linha de ano.
            const isStartOfTransaction = this.isDayMonth(current) && next && this.isYearLine(next);
            if (isStartOfTransaction) {
                const transaction = [rows[i], rows[i + 1]];
                i += 2;

                // Enquanto a linha atual não for o início de uma nova transação (ou seja, não for um padrão de data), continuamos adicionando as linhas ao grupo atual.
                const isSameTransaction = (line: string) => !this.isDayMonth(line);
                while (i < rows.length && isSameTransaction(rows[i]["raw"])) {
                    transaction.push(rows[i]);
                    i++;
                }

                // Adiciona a transação à lista de transações detetadas.
                transactions.push(transaction);
            } else {
                i++;
            }
        }

        return transactions;
    }

    // -------------------------
    // Extração dos dados de uma transação para o formato padrão Transaction
    // -------------------------

    private parseTransaction(group: BrokerRecord[]): Transaction | null {
        const texts = group.map(r => r["raw"]);
        const fullText = texts.join(" ");

        // DATE
        const [dayMonth, yearLine] = texts;
        const dateStr = `${dayMonth} ${yearLine.slice(0, 4)}`;

        const date = DateTime.fromFormat(
            dateStr,
            "d LLL yyyy",
            { zone: "utc" }
        );

        // TYPE
        const type = this.detectType(fullText);
        if (!type) return null;

        // ISIN
        const isin = this.extractISIN(fullText);

        // AMOUNTS
        const amounts = this.extractAmounts(fullText);

        // SHARES (optional)
        const shares = this.extractShares(fullText);

        // Asset (ticker unknown)
        const asset = new Asset("", isin || "", "EUR");

        const transaction: Transaction = {
            date,
            type,
            asset,
            shares,
            amount: amounts[0] || 0,
            currency: "EUR",
            broker: new TradeRepublic(),
            fees: [] as Fee[], // Não conseguimos extrair comissões do extrato da TR, então deixamos vazio por enquanto. Se no futuro encontrarmos um padrão para isso, podemos implementar a extração de taxas aqui.
            taxes: [] as Tax[],
            exchangeRate: 1
        };

        return transaction;
    }

    // -------------------------
    // Funções auxiliares para detetar o tipo de transação, extrair ISIN, valores monetários e quantidade de ações a partir do texto completo da transação. Essas funções usam expressões regulares simples para identificar os padrões relevantes no texto extraído do extrato.
    // -------------------------

    private detectType(text: string): TransactionType | null {
        const t = text.toLowerCase();

        if (t.includes("buy trade")) return "Buy";
        if (t.includes("sell trade")) return "Sell";
        if (t.includes("cash dividend")) return "Dividend";
        if (t.includes("interest payment")) return "Interest";

        return null;
    }

    private extractISIN(text: string): string | null {
        const match = text.match(/[A-Z]{2}[A-Z0-9]{10}/);
        return match ? match[0] : null;
    }

    private extractAmounts(text: string): number[] {
        const matches = text.match(/€[\d.]+/g) || [];
        return matches.map(v => parseFloat(v.replace("€", "")));
    }

    private extractShares(text: string): number {
        const match = text.match(/quantity:\s*([\d.]+)/i);
        return match ? parseFloat(match[1]) : 0;
    }
}

export { TradeRepublicParser };