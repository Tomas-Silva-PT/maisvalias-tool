import { it, describe, expect } from 'vitest';
import { Statement } from '../../models/statement.js';
import fs from "fs";
import { StrikeParser } from '../../parsers/strikeparser.js';

describe('StrikeParser', () => {
    it('should parse Strike transaction file correctly', () => {
        const parser = new StrikeParser();
        const statement = new Statement([]);

        const operationsFilePath = './data/mockdata/strike/2026-01.csv';
        const operationsFileData = fs.readFileSync(operationsFilePath, 'utf8');
        const transactions = parser.parse(operationsFileData);

        transactions.forEach(transaction => {
            statement.addTransaction(transaction);
        });

        console.log("Parsed Transactions: ", statement.getTransactions());

        expect(statement.getTransactions().length).toBe(2);

        const firstTransaction = statement.getTransactions()[0];
        expect(firstTransaction.type).toBe("Buy");

    });
});
