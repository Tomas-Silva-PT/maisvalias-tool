import { it, describe, expect } from 'vitest';
import { FIFOCalculator } from '../../calculators/FIFOCalculator.js';
import { RevolutParser } from '../../parsers/revolutparser.js';
import { Statement } from '../../models/statement.js';
import { Classifier } from '../../classifiers/classifier.js';
import { DividendsCalculator } from '../../calculators/DividendsCalculator.js';
import { PTIRSRules2025 } from '../../classifiers/rules/pt_rules2025.js';
import fs from "fs";

describe('Classifier', () => {
    it('should classify transactions correctly', async () => {
        const dividendsCalculator = new DividendsCalculator();
        const capitalGainsCalculator = new FIFOCalculator();
        const parser = new RevolutParser();
        const statement = new Statement([]);

        // Get capital gains and dividends
        const profitLossFilePath = './data/mockdata/revolut/revolut_profit_loss_statement.csv';
        const profitLossFileData = fs.readFileSync(profitLossFilePath, 'utf8');
        parser.loadIsins(profitLossFileData);

        const operationsFilePath = './data/mockdata/revolut/revolut_account_statement.csv';
        const operationsFileData = fs.readFileSync(operationsFilePath, 'utf8');
        const transactions = parser.parse(operationsFileData);

        transactions.forEach(transaction => {
            statement.addTransaction(transaction);
        });

        await statement.fetchData();

        const capitalGains = await capitalGainsCalculator.calculate(capitalGainsCalculator.match(statement.getTransactions()));
        const dividends = await dividendsCalculator.calculate(statement.getTransactions());

        // Classify transactions into IRS panels
        const classifier = new Classifier(PTIRSRules2025);
        const taxEvents = [...capitalGains, ...dividends];

        const classifications = classifier.classify(taxEvents);

        console.log(classifications);

        // Converte chaves do Map para array para facilitar testes
        const destinations = Array.from(classifications.keys());

        // Verifica que existem painéis com estes códigos
        expect(destinations.some(d => d.code === "ANEXO_J_QUADRO_8A"))
            .toBe(true);

        expect(destinations.some(d => d.code === "ANEXO_J_QUADRO_92A"))
            .toBe(true);

        // Agora obtém os valores pelo destino correto
        const dest8A =
            destinations.find(d => d.code === "ANEXO_J_QUADRO_8A")!;
        const dest92A =
            destinations.find(d => d.code === "ANEXO_J_QUADRO_92A")!;

        expect(classifications.get(dest8A)?.length).toBe(15);
        expect(classifications.get(dest92A)?.length).toBe(2);

    });
});

