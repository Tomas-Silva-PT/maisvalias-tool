import { it, describe, expect } from 'vitest';
import { Statement } from '../../models/statement.js';
import fs from "fs";
import { InteractiveBrokersParser } from '../../parsers/brokerparsers/interactivebrokersparser.js';
import { ParserEngine } from '../../parsers/parserengine.js';
import { CSVParser } from '../../parsers/fileparsers/csvparser.js';

describe('InteractiveBrokersParser', () => {
    it('should parse InteractiveBrokers transaction file correctly', async () => {
        const parserEngine = new ParserEngine(new CSVParser(), new InteractiveBrokersParser());
        const statement = new Statement([]);

        const operationsFilePath = './data/mockdata/interactivebrokers/Extrato.csv';
        const operationsFileData = fs.readFileSync(operationsFilePath, 'utf8');
        const transactions = await parserEngine.parse(operationsFileData);
        
        // console.log("Parsed transactions: ", transactions);

        transactions.forEach(transaction => {
            statement.addTransaction(transaction);
        });

        await statement.fetchData();

        console.log("Parsed Transactions: ", statement.getTransactions());

        expect(statement.getTransactions().length).toBe(6);

    });
});
