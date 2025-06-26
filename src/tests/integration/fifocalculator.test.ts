import { it, describe, expect } from 'vitest';
import { FIFOCalculator } from '../../calculators/FIFOCalculator.js';
import { RevolutParser } from '../../parsers/revolutparser.js';
import { Statement } from '../../models/statement.js';
import fs from "fs";

describe('FIFOCalculator', () => {
    it('should calculate capital gains correctly using FIFO', async () => {
        const calculator = new FIFOCalculator();
        const parser = new RevolutParser();
        const statement = new Statement([]);

        const profitLossFilePath = './data/mockdata/revolut/revolut_profit_loss_statement.csv';
        const profitLossFileData = fs.readFileSync(profitLossFilePath, 'utf8');
        parser.loadIsins(profitLossFileData)

        const operationsFilePath = './data/mockdata/revolut/revolut_account_statement.csv';
        const operationsFileData = fs.readFileSync(operationsFilePath, 'utf8');
        const transactions = parser.parse(operationsFileData);

        transactions.forEach(transaction => {
            statement.addTransaction(transaction);
        });

        await statement.fetchData();

        const capitalGains = await calculator.calculate(calculator.match(statement.getTransactions()));
        
        
        console.log(capitalGains);
        expect(capitalGains).toBeDefined();
        expect(capitalGains.length).toBe(2);

        expect(capitalGains[0].realizedValue).toBe(10.33);
        expect(capitalGains[0].acquiredValue).toBe(9.98);
        let exchangeRate = Math.round((capitalGains[0].sell.exchangeRate!)*1000)/1000;
        expect(exchangeRate).toBe(0.824);
        
        expect(capitalGains[1].realizedValue).toBe(13.26);
        expect(capitalGains[1].acquiredValue).toBe(9.93);
        exchangeRate = Math.round((capitalGains[1].sell.exchangeRate!)*1000)/1000;
        expect(exchangeRate).toBe(0.846);

    });
});
