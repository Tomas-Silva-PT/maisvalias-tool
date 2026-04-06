import { it, describe, expect } from 'vitest';
import fs from 'fs';
import { PDFParser } from '../../parsers/fileparsers/pdfparser';
import { TradeRepublicParser } from '../../parsers/brokerparsers/traderepublicparser';
import { FIFOCalculator } from '../../calculators/FIFOCalculator';
import { Statement } from '../../models/statement';
import { DividendsCalculator } from '../../calculators/DividendsCalculator';

describe('PDFParser', () => {
    it('should parse PDF files correctly', async () => {
        // Arrange
        const filePath = './data/mockdata/traderepublic/extrato.pdf';
        const fileBuffer = fs.readFileSync(filePath);

        const pdfParser = new PDFParser();
        const result = await pdfParser.parse(fileBuffer);
        // console.log("-------------------");
        // console.log(result);

        // Trade Republic Parser
        const parser = new TradeRepublicParser();
        const transactions = parser.parse(result);
        console.log(`Detected ${transactions.length} transactions from Trade Republic: `);
        console.log(transactions);

        expect(transactions.length).toBe(5);

        const calculator = new FIFOCalculator();
        const dividendCalculator = new DividendsCalculator();
        const statement = new Statement([]);

        transactions.forEach(transaction => {
            statement.addTransaction(transaction);
        });

        await statement.fetchData();

        const capitalGains = await calculator.calculate(calculator.match(statement.getTransactions()));
        console.log(capitalGains);
        expect(capitalGains.length).toBe(0);

        const dividends = await dividendCalculator.calculate(statement.getTransactions());
        console.log(dividends);
        expect(dividends.length).toBe(4);

    });
});