import { it, describe, expect } from 'vitest';
import { RevolutParser } from '../../parsers/revolutparser.js';
import { Statement } from '../../models/statement.js';
import fs from "fs";
import { DividendsCalculator } from '../../calculators/DividendsCalculator.js';

describe('DividendsCalculator', () => {
    it('should calculate dividends correctly', async () => {
        const calculator = new DividendsCalculator();
        const parser = new RevolutParser();
        const statement = new Statement([]);

        const profitLossFilePath = './data/mockdata/revolut_profit_loss_statement.csv';
        const profitLossFileData = fs.readFileSync(profitLossFilePath, 'utf8');
        parser.loadIsins(profitLossFileData)

        const operationsFilePath = './data/mockdata/revolut_account_statement.csv';
        const operationsFileData = fs.readFileSync(operationsFilePath, 'utf8');
        const transactions = parser.parse(operationsFileData);

        transactions.forEach(transaction => {
            statement.addTransaction(transaction);
        });

        await statement.fetchData();

        const dividends = await calculator.calculate(statement.getTransactions());

        console.log(dividends);
        expect(dividends).toBeDefined();
        expect(dividends.length).toBe(15);

        let exchangeRate = Math.round((dividends[0].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.846);
        expect(dividends[0].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[1].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.885);
        expect(dividends[1].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[2].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.908);
        expect(dividends[2].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[3].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.942);
        expect(dividends[3].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[4].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.993);
        expect(dividends[4].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[5].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.947);
        expect(dividends[5].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[6].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.936);
        expect(dividends[6].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[7].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.927);
        expect(dividends[7].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[8].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.94);
        expect(dividends[8].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[9].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.918);
        expect(dividends[9].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[10].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.919);
        expect(dividends[10].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[11].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.931);
        expect(dividends[11].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[12].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.903);
        expect(dividends[12].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[13].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.955);
        expect(dividends[13].amount).toBe(0.03);

        exchangeRate = Math.round((dividends[14].transaction.exchangeRate || 1) * 1000) / 1000;
        expect(exchangeRate).toBe(0.921);
        expect(dividends[14].amount).toBe(0.03);

    });
});
